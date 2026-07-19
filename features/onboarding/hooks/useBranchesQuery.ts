import { useQuery } from "@tanstack/react-query"

import { branchKeys } from "@/features/onboarding/hooks/branch-keys"
import { listBranches } from "@/services/branches.service"
import { createClient } from "@/lib/supabase/client"

export function useBranchesQuery(organizationId: string | null) {
  return useQuery({
    queryKey: branchKeys.list(organizationId),
    queryFn: async () => {
      const supabase = createClient()
      return listBranches(supabase, organizationId as string)
    },
    enabled: !!organizationId,
  })
}
