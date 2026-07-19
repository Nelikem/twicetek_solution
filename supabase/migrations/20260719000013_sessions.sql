-- App-level device/session metadata (e.g. "active devices" UI, force-logout of a device).
-- Distinct from Supabase Auth's own internal session store (auth.sessions).
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  organization_id uuid references organizations (id),
  device_info jsonb,
  ip_address inet,
  user_agent text,
  last_active_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
