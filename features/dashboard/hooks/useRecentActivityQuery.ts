import { useQuery } from "@tanstack/react-query"

import { activityKeys } from "@/features/dashboard/hooks/activity-keys"
import { listRecentActivity } from "@/services/activity.service"
import { createClient } from "@/lib/supabase/client"

interface RecentActivityOptions {
  businessId?: string | null
  days?: number
}

export function useRecentActivityQuery(organizationId: string | null, options: RecentActivityOptions = {}) {
  const { businessId, days } = options

  return useQuery({
    queryKey: activityKeys.recent(organizationId, businessId, days),
    queryFn: async () => {
      const supabase = createClient()
      return listRecentActivity(supabase, organizationId as string, 5, { businessId, days })
    },
    enabled: !!organizationId,
  })
}
