"use client"

import { Users } from "lucide-react"

import { useOrganizationMembersCountQuery } from "@/features/dashboard/hooks/useOrganizationMembersCountQuery"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { KpiCard } from "@/features/dashboard/components/widgets/KpiCard"

export function TeamMembersWidget() {
  const { organizationId } = useMembership()
  const { data, isLoading, isError } = useOrganizationMembersCountQuery(organizationId)

  return <KpiCard title="Team members" icon={Users} value={data ?? null} isLoading={isLoading} isError={isError} />
}
