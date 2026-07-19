import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database.types"

type TypedClient = SupabaseClient<Database>

const BUCKET = "organization-logos"
const SIGNED_URL_TTL_SECONDS = 3600

export async function uploadOrganizationLogo(
  supabase: TypedClient,
  organizationId: string,
  file: File
): Promise<string> {
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
  const path = `${organizationId}/logo-${Date.now()}.${extension}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  })

  if (error) throw error
  return path
}

export async function getOrganizationLogoSignedUrl(
  supabase: TypedClient,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
  if (error) throw error
  return data.signedUrl
}

export async function deleteOrganizationLogo(supabase: TypedClient, path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}
