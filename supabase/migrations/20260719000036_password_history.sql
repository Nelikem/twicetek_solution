create table password_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index password_history_user_id_created_at_idx on password_history (user_id, created_at desc);

alter table password_history enable row level security;

-- No select policy at all -- even the owning user has no legitimate reason to read
-- back old password hashes; only check_password_reused() (security definer) ever
-- reads this table.
