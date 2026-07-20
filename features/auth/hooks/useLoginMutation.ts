import { useMutation } from "@tanstack/react-query"

import type { LoginValues } from "@/features/auth/schemas/security.schema"
import { isAccountLocked, recordLoginAttempt } from "@/services/security.service"
import { createClient } from "@/lib/supabase/client"

const REMEMBER_COOKIE = "tk-remember"
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 400 // 400 days, matches the Supabase cookie's own default lifetime

/** Plain first-party cookie (not managed by @supabase/ssr, so unaffected by its
 * maxAge-ignoring bug) recording the user's "remember me" choice -- read by
 * middleware/session.ts on every subsequent request to decide whether to strip
 * maxAge/expires from the Supabase cookies it writes during background refresh. */
function writeRememberMarker(rememberMe: boolean) {
  const maxAge = rememberMe ? `; max-age=${REMEMBER_MAX_AGE}` : ""
  document.cookie = `${REMEMBER_COOKIE}=${rememberMe ? "1" : "0"}; path=/; samesite=lax${maxAge}`
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: async ({ email, password, rememberMe }: LoginValues) => {
      const readClient = createClient()

      if (await isAccountLocked(readClient, email)) {
        throw new Error("Too many failed attempts. Try again in 15 minutes.")
      }

      const authClient = createClient({ rememberMe })
      const { error } = await authClient.auth.signInWithPassword({ email, password })

      await recordLoginAttempt(readClient, {
        email,
        success: !error,
        failureReason: error?.message,
      })

      if (error) {
        throw new Error(
          error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message
        )
      }

      writeRememberMarker(rememberMe)
    },
  })
}
