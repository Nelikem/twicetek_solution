import type { SupabaseClient } from "@supabase/supabase-js"

import type { SubscriptionDraftValues } from "@/features/onboarding/schemas/subscription.schema"
import type { Subscription } from "@/features/onboarding/types/onboarding.types"
import type { Database, Tables } from "@/types/database.types"

type TypedClient = SupabaseClient<Database, "public">
type SubscriptionRow = Tables<"subscriptions">

function toDomain(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    organizationId: row.organization_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    planId: row.plan_name,
    billingCycle: row.billing_cycle ?? "monthly",
  }
}

function toRowPatch(patch: SubscriptionDraftValues) {
  return {
    ...(patch.planId !== undefined && { plan_name: patch.planId }),
    ...(patch.billingCycle !== undefined && { billing_cycle: patch.billingCycle }),
  }
}

/** Get-or-null — at most one subscription per organization during onboarding. */
export async function getSubscription(supabase: TypedClient, organizationId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle()

  if (error) throw error
  return data ? toDomain(data) : null
}

/** Get-then-update-or-insert: no bootstrapping/RLS-timing problem here (unlike
 * organizations/organization_members), since is_org_admin is already satisfied
 * via the Step 4 membership row by the time Step 5 is reached. */
export async function upsertSubscription(
  supabase: TypedClient,
  organizationId: string,
  patch: SubscriptionDraftValues
): Promise<Subscription> {
  const existing = await getSubscription(supabase, organizationId)

  if (existing) {
    const { data, error } = await supabase
      .from("subscriptions")
      .update(toRowPatch(patch))
      .eq("id", existing.id)
      .select("*")
      .single()

    if (error) throw error
    return toDomain(data)
  }

  // plan_name is NOT NULL with no default -- must be set explicitly on insert.
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({ organization_id: organizationId, plan_name: patch.planId ?? "", ...toRowPatch(patch) })
    .select("*")
    .single()

  if (error) throw error
  return toDomain(data)
}
