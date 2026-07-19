-- RLS policies for the tenant-hierarchy, membership, and platform-utility tables.
-- (profiles and organizations are handled separately in rls_policies_organizations.sql
-- because of their bootstrapping requirements.)

alter table businesses enable row level security;
alter table branches enable row level security;
alter table departments enable row level security;
alter table roles enable row level security;
alter table permissions enable row level security;
alter table role_permissions enable row level security;
alter table organization_members enable row level security;
alter table business_members enable row level security;
alter table branch_members enable row level security;
alter table subscriptions enable row level security;
alter table settings enable row level security;
alter table invitations enable row level security;
alter table sessions enable row level security;
alter table audit_logs enable row level security;
alter table activity_logs enable row level security;
alter table notifications enable row level security;

-- ---------------------------------------------------------------------------
-- businesses: standard org-scoped read/write
-- ---------------------------------------------------------------------------
create policy businesses_select on businesses for select
  using (is_org_member(organization_id));
create policy businesses_insert on businesses for insert
  with check (is_org_admin(organization_id));
create policy businesses_update on businesses for update
  using (is_org_admin(organization_id))
  with check (is_org_admin(organization_id));
create policy businesses_delete on businesses for delete
  using (is_org_admin(organization_id));

-- ---------------------------------------------------------------------------
-- branches: standard org-scoped read/write
-- ---------------------------------------------------------------------------
create policy branches_select on branches for select
  using (is_org_member(organization_id));
create policy branches_insert on branches for insert
  with check (is_org_admin(organization_id));
create policy branches_update on branches for update
  using (is_org_admin(organization_id))
  with check (is_org_admin(organization_id));
create policy branches_delete on branches for delete
  using (is_org_admin(organization_id));

-- ---------------------------------------------------------------------------
-- departments: standard org-scoped read/write
-- ---------------------------------------------------------------------------
create policy departments_select on departments for select
  using (is_org_member(organization_id));
create policy departments_insert on departments for insert
  with check (is_org_admin(organization_id));
create policy departments_update on departments for update
  using (is_org_admin(organization_id))
  with check (is_org_admin(organization_id));
create policy departments_delete on departments for delete
  using (is_org_admin(organization_id));

-- ---------------------------------------------------------------------------
-- roles: organization_id is null for system-wide templates (readable by any
-- authenticated user, not client-writable); org-scoped rows follow the standard
-- org-scoped read/write pattern.
-- ---------------------------------------------------------------------------
create policy roles_select on roles for select
  using (organization_id is null or is_org_member(organization_id));
create policy roles_insert on roles for insert
  with check (organization_id is not null and is_org_admin(organization_id));
create policy roles_update on roles for update
  using (organization_id is not null and is_org_admin(organization_id))
  with check (organization_id is not null and is_org_admin(organization_id));
create policy roles_delete on roles for delete
  using (organization_id is not null and is_org_admin(organization_id));

-- ---------------------------------------------------------------------------
-- permissions: system-managed catalog, readable by any authenticated user.
-- No insert/update/delete policy -- RLS enabled with no matching policy denies
-- by default, so writes are only possible via migrations/seed (table owner).
-- ---------------------------------------------------------------------------
create policy permissions_select on permissions for select
  using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- role_permissions: visibility/write follows the organization_id of the parent
-- role (joined via role_id). System role templates (roles.organization_id is
-- null) are readable by all authenticated users but never client-writable.
-- ---------------------------------------------------------------------------
create policy role_permissions_select on role_permissions for select
  using (
    exists (
      select 1 from roles r
      where r.id = role_permissions.role_id
        and (r.organization_id is null or is_org_admin(r.organization_id))
    )
  );
create policy role_permissions_insert on role_permissions for insert
  with check (
    exists (
      select 1 from roles r
      where r.id = role_permissions.role_id
        and r.organization_id is not null
        and is_org_admin(r.organization_id)
    )
  );
create policy role_permissions_update on role_permissions for update
  using (
    exists (
      select 1 from roles r
      where r.id = role_permissions.role_id
        and r.organization_id is not null
        and is_org_admin(r.organization_id)
    )
  )
  with check (
    exists (
      select 1 from roles r
      where r.id = role_permissions.role_id
        and r.organization_id is not null
        and is_org_admin(r.organization_id)
    )
  );
create policy role_permissions_delete on role_permissions for delete
  using (
    exists (
      select 1 from roles r
      where r.id = role_permissions.role_id
        and r.organization_id is not null
        and is_org_admin(r.organization_id)
    )
  );

-- ---------------------------------------------------------------------------
-- organization_members: standard org-scoped read/write
-- ---------------------------------------------------------------------------
create policy organization_members_select on organization_members for select
  using (is_org_member(organization_id));
