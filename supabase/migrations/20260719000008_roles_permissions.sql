-- roles: organization_id = null denotes a system-wide role template (seeded, reusable
-- across all orgs); a non-null organization_id denotes an org-specific custom role.
create table roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations (id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles (id)
);

-- Slug must be unique per organization, and unique among system templates
-- (organization_id is null). coalesce() collapses all null org_ids onto one sentinel
-- so the uniqueness constraint applies within that group too.
create unique index roles_org_slug_idx on roles (
  coalesce(organization_id, '00000000-0000-0000-0000-000000000000'::uuid),
  slug
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  resource text not null,
  action text not null,
  description text,
  created_at timestamptz not null default now()
);

create table role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references roles (id) on delete cascade,
  permission_id uuid not null references permissions (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (role_id, permission_id)
);
