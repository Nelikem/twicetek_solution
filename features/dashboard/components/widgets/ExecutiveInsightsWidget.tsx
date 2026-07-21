"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import { useBusinessOverviewQuery } from "@/features/dashboard/hooks/useBusinessOverviewQuery"
import { useOrganizationMembersCountQuery } from "@/features/dashboard/hooks/useOrganizationMembersCountQuery"
import { useMemberGrowthQuery } from "@/features/dashboard/hooks/useMemberGrowthQuery"
import { useRecentActivityCountQuery } from "@/features/dashboard/hooks/useRecentActivityCountQuery"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { generateInsights } from "@/features/dashboard/lib/insights/rules"
import type { DashboardSnapshot } from "@/features/dashboard/lib/insights/types"
import { WidgetContainer } from "@/features/dashboard/components/widgets/WidgetContainer"

/**
 * Real, rule-based insights over the same data the KPI cards already fetch
 * (TanStack Query dedupes the requests). The only future-phase seam is
 * generateInsights -- swap its rule set, or replace it with an LLM call over
 * the same DashboardSnapshot, with zero changes here.
 */
export function ExecutiveInsightsWidget() {
  const { organizationId } = useMembership()
  const businessOverview = useBusinessOverviewQuery(organizationId)
  const memberCount = useOrganizationMembersCountQuery(organizationId)
  const memberGrowth = useMemberGrowthQuery(organizationId)
  const activityCount = useRecentActivityCountQuery(organizationId, 7)

  const isLoading = businessOverview.isLoading || memberCount.isLoading || memberGrowth.isLoading || activityCount.isLoading
  const isError = businessOverview.isError || memberCount.isError || memberGrowth.isError || activityCount.isError

  const insights = useMemo(() => {
    if (!organizationId || !businessOverview.data || !memberGrowth.data) return []

    const snapshot: DashboardSnapshot = {
      organizationId,
      businessCount: businessOverview.data.length,
      branchesByBusiness: businessOverview.data.map((b) => ({
        businessId: b.businessId,
        businessName: b.name || "Untitled business",
        branchCount: b.branchCount,
      })),
      activeMemberCount: memberCount.data ?? 0,
      newMembersLast30Days: memberGrowth.data.last30Days,
      newMembersPrev30Days: memberGrowth.data.prev30Days,
      recentActivityCount7d: activityCount.data ?? 0,
    }
    return generateInsights(snapshot)
  }, [organizationId, businessOverview.data, memberCount.data, memberGrowth.data, activityCount.data])

  return (
    <WidgetContainer
      title="Executive insights"
      icon={Sparkles}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && insights.length === 0}
      emptyMessage="No insights right now — check back as your organization grows."
    >
      <ul className="flex flex-col gap-3">
        {insights.map((insight) => {
          const content = (
            <div className="flex items-start gap-2.5 text-sm">
              <span
                className={cn(
                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                  insight.severity === "positive" && "bg-success",
                  insight.severity === "warning" && "bg-warning",
                  insight.severity === "info" && "bg-muted-foreground"
                )}
              />
              <span className={insight.href ? "hover:underline" : undefined}>{insight.message}</span>
            </div>
          )
          return <li key={insight.id}>{insight.href ? <Link href={insight.href}>{content}</Link> : content}</li>
        })}
      </ul>
    </WidgetContainer>
  )
}
