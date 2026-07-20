import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database.types"

type TypedClient = SupabaseClient<Database, "public">

export type RoleSlug =
  | "owner"
  | "org_admin"
  | "business_manager"
  | "branch_manager"
  | "employee"
  | "finance"
  | "inventory_manager"
  | "hr"
  | "sales"
  | "read_only"

export interface CurrentMembership {
  membershipId: string
  organizationId: string
  userId: string
  fullName: string
  avatarUrl: string | null
  roleSlug: RoleSlug | null
  roleName: string | null
  status: "invited" | "active" | "suspended"
  organization: {
    id: string
    companyName: string
    status: "draft" | "active" | "suspended" | "archived"
  }
}

type MembershipQueryRow = {
  id: string
  organization_id: string
  user_id: string
  status: "invited" | "active" | "suspended"
  organizations: { id: string; company_name: string | null; status: "draft" | "active" | "suspended" | "archived" } | null
  roles: { id: string; slug: string; name: string } | null
}

function toDomain(
  row: MembershipQueryRow,
  profile: { full_name: string | null; avatar_url: string | null }
): CurrentMembership | null {
  if (!row.organizations) return null

  return {
    membershipId: row.id,
    organizationId: row.organization_id,
    userId: row.user_id,
    fullName: profile.full_name ?? "",
    avatarUrl: profile.avatar_url,
    roleSlug: (row.roles?.slug as RoleSlug) ?? null,
    roleName: row.roles?.name ?? null,
    status: row.status,
    organization: {
      id: row.organizations.id,
      companyName: row.organizations.company_name ?? "",
      status: row.organizations.status,
    },
  }
}

/**
 * Resolves "my organization + my role" via organization_members, not
 * organizations.owner_user_id -- unlike getOrganizationByOwner (see
 * organizations.service.ts), this correctly covers every membership role, not
 * just the owner. Used by the dashboard shell, which needs to be correct for
 * all 10 roles, not just owners.
 */
export async function getCurrentMembership(supabase: TypedClient): Promise<CurrentMembership | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!userData.user) return null

  const [membershipResult, profileResult] = await Promise.all([
    supabase
      .from("organization_members")
      .select("id, organization_id, user_id, status, organizations(id, company_name, status), roles(id, slug, name)")
      .eq("user_id", userData.user.id)
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase.from("profiles").select("full_name, avatar_url").eq("id", userData.user.id).single(),
  ])

  if (membershipResult.error) throw membershipResult.error
  if (profileResult.error) throw profileResult.error
  if (!membershipResult.data) return null

  return toDomain(membershipResult.data as unknown as MembershipQueryRow, profileResult.data)
}

export async function countActiveMembers(supabase: TypedClient, organizationId: string): Promise<number> {
  const { count, error } = await supabase
    .from("organization_members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "active")

  if (error) throw error
  return count ?? 0
}
