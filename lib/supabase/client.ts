import { createBrowserClient } from "@supabase/ssr"
import { parse, serialize } from "cookie"

import { env } from "@/lib/env"
import type { Database } from "@/types/database.types"

/**
 * @supabase/ssr@0.12.3 silently ignores `cookieOptions.maxAge` -- confirmed by
 * reading the installed source (dist/module/cookies.js): every cookie write does
 * `maxAge: DEFAULT_COOKIE_OPTIONS.maxAge` unconditionally, applied *after*
 * spreading in `cookieOptions`, overwriting whatever was passed. So "remember me"
 * can't be implemented via that option -- instead, a custom cookies.setAll strips
 * maxAge/expires from each write when rememberMe is false, turning the library's
 * hardcoded 400-day cookie into a real session-only cookie. isSingleton: false is
 * required whenever rememberMe is passed, since the default browser client is a
 * cached singleton shared across every createClient() call in the app -- reusing
 * it would leak one login's rememberMe choice into unrelated later calls.
 */
export function createClient(options?: { rememberMe?: boolean }) {
  if (options?.rememberMe === undefined) {
    return createBrowserClient<Database>(env.supabaseUrl(), env.supabaseAnonKey())
  }

  const rememberMe = options.rememberMe

  return createBrowserClient<Database>(env.supabaseUrl(), env.supabaseAnonKey(), {
    isSingleton: false,
    cookies: {
      getAll() {
        const parsed = parse(document.cookie)
        return Object.entries(parsed).map(([name, value]) => ({ name, value: value ?? "" }))
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
          const finalOptions = rememberMe
            ? cookieOptions
            : { ...cookieOptions, maxAge: undefined, expires: undefined }
          document.cookie = serialize(name, value, finalOptions)
        })
      },
    },
  })
}
