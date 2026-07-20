-- Additional system role templates needed for the dashboard framework's
-- permission-aware sidebar. Mirrors the insert shape/on-conflict target in
-- supabase/seed.sql exactly, but ships as a migration (not seed.sql) so it
-- reaches every environment, including linked/production, via
-- `supabase db push` -- seed.sql only runs on local `db reset`.
insert into roles (organization_id, name, slug, description, is_system)
values
  (null, 'Finance', 'finance', 'Manages accounting, invoicing, and financial reporting.', true),
  (null, 'Inventory Manager', 'inventory_manager', 'Manages stock, suppliers, and inventory across branches.', true),
  (null, 'HR', 'hr', 'Manages employees, attendance, and human resources records.', true),
  (null, 'Sales', 'sales', 'Manages sales pipeline, customers, and POS operations.', true),
  (null, 'Read Only', 'read_only', 'View-only access across the organization, no write actions.', true)
on conflict (coalesce(organization_id, '00000000-0000-0000-0000-000000000000'::uuid), slug) do nothing;
