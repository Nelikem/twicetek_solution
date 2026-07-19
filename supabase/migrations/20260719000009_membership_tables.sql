-- Membership tables map users to a scope (org/business/branch) with a role and status.
-- business_members/branch_members denormalize their ancestor id(s) for cheap RLS scoping;
-- those are kept in sync by triggers in triggers_scoping_consistency.sql.

create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  role_id uuid references roles (id),
  status member_status not null default 'invited',
  invited_by uuid references profiles (id),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles (id),
  unique (organization_id, user_id)
);

create table business_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  role_id uuid references roles (id),
  status member_status not null default 'invited',
  invited_by uuid references profiles (id),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles (id),
  unique (business_id, user_id)
);

create table branch_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  branch_id uuid not null references branches (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  role_id uuid references roles (id),
  status member_status not null default 'invited',
  invited_by uuid references profiles (id),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles (id),
  unique (branch_id, user_id)
);
