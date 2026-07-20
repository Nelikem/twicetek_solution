-- Enables Supabase Realtime postgres_changes on notifications so the
-- dashboard's notification bell can subscribe to INSERTs for the current
-- user. No table has ever been added to supabase_realtime before this.
--
-- activity_logs is deliberately NOT added: the Activity Timeline is a
-- "last N events" widget, not a live ticker, and the existing 30s
-- TanStack Query staleTime is adequate latency for it. It also has no
-- per-recipient column to filter a realtime subscription on the way
-- notifications.recipient_user_id does.
alter publication supabase_realtime add table notifications;
