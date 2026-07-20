"use client"

import Link from "next/link"
import { Bell } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { useMarkNotificationReadMutation } from "@/features/dashboard/hooks/useMarkNotificationReadMutation"
import { useNotificationsQuery } from "@/features/dashboard/hooks/useNotificationsQuery"

export function NotificationBell() {
  const membership = useMembership()
  const { data: notifications = [] } = useNotificationsQuery(membership.userId)
  const markRead = useMarkNotificationReadMutation(membership.userId)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="relative" aria-label="Notifications" />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1 text-[0.65rem]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border/60 px-3 py-2 text-sm font-medium">Notifications</div>
        {notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
        ) : (
          <ScrollArea className="max-h-80">
            <ul className="flex flex-col">
              {notifications.map((notification) => {
                const row = (
                  <div
                    className={cn(
                      "flex flex-col gap-0.5 border-b border-border/40 px-3 py-2.5 text-sm last:border-b-0",
                      !notification.isRead && "bg-primary/5"
                    )}
                  >
                    <span className="font-medium">{notification.title}</span>
                    {notification.body && (
                      <span className="text-xs text-muted-foreground">{notification.body}</span>
                    )}
                  </div>
                )

                return (
                  <li key={notification.id}>
                    {notification.link ? (
                      <Link
                        href={notification.link}
                        onClick={() => !notification.isRead && markRead.mutate(notification.id)}
                        className="block hover:bg-muted"
                      >
                        {row}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => !notification.isRead && markRead.mutate(notification.id)}
                        className="block w-full text-left hover:bg-muted"
                      >
                        {row}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