create policy organization_members_insert on organization_members for insert
  with check (is_org_admin(organization_id));
create policy organization_members_update on organization_members for update
  using (is_org_admin(organization_id))
  with check (is_org_admin(organization_id));
create policy organization_members_delete on organization_members for delete
  using (is_org_admin(organization_id));

-- ---------------------------------------------------------------------------
-- business_members: read at org scope, write via business manager or org admin
-- ---------------------------------------------------------------------------
create policy business_members_select on business_members for select
  using (is_org_member(organization_id));
create policy business_members_insert on business_members for insert
  with check (is_business_manager(business_id) or is_org_admin(organization_id));
create policy business_members_update on business_members for update
  using (is_business_manager(business_id) or is_org_admin(organization_id))
  with check (is_business_manager(business_id) or is_org_admin(organization_id));
create policy business_members_delete on business_members for delete
  using (is_business_manager(business_id) or is_org_admin(organization_id));

-- ---------------------------------------------------------------------------
-- branch_members: read at org scope, write via branch manager or org admin
-- ---------------------------------------------------------------------------
create policy branch_members_select on branch_members for select
  using (is_org_member(organization_id));
create policy branch_members_insert on branch_members for insert
  with check (is_branch_manager(branch_id) or is_org_admin(organization_id));
create policy branch_members_update on branch_members for update
  using (is_branch_manager(branch_id) or is_org_admin(organization_id))
  with check (is_branch_manager(branch_id) or is_org_admin(organization_id));
create policy branch_members_delete on branch_members for delete
  using (is_branch_manager(branch_id) or is_org_admin(organization_id));

-- ---------------------------------------------------------------------------
-- subscriptions: standard org-scoped read/write
-- ---------------------------------------------------------------------------
create policy subscriptions_select on subscriptions for select
  using (is_org_member(organization_id));
create policy subscriptions_insert on subscriptions for insert
  with check (is_org_admin(organization_id));
create policy subscriptions_update on subscriptions for update
  using (is_org_admin(organization_id))
  with check (is_org_admin(organization_id));
create policy subscriptions_delete on subscriptions for delete
  using (is_org_admin(organization_id));

-- ---------------------------------------------------------------------------
-- settings: standard org-scoped read/write
-- ---------------------------------------------------------------------------
create policy settings_select on settings for select
  using (is_org_member(organization_id));
create policy settings_insert on settings for insert
  with check (is_org_admin(organization_id));
create policy settings_update on settings for update
  using (is_org_admin(organization_id))
  with check (is_org_admin(organization_id));
create policy settings_delete on settings for delete
  using (is_org_admin(organization_id));

-- ---------------------------------------------------------------------------
-- invitations: standard org-scoped read/write
-- ---------------------------------------------------------------------------
create policy invitations_select on invitations for select
  using (is_org_member(organization_id));
create policy invitations_insert on invitations for insert
  with check (is_org_admin(organization_id));
create policy invitations_update on invitations for update
  using (is_org_admin(organization_id))
  with check (is_org_admin(organization_id));
create policy invitations_delete on invitations for delete
  using (is_org_admin(organization_id));

-- ---------------------------------------------------------------------------
-- sessions: self-only (app-level device metadata belongs to the owning user)
-- ---------------------------------------------------------------------------
create policy sessions_select on sessions for select
  using (user_id = auth.uid());
create policy sessions_insert on sessions for insert
  with check (user_id = auth.uid());
create policy sessions_update on sessions for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy sessions_delete on sessions for delete
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- audit_logs: read-only for org admins. No insert/update/delete policy for
-- regular clients -- writes happen only via security definer trigger functions
-- in a later phase, so direct client writes are denied by default (intentional).
-- ---------------------------------------------------------------------------
create policy audit_logs_select on audit_logs for select
  using (is_org_admin(organization_id));

-- ---------------------------------------------------------------------------
-- activity_logs: readable by any org member; insertable by any org member
-- (e.g. "user viewed X" style logging); no update/delete -- entries are immutable.
-- ---------------------------------------------------------------------------
create policy activity_logs_select on activity_logs for select
  using (is_org_member(organization_id));
create policy activity_logs_insert on activity_logs for insert
  with check (is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- notifications: self-only (recipient owns their own notification rows)
-- ---------------------------------------------------------------------------
create policy notifications_select on notifications for select
  using (recipient_user_id = auth.uid());
create policy notifications_insert on notifications for insert
  with check (recipient_user_id = auth.uid());
create policy notifications_update on notifications for update
  using (recipient_user_id = auth.uid())
  with check (recipient_user_id = auth.uid());
create policy notifications_delete on notifications for delete
  using (recipient_user_id = auth.uid());
