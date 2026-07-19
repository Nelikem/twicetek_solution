import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { branchKeys } from "@/features/onboarding/hooks/branch-keys"
import type { Branch } from "@/features/onboarding/types/onboarding.types"
import { updateSortOrders } from "@/services/branches.service"
import { createClient } from "@/lib/supabase/client"

interface ReorderBranchesInput {
  businessId: string
  reordered: Branch[]
}

/** Optimistic: writes the new order into the cache immediately so Framer Motion's
 * `layout` animates on click, persists in the background, rolls back on error.
 *
 * Unlike useReorderBusinessesMutation, the cache here holds every branch across
 * every business in the org (one flat list, grouped client-side by business_id).
 * A reorder only ever touches one business's subset, so onMutate must merge that
 * reindexed subset back into the full array rather than replacing it wholesale —
 * a wholesale replace would silently drop every other business's branches from
 * the cache until the next refetch. */
export function useReorderBranchesMutation(organizationId: string | null) {
  const queryClient = useQueryClient()
  const queryKey = branchKeys.list(organizationId)

  return useMutation({
    mutationFn: async ({ reordered }: ReorderBranchesInput) => {
      const supabase = createClient()
      await updateSortOrders(
        supabase,
        reordered.map((branch, index) => ({ id: branch.id, sortOrder: index }))
      )
    },
    onMutate: async ({ businessId, reordered }: ReorderBranchesInput) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Branch[]>(queryKey)
      const reindexed = reordered.map((branch, index) => ({ ...branch, sortOrder: index }))
      queryClient.setQueryData<Branch[]>(queryKey, (old) => [
        ...(old ?? []).filter((branch) => branch.businessId !== businessId),
        ...reindexed,
      ])
      return { previous }
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
      toast.error(error instanceof Error ? error.message : "Couldn't reorder branches")
    },
  })
}
