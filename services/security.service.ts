import type { SupabaseClient } from "@supabase/supabase-js"

import type { ProfileSecurityDraftValues } from "@/features/auth/schemas/security.schema"
import type { Session } from "@/features/auth/types/auth.types"
import type { Database, Enums, Json } from "@/types/database.types"

type TypedClient = SupabaseClient<Database, "public">
type SecurityEventType = Enums<"security_event_type">

export async function recordLoginAttempt(
  supabase: TypedClient,
  params: {
    email: string
    success: boolean
    failureReason?: string
    ipAddress?: string | null
    userAgent?: string | null
  }
): Promise<void> {
  const { error } = await supabase.rpc("record_login_attempt", {
    p_email: params.email,
    p_success: params.success,
    p_failure_reason: params.failureReason,
    p_ip_address: params.ipAddress ?? undefined,
    p_user_agent: params.userAgent ?? undefined,
  })
  if (error) throw error
}

export async function isAccountLocked(supabase: TypedClient, email: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_account_locked", { p_email: email })
  if (error) throw error
  return data
}

export async function checkPasswordReused(supabase: TypedClient, password: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_password_reused", { p_password: password })
  if (error) throw error
  return data
}

function toDomainSession(row: {
  id: string
  created_at: string
  updated_at: string | null
  refreshed_at: string | null
  not_after: string | null
  user_agent: string | null
  ip: string | null
  is_current: boolean
}): Session {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    refreshedAt: row.refreshed_at,
    expiresAt: row.not_after,
    userAgent: row.user_agent,
    ip: row.ip,
    isCurrent: row.is_current,
  }
}

export async function listMySessions(supabase: TypedClient): Promise<Session[]> {
  const { data, error } = await supabase.rpc("list_my_sessions")
  if (error) throw error
  return data.map(toDomainSession)
}

export async function revokeSession(supabase: TypedClient, sessionId: string): Promise<void> {
  const { error } = await supabase.rpc("revoke_session", { p_session_id: sessionId })
  if (error) throw error
}

export async function logSecurityEvent(
  supabase: TypedClient,
  eventType: SecurityEventType,
  metadata: Record<string, Json> = {}
): Promise<void> {
  const { error } = await supabase.rpc("log_security_event", {
    p_event_type: eventType,
    p_metadata: metadata,
  })
  if (error) throw error
}

function toProfileSecurityPatch(patch: ProfileSecurityDraftValues) {
  return {
    ...(patch.firstName !== undefined && { first_name: patch.firstName }),
    ...(patch.lastName !== undefined && { last_name: patch.lastName }),
    ...(patch.displayName !== undefined && { display_name: patch.displayName }),
    ...(patch.timezone !== undefined && { timezone: patch.timezone }),
    ...(patch.language !== undefined && { language: patch.language }),
    ...(patch.theme !== undefined && { theme: patch.theme }),
  }
}

export async function updateProfileSecurityFields(
  supabase: TypedClient,
  userId: string,
  patch: ProfileSecurityDraftValues
): Promise<void> {
  const { error } = await supabase.from("profiles").update(toProfileSecurityPatch(patch)).eq("id", userId)
  if (error) throw error
}
