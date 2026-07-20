import { useMutation } from "@tanstack/react-query"

import { createClient } from "@/lib/supabase/client"

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (email: string) => {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })
      if (error) throw new Error(error.message)
    },
  })
}
