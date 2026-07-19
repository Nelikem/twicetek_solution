-- A branch is an unlimited child entity of a business (e.g. a physical location).
-- organization_id is denormalized from the parent business for cheaper RLS/query scoping
-- and is kept in sync by enforce_branch_scoping() (see triggers_scoping_consistency.sql).
create table branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  name text not null,
  code text,
  manager_user_id uuid references profiles (id),
  email citext,
  phone text,
  gps_address text,
  physical_address text,
  opening_hours jsonb,
  is_headquarters boolean not null default false,
  warehouse_enabled boolean not null default false,
  pos_enabled boolean not null default false,
  delivery_enabled boolean not null default false,
  status organization_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles (id)
);

create index branches_organization_id_idx on branches (organization_id);
create index branches_business_id_idx on branches (business_id);
