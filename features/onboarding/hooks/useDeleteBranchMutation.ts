import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { branchKeys } from "@/features/onboarding/hooks/branch-keys"
import type { Branch } from "@/features/onboarding/types/onboarding.types"
import { deleteBranch } from "@/services/branches.service"
import { createClient } from "@/lib/supabase/client"

/** Optimistic: removes from the cache immediately so the exit animation fires on
 * click rather than after a round trip; rolls back on error. */
export function useDeleteBranchMutation(organizationId: string | null) {
  const queryClient = useQueryClient()
  const queryKey = branchKeys.list(organizationId)

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      await deleteBranch(supabase, id)
      return id
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Branch[]>(queryKey)
      queryClient.setQueryData<Branch[]>(queryKey, (old) => old?.filter((b) => b.id !== id))
      return { previous }
    },
    onError: (error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
      toast.error(error instanceof Error ? error.message : "Couldn't delete that branch")
    },
  })
}
