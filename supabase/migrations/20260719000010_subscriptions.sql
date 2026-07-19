create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  plan_name text not null,
  billing_cycle billing_cycle,
  status subscription_status not null default 'trialing',
  current_period_start timestamptz,
  current_period_end timestamptz,
  seats_limit int,
  price_amount numeric(12, 2),
  currency text,
  external_provider text,
  external_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles (id)
);

-- Only one active subscription per organization at a time.
create unique index subscriptions_one_active_per_org on subscriptions (organization_id) where status = 'active';
