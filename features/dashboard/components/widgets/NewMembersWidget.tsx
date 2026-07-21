"use client"

import { UserPlus } from "lucide-react"

import { useMemberGrowthQuery } from "@/features/dashboard/hooks/useMemberGrowthQuery"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { KpiCard, type KpiTrend } from "@/features/dashboard/components/widgets/KpiCard"

function computeTrend(last30Days: number, prev30Days: number): KpiTrend {
  if (prev30Days === 0) {
    return { direction: last30Days > 0 ? "up" : "flat", percent: "new", label: "vs prior 30 days" }
  }
  const percent = Math.round(((last30Days - prev30Days) / prev30Days) * 100)
  return {
    direction: percent > 0 ? "up" : percent < 0 ? "down" : "flat",
    percent: Math.abs(percent),
    label: "vs prior 30 days",
  }
}

/** The one KPI card with a genuinely real trend + sparkline this phase --
 * both computed from organization_members.created_at, a real timestamp. */
export function NewMembersWidget() {
  const { organizationId } = useMembership()
  const { data, isLoading, isError } = useMemberGrowthQuery(organizationId)

  return (
    <KpiCard
      title="New team members"
      icon={UserPlus}
      value={data ? data.last30Days : null}
      isLoading={isLoading}
      isError={isError}
      trend={data ? computeTrend(data.last30Days, data.prev30Days) : undefined}
      sparklineData={data?.weeklyBuckets.map((value) => ({ value }))}
      tooltip="New active team members in the last 30 days, by week"
    />
  )
}
