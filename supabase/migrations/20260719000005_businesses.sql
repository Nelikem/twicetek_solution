-- A business is an unlimited child entity of an organization (e.g. one legal
-- entity/brand operating under the parent org).
create table businesses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  name text not null,
  legal_name text,
  registration_number text,
  tax_id text,
  industry text,
  logo_path text,
  description text,
  email citext,
  phone text,
  website text,
  manager_user_id uuid references profiles (id),
  address text,
  timezone text,
  currency text,
  status organization_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles (id)
);

create index businesses_organization_id_idx on businesses (organization_id);
