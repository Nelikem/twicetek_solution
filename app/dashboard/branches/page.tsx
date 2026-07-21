import { createClient } from "@/lib/supabase/server"
import { getCurrentMembership } from "@/services/memberships.service"
import { getBranchOverview } from "@/services/branches.service"
import { getBusinessOverview } from "@/services/businesses.service"
import { BranchOverviewTable } from "@/features/dashboard/components/branches/BranchOverviewTable"

export default async function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>
}) {
  const { business: businessId } = await searchParams
  const supabase = await createClient()
  const membership = await getCurrentMembership(supabase)
  if (!membership) return null

  const [branches, businesses] = await Promise.all([
    getBranchOverview(supabase, membership.organizationId, businessId ?? null),
    getBusinessOverview(supabase, membership.organizationId),
  ])
  const filteredBusinessName = businessId
    ? businesses.find((b) => b.businessId === businessId)?.name
    : undefined

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Branches</h1>
        <p className="text-sm text-muted-foreground">The branches registered across your businesses.</p>
      </div>
      <BranchOverviewTable branches={branches} filteredBusinessName={filteredBusinessName} />
    </div>
  )
}
