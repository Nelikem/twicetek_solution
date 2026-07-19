import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { branchKeys } from "@/features/onboarding/hooks/branch-keys"
import type { Branch } from "@/features/onboarding/types/onboarding.types"
import { createBranch } from "@/services/branches.service"
import { createClient } from "@/lib/supabase/client"

export function useCreateBranchMutation(organizationId: string | null, businessId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error("No organization to add a branch to yet")
      const supabase = createClient()
      return createBranch(supabase, organizationId, businessId)
    },
    onSuccess: (branch) => {
      queryClient.setQueryData<Branch[]>(branchKeys.list(organizationId), (old) => [...(old ?? []), branch])
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Couldn't add a branch")
    },
  })
}
