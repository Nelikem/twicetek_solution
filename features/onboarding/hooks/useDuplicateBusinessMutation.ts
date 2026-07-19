import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { businessKeys } from "@/features/onboarding/hooks/business-keys"
import type { Business } from "@/features/onboarding/types/onboarding.types"
import { duplicateBusiness } from "@/services/businesses.service"
import { createClient } from "@/lib/supabase/client"

export function useDuplicateBusinessMutation(organizationId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (source: Business) => {
      const supabase = createClient()
      return duplicateBusiness(supabase, source)
    },
    onSuccess: (business) => {
      queryClient.setQueryData<Business[]>(businessKeys.list(organizationId), (old) => [
        ...(old ?? []),
        business,
      ])
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Couldn't duplicate that business")
    },
  })
}
