import { createClient } from "@/lib/supabase/server"
import { getCurrentMembership } from "@/services/memberships.service"
import { listBusinesses } from "@/services/businesses.service"
import { BusinessesTable } from "@/features/dashboard/components/businesses/BusinessesTable"

export default async function BusinessesPage() {
  const supabase = await createClient()
  const membership = await getCurrentMembership(supabase)
  if (!membership) return null

  const businesses = await listBusinesses(supabase, membership.organizationId)

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Businesses</h1>
        <p className="text-sm text-muted-foreground">The businesses registered under your organization.</p>
      </div>
      <BusinessesTable businesses={businesses} />
    </div>
  )
}
