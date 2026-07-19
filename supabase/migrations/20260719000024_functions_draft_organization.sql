-- get_or_create_draft_organization(): the entry point Step 1 of the onboarding
-- wizard calls on mount. Idempotent — returns the caller's existing draft org if
-- one exists, else creates one. Runs `security invoker` (the default) rather than
-- `security definer`: the calling user already has legitimate direct access to
-- their own draft under the organizations RLS policies (organizations_select,
-- organizations_insert from rls_policies_organizations.sql), so there is no need
-- to bypass RLS here — doing the insert as the caller lets Postgres enforce the
-- same owner_user_id/status='draft' invariant it would for a raw client insert.
create or replace function get_or_create_draft_organization()
returns organizations
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  draft organizations;
begin
  select *
  into draft
  from organizations
  where owner_user_id = auth.uid()
    and status = 'draft'
  limit 1;

  if found then
    return draft;
  end if;

  begin
    insert into organizations (owner_user_id, status, created_by)
    values (auth.uid(), 'draft', auth.uid())
    returning * into draft;

    return draft;
  exception when unique_violation then
    -- Lost a race against organizations_one_draft_per_owner (e.g. a second tab
    -- creating a draft at the same moment) -- the other transaction's draft is
    -- now the canonical one, so just return it.
    select *
    into draft
    from organizations
    where owner_user_id = auth.uid()
      and status = 'draft'
    limit 1;

    return draft;
  end;
end;
$$;

revoke execute on function get_or_create_draft_organization() from public;
grant execute on function get_or_create_draft_organization() to authenticated;
