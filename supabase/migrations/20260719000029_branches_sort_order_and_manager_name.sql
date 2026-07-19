-- Step 3 (Branch Registration) needs the same additions Step 2 needed for
-- businesses: a persisted display order (up/down move controls, scoped per
-- business since branches only reorder among their own business's siblings)
-- and a free-text manager name (no team-invite system exists yet to link a
-- real user account as manager_user_id).
alter table branches add column sort_order integer not null default 0;
alter table branches add column manager_name text;

-- Branches are always queried "all branches for a business, in order" once
-- grouped client-side from the org-wide list.
create index branches_business_id_sort_order_idx on branches (business_id, sort_order);
