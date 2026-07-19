import { useQuery } from "@tanstack/react-query"

import { getOrganizationLogoSignedUrl } from "@/services/storage.service"
import { createClient } from "@/lib/supabase/client"

export function useOrganizationLogoUrlQuery(logoPath: string | null | undefined) {
  return useQuery({
    queryKey: ["organizations", "logo-signed-url", logoPath],
    queryFn: async () => {
      const supabase = createClient()
      return getOrganizationLogoSignedUrl(supabase, logoPath as string)
    },
    enabled: !!logoPath,
    staleTime: 55 * 60 * 1000, // signed URL is valid for 60 minutes server-side
  })
}
