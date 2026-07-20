"use client"

import { Activity } from "lucide-react"

import { useRecentActivityQuery } from "@/features/dashboard/hooks/useRecentActivityQuery"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { WidgetContainer } from "@/features/dashboard/components/widgets/WidgetContainer"

function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function RecentActivityWidget() {
  const { organizationId } = useMembership()
  const { data, isLoading, isError } = useRecentActivityQuery(organizationId)

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
