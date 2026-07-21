import { Suspense } from "react"
import { cookies } from "next/headers"
import Link from "next/link"
import { MapPin } from "lucide-react"

import { WORKSPACE_COOKIE } from "@/app/welcome/workspace-cookie"
import { createClient } from "@/lib/supabase/server"
import { getCurrentMembership } from "@/services/memberships.service"
import { listBranches } from "@/services/branches.service"
import { listBusinesses } from "@/services/businesses.service"
import { DashboardWidgetGrid } from "@/features/dashboard/components/DashboardWidgetGrid"
import { DashboardFilterBar } from "@/features/dashboard/components/DashboardFilterBar"

function readWorkspaceCookie(raw: string | undefined): { businessId: string; branchId: string | null } | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed?.businessId !== "string") return null
    return { businessId: parsed.businessId, branchId: typeof parsed.branchId === "string" ? parsed.branchId : null }
  } catch {
    return null
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  // The layout already resolved and redirected on a missing/inactive membership --
  // this call is cheap (single indexed query) and keeps this page independently
  // correct rather than trusting an unenforced contract with its parent layout.
  const membership = await getCurrentMembership(supabase)
  if (!membership) return null

  const [businesses, branches] = await Promise.all([
    listBusinesses(supabase, membership.organizationId),
    listBranches(supabase, membership.organizationId),
  ])

  const cookieStore = await cookies()
  const workspace = readWorkspaceCookie(cookieStore.get(WORKSPACE_COOKIE)?.value)
  const workspaceBusiness = workspace ? businesses.find((b) => b.id === workspace.businessId) : undefined
  const workspaceBranch = workspace?.branchId ? branches.find((b) => b.id === workspace.branchId) : undefined

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Welcome back{membership.fullName ? `, ${membership.fullName.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">{membership.organization.companyName}</p>
        </div>

        {workspaceBusiness && (
          <div className="flex items-center gap-2 rounded-full border border-border/60 px-4 py-1.5 text-sm">
            <MapPin className="size-3.5 text-primary" />
            <span>
              {workspaceBusiness.name}
              {workspaceBranch && <span className="text-muted-foreground"> · {workspaceBranch.name}</span>}
            </span>
            <Link href="/welcome" className="text-xs text-primary underline underline-offset-4">
              Switch workspace
            </Link>
          </div>
        )}
      </div>

      {/* DashboardFilterBar and RecentActivityWidget (inside DashboardWidgetGrid) both
          read useSearchParams -- Suspense avoids the CSR-bailout Next.js requires for
          that hook, matching the same pattern already used in app/(auth)/login/page.tsx. */}
      <Suspense fallback={null}>
        <DashboardFilterBar businesses={businesses.map((b) => ({ id: b.id, name: b.name || "Untitled business" }))} />
        <DashboardWidgetGrid />
      </Suspense>
    </div>
  )
}
