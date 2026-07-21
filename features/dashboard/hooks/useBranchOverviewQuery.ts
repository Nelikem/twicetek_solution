import { useQuery } from "@tanstack/react-query"

import { branchKeys } from "@/features/onboarding/hooks/branch-keys"
import { getBranchOverview } from "@/services/branches.service"
import { createClient } from "@/lib/supabase/client"

export function useBranchOverviewQuery(organizationId: string | null, businessId: string | null = null) {
  return useQuery({
    queryKey: branchKeys.overview(organizationId, businessId),
    queryFn: async () => {
      const supabase = createClient()
      return getBranchOverview(supabase, organizationId as string, businessId)
    },
    enabled: !!organizationId,
  })
}
