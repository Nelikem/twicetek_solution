-- RLS policies for profiles and organizations.
--
-- Bootstrapping problem: during onboarding, a user has just created their draft
-- organization and has NOT yet been given an organization_members row (that only
-- happens once a later-phase provisioning step runs). If organizations' policies
-- keyed off is_org_member()/is_org_admin() alone, the owner would be locked out of
-- the very row they just created. So for the draft phase, policies must key off
-- organizations.owner_user_id directly, in addition to (not instead of) the
-- membership-based checks used once the org is fully provisioned.

alter table profiles enable row level security;
alter table organizations enable row level security;

-- ---------------------------------------------------------------------------
-- profiles: self-only read/update. No insert policy -- rows are created solely
-- by the handle_new_user() trigger (triggers_auth_profile.sql), which runs as
-- security definer / table owner and bypasses RLS entirely. Adding a client
-- insert policy here is unnecessary and would only widen the attack surface.
-- ---------------------------------------------------------------------------
create policy profiles_select on profiles for select
  using (id = auth.uid());
create policy profiles_update on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------

-- select: the owner can always see their own org (covers the pre-membership
-- draft phase), and any active member can see it once membership exists.
create policy organizations_select on organizations for select
  using (owner_user_id = auth.uid() or is_org_member(id));

-- insert: a user may only ever insert a draft row for themselves. Going
-- straight to 'active' (or any other status) via a client insert is blocked --
-- only a later-phase security definer provisioning function can do that.
create policy organizations_insert on organizations for insert
  with check (owner_user_id = auth.uid() and status = 'draft');

-- update: USING governs which rows a client may target; WITH CHECK governs what
-- the row is allowed to become. We OR in is_org_admin(id) on the USING side so
-- org admins can already target (see/attempt to write) active-org rows, which
-- future phases will build on for read/limited-write use cases. The WITH CHECK
-- is intentionally narrower -- restricted to the draft-owner case only -- so
-- this phase does not open general write access to active organizations from
-- the client. Once a provisioning function (security definer, bypasses RLS)
-- flips status to 'active', this policy's WITH CHECK blocks any further direct
-- client writes to that row, forcing all post-provisioning updates through a
-- governed RPC/function.
create policy organizations_update on organizations for update
  using ((owner_user_id = auth.uid() and status = 'draft') or is_org_admin(id))
  with check (owner_user_id = auth.uid() and status = 'draft');

-- No delete policy: organizations are never hard-deleted by clients.
