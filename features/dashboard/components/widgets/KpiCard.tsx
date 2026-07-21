"use client"

import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { Info, Lock, Minus, TrendingDown, TrendingUp } from "lucide-react"
import { Line, LineChart, ResponsiveContainer } from "recharts"

import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useCountUp } from "@/features/dashboard/hooks/useCountUp"

export interface KpiTrend {
  direction: "up" | "down" | "flat"
  /** "new" avoids a div-by-zero infinity% when the prior period was 0. */
  percent: number | "new"
  label: string
}

interface KpiCardProps {
  title: string
  icon: LucideIcon
  /** null forces the loading/skeleton branch -- never render a fabricated 0. */
  value: number | null
  format?: "number" | "currency" | "percent"
  isLoading?: boolean
  isError?: boolean
  trend?: KpiTrend
  /** Omit entirely for no sparkline -- a 1-2 point "trend" looks fake, so callers
   * should only pass this when there's genuine multi-point history. */
  sparklineData?: { value: number }[]
  tooltip?: string
  href?: string
  onClick?: () => void
}

function formatValue(value: number, format: KpiCardProps["format"]) {
  if (format === "currency") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
      value
    )
  }
  if (format === "percent") return `${value}%`
  return new Intl.NumberFormat("en-US").format(value)
}

const TREND_COLOR: Record<KpiTrend["direction"], string> = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
}
const TREND_ICON: Record<KpiTrend["direction"], LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
}

/** The dashboard's premium KPI tile: icon/label, animated value, trend, and an
 * optional mini sparkline. Reuses WidgetContainer's established loading
 * (Skeleton) / error (Alert) conventions, with its own tighter card density. */
export function KpiCard({
  title,
  icon: Icon,
  value,
  format = "number",
  isLoading,
  isError,
  trend,
  sparklineData,
  tooltip,
  href,
  onClick,
}: KpiCardProps) {
  const animated = useCountUp(value)
  const TrendIcon = trend ? TREND_ICON[trend.direction] : null
  const isInteractive = !!href || !!onClick
  const showValue = !isLoading && !isError && value !== null

  const content = (
    <Card
      className={cn("gap-3 py-4", isInteractive && "cursor-pointer transition-colors hover:bg-muted/40")}
      onClick={onClick}
    >
      <CardContent className="flex flex-col gap-2 px-5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <Icon className="size-3.5" />
            {title}
          </span>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger render={<span className="text-muted-foreground" />}>
                <Info className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          )}
        </div>

        {isLoading || value === null ? (
          <Skeleton className="h-8 w-2/3" />
        ) : isError ? (
          <Alert variant="destructive" className="py-1.5">
            <AlertDescription>Failed to load.</AlertDescription>
          </Alert>
        ) : (
          <p className="text-2xl font-semibold tabular-nums sm:text-3xl">{formatValue(animated, format)}</p>
        )}

        {trend && TrendIcon && showValue && (
          <div className={cn("flex items-center gap-1 text-xs font-medium", TREND_COLOR[trend.direction])}>
            <TrendIcon className="size-3.5" />
            <span>{trend.percent === "new" ? "New" : `${trend.percent}%`}</span>
            <span className="font-normal text-muted-foreground">{trend.label}</span>
          </div>
        )}

        {sparklineData && sparklineData.length > 1 && showValue && (
          <div className="h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={trend?.direction === "down" ? "var(--destructive)" : "var(--success)"}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return href ? <Link href={href}>{content}</Link> : content
}

interface LockedKpiCardProps {
  title: string
  icon: LucideIcon
  lockMessage?: string
}

/** Renders when the backing data (Sales/Accounting/Inventory) doesn't exist yet.
 * Never shows a numeric value, not even 0 -- the value slot is a literal em-dash. */
export function LockedKpiCard({ title, icon: Icon, lockMessage = "Coming with the Sales module" }: LockedKpiCardProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Card aria-disabled="true" className="cursor-default gap-3 py-4 opacity-60" />}>
        <CardContent className="flex flex-col gap-2 px-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <Icon className="size-3.5" />
              {title}
            </span>
            <Lock className="size-3.5 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold text-muted-foreground sm:text-3xl">—</p>
        </CardContent>
      </TooltipTrigger>
      <TooltipContent>{lockMessage}</TooltipContent>
    </Tooltip>
  )
}
