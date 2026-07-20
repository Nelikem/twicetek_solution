import { createClient } from "@/lib/supabase/server"
import { getCurrentMembership } from "@/services/memberships.service"
import { listBranches } from "@/services/branches.service"
import { listBusinesses } from "@/services/businesses.service"
import { BranchesTable } from "@/features/dashboard/components/branches/BranchesTable"

export default async function BranchesPage() {
  const supabase = await createClient()
  const membership = await getCurrentMembership(supabase)
  if (!membership) return null

  const [branches, businesses] = await Promise.all([
    listBranches(supabase, membership.organizationId),
    listBusinesses(supabase, membership.organizationId),
  ])
  const businessNamesById = new Map(businesses.map((b) => [b.id, b.name || "Untitled business"]))

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Branches</h1>
        <p className="text-sm text-muted-foreground">The branches registered across your businesses.</p>
      </div>
      <BranchesTable branches={branches} businessNamesById={businessNamesById} />
    </div>
  )
}
