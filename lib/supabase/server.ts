import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

import { env } from "@/lib/env"
import type { Database } from "@/types/database.types"

/**
 * Server Component / Server Action / Route Handler client.
 * Writing cookies from a Server Component itself is a no-op (Next.js restriction) —
 * the actual session refresh happens in middleware.ts, which can write response cookies.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component with no writable response — safe to ignore
          // because middleware.ts refreshes the session on every request.
        }
      },
    },
  })
}
