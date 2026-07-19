import { useMutation, useQueryClient } from "@tanstack/react-query"

import { businessKeys } from "@/features/onboarding/hooks/business-keys"
import type { Business } from "@/features/onboarding/types/onboarding.types"
import { deleteBusiness } from "@/services/businesses.service"
import { createClient } from "@/lib/supabase/client"

/** Optimistic: removes from the cache immediately so the exit animation fires on
 * click rather than after a round trip; rolls back on error. */
export function useDeleteBusinessMutation(organizationId: string | null) {
  const queryClient = useQueryClient()
  const queryKey = businessKeys.list(organizationId)

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      await deleteBusiness(supabase, id)
      return id
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Business[]>(queryKey)
      queryClient.setQueryData<Business[]>(queryKey, (old) => old?.filter((b) => b.id !== id))
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
  })
}
