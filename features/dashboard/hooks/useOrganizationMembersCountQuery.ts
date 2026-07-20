import { useQuery } from "@tanstack/react-query"

import { membershipKeys } from "@/features/dashboard/hooks/membership-keys"
import { countActiveMembers } from "@/services/memberships.service"
import { createClient } from "@/lib/supabase/client"

export function useOrganizationMembersCountQuery(organizationId: string | null) {
  return useQuery({
    queryKey: membershipKeys.count(organizationId),
    queryFn: async () => {
      const supabase = createClient()
      return countActiveMembers(supabase, organizationId as string)
    },
    enabled: !!organizationId,
  })
}
