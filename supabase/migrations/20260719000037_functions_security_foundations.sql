-- ---------------------------------------------------------------------------
-- record_login_attempt: called by the login form after every signInWithPassword
-- result (success or failure). Writes login_history + security_logs, and bumps
-- profiles.last_login on success. security definer because an anonymous or
-- not-yet-resolved-to-a-user caller must still be able to log a failed attempt
-- against an email with no matching profiles row.
-- ---------------------------------------------------------------------------
create or replace function record_login_attempt(
  p_email text,
  p_success boolean,
  p_failure_reason text default null,
  p_ip_address inet default null,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from profiles where email = p_email::extensions.citext limit 1;

  insert into login_history (user_id, email, success, failure_reason, ip_address, user_agent)
  values (v_user_id, p_email, p_success, p_failure_reason, p_ip_address, p_user_agent);

  if v_user_id is not null then
    insert into security_logs (user_id, event_type, ip_address, user_agent)
    values (v_user_id,
            (case when p_success then 'login_success' else 'login_failed' end)::security_event_type,
            p_ip_address, p_user_agent);

    if p_success then
      update profiles set last_login = now() where id = v_user_id;
    end if;
  end if;
end;
$$;

revoke execute on function record_login_attempt(text, boolean, text, inet, text) from public;
grant execute on function record_login_attempt(text, boolean, text, inet, text) to authenticated, anon;
-- anon needed: a failed-login attempt happens *before* Supabase Auth grants an
-- authenticated JWT for that request in the failure case, so the caller may still
-- be running as anon at the moment this RPC is invoked from the login form.

-- ---------------------------------------------------------------------------
-- is_account_locked: 5 failed attempts / 15 minute window (confirmed default).
-- ---------------------------------------------------------------------------
create or replace function is_account_locked(p_email text)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select count(*) >= 5
  from login_history
  where email = p_email
    and success = false
    and created_at > now() - interval '15 minutes';
$$;

revoke execute on function is_account_locked(text) from public;
grant execute on function is_account_locked(text) to authenticated, anon;

-- ---------------------------------------------------------------------------
-- capture_password_history: BEFORE UPDATE trigger on auth.users, mirrors
-- handle_new_user()'s security-definer-on-auth-schema pattern exactly. Copies
-- the outgoing hash before it's overwritten, then prunes to the last 5 rows
-- (confirmed retention count).
-- ---------------------------------------------------------------------------
create or replace function capture_password_history()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if old.encrypted_password is not null and old.encrypted_password <> new.encrypted_password then
    insert into password_history (user_id, password_hash)
    values (old.id, old.encrypted_password);

    delete from password_history
    where user_id = old.id
      and id not in (
        select id from password_history
        where user_id = old.id
        order by created_at desc
        limit 5
      );
  end if;
  return new;
end;
$$;

create trigger on_auth_user_password_change
  before update of encrypted_password on auth.users
  for each row execute function capture_password_history();

-- ---------------------------------------------------------------------------
-- check_password_reused: candidate password never leaves the request that
-- already has it -- reset-password page calls this before updateUser().
-- ---------------------------------------------------------------------------
create or replace function check_password_reused(p_password text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_reused boolean;
begin
  select exists (
    select 1 from password_history
    where user_id = auth.uid()
      and password_hash = crypt(p_password, password_hash)
  ) into v_reused;
  return v_reused;
end;
$$;

revoke execute on function check_password_reused(text) from public;
grant execute on function check_password_reused(text) to authenticated;

-- ---------------------------------------------------------------------------
-- list_my_sessions / revoke_session: read/mutate auth.sessions (GoTrue's own
-- table -- RLS-enabled, zero policies, so this security-definer RPC is the only
-- supported access path). Deleting a row from auth.sessions is GoTrue's own
-- session-revocation primitive: refresh tokens are validated against their
-- owning session row on every refresh, so removing the row makes the next
-- refresh attempt for that session fail, signing that device out.
-- ---------------------------------------------------------------------------
create or replace function list_my_sessions()
returns table (
  id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  refreshed_at timestamptz,
  not_after timestamptz,
  user_agent text,
  ip text,
  is_current boolean
)
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select s.id, s.created_at, s.updated_at, s.refreshed_at, s.not_after,
         s.user_agent, s.ip::text,
         s.id = (auth.jwt() ->> 'session_id')::uuid as is_current
  from auth.sessions s
  where s.user_id = auth.uid()
  order by s.created_at desc;
$$;

revoke execute on function list_my_sessions() from public;
grant execute on function list_my_sessions() to authenticated;

create or replace function revoke_session(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  delete from auth.sessions
  where id = p_session_id and user_id = auth.uid();
end;
$$;

revoke execute on function revoke_session(uuid) from public;
grant execute on function revoke_session(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- log_security_event: shared helper for any authenticated-user-initiated
-- security event (password change, future profile-update/logout call sites),
-- avoiding duplicated insert logic per flow.
-- ---------------------------------------------------------------------------
create or replace function log_security_event(p_event_type security_event_type, p_metadata jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into security_logs (user_id, event_type, metadata)
  values (auth.uid(), p_event_type, p_metadata);
end;
$$;

revoke execute on function log_security_event(security_event_type, jsonb) from public;
grant execute on function log_security_event(security_event_type, jsonb) to authenticated;
