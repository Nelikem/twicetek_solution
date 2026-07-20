"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { WORKSPACE_COOKIE } from "@/app/welcome/workspace-cookie"
import { createClient } from "@/lib/supabase/server"

/**
 * Sets the caller's active workspace (business + optional branch) and redirects
 * to the dashboard. Callable both as a client-triggered Server Action (from
 * WorkspaceSelector) and directly from app/welcome/page.tsx's server-side
 * auto-skip path -- Server Actions are plain async functions and work either way.
 */
export async function selectWorkspace(businessId: string, branchId: string | null) {
  const supabase = await createClient()

  // RLS (is_org_member) already scopes what a row lookup can return -- a business
  // (and branch, if given) coming back at all is the authorization check.
  const { data: business, error } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .single()
  if (error || !business) throw new Error("Business not found")

  if (branchId) {
    const { data: branch, error: branchError } = await supabase
      .from("branches")
      .select("id")
      .eq("id", branchId)
      .eq("business_id", businessId)
      .single()
    if (branchError || !branch) throw new Error("Branch not found")
  }

  const cookieStore = await cookies()
  cookieStore.set(WORKSPACE_COOKIE, JSON.stringify({ businessId, branchId }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })

  redirect("/dashboard")
}
