import { useMutation, useQueryClient } from "@tanstack/react-query"

import { administratorKeys } from "@/features/onboarding/hooks/administrator-keys"
import { ensureOwnerMembership } from "@/services/administrators.service"
import { createClient } from "@/lib/supabase/client"

/**
 * Ensures the signed-in owner has an organization_members row for the draft org,
 * creating one on first visit to Step 4. Idempotent server-side
 * (ensure_owner_membership RPC), so calling this from multiple tabs/mounts is safe.
 */
export function useEnsureOwnerMembershipMutation(organizationId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error("No organization to attach the administrator to yet")
      const supabase = createClient()
      return ensureOwnerMembership(supabase, organizationId)
    },
    onSuccess: (administrator) => {
      queryClient.setQueryData(administratorKeys.detail(administrator.organizationId), administrator)
    },
  })
}
