import { useMutation, useQueryClient } from "@tanstack/react-query"

import { administratorKeys } from "@/features/onboarding/hooks/administrator-keys"
import type { AdministratorDraftValues } from "@/features/onboarding/schemas/administrator.schema"
import { updateAdministrator } from "@/services/administrators.service"
import { createClient } from "@/lib/supabase/client"

export function useUpdateAdministratorMutation(organizationId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { membershipId: string; userId: string; patch: AdministratorDraftValues }) => {
      const supabase = createClient()
      return updateAdministrator(supabase, params)
    },
    onSuccess: (administrator) => {
      queryClient.setQueryData(administratorKeys.detail(organizationId), administrator)
    },
  })
}
