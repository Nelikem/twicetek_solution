"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Building2 } from "lucide-react"

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { DashboardSidebarItem } from "@/features/dashboard/components/shell/DashboardSidebarItem"
import { NAV_ITEMS } from "@/features/dashboard/config/nav-items.config"

export function MobileSidebarSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const membership = useMembership()
  const pathname = usePathname()
  const items = NAV_ITEMS.filter(
    (item) => membership.roleSlug !== null && item.visibleToRoles.includes(membership.roleSlug)
  )

  useEffect(() => {
    onOpenChange(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-3/4">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex items-center gap-2.5 px-4 pt-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Building2 className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">{membership.organization.companyName}</span>
        </div>
        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-1 p-3">
            {items.map((item) => (
              <DashboardSidebarItem key={item.id} item={item} onNavigate={() => onOpenChange(false)} />
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
