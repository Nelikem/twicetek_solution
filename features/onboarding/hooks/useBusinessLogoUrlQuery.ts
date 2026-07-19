import { useQuery } from "@tanstack/react-query"

import { getBusinessLogoSignedUrl } from "@/services/storage.service"
import { createClient } from "@/lib/supabase/client"

export function useBusinessLogoUrlQuery(logoPath: string | null | undefined) {
  return useQuery({
    queryKey: ["businesses", "logo-signed-url", logoPath],
    queryFn: async () => {
      const supabase = createClient()
      return getBusinessLogoSignedUrl(supabase, logoPath as string)
    },
    enabled: !!logoPath,
    staleTime: 55 * 60 * 1000,
  })
}
