import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export type HealthStatus = "excellent" | "good" | "average" | "warning" | "critical"

const HEALTH_LABEL: Record<HealthStatus, string> = {
  excellent: "Excellent",
  good: "Good",
  average: "Average",
  warning: "Warning",
  critical: "Critical",
}

const HEALTH_CLASS: Record<HealthStatus, string> = {
  excellent: "bg-success/10 text-success",
  good: "bg-success/10 text-success",
  average: "bg-warning/10 text-warning",
  warning: "bg-warning/10 text-warning",
  critical: "bg-destructive/10 text-destructive",
}

/** Presentational only -- no call sites yet. Exists so a future phase with real
 * financial inputs can wire a Business Health Score into e.g. BusinessOverviewTable
 * without inventing this component then. */
export function HealthBadge({ status, label }: { status: HealthStatus; label?: string }) {
  return (
    <Badge variant="outline" className={cn("border-transparent", HEALTH_CLASS[status])}>
      {label ?? HEALTH_LABEL[status]}
    </Badge>
  )
}
