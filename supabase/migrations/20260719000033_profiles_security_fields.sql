-- Genuinely new profile-shaped fields for the auth security-foundations phase.
-- Deliberately NOT adding organization_id/business_id/branch_id/role_id/status --
-- those already live correctly on organization_members (per-membership, not
-- per-profile), and duplicating them here would create two sources of truth.
alter table profiles
  add column first_name text,
  add column last_name text,
  add column display_name text,
  add column timezone text not null default 'UTC',
  add column language text not null default 'en',
  add column theme text not null default 'system'
    check (theme in ('light', 'dark', 'system')),
  add column last_login timestamptz;
