-- Powers the Business/Branch Overview tables on the dashboard with one round
-- trip each, instead of N+1 client-side count queries. security definer
-- because the branch_count/employee_count joins span rows the caller may not
-- individually have RLS access to select from directly; is_org_member(org_id)
-- is the explicit guard (mirrors is_business_manager/is_branch_manager's
-- pattern in 20260719000017_rls_helper_functions.sql), and org_id is a bound
-- parameter, not client-controlled row data.
create or replace function get_business_overview(org_id uuid)
returns table (
  business_id uuid,
  name text,
  status organization_status,
  manager_name text,
  created_at timestamptz,
  branch_count bigint,
  employee_count bigint
)
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select b.id, b.name, b.status, b.manager_name, b.created_at,
         coalesce(br.branch_count, 0), coalesce(bm.employee_count, 0)
  from businesses b
  left join (
    select business_id, count(*) as branch_count from branches group by business_id
  ) br on br.business_id = b.id
  left join (
    select business_id, count(*) as employee_count from business_members
    where status = 'active' group by business_id
  ) bm on bm.business_id = b.id
  where b.organization_id = org_id and is_org_member(org_id)
  order by b.sort_order asc;
$$;

revoke execute on function get_business_overview(uuid) from public;
grant execute on function get_business_overview(uuid) to authenticated;

create or replace function get_branch_overview(org_id uuid, business_id_filter uuid default null)
returns table (
  branch_id uuid,
  name text,
  status organization_status,
  manager_name text,
  business_id uuid,
  business_name text,
  created_at timestamptz,
  employee_count bigint
)
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select br.id, br.name, br.status, br.manager_name, br.business_id, b.name,
         br.created_at, coalesce(brm.employee_count, 0)
  from branches br
  join businesses b on b.id = br.business_id
  left join (
    select branch_id, count(*) as employee_count from branch_members
    where status = 'active' group by branch_id
  ) brm on brm.branch_id = br.id
  where br.organization_id = org_id and is_org_member(org_id)
    and (business_id_filter is null or br.business_id = business_id_filter)
  order by br.sort_order asc;
$$;

revoke execute on function get_branch_overview(uuid, uuid) from public;
grant execute on function get_branch_overview(uuid, uuid) to authenticated;

-- Supports the dashboard's date-range + business filter on Recent Activity
-- (existing activity_logs_org_created_at_idx doesn't cover business_id).
create index activity_logs_org_business_created_at_idx
  on activity_logs (organization_id, business_id, created_at desc);
