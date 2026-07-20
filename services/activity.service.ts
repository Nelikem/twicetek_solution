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

export async function listRecentActivity(
  supabase: TypedClient,
  organizationId: string,
  limit = 5
): Promise<ActivityLogEntry[]> {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data.map(toDomain)
}
