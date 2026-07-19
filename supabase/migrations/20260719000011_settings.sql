-- Generic key/value settings store scoped to org, and optionally business/branch.
create table settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  business_id uuid references businesses (id) on delete cascade,
  branch_id uuid references branches (id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  -- scope_key collapses (organization_id, business_id, branch_id, key) into a single
  -- unique string so a plain unique index can enforce one setting per scope+key,
  -- including where business_id/branch_id are null.
  scope_key text generated always as (
    organization_id::text || '|' || coalesce(business_id::text, '') || '|' || coalesce(branch_id::text, '') || '|' || key
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles (id),
  unique (scope_key)
);
