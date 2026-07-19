-- Lower-stakes, client-writable activity feed (e.g. "user viewed X"), as opposed to
-- audit_logs which is reserved for governed system-of-record writes.
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations (id),
  business_id uuid references businesses (id),
  branch_id uuid references branches (id),
  actor_user_id uuid references profiles (id),
  activity_type text not null,
  description text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index activity_logs_org_created_at_idx on activity_logs (organization_id, created_at desc);
