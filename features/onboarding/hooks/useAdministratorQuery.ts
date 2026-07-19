import { useQuery } from "@tanstack/react-query"

import { administratorKeys } from "@/features/onboarding/hooks/administrator-keys"
import { getAdministrator } from "@/services/administrators.service"
import { createClient } from "@/lib/supabase/client"

export function useAdministratorQuery(organizationId: string | null) {
  return useQuery({
    queryKey: administratorKeys.detail(organizationId),
    queryFn: async () => {
      const supabase = createClient()
      return getAdministrator(supabase, organizationId as string)
    },
    enabled: !!organizationId,
  })
}
