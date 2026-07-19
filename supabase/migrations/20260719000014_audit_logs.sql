-- Append-only audit trail. No updated_at: rows are never modified after insert.
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations (id),
  business_id uuid references businesses (id),
  branch_id uuid references branches (id),
  actor_user_id uuid references profiles (id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index audit_logs_org_created_at_idx on audit_logs (organization_id, created_at desc);
