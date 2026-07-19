-- Storage buckets. Objects are expected to be keyed as "<scope-id>/<filename>" so that
-- (storage.foldername(name))[1] resolves to the owning organization/business/branch/user id.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('organization-logos', 'organization-logos', false, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('business-logos', 'business-logos', false, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('branch-assets', 'branch-assets', false, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-avatars', 'user-avatars', false, 1048576, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg'
  ]
)
on conflict (id) do nothing;

-- business-logos: RLS policies for this bucket: future phase
-- branch-assets: RLS policies for this bucket: future phase
-- user-avatars: RLS policies for this bucket: future phase
-- documents: RLS policies for this bucket: future phase

-- ---------------------------------------------------------------------------
-- organization-logos: the only bucket with client-facing policies in Phase 1.
-- The first path segment of the object name must be the owning organization's
-- id; access is granted to the org owner or any active org member.
-- ---------------------------------------------------------------------------
create policy organization_logos_insert on storage.objects for insert
  with check (
    bucket_id = 'organization-logos'
    and (
      is_org_owner(((storage.foldername(name))[1])::uuid)
      or is_org_member(((storage.foldername(name))[1])::uuid)
    )
  );

create policy organization_logos_select on storage.objects for select
  using (
    bucket_id = 'organization-logos'
    and (
      is_org_owner(((storage.foldername(name))[1])::uuid)
      or is_org_member(((storage.foldername(name))[1])::uuid)
    )
  );

create policy organization_logos_update on storage.objects for update
  using (
    bucket_id = 'organization-logos'
    and (
      is_org_owner(((storage.foldername(name))[1])::uuid)
      or is_org_member(((storage.foldername(name))[1])::uuid)
    )
  )
  with check (
    bucket_id = 'organization-logos'
    and (
      is_org_owner(((storage.foldername(name))[1])::uuid)
      or is_org_member(((storage.foldername(name))[1])::uuid)
    )
  );

create policy organization_logos_delete on storage.objects for delete
  using (
    bucket_id = 'organization-logos'
    and (
      is_org_owner(((storage.foldername(name))[1])::uuid)
      or is_org_member(((storage.foldername(name))[1])::uuid)
    )
  );
