import { useMutation } from "@tanstack/react-query"

import type { LoginValues } from "@/features/auth/schemas/security.schema"
import { isAccountLocked, recordLoginAttempt } from "@/services/security.service"
import { getCurrentMembership } from "@/services/memberships.service"
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

/**
 * Returns the destination a login without an explicit `next` param should land
 * on: the organization's own draft/active status is the source of truth for
 * "has this user already finished onboarding", not just "are they authenticated"
 * -- /onboarding/page.tsx's server redirect makes the same check for the paths
 * that go through it (e.g. middleware bouncing an already-signed-in visitor away
 * from /login), but the login form itself deliberately skips that server hop
 * (racing the just-set session cookie) and needs to make the same call directly.
 *
 * Resolved via getCurrentMembership (organization_members-based), not
 * getOrganizationByOwner (owner_user_id-based) -- the latter returns null for
 * every non-owner role, which previously sent every non-owner login straight
 * back to /onboarding/step-1 instead of their dashboard.
 */
export function useLoginMutation() {
  return useMutation({
    mutationFn: async ({ email, password, rememberMe }: LoginValues) => {
      const readClient = createClient()

      if (await isAccountLocked(readClient, email)) {
        throw new Error("Too many failed attempts. Try again in 15 minutes.")
      }

      const authClient = createClient({ rememberMe })
      const { data, error } = await authClient.auth.signInWithPassword({ email, password })

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

      const membership = data.user ? await getCurrentMembership(readClient) : null
      return membership?.organization.status === "active" ? "/welcome" : "/onboarding/step-1"
    },
  })
}
