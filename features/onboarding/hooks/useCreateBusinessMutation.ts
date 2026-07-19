import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { businessKeys } from "@/features/onboarding/hooks/business-keys"
import type { Business } from "@/features/onboarding/types/onboarding.types"
import { createBusiness } from "@/services/businesses.service"
import { createClient } from "@/lib/supabase/client"

export function useCreateBusinessMutation(organizationId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error("No organization to add a business to yet")
      const supabase = createClient()
      return createBusiness(supabase, organizationId)
    },
    onSuccess: (business) => {
      queryClient.setQueryData<Business[]>(businessKeys.list(organizationId), (old) => [
        ...(old ?? []),
        business,
      ])
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Couldn't add a business")
    },
  })
}
