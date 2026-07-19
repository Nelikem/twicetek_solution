import { useMutation, useQueryClient } from "@tanstack/react-query"

import { businessKeys } from "@/features/onboarding/hooks/business-keys"
import type { Business } from "@/features/onboarding/types/onboarding.types"
import { updateBusiness } from "@/services/businesses.service"
import { uploadBusinessLogo, getBusinessLogoSignedUrl } from "@/services/storage.service"
import { createClient } from "@/lib/supabase/client"
import { compressLogoImage } from "@/utils/image-compression"

interface UploadLogoResult {
  logoPath: string
  signedUrl: string
}

export function useUploadBusinessLogoMutation(businessId: string, organizationId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File): Promise<UploadLogoResult> => {
      const supabase = createClient()
      const compressed = await compressLogoImage(file)
      const logoPath = await uploadBusinessLogo(supabase, businessId, compressed)
      const updated = await updateBusiness(supabase, businessId, { logoPath })
      const signedUrl = await getBusinessLogoSignedUrl(supabase, logoPath)

      queryClient.setQueryData<Business[]>(businessKeys.list(organizationId), (old) =>
        old?.map((business) => (business.id === updated.id ? updated : business))
      )
      return { logoPath, signedUrl }
    },
  })
}
