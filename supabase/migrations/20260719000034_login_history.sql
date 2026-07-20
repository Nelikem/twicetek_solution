-- user_id is nullable (not a hard FK requirement) so a failed attempt against an
-- email with no matching profile can still be logged -- lockout detection is keyed
-- by email, not user_id, since the whole point is to catch attempts against emails
-- that may not resolve to a real account.
create table login_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete cascade,
  email text not null,
  success boolean not null,
  failure_reason text,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index login_history_email_created_at_idx on login_history (email, created_at desc);
create index login_history_user_id_created_at_idx on login_history (user_id, created_at desc);

alter table login_history enable row level security;

-- Self-scoped read only. No insert/update/delete policy for authenticated clients --
-- rows are written exclusively by the security-definer record_login_attempt() RPC
-- (20260719000037), which needs to log failed attempts against emails that may not
-- resolve to any user_id, so a client-side RLS insert check keyed on auth.uid()
-- couldn't authorize that case at all -- writes are routed around RLS entirely.
create policy login_history_select on login_history for select
  using (user_id = auth.uid());
