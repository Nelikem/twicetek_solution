-- Bug fix: is_org_member() had no owner-bootstrap bypass, unlike is_org_admin().
--
-- A draft-org owner has zero organization_members rows until a future provisioning
-- phase creates one. is_org_admin() already ORs in is_org_owner(), so the owner could
-- INSERT into org-scoped tables (businesses, etc. -- insert/update/delete policies use
-- is_org_admin). But every SELECT policy on those same tables uses is_org_member(),
-- which had no such bypass -- so the owner could insert a business and then never see
-- it come back. Adding the same is_org_owner() OR here fixes SELECT access to every
-- table gated by is_org_member (businesses, branches, departments, roles,
-- organization_members-read, subscriptions, settings, invitations, activity_logs) in
-- one place, transparently, with no policy or app-code changes required.
create or replace function is_org_member(org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select is_org_owner(org_id)
    or exists (
      select 1
      from organization_members
      where organization_id = org_id
        and user_id = auth.uid()
        and status = 'active'
    );
$$;
