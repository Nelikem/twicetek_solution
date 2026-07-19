import { useMutation, useQueryClient } from "@tanstack/react-query"

import { organizationKeys } from "@/features/onboarding/hooks/organization-keys"
import { useOnboardingWizardStore } from "@/features/onboarding/store/onboarding-wizard.store"
import { getOrCreateDraft } from "@/services/organizations.service"
import { createClient } from "@/lib/supabase/client"

/**
 * Ensures the signed-in user has a draft organization to work against, creating one
 * on first visit. Idempotent server-side (get_or_create_draft_organization RPC), so
 * calling this from multiple tabs/mounts is safe.
 */
export function useEnsureDraftMutation() {
  const queryClient = useQueryClient()
  const setDraftId = useOnboardingWizardStore((state) => state.setDraftId)

  return useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      return getOrCreateDraft(supabase)
    },
    onSuccess: (draft) => {
      setDraftId(draft.id)
      queryClient.setQueryData(organizationKeys.draft(draft.id), draft)
    },
  })
}
