"use client"

import { MapPin } from "lucide-react"

import { useBranchesQuery } from "@/features/onboarding/hooks/useBranchesQuery"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { WidgetContainer } from "@/features/dashboard/components/widgets/WidgetContainer"

export function TotalBranchesWidget() {
  const { organizationId } = useMembership()
  const { data, isLoading, isError } = useBranchesQuery(organizationId)

  return (
    <WidgetContainer title="Branches" icon={MapPin} isLoading={isLoading} isError={isError}>
      <p className="text-3xl font-semibold">{data?.length ?? 0}</p>
    </WidgetContainer>
  )
}
