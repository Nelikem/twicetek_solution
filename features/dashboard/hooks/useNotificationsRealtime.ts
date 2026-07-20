import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { notificationKeys } from "@/features/dashboard/hooks/notification-keys"
import { createClient } from "@/lib/supabase/client"

/**
 * Subscribes to INSERTs on notifications for the current user (requires the
 * `notifications` table to be in the supabase_realtime publication -- see
 * supabase/migrations/20260719000039_dashboard_realtime_publication.sql).
 * Invalidates the notification list cache and fires a toast for each arrival.
 */
export function useNotificationsRealtime(userId: string | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_user_id=eq.${userId}` },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: notificationKeys.list(userId) })
          const row = payload.new as { title?: string; body?: string | null }
          if (row.title) toast(row.title, { description: row.body ?? undefined })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, queryClient])
}
