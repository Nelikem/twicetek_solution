import { useQuery } from "@tanstack/react-query"

import { activityKeys } from "@/features/dashboard/hooks/activity-keys"
import { listRecentActivity } from "@/services/activity.service"
import { createClient } from "@/lib/supabase/client"

export function useRecentActivityQuery(organizationId: string | null) {
  return useQuery({
    queryKey: activityKeys.recent(organizationId),
    queryFn: async () => {
      const supabase = createClient()
      return listRecentActivity(supabase, organizationId as string)
    },
    enabled: !!organizationId,
  })
}
