import type { SupabaseClient } from "@supabase/supabase-js"

import type { BranchDraftValues } from "@/features/onboarding/schemas/branch.schema"
import type { Branch } from "@/features/onboarding/types/onboarding.types"
import type { Database, Tables } from "@/types/database.types"

type TypedClient = SupabaseClient<Database>
type BranchRow = Tables<"branches">

function toDomain(row: BranchRow): Branch {
  return {
    id: row.id,
    organizationId: row.organization_id,
    businessId: row.business_id,
    status: row.status,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    name: row.name,
    managerName: row.manager_name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    gpsAddress: row.gps_address ?? "",
    physicalAddress: row.physical_address ?? "",
    // opening_hours is jsonb but the UI only ever writes a plain string into it;
    // PostgREST round-trips a jsonb scalar string back into a native JS string.
    openingHours: typeof row.opening_hours === "string" ? row.opening_hours : "",
    warehouseEnabled: row.warehouse_enabled,
    posEnabled: row.pos_enabled,
    deliveryEnabled: row.delivery_enabled,
  }
}

function toRowPatch(patch: BranchDraftValues) {
  return {
    ...(patch.name !== undefined && { name: patch.name }),
    ...(patch.managerName !== undefined && { manager_name: patch.managerName }),
    ...(patch.email !== undefined && { email: patch.email }),
    ...(patch.phone !== undefined && { phone: patch.phone }),
    ...(patch.gpsAddress !== undefined && { gps_address: patch.gpsAddress }),
    ...(patch.physicalAddress !== undefined && { physical_address: patch.physicalAddress }),
    ...(patch.openingHours !== undefined && { opening_hours: patch.openingHours }),
    ...(patch.warehouseEnabled !== undefined && { warehouse_enabled: patch.warehouseEnabled }),
    ...(patch.posEnabled !== undefined && { pos_enabled: patch.posEnabled }),
    ...(patch.deliveryEnabled !== undefined && { delivery_enabled: patch.deliveryEnabled }),
  }
}

/** Whole-org fetch — Step3Form groups the result by business_id client-side, so
 * ordering by sort_order alone is enough: each business's bucket naturally comes
 * out in ascending order. */
export async function listBranches(supabase: TypedClient, organizationId: string): Promise<Branch[]> {
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("organization_id", organizationId)
    .order("sort_order", { ascending: true })

  if (error) throw error
  return data.map(toDomain)
}

/** sort_order is scoped to the business, not the org — branches only reorder
 * among their own business's siblings. name is NOT NULL with no default, so the
 * freshly-added row must set it explicitly. */
export async function createBranch(
  supabase: TypedClient,
  organizationId: string,
  businessId: string
): Promise<Branch> {
  const { data: existing, error: maxError } = await supabase
    .from("branches")
    .select("sort_order")
    .eq("business_id", businessId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (maxError) throw maxError
  const nextSortOrder = (existing?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from("branches")
    .insert({ organization_id: organizationId, business_id: businessId, name: "", sort_order: nextSortOrder })
    .select("*")
    .single()

  if (error) throw error
  return toDomain(data)
}

export async function updateBranch(supabase: TypedClient, id: string, patch: BranchDraftValues): Promise<Branch> {
  const { data, error } = await supabase
    .from("branches")
    .update(toRowPatch(patch))
    .eq("id", id)
    .select("*")
    .single()

  if (error) throw error
  return toDomain(data)
}

export async function deleteBranch(supabase: TypedClient, id: string): Promise<void> {
  const { error } = await supabase.from("branches").delete().eq("id", id)
  if (error) throw error
}

export async function duplicateBranch(supabase: TypedClient, source: Branch): Promise<Branch> {
  const { data, error } = await supabase
    .from("branches")
    .insert({
      organization_id: source.organizationId,
      business_id: source.businessId,
      name: source.name ? `${source.name} (Copy)` : "",
      manager_name: source.managerName || null,
      email: source.email || null,
      phone: source.phone || null,
      gps_address: source.gpsAddress || null,
      physical_address: source.physicalAddress || null,
      opening_hours: source.openingHours || null,
      warehouse_enabled: source.warehouseEnabled,
      pos_enabled: source.posEnabled,
      delivery_enabled: source.deliveryEnabled,
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
    updates.map(({ id, sortOrder }) => supabase.from("branches").update({ sort_order: sortOrder }).eq("id", id))
  )

  const failed = results.find((result) => result.error)
  if (failed?.error) throw failed.error
}
