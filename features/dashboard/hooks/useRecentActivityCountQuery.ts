import { useQuery } from "@tanstack/react-query"

import { activityKeys } from "@/features/dashboard/hooks/activity-keys"
import { countRecentActivity } from "@/services/activity.service"
import { createClient } from "@/lib/supabase/client"

export function useRecentActivityCountQuery(organizationId: string | null, days: number) {
  return useQuery({
    queryKey: activityKeys.count(organizationId, days),
    queryFn: async () => {
      const supabase = createClient()
      return countRecentActivity(supabase, organizationId as string, days)
    },
    enabled: !!organizationId,
  })
}
