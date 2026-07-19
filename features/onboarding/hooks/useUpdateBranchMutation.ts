import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { branchKeys } from "@/features/onboarding/hooks/branch-keys"
import type { BranchDraftValues } from "@/features/onboarding/schemas/branch.schema"
import type { Branch } from "@/features/onboarding/types/onboarding.types"
import { updateBranch } from "@/services/branches.service"
import { createClient } from "@/lib/supabase/client"

export function useUpdateBranchMutation(branchId: string, organizationId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patch: BranchDraftValues) => {
      const supabase = createClient()
      return updateBranch(supabase, branchId, patch)
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Branch[]>(branchKeys.list(organizationId), (old) =>
        old?.map((branch) => (branch.id === updated.id ? updated : branch))
      )
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Couldn't save that branch")
    },
  })
}
