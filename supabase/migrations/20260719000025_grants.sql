-- Table-level GRANTs for the API-facing Postgres roles.
--
-- RLS policies (rls_policies_core.sql, rls_policies_organizations.sql) control which
-- ROWS a role can see/touch, but Postgres has a separate, more basic permission layer:
-- without an explicit GRANT, a role cannot touch a table AT ALL, regardless of RLS —
-- the query fails with "permission denied for table X" before RLS is ever evaluated.
-- New tables get no such grant by default. `authenticated` is the role every signed-in
-- API request runs as; `service_role` bypasses RLS (rolbypassrls) but still needs these
-- base grants for the same reason. `anon` intentionally gets nothing here — this app
-- has no unauthenticated data access, only Supabase Auth's own endpoints.

grant select, insert, update, delete on
  profiles,
  organizations,
  businesses,
  branches,
  departments,
  roles,
  permissions,
  role_permissions,
  organization_members,
  business_members,
  branch_members,
  subscriptions,
  settings,
  invitations,
  sessions,
  audit_logs,
  activity_logs,
  notifications
to authenticated, service_role;

-- Safety net for future migrations: any new table `postgres` creates in `public`
-- automatically gets the same baseline grant, so this class of bug can't recur.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated, service_role;
