create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on profiles
  for each row execute function set_updated_at();

create trigger set_updated_at before update on organizations
  for each row execute function set_updated_at();

create trigger set_updated_at before update on businesses
  for each row execute function set_updated_at();

create trigger set_updated_at before update on branches
  for each row execute function set_updated_at();

create trigger set_updated_at before update on departments
  for each row execute function set_updated_at();

create trigger set_updated_at before update on roles
  for each row execute function set_updated_at();

create trigger set_updated_at before update on organization_members
  for each row execute function set_updated_at();

create trigger set_updated_at before update on business_members
  for each row execute function set_updated_at();

create trigger set_updated_at before update on branch_members
  for each row execute function set_updated_at();

create trigger set_updated_at before update on subscriptions
  for each row execute function set_updated_at();

create trigger set_updated_at before update on settings
  for each row execute function set_updated_at();

create trigger set_updated_at before update on invitations
  for each row execute function set_updated_at();
