-- A department belongs to a business, and optionally to one branch of that business.
-- organization_id/business_id consistency (and branch_id/business_id agreement) are
-- enforced by enforce_department_scoping() (see triggers_scoping_consistency.sql).
create table departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  branch_id uuid references branches (id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles (id)
);

create index departments_organization_id_idx on departments (organization_id);
create index departments_business_id_idx on departments (business_id);
