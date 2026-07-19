-- job_title is deliberately on organization_members, not profiles: a title is
-- contextual to this org's administrator role, not a global user attribute.
alter table organization_members add column job_title text;

-- Idempotent, mirrors get_or_create_draft_organization()'s pattern exactly.
-- security invoker (not definer): organization_members_insert/select/update all
-- already have an owner bypass (is_org_admin()/is_org_member() both OR in
-- is_org_owner()), so the caller's own RLS access covers every statement here —
-- no need to bypass RLS. No RLS policy changes needed in this migration.
create or replace function ensure_owner_membership(org_id uuid)
returns organization_members
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  membership organization_members;
  owner_role_id uuid;
begin
  select * into membership
  from organization_members
  where organization_id = org_id and user_id = auth.uid()
  limit 1;

  if found then
    return membership;
  end if;

  select id into owner_role_id
  from roles
  where organization_id is null and slug = 'owner'
  limit 1;

  begin
    insert into organization_members (organization_id, user_id, role_id, status, joined_at, created_by)
    values (org_id, auth.uid(), owner_role_id, 'active', now(), auth.uid())
    returning * into membership;

    return membership;
  exception when unique_violation then
    -- Race against organization_members' unique(organization_id, user_id)
    -- constraint (e.g. a second tab calling this at the same moment) -- the
    -- other transaction's row is now the canonical one, so just return it.
    select * into membership
    from organization_members
    where organization_id = org_id and user_id = auth.uid()
    limit 1;

    return membership;
  end;
end;
$$;

revoke execute on function ensure_owner_membership(uuid) from public;
grant execute on function ensure_owner_membership(uuid) to authenticated;
