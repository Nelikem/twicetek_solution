-- Top level tenant entity. Onboarding step 1 ("Organization Info") writes to this table
-- as a draft row that autosaves before the full tenant is provisioned in a later phase.
create table organizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references profiles (id),
  status organization_status not null default 'draft',
  onboarding_current_step smallint not null default 1,
  onboarding_completed_steps jsonb not null default '[]'::jsonb,
  onboarding_last_saved_at timestamptz,
  logo_path text,
  company_name text,
  legal_business_name text,
  registration_number text,
  tax_id text,
  industry text,
  org_email citext,
  phone text,
  website text,
  country text,
  state text,
  city text,
  address text,
  timezone text,
  currency text,
  fiscal_year_start_month smallint check (fiscal_year_start_month between 1 and 12),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles (id)
);

-- A given owner may only have one in-progress draft organization at a time.
create unique index organizations_one_draft_per_owner on organizations (owner_user_id) where status = 'draft';

create index organizations_status_idx on organizations (status);
