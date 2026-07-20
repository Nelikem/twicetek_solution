"use client"

import { Bell } from "lucide-react"

import { useNotificationsQuery } from "@/features/dashboard/hooks/useNotificationsQuery"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { WidgetContainer } from "@/features/dashboard/components/widgets/WidgetContainer"

/** Shares the same query cache as NotificationBell -- one source of truth, not a duplicate subscription. */
export function UnreadNotificationsWidget() {
  const { userId } = useMembership()
  const { data, isLoading, isError } = useNotificationsQuery(userId)
  const unreadCount = data?.filter((n) => !n.isRead).length ?? 0

  return (
    <WidgetContainer title="Unread notifications" icon={Bell} isLoading={isLoading} isError={isError}>
      <p className="text-3xl font-semibold">{unreadCount}</p>
    </WidgetContainer>
  )
}
