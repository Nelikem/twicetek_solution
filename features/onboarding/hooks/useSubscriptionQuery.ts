import { useQuery } from "@tanstack/react-query"

import { subscriptionKeys } from "@/features/onboarding/hooks/subscription-keys"
import { getSubscription } from "@/services/subscriptions.service"
import { createClient } from "@/lib/supabase/client"

export function useSubscriptionQuery(organizationId: string | null) {
  return useQuery({
    queryKey: subscriptionKeys.detail(organizationId),
    queryFn: async () => {
      const supabase = createClient()
      return getSubscription(supabase, organizationId as string)
    },
    enabled: !!organizationId,
  })
}
