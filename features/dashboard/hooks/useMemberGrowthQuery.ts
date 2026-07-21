import { useQuery } from "@tanstack/react-query"

import { membershipKeys } from "@/features/dashboard/hooks/membership-keys"
import { getMemberGrowth } from "@/services/memberships.service"
import { createClient } from "@/lib/supabase/client"

export function useMemberGrowthQuery(organizationId: string | null) {
  return useQuery({
    queryKey: membershipKeys.growth(organizationId),
    queryFn: async () => {
      const supabase = createClient()
      return getMemberGrowth(supabase, organizationId as string)
    },
    enabled: !!organizationId,
  })
}
