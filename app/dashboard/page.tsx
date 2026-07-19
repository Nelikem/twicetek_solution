import { redirect } from "next/navigation"
import { Building2, ShieldCheck, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { SUBSCRIPTION_PLANS } from "@/features/onboarding/config/subscription-plans.config"
import { createClient } from "@/lib/supabase/server"
import { getAdministrator } from "@/services/administrators.service"
import { getOrganizationByOwner } from "@/services/organizations.service"
import { getSubscription } from "@/services/subscriptions.service"

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

  const [administrator, subscription] = await Promise.all([
    getAdministrator(supabase, org.id),
    getSubscription(supabase, org.id),
  ])
  const plan = subscription ? SUBSCRIPTION_PLANS.find((p) => p.id === subscription.planId) : undefined

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
