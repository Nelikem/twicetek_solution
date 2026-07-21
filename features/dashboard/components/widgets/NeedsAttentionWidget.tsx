"use client"

import Link from "next/link"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { cn, timeAgo } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { useNotificationsQuery } from "@/features/dashboard/hooks/useNotificationsQuery"
import { useMarkNotificationReadMutation } from "@/features/dashboard/hooks/useMarkNotificationReadMutation"
import { WidgetContainer } from "@/features/dashboard/components/widgets/WidgetContainer"

type Severity = "info" | "positive" | "warning"

/** Only `organization_activated` exists today -- intentionally thin, but the
 * map is the seam for future notification types (overdue invoice, low stock,
 * etc.) to slot in without touching the widget itself. */
const SEVERITY_BY_TYPE: Record<string, Severity> = {
  organization_activated: "positive",
}

/** Real "needs a decision" widget, sourced from the existing notifications
 * table (shares NotificationBell's query cache, no duplicate subscription).
 * Complements the top-nav bell rather than duplicating it. */
export function NeedsAttentionWidget() {
  const membership = useMembership()
  const { data: notifications = [], isLoading, isError } = useNotificationsQuery(membership.userId)
  const markRead = useMarkNotificationReadMutation(membership.userId)
  const unread = notifications.filter((n) => !n.isRead).slice(0, 5)

  return (
    <WidgetContainer
      title="Needs attention"
      icon={AlertCircle}
      isLoading={isLoading}
      isError={isError}
      isEmpty={!isLoading && !isError && unread.length === 0}
      emptyMessage="Nothing needs your attention right now."
      action={unread.length > 0 && <Badge variant="secondary">{unread.length}</Badge>}
    >
      <ul className="flex flex-col gap-3">
        {unread.map((notification) => {
          const severity = SEVERITY_BY_TYPE[notification.type] ?? "info"
          return (
            <li key={notification.id} className="flex items-start gap-3 text-sm">
              <span
                className={cn(
                  "mt-1 size-1.5 shrink-0 rounded-full",
                  severity === "positive" && "bg-success",
                  severity === "warning" && "bg-warning",
                  severity === "info" && "bg-muted-foreground"
                )}
              />
              <div className="min-w-0 flex-1">
                {notification.link ? (
                  <Link href={notification.link} className="font-medium hover:underline">
                    {notification.title}
                  </Link>
                ) : (
                  <span className="font-medium">{notification.title}</span>
                )}
                <p className="text-xs text-muted-foreground">{timeAgo(notification.createdAt)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Mark read"
                onClick={() => markRead.mutate(notification.id)}
              >
                <CheckCircle2 className="size-3.5" />
              </Button>
            </li>
          )
        })}
      </ul>
    </WidgetContainer>
  )
}
