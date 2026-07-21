"use client"

import { MapPin } from "lucide-react"

import { useBranchesQuery } from "@/features/onboarding/hooks/useBranchesQuery"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { KpiCard } from "@/features/dashboard/components/widgets/KpiCard"

export function TotalBranchesWidget() {
  const { organizationId } = useMembership()
  const { data, isLoading, isError } = useBranchesQuery(organizationId)

  return (
    <KpiCard
      title="Branches"
      icon={MapPin}
      value={data ? data.length : null}
      isLoading={isLoading}
      isError={isError}
      href="/dashboard/branches"
    />
  )
}
