-- Extendable later via `alter type security_event_type add value '...'` for OAuth/
-- MFA events in future phases -- additive, no table rewrite, no breaking change.
create type security_event_type as enum (
  'login_success',
  'login_failed',
  'logout',
  'password_changed',
  'password_reset_requested',
  'password_reset_completed',
  'profile_updated',
  'account_locked'
);

create table security_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  event_type security_event_type not null,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index security_logs_user_id_created_at_idx on security_logs (user_id, created_at desc);

alter table security_logs enable row level security;

-- Self-scoped read only, same rationale as login_history: writes happen only via
-- security-definer RPCs, never directly from client inserts.
create policy security_logs_select on security_logs for select
  using (user_id = auth.uid());
