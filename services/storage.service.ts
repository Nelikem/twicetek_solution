import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database.types"

type TypedClient = SupabaseClient<Database>

type LogoBucket = "organization-logos" | "business-logos"

const SIGNED_URL_TTL_SECONDS = 3600

async function uploadLogo(
  supabase: TypedClient,
  bucket: LogoBucket,
  scopeId: string,
  file: File
): Promise<string> {
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
  const path = `${scopeId}/logo-${Date.now()}.${extension}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  })

  if (error) throw error
  return path
}

async function getLogoSignedUrl(supabase: TypedClient, bucket: LogoBucket, path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
  if (error) throw error
  return data.signedUrl
}

async function deleteLogo(supabase: TypedClient, bucket: LogoBucket, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

export const uploadOrganizationLogo = (supabase: TypedClient, organizationId: string, file: File) =>
  uploadLogo(supabase, "organization-logos", organizationId, file)
export const getOrganizationLogoSignedUrl = (supabase: TypedClient, path: string) =>
  getLogoSignedUrl(supabase, "organization-logos", path)
export const deleteOrganizationLogo = (supabase: TypedClient, path: string) =>
  deleteLogo(supabase, "organization-logos", path)

export const uploadBusinessLogo = (supabase: TypedClient, businessId: string, file: File) =>
  uploadLogo(supabase, "business-logos", businessId, file)
export const getBusinessLogoSignedUrl = (supabase: TypedClient, path: string) =>
  getLogoSignedUrl(supabase, "business-logos", path)
export const deleteBusinessLogo = (supabase: TypedClient, path: string) =>
  deleteLogo(supabase, "business-logos", path)
