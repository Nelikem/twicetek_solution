import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import { env } from "@/lib/env"
import type { Database } from "@/types/database.types"

/**
 * Service-role client — bypasses RLS entirely. Never import this into client code
 * or any module reachable from a Client Component; `server-only` enforces this at build time.
 * Unused by Phase 1 feature code; scaffolded for the future provisioning Edge Function/RPC layer.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(env.supabaseUrl(), env.supabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
