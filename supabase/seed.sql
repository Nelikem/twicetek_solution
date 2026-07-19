-- Baseline system role templates (organization_id = null, is_system = true).
-- These are reusable across every organization and selectable when inviting members
-- or provisioning a tenant. Idempotent: safe to re-run against an existing database.

insert into roles (organization_id, name, slug, description, is_system)
values
  (null, 'Owner', 'owner', 'Full control over the organization, including billing and destructive actions.', true),
  (null, 'Organization Admin', 'org_admin', 'Manages organization-wide settings, businesses, branches, and members.', true),
  (null, 'Business Manager', 'business_manager', 'Manages a single business and its branches, departments, and members.', true),
  (null, 'Branch Manager', 'branch_manager', 'Manages day-to-day operations and staff of a single branch.', true),
  (null, 'Employee', 'employee', 'Standard staff member with access to their assigned business/branch.', true)
on conflict (coalesce(organization_id, '00000000-0000-0000-0000-000000000000'::uuid), slug) do nothing;

-- Baseline permission catalog: resource:action slugs across core platform resources.

insert into permissions (slug, resource, action, description)
values
  ('organizations:view', 'organizations', 'view', 'View organization details.'),
  ('organizations:create', 'organizations', 'create', 'Create a new organization.'),
  ('organizations:update', 'organizations', 'update', 'Update organization details.'),
  ('organizations:delete', 'organizations', 'delete', 'Archive or delete an organization.'),
  ('organizations:manage', 'organizations', 'manage', 'Full management of an organization, including settings and billing.'),

  ('businesses:view', 'businesses', 'view', 'View business details.'),
  ('businesses:create', 'businesses', 'create', 'Create a new business under an organization.'),
  ('businesses:update', 'businesses', 'update', 'Update business details.'),
  ('businesses:delete', 'businesses', 'delete', 'Delete a business.'),
  ('businesses:manage', 'businesses', 'manage', 'Full management of a business.'),

  ('branches:view', 'branches', 'view', 'View branch details.'),
  ('branches:create', 'branches', 'create', 'Create a new branch under a business.'),
  ('branches:update', 'branches', 'update', 'Update branch details.'),
  ('branches:delete', 'branches', 'delete', 'Delete a branch.'),
  ('branches:manage', 'branches', 'manage', 'Full management of a branch.'),

  ('departments:view', 'departments', 'view', 'View department details.'),
  ('departments:create', 'departments', 'create', 'Create a new department.'),
  ('departments:update', 'departments', 'update', 'Update department details.'),
  ('departments:delete', 'departments', 'delete', 'Delete a department.'),
  ('departments:manage', 'departments', 'manage', 'Full management of departments.'),

  ('members:view', 'members', 'view', 'View organization/business/branch members.'),
  ('members:create', 'members', 'create', 'Add a member to a scope.'),
  ('members:update', 'members', 'update', 'Update a member''s role or status.'),
  ('members:delete', 'members', 'delete', 'Remove a member from a scope.'),
  ('members:manage', 'members', 'manage', 'Full management of members across scopes.'),

  ('roles:view', 'roles', 'view', 'View roles and their permissions.'),
  ('roles:create', 'roles', 'create', 'Create a custom role.'),
  ('roles:update', 'roles', 'update', 'Update a custom role.'),
  ('roles:delete', 'roles', 'delete', 'Delete a custom role.'),
  ('roles:manage', 'roles', 'manage', 'Full management of roles and permission assignments.'),

  ('settings:view', 'settings', 'view', 'View settings.'),
  ('settings:create', 'settings', 'create', 'Create a setting entry.'),
  ('settings:update', 'settings', 'update', 'Update a setting entry.'),
  ('settings:delete', 'settings', 'delete', 'Delete a setting entry.'),
  ('settings:manage', 'settings', 'manage', 'Full management of settings.'),

  ('subscriptions:view', 'subscriptions', 'view', 'View subscription and billing details.'),
  ('subscriptions:create', 'subscriptions', 'create', 'Create a subscription.'),
  ('subscriptions:update', 'subscriptions', 'update', 'Update a subscription.'),
  ('subscriptions:delete', 'subscriptions', 'delete', 'Cancel/delete a subscription.'),
  ('subscriptions:manage', 'subscriptions', 'manage', 'Full management of billing and subscriptions.'),

  ('invitations:view', 'invitations', 'view', 'View pending/past invitations.'),
  ('invitations:create', 'invitations', 'create', 'Invite a new member.'),
  ('invitations:update', 'invitations', 'update', 'Update/resend an invitation.'),
  ('invitations:delete', 'invitations', 'delete', 'Revoke an invitation.'),
  ('invitations:manage', 'invitations', 'manage', 'Full management of invitations.')
on conflict (slug) do nothing;
