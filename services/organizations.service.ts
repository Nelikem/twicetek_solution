import type { SupabaseClient } from "@supabase/supabase-js"

import type { OrganizationInfoDraftValues } from "@/features/onboarding/schemas/organization-info.schema"
import type { OrganizationDraft } from "@/features/onboarding/types/onboarding.types"
import type { Database, Tables } from "@/types/database.types"

type TypedClient = SupabaseClient<Database>
type OrganizationRow = Tables<"organizations">

function toDomain(row: OrganizationRow): OrganizationDraft {
  return {
    id: row.id,
    status: row.status,
    ownerUserId: row.owner_user_id,
    onboardingCurrentStep: row.onboarding_current_step,
    onboardingLastSavedAt: row.onboarding_last_saved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    logoPath: row.logo_path,
    companyName: row.company_name ?? "",
    legalBusinessName: row.legal_business_name ?? "",
    registrationNumber: row.registration_number ?? "",
    taxId: row.tax_id ?? "",
    industry: row.industry ?? "",
    orgEmail: row.org_email ?? "",
    phone: row.phone ?? "",
    website: row.website ?? "",
    country: row.country ?? "",
    state: row.state ?? "",
    city: row.city ?? "",
    address: row.address ?? "",
    timezone: row.timezone ?? "",
    currency: row.currency ?? "",
    fiscalYearStartMonth:
      row.fiscal_year_start_month != null ? String(row.fiscal_year_start_month) : "",
  }
}

function toRowPatch(patch: OrganizationInfoDraftValues) {
  return {
    ...(patch.logoPath !== undefined && { logo_path: patch.logoPath }),
    ...(patch.companyName !== undefined && { company_name: patch.companyName }),
    ...(patch.legalBusinessName !== undefined && { legal_business_name: patch.legalBusinessName }),
    ...(patch.registrationNumber !== undefined && { registration_number: patch.registrationNumber }),
    ...(patch.taxId !== undefined && { tax_id: patch.taxId }),
    ...(patch.industry !== undefined && { industry: patch.industry }),
    ...(patch.orgEmail !== undefined && { org_email: patch.orgEmail }),
    ...(patch.phone !== undefined && { phone: patch.phone }),
    ...(patch.website !== undefined && { website: patch.website }),
    ...(patch.country !== undefined && { country: patch.country }),
    ...(patch.state !== undefined && { state: patch.state }),
    ...(patch.city !== undefined && { city: patch.city }),
    ...(patch.address !== undefined && { address: patch.address }),
    ...(patch.timezone !== undefined && { timezone: patch.timezone }),
    ...(patch.currency !== undefined && { currency: patch.currency }),
    ...(patch.fiscalYearStartMonth !== undefined && {
      fiscal_year_start_month: Number(patch.fiscalYearStartMonth),
    }),
  }
}

/**
 * Idempotent: returns the caller's existing draft org if one exists, else creates
 * one. Implemented as a Postgres RPC (not a client select-then-insert) to close the
 * race window between two concurrent tabs both finding "no draft yet".
 */
export async function getOrCreateDraft(supabase: TypedClient): Promise<OrganizationDraft> {
  const { data, error } = await supabase.rpc("get_or_create_draft_organization")
  if (error) throw error
  return toDomain(data)
}

export async function getDraftById(
  supabase: TypedClient,
  id: string
): Promise<OrganizationDraft | null> {
  const { data, error } = await supabase.from("organizations").select("*").eq("id", id).maybeSingle()
  if (error) throw error
  return data ? toDomain(data) : null
}

export async function updateOrganizationInfo(
  supabase: TypedClient,
  id: string,
  patch: OrganizationInfoDraftValues
): Promise<OrganizationDraft> {
  const { data, error } = await supabase
    .from("organizations")
    .update({ ...toRowPatch(patch), onboarding_last_saved_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single()

  if (error) throw error
  return toDomain(data)
}
