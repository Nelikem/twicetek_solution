-- Bug: get_or_create_draft_organization() only ever looked for a 'draft' org.
-- Every step's client fallback (useEnsureDraftMutation) calls this on mount
-- whenever draftId is falsy -- which happens on every hard page reload for a
-- brief window before the Zustand store's persisted draftId rehydrates from
-- localStorage. While onboarding is in progress this is harmless (the lookup
-- still finds the same 'draft' row), but once complete_onboarding() flips the
-- org to 'active', that rehydration-window reload race causes this function to
-- find nothing, fall through to INSERT, and silently create a second, empty
-- draft org for the same owner -- orphaning the just-completed one.
--
-- Fix: look up ANY organization owned by the caller regardless of status, and
-- only create a new draft if they truly have none. This preserves idempotency
-- across the org's entire lifecycle (draft through active), not just the
-- in-progress-onboarding phase.
create or replace function get_or_create_draft_organization()
returns organizations
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  org organizations;
begin
  select *
  into org
  from organizations
  where owner_user_id = auth.uid()
  order by created_at desc
  limit 1;

  if found then
    return org;
  end if;

  begin
    insert into organizations (owner_user_id, status, created_by)
    values (auth.uid(), 'draft', auth.uid())
    returning * into org;

    return org;
  exception when unique_violation then
    -- Lost a race against organizations_one_draft_per_owner (e.g. a second tab
    -- creating a draft at the same moment) -- the other transaction's draft is
    -- now the canonical one, so just return it.
    select *
    into org
    from organizations
    where owner_user_id = auth.uid()
    order by created_at desc
    limit 1;

    return org;
  end;
end;
$$;
