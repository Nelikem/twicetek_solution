import { useMutation, useQueryClient } from "@tanstack/react-query"

import { notificationKeys } from "@/features/dashboard/hooks/notification-keys"
import type { Notification } from "@/services/notifications.service"
import { markNotificationRead } from "@/services/notifications.service"
import { createClient } from "@/lib/supabase/client"

/** Optimistic: flips is_read in the cache immediately, rolls back on error. */
export function useMarkNotificationReadMutation(userId: string | null) {
  const queryClient = useQueryClient()
  const queryKey = notificationKeys.list(userId)

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      return markNotificationRead(supabase, id)
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Notification[]>(queryKey)
      queryClient.setQueryData<Notification[]>(queryKey, (old) =>
        old?.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
  })
}
