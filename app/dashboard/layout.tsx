import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getCurrentMembership } from "@/services/memberships.service"
import { MembershipProvider } from "@/features/dashboard/context/membership-context"
import { DashboardShell } from "@/features/dashboard/components/shell/DashboardShell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/dashboard")
  }

  // getCurrentMembership resolves "my org" via organization_members, not
  // organizations.owner_user_id -- correct for all 10 roles, not just owners
  // (see getOrganizationByOwner's docstring for why that one is owner-only).
  const membership = await getCurrentMembership(supabase)
  if (!membership || membership.organization.status !== "active") {
    redirect("/onboarding")
  }

  return (
    <MembershipProvider initialMembership={membership}>
      <DashboardShell>{children}</DashboardShell>
    </MembershipProvider>
  )
}
