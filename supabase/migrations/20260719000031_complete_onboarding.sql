-- complete_onboarding(): the sole path to flipping an organization (and its
-- businesses/branches) from 'draft' to 'active'. security definer because
-- organizations_update's WITH CHECK only ever permits status to remain 'draft' --
-- a plain client update is unconditionally rejected by RLS. Unlike every other
-- function in this feature (security invoker, relying on the caller's own RLS
-- access), this one bypasses RLS and must authorize the caller itself.
create or replace function complete_onboarding(org_id uuid)
returns organizations
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  org organizations;
  business_count int;
begin
  select * into org from organizations where id = org_id;

  if not found then
    raise exception 'Organization % not found', org_id;
  end if;

  if org.owner_user_id <> auth.uid() then
    raise exception 'Not authorized to complete onboarding for organization %', org_id;
  end if;

  -- Idempotent: already active (re-visiting step-6, or a double-click before the
  -- client's mutation state settles) -- just return the current row.
  if org.status = 'active' then
    return org;
  end if;

  if org.status <> 'draft' then
    raise exception 'Organization % is not in draft status (current: %)', org_id, org.status;
  end if;

  -- Defense in depth mirroring Step 2's own client-side "at least one business"
  -- gate: once this flips status to 'active', WITH CHECK forecloses any client
  -- path back to 'draft', so it's worth re-checking the one invariant that matters.
  select count(*) into business_count from businesses where organization_id = org_id;
  if business_count = 0 then
    raise exception 'Organization % has no businesses; cannot complete onboarding', org_id;
  end if;

  update organizations
  set status = 'active', updated_at = now()
  where id = org_id
  returning * into org;

  update businesses set status = 'active' where organization_id = org_id and status = 'draft';
  update branches set status = 'active' where organization_id = org_id and status = 'draft';

  return org;
end;
$$;

revoke execute on function complete_onboarding(uuid) from public;
grant execute on function complete_onboarding(uuid) to authenticated;
