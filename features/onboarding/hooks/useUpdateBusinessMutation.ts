import { useMutation, useQueryClient } from "@tanstack/react-query"

import { businessKeys } from "@/features/onboarding/hooks/business-keys"
import type { BusinessDraftValues } from "@/features/onboarding/schemas/business.schema"
import type { Business } from "@/features/onboarding/types/onboarding.types"
import { updateBusiness } from "@/services/businesses.service"
import { createClient } from "@/lib/supabase/client"

export function useUpdateBusinessMutation(businessId: string, organizationId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patch: BusinessDraftValues) => {
      const supabase = createClient()
      return updateBusiness(supabase, businessId, patch)
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Business[]>(businessKeys.list(organizationId), (old) =>
        old?.map((business) => (business.id === updated.id ? updated : business))
      )
    },
  })
}
