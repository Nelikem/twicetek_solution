import { useQuery } from "@tanstack/react-query"

import { businessKeys } from "@/features/onboarding/hooks/business-keys"
import { getBusinessOverview } from "@/services/businesses.service"
import { createClient } from "@/lib/supabase/client"

export function useBusinessOverviewQuery(organizationId: string | null) {
  return useQuery({
    queryKey: businessKeys.overview(organizationId),
    queryFn: async () => {
      const supabase = createClient()
      return getBusinessOverview(supabase, organizationId as string)
    },
    enabled: !!organizationId,
  })
}
