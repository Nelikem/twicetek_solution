import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database, Tables } from "@/types/database.types"

type TypedClient = SupabaseClient<Database, "public">
type NotificationRow = Tables<"notifications">

export interface Notification {
  id: string
  organizationId: string | null
  type: string
  title: string
  body: string
  link: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

function toDomain(row: NotificationRow): Notification {
  return {
    id: row.id,
    organizationId: row.organization_id,
    type: row.type,
    title: row.title,
    body: row.body ?? "",
    link: row.link,
    isRead: row.is_read,
    readAt: row.read_at,
    createdAt: row.created_at,
  }
}

export async function listNotifications(
  supabase: TypedClient,
  userId: string,
  limit = 10
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data.map(toDomain)
}

export async function markNotificationRead(supabase: TypedClient, id: string): Promise<Notification> {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single()

  if (error) throw error
  return toDomain(data)
}
