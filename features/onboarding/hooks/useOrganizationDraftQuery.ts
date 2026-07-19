import { useQuery } from "@tanstack/react-query"

import { organizationKeys } from "@/features/onboarding/hooks/organization-keys"
import { getDraftById } from "@/services/organizations.service"
import { createClient } from "@/lib/supabase/client"

export function useOrganizationDraftQuery(draftId: string | null) {
  return useQuery({
    queryKey: organizationKeys.draft(draftId),
    queryFn: async () => {
      const supabase = createClient()
      return getDraftById(supabase, draftId as string)
    },
    enabled: !!draftId,
  })
}
