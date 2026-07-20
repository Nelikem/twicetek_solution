import type { SupabaseClient } from "@supabase/supabase-js"

import type { BusinessDraftValues } from "@/features/onboarding/schemas/business.schema"
import type { Business } from "@/features/onboarding/types/onboarding.types"
import type { Database, Tables } from "@/types/database.types"

type TypedClient = SupabaseClient<Database, "public">
type BusinessRow = Tables<"businesses">

function toDomain(row: BusinessRow): Business {
  return {
    id: row.id,
    organizationId: row.organization_id,
    status: row.status,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    logoPath: row.logo_path,
    name: row.name,
    legalName: row.legal_name ?? "",
    registrationNumber: row.registration_number ?? "",
    taxId: row.tax_id ?? "",
    industry: row.industry ?? "",
    description: row.description ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    website: row.website ?? "",
    managerName: row.manager_name ?? "",
    address: row.address ?? "",
  }
}

function toRowPatch(patch: BusinessDraftValues) {
  return {
    ...(patch.logoPath !== undefined && { logo_path: patch.logoPath }),
    ...(patch.name !== undefined && { name: patch.name }),
    ...(patch.legalName !== undefined && { legal_name: patch.legalName }),
    ...(patch.registrationNumber !== undefined && { registration_number: patch.registrationNumber }),
    ...(patch.taxId !== undefined && { tax_id: patch.taxId }),
    ...(patch.industry !== undefined && { industry: patch.industry }),
    ...(patch.description !== undefined && { description: patch.description }),
    ...(patch.email !== undefined && { email: patch.email }),
    ...(patch.phone !== undefined && { phone: patch.phone }),
    ...(patch.website !== undefined && { website: patch.website }),
    ...(patch.managerName !== undefined && { manager_name: patch.managerName }),
    ...(patch.address !== undefined && { address: patch.address }),
  }
}

export async function listBusinesses(supabase: TypedClient, organizationId: string): Promise<Business[]> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("organization_id", organizationId)
    .order("sort_order", { ascending: true })

  if (error) throw error
  return data.map(toDomain)
}

/** name is NOT NULL with no default, so the freshly-added row must set it explicitly. */
export async function createBusiness(supabase: TypedClient, organizationId: string): Promise<Business> {
  const { data: existing, error: maxError } = await supabase
    .from("businesses")
    .select("sort_order")
    .eq("organization_id", organizationId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (maxError) throw maxError
  const nextSortOrder = (existing?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from("businesses")
    .insert({ organization_id: organizationId, name: "", sort_order: nextSortOrder })
    .select("*")
    .single()

  if (error) throw error
  return toDomain(data)
}

export async function updateBusiness(
  supabase: TypedClient,
  id: string,
  patch: BusinessDraftValues
): Promise<Business> {
  const { data, error } = await supabase
    .from("businesses")
    .update(toRowPatch(patch))
    .eq("id", id)
    .select("*")
    .single()

  if (error) throw error
  return toDomain(data)
}

export async function deleteBusiness(supabase: TypedClient, id: string): Promise<void> {
  const { error } = await supabase.from("businesses").delete().eq("id", id)
  if (error) throw error
}

export async function duplicateBusiness(supabase: TypedClient, source: Business): Promise<Business> {
  const { data, error } = await supabase
    .from("businesses")
    .insert({
      organization_id: source.organizationId,
      name: source.name ? `${source.name} (Copy)` : "",
      legal_name: source.legalName || null,
      registration_number: source.registrationNumber || null,
      tax_id: source.taxId || null,
      industry: source.industry || null,
      description: source.description || null,
      email: source.email || null,
      phone: source.phone || null,
      website: source.website || null,
      manager_name: source.managerName || null,
      address: source.address || null,
      sort_order: source.sortOrder + 1,
    })
    .select("*")
    .single()

  if (error) throw error
  return toDomain(data)
}

export async function updateSortOrders(
  supabase: TypedClient,
  updates: { id: string; sortOrder: number }[]
): Promise<void> {
  const results = await Promise.all(
    updates.map(({ id, sortOrder }) =>
      supabase.from("businesses").update({ sort_order: sortOrder }).eq("id", id)
    )
  )

  const failed = results.find((result) => result.error)
  if (failed?.error) throw failed.error
}
