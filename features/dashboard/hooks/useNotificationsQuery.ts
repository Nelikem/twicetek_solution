import { useQuery } from "@tanstack/react-query"

import { notificationKeys } from "@/features/dashboard/hooks/notification-keys"
import { listNotifications } from "@/services/notifications.service"
import { createClient } from "@/lib/supabase/client"

export function useNotificationsQuery(userId: string | null) {
  return useQuery({
    queryKey: notificationKeys.list(userId),
    queryFn: async () => {
      const supabase = createClient()
      return listNotifications(supabase, userId as string)
    },
    enabled: !!userId,
  })
}
