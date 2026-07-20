"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Lock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { DashboardNavItem } from "@/features/dashboard/config/nav-items.config"

export function DashboardSidebarItem({
  item,
  collapsed = false,
  onNavigate,
}: {
  item: DashboardNavItem
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const isActive = item.status === "active" && pathname === item.path
  const isLocked = item.status === "locked"
  const Icon = item.icon

  const content = (
    <>
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span className="flex-1 truncate text-left">{item.title}</span>}
      {isLocked && !collapsed && <Lock className="size-3.5 shrink-0" />}
    </>
  )

  const rowClassName = cn(
    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
    isActive && "bg-primary/10 text-primary",
    !isActive && !isLocked && "text-muted-foreground hover:bg-muted hover:text-foreground",
    isLocked && "text-muted-foreground opacity-50",
    collapsed && "justify-center px-0"
  )

  if (isLocked) {
    return (
      <Tooltip>
        <TooltipTrigger render={<div aria-disabled="true" className={rowClassName} />}>{content}</TooltipTrigger>
        <TooltipContent side="right">Coming soon</TooltipContent>
      </Tooltip>
    )
  }

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={<Link href={item.path} onClick={onNavigate} className={rowClassName} />}>
          {content}
        </TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Link href={item.path} onClick={onNavigate} className={rowClassName}>
      {content}
    </Link>
  )
}
