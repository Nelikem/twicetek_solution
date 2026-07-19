import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { branchKeys } from "@/features/onboarding/hooks/branch-keys"
import type { Branch } from "@/features/onboarding/types/onboarding.types"
import { duplicateBranch } from "@/services/branches.service"
import { createClient } from "@/lib/supabase/client"

export function useDuplicateBranchMutation(organizationId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (source: Branch) => {
      const supabase = createClient()
      return duplicateBranch(supabase, source)
    },
    onSuccess: (branch) => {
      queryClient.setQueryData<Branch[]>(branchKeys.list(organizationId), (old) => [...(old ?? []), branch])
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Couldn't duplicate that branch")
    },
  })
}
