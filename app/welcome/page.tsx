import { redirect } from "next/navigation"

import { AutoSelectWorkspace } from "@/app/welcome/AutoSelectWorkspace"
import { WorkspaceSelector } from "@/app/welcome/WorkspaceSelector"
import type { Branch } from "@/features/onboarding/types/onboarding.types"
import { createClient } from "@/lib/supabase/server"
import { listBranches } from "@/services/branches.service"
import { listBusinesses } from "@/services/businesses.service"
import { getOrganizationByOwner } from "@/services/organizations.service"

export default async function WelcomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Layout guard already redirects unauthenticated visitors -- user is non-null here.
  const org = await getOrganizationByOwner(supabase, user!.id)
  if (!org) {
    redirect("/onboarding")
  }

  const [businesses, branches] = await Promise.all([
    listBusinesses(supabase, org.id),
    listBranches(supabase, org.id),
  ])

  if (businesses.length === 0) {
    redirect("/onboarding")
  }

  // Nothing meaningful to choose -- set the one business as the workspace and
  // skip straight to the dashboard. Cookie mutation only works from a real
  // client-triggered Server Action call, not directly during this render (see
  // AutoSelectWorkspace's comment), so this still renders briefly rather than
  // redirecting from here.
  if (businesses.length === 1 && branches.length === 0) {
    return <AutoSelectWorkspace businessId={businesses[0].id} />
  }

  const branchesByBusiness: Record<string, Branch[]> = {}
  for (const branch of branches) {
    ;(branchesByBusiness[branch.businessId] ??= []).push(branch)
  }

  return (
    <WorkspaceSelector
      businesses={businesses}
      branchesByBusiness={branchesByBusiness}
      companyName={org.companyName || "your organization"}
    />
  )
}
