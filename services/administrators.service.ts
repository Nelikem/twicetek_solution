import type { SupabaseClient } from "@supabase/supabase-js"

import type { AdministratorDraftValues } from "@/features/onboarding/schemas/administrator.schema"
import type { Administrator } from "@/features/onboarding/types/onboarding.types"
import type { Database, Tables } from "@/types/database.types"

type TypedClient = SupabaseClient<Database>
type MembershipRow = Tables<"organization_members">
type ProfileRow = Tables<"profiles">

function toDomain(membership: MembershipRow, profile: ProfileRow): Administrator {
  return {
    membershipId: membership.id,
    organizationId: membership.organization_id,
    userId: membership.user_id,
    roleId: membership.role_id,
    status: membership.status,
    joinedAt: membership.joined_at,
    createdAt: membership.created_at,
    updatedAt: membership.updated_at,
    fullName: profile.full_name ?? "",
    jobTitle: membership.job_title ?? "",
    phone: profile.phone ?? "",
  }
}

function toMembershipPatch(patch: AdministratorDraftValues) {
  return {
    ...(patch.jobTitle !== undefined && { job_title: patch.jobTitle }),
  }
}

function toProfilePatch(patch: AdministratorDraftValues) {
  return {
    ...(patch.fullName !== undefined && { full_name: patch.fullName }),
    ...(patch.phone !== undefined && { phone: patch.phone }),
  }
}

/**
 * Idempotent: creates (or returns) the owner's organization_members row via RPC,
 * then fetches their profile to build the combined domain object.
 */
export async function ensureOwnerMembership(
  supabase: TypedClient,
  organizationId: string
): Promise<Administrator> {
  const { data: membership, error } = await supabase.rpc("ensure_owner_membership", {
    org_id: organizationId,
  })
  if (error) throw error

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", membership.user_id)
    .single()
  if (profileError) throw profileError

  return toDomain(membership, profile)
}

export async function getAdministrator(
  supabase: TypedClient,
  organizationId: string
): Promise<Administrator | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError

  const [membershipResult, profileResult] = await Promise.all([
    supabase
      .from("organization_members")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("user_id", userData.user.id)
      .maybeSingle(),
    supabase.from("profiles").select("*").eq("id", userData.user.id).single(),
  ])
  if (membershipResult.error) throw membershipResult.error
  if (profileResult.error) throw profileResult.error
  if (!membershipResult.data) return null

  return toDomain(membershipResult.data, profileResult.data)
}

/**
 * The entity spans two tables (profiles.full_name/phone, organization_members.job_title).
 * This is the only place that needs to know that — callers see one combined Administrator.
 */
export async function updateAdministrator(
  supabase: TypedClient,
  params: { membershipId: string; userId: string; patch: AdministratorDraftValues }
): Promise<Administrator> {
  const membershipPatch = toMembershipPatch(params.patch)
  const profilePatch = toProfilePatch(params.patch)

  const [membershipResult, profileResult] = await Promise.all([
    Object.keys(membershipPatch).length > 0
      ? supabase
          .from("organization_members")
          .update(membershipPatch)
          .eq("id", params.membershipId)
          .select("*")
          .single()
      : supabase.from("organization_members").select("*").eq("id", params.membershipId).single(),
    Object.keys(profilePatch).length > 0
      ? supabase.from("profiles").update(profilePatch).eq("id", params.userId).select("*").single()
      : supabase.from("profiles").select("*").eq("id", params.userId).single(),
  ])
  if (membershipResult.error) throw membershipResult.error
  if (profileResult.error) throw profileResult.error

  return toDomain(membershipResult.data, profileResult.data)
}
