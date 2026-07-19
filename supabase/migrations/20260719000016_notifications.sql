create table notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations (id),
  recipient_user_id uuid not null references profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  read_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index notifications_recipient_is_read_idx on notifications (recipient_user_id, is_read);
