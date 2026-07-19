-- RLS helper functions.
--
-- All of these are `security definer` because they query membership tables
-- (organization_members, business_members, branch_members) that are themselves
-- protected by RLS policies which call these very functions. If the functions ran
-- as `security invoker`, evaluating a policy on organization_members would re-trigger
-- RLS on organization_members, which would call the function again, which would
-- re-trigger RLS again -- infinite recursion. `security definer` makes the function
-- body run with the privileges of its owner (bypassing RLS on the tables it reads),
-- breaking that cycle. `stable` lets the planner cache the result within a statement.
-- `set search_path` pins name resolution to prevent search-path hijacking, which is
-- required whenever a function is security definer.

create or replace function is_org_member(org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from organization_members
    where organization_id = org_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function is_org_owner(org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from organizations
    where id = org_id
      and owner_user_id = auth.uid()
  );
$$;

create or replace function is_org_admin(org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select is_org_owner(org_id)
    or exists (
      select 1
      from organization_members om
      join roles r on r.id = om.role_id
      where om.organization_id = org_id
        and om.user_id = auth.uid()
        and om.status = 'active'
        and r.slug in ('owner', 'org_admin')
    );
$$;

create or replace function is_business_manager(biz_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from business_members bm
    where bm.business_id = biz_id
      and bm.user_id = auth.uid()
      and bm.status = 'active'
  )
  or is_org_admin((select organization_id from businesses where id = biz_id));
$$;

create or replace function is_branch_manager(br_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from branch_members brm
    where brm.branch_id = br_id
      and brm.user_id = auth.uid()
      and brm.status = 'active'
  )
  or is_org_admin((select organization_id from branches where id = br_id));
$$;
