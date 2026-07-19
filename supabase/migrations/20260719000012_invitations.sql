create table invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  business_id uuid references businesses (id),
  branch_id uuid references branches (id),
  email extensions.citext not null,
  role_id uuid not null references roles (id),
  invited_by uuid references profiles (id),
  token text not null unique,
  status invitation_status not null default 'pending',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles (id)
);
