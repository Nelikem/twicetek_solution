import { useQuery } from "@tanstack/react-query"

import { businessKeys } from "@/features/onboarding/hooks/business-keys"
import { listBusinesses } from "@/services/businesses.service"
import { createClient } from "@/lib/supabase/client"

export function useBusinessesQuery(organizationId: string | null) {
  return useQuery({
    queryKey: businessKeys.list(organizationId),
    queryFn: async () => {
      const supabase = createClient()
      return listBusinesses(supabase, organizationId as string)
    },
    enabled: !!organizationId,
  })
}
