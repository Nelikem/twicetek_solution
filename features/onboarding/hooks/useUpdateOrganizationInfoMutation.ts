import { useMutation, useQueryClient } from "@tanstack/react-query"

import { organizationKeys } from "@/features/onboarding/hooks/organization-keys"
import type { OrganizationInfoDraftValues } from "@/features/onboarding/schemas/organization-info.schema"
import { updateOrganizationInfo } from "@/services/organizations.service"
import { createClient } from "@/lib/supabase/client"

export function useUpdateOrganizationInfoMutation(draftId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patch: OrganizationInfoDraftValues) => {
      if (!draftId) throw new Error("No draft organization to update yet")
      const supabase = createClient()
      return updateOrganizationInfo(supabase, draftId, patch)
    },
    onSuccess: (draft) => {
      // Autosave success writes straight into the cache instead of refetching —
      // avoids a network round trip on every debounced keystroke batch.
      queryClient.setQueryData(organizationKeys.draft(draft.id), draft)
    },
  })
}
