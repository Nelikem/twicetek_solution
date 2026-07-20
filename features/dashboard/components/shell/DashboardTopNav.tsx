"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, LogOut, Menu } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { useNotificationsRealtime } from "@/features/dashboard/hooks/useNotificationsRealtime"
import { NotificationBell } from "@/features/dashboard/components/notifications/NotificationBell"
import { ThemeToggle } from "@/features/dashboard/components/shell/ThemeToggle"
import { MobileSidebarSheet } from "@/features/dashboard/components/shell/MobileSidebarSheet"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function DashboardTopNav() {
  const membership = useMembership()
  const router = useRouter()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  useNotificationsRealtime(membership.userId)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </Button>
      <MobileSidebarSheet open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <Building2 className="size-3.5" />
        </div>
        <span className="hidden text-sm font-semibold tracking-tight sm:inline">
          {membership.organization.companyName}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" className="ml-1 rounded-full" aria-label="Account menu" />}
          >
            <Avatar size="sm">
              {membership.avatarUrl && <AvatarImage src={membership.avatarUrl} alt="" />}
              <AvatarFallback>{initials(membership.fullName) || "U"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="flex flex-col gap-0">
              <span className="font-medium text-foreground">{membership.fullName || "Member"}</span>
              <span className="text-xs font-normal text-muted-foreground">{membership.roleName ?? ""}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
