"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { DashboardSidebarItem } from "@/features/dashboard/components/shell/DashboardSidebarItem"
import { NAV_ITEMS } from "@/features/dashboard/config/nav-items.config"
import { useDashboardUiStore } from "@/features/dashboard/store/dashboard-ui.store"

export function DashboardSidebar() {
  const membership = useMembership()
  const { sidebarCollapsed, toggleSidebar } = useDashboardUiStore()
  const items = NAV_ITEMS.filter(
    (item) => membership.roleSlug !== null && item.visibleToRoles.includes(membership.roleSlug)
  )

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-border/60 bg-muted/20 transition-[width] duration-200 lg:flex",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-3">
          {items.map((item) => (
            <DashboardSidebarItem key={item.id} item={item} collapsed={sidebarCollapsed} />
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-border/60 p-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="w-full"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>
    </aside>
  )
}
