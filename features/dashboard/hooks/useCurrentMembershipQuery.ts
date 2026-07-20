import { useQuery } from "@tanstack/react-query"

import { membershipKeys } from "@/features/dashboard/hooks/membership-keys"
import { getCurrentMembership, type CurrentMembership } from "@/services/memberships.service"
import { createClient } from "@/lib/supabase/client"

export function useCurrentMembershipQuery(initialData?: CurrentMembership) {
  return useQuery({
    queryKey: membershipKeys.current(),
    queryFn: async () => {
      const supabase = createClient()
      return getCurrentMembership(supabase)
    },
    initialData,
  })
}
