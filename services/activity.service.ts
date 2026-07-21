import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database, Tables } from "@/types/database.types"

type TypedClient = SupabaseClient<Database, "public">
type ActivityLogRow = Tables<"activity_logs">

export interface ActivityLogEntry {
  id: string
  activityType: string
  description: string
  createdAt: string
}

function toDomain(row: ActivityLogRow): ActivityLogEntry {
  return {
    id: row.id,
    activityType: row.activity_type,
    description: row.description ?? "",
    createdAt: row.created_at,
  }
}

export interface RecentActivityFilters {
  businessId?: string | null
  days?: number
}

export async function listRecentActivity(
  supabase: TypedClient,
  organizationId: string,
  limit = 5,
  filters: RecentActivityFilters = {}
): Promise<ActivityLogEntry[]> {
  let query = supabase
    .from("activity_logs")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (filters.businessId) {
    query = query.eq("business_id", filters.businessId)
  }
  if (filters.days) {
    const cutoff = new Date(Date.now() - filters.days * 24 * 60 * 60 * 1000).toISOString()
    query = query.gte("created_at", cutoff)
  }

  const { data, error } = await query
  if (error) throw error
  return data.map(toDomain)
}

export async function countRecentActivity(supabase: TypedClient, organizationId: string, days: number): Promise<number> {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const { count, error } = await supabase
    .from("activity_logs")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .gte("created_at", cutoff)

  if (error) throw error
  return count ?? 0
}
