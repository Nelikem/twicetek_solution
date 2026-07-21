"use client"

import type { LucideIcon } from "lucide-react"
import {
  Activity,
  Banknote,
  Boxes,
  Calendar,
  DollarSign,
  Lock,
  Receipt,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { LockedKpiCard } from "@/features/dashboard/components/widgets/KpiCard"

const LOCKED_KPIS: { title: string; icon: LucideIcon }[] = [
  { title: "Today's Sales", icon: DollarSign },
  { title: "Gross Revenue (MTD)", icon: TrendingUp },
  { title: "Net Profit", icon: Wallet },
  { title: "Cash Flow", icon: Banknote },
  { title: "Inventory Value", icon: Boxes },
  { title: "Outstanding Receivables", icon: Receipt },
]

const COMING_FEATURES: { title: string; icon: LucideIcon }[] = [
  { title: "Cash Flow Dashboard", icon: Banknote },
  { title: "Inventory Intelligence", icon: Boxes },
  { title: "Sales Intelligence", icon: TrendingUp },
  { title: "AI-Powered Insights", icon: Sparkles },
  { title: "Business Health Scoring", icon: Activity },
]

/** One honest, uncluttered place acknowledging the full mega-spec's breadth --
 * metric-level locked KPI cards, plus a compact feature-area list below them.
 * Zero fabricated numbers anywhere in this component. */
export function ComingWithFutureModules() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">Coming with the Sales & Accounting modules</h2>
        <Badge variant="outline">
          <Calendar className="size-3" />
          Planned
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LOCKED_KPIS.map((kpi) => (
          <LockedKpiCard key={kpi.title} title={kpi.title} icon={kpi.icon} />
        ))}
      </div>

      <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-2">
        {COMING_FEATURES.map((feature) => {
          const Icon = feature.icon
          return (
            <Tooltip key={feature.title}>
              <TooltipTrigger
                render={
                  <div
                    aria-disabled="true"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground opacity-70"
                  />
                }
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1">{feature.title}</span>
                <Lock className="size-3.5 shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="right">Coming soon</TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </section>
  )
}
