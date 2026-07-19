-- Enforces that denormalized ancestor-scoping columns always match their parent row,
-- rather than trusting whatever the client supplied.

create or replace function enforce_branch_scoping()
returns trigger
language plpgsql
as $$
begin
  select organization_id into new.organization_id
  from businesses
  where id = new.business_id;

  if new.organization_id is null then
    raise exception 'branches.business_id % does not reference an existing business', new.business_id;
  end if;

  return new;
end;
$$;

create trigger enforce_branch_scoping before insert or update on branches
  for each row execute function enforce_branch_scoping();

create or replace function enforce_department_scoping()
returns trigger
language plpgsql
as $$
declare
  branch_business_id uuid;
begin
  select organization_id into new.organization_id
  from businesses
  where id = new.business_id;

  if new.organization_id is null then
    raise exception 'departments.business_id % does not reference an existing business', new.business_id;
  end if;

  if new.branch_id is not null then
    select business_id into branch_business_id
    from branches
    where id = new.branch_id;

    if branch_business_id is null then
      raise exception 'departments.branch_id % does not reference an existing branch', new.branch_id;
    end if;

    if branch_business_id <> new.business_id then
      raise exception 'departments.branch_id % belongs to a different business than departments.business_id %', new.branch_id, new.business_id;
    end if;
  end if;

  return new;
end;
$$;

create trigger enforce_department_scoping before insert or update on departments
  for each row execute function enforce_department_scoping();

create or replace function enforce_business_member_scoping()
returns trigger
language plpgsql
as $$
begin
  select organization_id into new.organization_id
  from businesses
  where id = new.business_id;

  if new.organization_id is null then
    raise exception 'business_members.business_id % does not reference an existing business', new.business_id;
  end if;

  return new;
end;
$$;

create trigger enforce_business_member_scoping before insert or update on business_members
  for each row execute function enforce_business_member_scoping();

create or replace function enforce_branch_member_scoping()
returns trigger
language plpgsql
as $$
begin
  select organization_id, business_id into new.organization_id, new.business_id
  from branches
  where id = new.branch_id;

  if new.organization_id is null then
    raise exception 'branch_members.branch_id % does not reference an existing branch', new.branch_id;
  end if;

  return new;
end;
$$;

create trigger enforce_branch_member_scoping before insert or update on branch_members
  for each row execute function enforce_branch_member_scoping();
