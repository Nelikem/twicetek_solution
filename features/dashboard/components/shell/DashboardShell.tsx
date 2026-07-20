import { DashboardSidebar } from "@/features/dashboard/components/shell/DashboardSidebar"
import { DashboardTopNav } from "@/features/dashboard/components/shell/DashboardTopNav"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-svh flex-col bg-background">
      <DashboardTopNav />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
