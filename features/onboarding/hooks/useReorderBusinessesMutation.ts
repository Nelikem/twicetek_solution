import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { businessKeys } from "@/features/onboarding/hooks/business-keys"
import type { Business } from "@/features/onboarding/types/onboarding.types"
import { updateSortOrders } from "@/services/businesses.service"
import { createClient } from "@/lib/supabase/client"

/** Optimistic: writes the new order into the cache immediately so Framer Motion's
 * `layout` animates on click, persists in the background, rolls back on error. */
export function useReorderBusinessesMutation(organizationId: string | null) {
  const queryClient = useQueryClient()
  const queryKey = businessKeys.list(organizationId)

  return useMutation({
    mutationFn: async (reordered: Business[]) => {
      const supabase = createClient()
      await updateSortOrders(
        supabase,
        reordered.map((business, index) => ({ id: business.id, sortOrder: index }))
      )
      return reordered
    },
    onMutate: async (reordered: Business[]) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Business[]>(queryKey)
      queryClient.setQueryData<Business[]>(
        queryKey,
        reordered.map((business, index) => ({ ...business, sortOrder: index }))
      )
      return { previous }
    },
    onError: (error, _reordered, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
      toast.error(error instanceof Error ? error.message : "Couldn't reorder businesses")
    },
  })
}
