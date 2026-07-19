-- Step 2 (Business Registration) needs: a persisted display order (Reorder via
-- up/down move controls, not drag-and-drop) and a free-text manager name (no
-- team-invite system exists yet to link a real user account as manager_user_id).
alter table businesses add column sort_order integer not null default 0;
alter table businesses add column manager_name text;

-- The business list is always queried as "all businesses for this org, in order".
create index businesses_organization_id_sort_order_idx on businesses (organization_id, sort_order);
