import { useMutation, useQueryClient } from "@tanstack/react-query"

import { branchKeys } from "@/features/onboarding/hooks/branch-keys"
import { businessKeys } from "@/features/onboarding/hooks/business-keys"
import { organizationKeys } from "@/features/onboarding/hooks/organization-keys"
import { completeOnboarding } from "@/services/organizations.service"
import { createClient } from "@/lib/supabase/client"

/**
 * Idempotent: flips the org (and its draft businesses/branches) to 'active' via
 * the complete_onboarding RPC. The RPC only returns the organization row, so
 * businesses/branches caches are invalidated (not directly written) to pick up
 * their new 'active' status before Step 6's summary re-renders.
 */
export function useCompleteOnboardingMutation(organizationId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error("No organization to complete onboarding for yet")
      const supabase = createClient()
      return completeOnboarding(supabase, organizationId)
    },
    onSuccess: (org) => {
      queryClient.setQueryData(organizationKeys.draft(organizationId), org)
      queryClient.invalidateQueries({ queryKey: businessKeys.list(organizationId) })
      queryClient.invalidateQueries({ queryKey: branchKeys.list(organizationId) })
    },
  })
}
