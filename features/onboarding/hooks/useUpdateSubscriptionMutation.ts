import { useMutation, useQueryClient } from "@tanstack/react-query"

import { subscriptionKeys } from "@/features/onboarding/hooks/subscription-keys"
import type { SubscriptionDraftValues } from "@/features/onboarding/schemas/subscription.schema"
import { upsertSubscription } from "@/services/subscriptions.service"
import { createClient } from "@/lib/supabase/client"

export function useUpdateSubscriptionMutation(organizationId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patch: SubscriptionDraftValues) => {
      if (!organizationId) throw new Error("No organization to update a subscription for yet")
      const supabase = createClient()
      return upsertSubscription(supabase, organizationId, patch)
    },
    onSuccess: (subscription) => {
      queryClient.setQueryData(subscriptionKeys.detail(organizationId), subscription)
    },
  })
}
