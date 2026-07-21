"use client"

import { useSearchParams } from "next/navigation"
import { Activity } from "lucide-react"

import { timeAgo } from "@/lib/utils"
import { useRecentActivityQuery } from "@/features/dashboard/hooks/useRecentActivityQuery"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { WidgetContainer } from "@/features/dashboard/components/widgets/WidgetContainer"

export function RecentActivityWidget() {
  const { organizationId } = useMembership()
  const searchParams = useSearchParams()
  const businessId = searchParams.get("business")
  // 30 days matches DashboardFilterBar's default selection -- kept in sync so the
  // widget's actual query always matches what the filter bar visually shows,
  // even before the user has touched it (and the URL is empty).
  const days = Number(searchParams.get("range") ?? "30")
  const { data, isLoading, isError } = useRecentActivityQuery(organizationId, { businessId, days })

  return (
    <WidgetContainer
      title="Recent activity"
      icon={Activity}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && (data?.length ?? 0) === 0}
      emptyMessage="No activity yet."
    >
      <ul className="flex flex-col gap-3">
        {data?.map((entry) => (
          <li key={entry.id} className="flex items-start justify-between gap-3 text-sm">
            <span>{entry.description}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(entry.createdAt)}</span>
          </li>
        ))}
      </ul>
    </WidgetContainer>
  )
}
