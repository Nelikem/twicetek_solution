import { useMutation, useQueryClient } from "@tanstack/react-query"

import { organizationKeys } from "@/features/onboarding/hooks/organization-keys"
import { updateOrganizationInfo } from "@/services/organizations.service"
import { uploadOrganizationLogo, getOrganizationLogoSignedUrl } from "@/services/storage.service"
import { createClient } from "@/lib/supabase/client"
import { compressLogoImage } from "@/utils/image-compression"

interface UploadLogoResult {
  logoPath: string
  signedUrl: string
}

export function useUploadLogoMutation(draftId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File): Promise<UploadLogoResult> => {
      if (!draftId) throw new Error("No draft organization to attach a logo to yet")

      const supabase = createClient()
      const compressed = await compressLogoImage(file)
      const logoPath = await uploadOrganizationLogo(supabase, draftId, compressed)
      const draft = await updateOrganizationInfo(supabase, draftId, { logoPath })
      const signedUrl = await getOrganizationLogoSignedUrl(supabase, logoPath)

      queryClient.setQueryData(organizationKeys.draft(draft.id), draft)
      return { logoPath, signedUrl }
    },
  })
}
