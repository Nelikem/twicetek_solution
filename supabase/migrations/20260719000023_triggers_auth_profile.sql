-- Creates a public.profiles row automatically whenever a new auth.users row is created.
-- security definer is required because this trigger fires on auth.users (owned by
-- supabase_auth_admin) and must write into public.profiles on behalf of that role;
-- running as the function owner (postgres, via `supabase db push`) bypasses RLS on
-- profiles and grants the necessary write access without exposing it to end users.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Standard Supabase pattern: supabase_auth_admin must be able to see/use objects in
-- the public schema for this trigger to fire successfully. Migrations are applied by
-- the postgres superuser (both locally and via `supabase db push`), so the function
-- itself is created with sufficient privilege; this grant covers the auth.users side.
grant usage on schema public to supabase_auth_admin;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
