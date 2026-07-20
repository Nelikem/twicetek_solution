import { cookies } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Building2, MapPin, ShieldCheck, Sparkles } from "lucide-react"

import { WORKSPACE_COOKIE } from "@/app/welcome/workspace-cookie"
import { Badge } from "@/components/ui/badge"
import { SUBSCRIPTION_PLANS } from "@/features/onboarding/config/subscription-plans.config"
import { createClient } from "@/lib/supabase/server"
import { getAdministrator } from "@/services/administrators.service"
import { listBranches } from "@/services/branches.service"
import { listBusinesses } from "@/services/businesses.service"
import { getOrganizationByOwner } from "@/services/organizations.service"
import { getSubscription } from "@/services/subscriptions.service"

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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Layout guard already redirects unauthenticated visitors -- user is non-null here.
  const org = await getOrganizationByOwner(supabase, user!.id)
  if (!org) {
    redirect("/onboarding")
  }

  const [administrator, subscription, businesses, branches] = await Promise.all([
    getAdministrator(supabase, org.id),
    getSubscription(supabase, org.id),
    listBusinesses(supabase, org.id),
    listBranches(supabase, org.id),
  ])
  const plan = subscription ? SUBSCRIPTION_PLANS.find((p) => p.id === subscription.planId) : undefined

  // Not present for pre-existing sessions from before this feature shipped, or an
  // expired cookie -- the dashboard should still be reachable on its own, not a
  // hard redirect back to /welcome.
  const cookieStore = await cookies()
  const workspace = readWorkspaceCookie(cookieStore.get(WORKSPACE_COOKIE)?.value)
  const workspaceBusiness = workspace ? businesses.find((b) => b.id === workspace.businessId) : undefined
  const workspaceBranch = workspace?.branchId ? branches.find((b) => b.id === workspace.branchId) : undefined

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="size-6" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to {org.companyName || "your organization"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Your organization is set up and ready to go. This is a placeholder dashboard —
          full features are coming in a future release.
        </p>
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

      <div className="grid w-full gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border/60 p-4">
          <ShieldCheck className="size-5 text-primary" />
          <p className="text-sm font-medium">{administrator?.fullName || "—"}</p>
          <Badge variant="secondary">Owner</Badge>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border/60 p-4">
          <Building2 className="size-5 text-primary" />
          <p className="text-sm font-medium">{plan?.name || "No plan"}</p>
          {subscription && (
            <Badge variant="outline" className="capitalize">
              {subscription.billingCycle}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
