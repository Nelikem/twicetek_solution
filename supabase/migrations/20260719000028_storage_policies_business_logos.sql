-- business-logos: policies deferred in storage_buckets.sql until this feature existed.
-- Objects are keyed "<business_id>/logo-<timestamp>.<ext>", so the first path segment
-- resolves to a business id, not an organization id directly -- look up the owning
-- organization_id from businesses before delegating to the same is_org_owner/is_org_member
-- checks organization-logos uses.
create policy business_logos_insert on storage.objects for insert
  with check (
    bucket_id = 'business-logos'
    and (
      is_org_owner((select organization_id from businesses where id = ((storage.foldername(name))[1])::uuid))
      or is_org_member((select organization_id from businesses where id = ((storage.foldername(name))[1])::uuid))
    )
  );

create policy business_logos_select on storage.objects for select
  using (
    bucket_id = 'business-logos'
    and (
      is_org_owner((select organization_id from businesses where id = ((storage.foldername(name))[1])::uuid))
      or is_org_member((select organization_id from businesses where id = ((storage.foldername(name))[1])::uuid))
    )
  );

create policy business_logos_update on storage.objects for update
  using (
    bucket_id = 'business-logos'
    and (
      is_org_owner((select organization_id from businesses where id = ((storage.foldername(name))[1])::uuid))
      or is_org_member((select organization_id from businesses where id = ((storage.foldername(name))[1])::uuid))
    )
  )
  with check (
    bucket_id = 'business-logos'
    and (
      is_org_owner((select organization_id from businesses where id = ((storage.foldername(name))[1])::uuid))
      or is_org_member((select organization_id from businesses where id = ((storage.foldername(name))[1])::uuid))
    )
  );

create policy business_logos_delete on storage.objects for delete
  using (
    bucket_id = 'business-logos'
    and (
      is_org_owner((select organization_id from businesses where id = ((storage.foldername(name))[1])::uuid))
      or is_org_member((select organization_id from businesses where id = ((storage.foldername(name))[1])::uuid))
    )
  );
