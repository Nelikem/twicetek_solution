import { createClient } from "@/lib/supabase/server"
import { getCurrentMembership } from "@/services/memberships.service"
import { getBusinessOverview } from "@/services/businesses.service"
import { BusinessOverviewTable } from "@/features/dashboard/components/businesses/BusinessOverviewTable"

export default async function BusinessesPage() {
  const supabase = await createClient()
  const membership = await getCurrentMembership(supabase)
  if (!membership) return null

  const businesses = await getBusinessOverview(supabase, membership.organizationId)

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Businesses</h1>
        <p className="text-sm text-muted-foreground">The businesses registered under your organization.</p>
      </div>
      <BusinessOverviewTable businesses={businesses} />
    </div>
  )
}
