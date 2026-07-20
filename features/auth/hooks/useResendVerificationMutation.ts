import { useMutation } from "@tanstack/react-query"

import { createClient } from "@/lib/supabase/client"

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: async (email: string) => {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({ type: "signup", email })
      if (error) throw new Error(error.message)
    },
  })
}
