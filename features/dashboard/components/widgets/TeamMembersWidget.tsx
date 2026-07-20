"use client"

import { Users } from "lucide-react"

import { useOrganizationMembersCountQuery } from "@/features/dashboard/hooks/useOrganizationMembersCountQuery"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { WidgetContainer } from "@/features/dashboard/components/widgets/WidgetContainer"

export function TeamMembersWidget() {
  const { organizationId } = useMembership()
  const { data, isLoading, isError } = useOrganizationMembersCountQuery(organizationId)

  return (
    <WidgetContainer title="Team members" icon={Users} isLoading={isLoading} isError={isError}>
      <p className="text-3xl font-semibold">{data ?? 0}</p>
    </WidgetContainer>
  )
}
