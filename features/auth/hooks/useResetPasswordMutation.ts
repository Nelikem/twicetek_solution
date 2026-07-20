import { useMutation } from "@tanstack/react-query"

import { checkPasswordReused, logSecurityEvent } from "@/services/security.service"
import { createClient } from "@/lib/supabase/client"

export class PasswordReusedError extends Error {
  constructor() {
    super("You've used this password before. Choose a different one.")
    this.name = "PasswordReusedError"
  }
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (password: string) => {
      const supabase = createClient()

      if (await checkPasswordReused(supabase, password)) {
        throw new PasswordReusedError()
      }

      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw new Error(error.message)

      await logSecurityEvent(supabase, "password_reset_completed")

      // The recovery-flow session from clicking the email link is still active at
      // this point -- without signing out, redirecting to /login would immediately
      // get overridden by middleware's "bounce authenticated users away from auth
      // routes" rule, silently dropping the user into /onboarding instead of the
      // success confirmation. Signing out also forces a fresh login with the new
      // password, confirming it actually works.
      await supabase.auth.signOut()
    },
  })
}
