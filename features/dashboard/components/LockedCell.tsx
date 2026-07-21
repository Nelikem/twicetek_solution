"use client"

import { Lock } from "lucide-react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/** Table-cell-sized version of KpiCard's LockedKpiCard treatment -- a locked
 * financial column (Revenue/Profit/Health Score) that has no backing data yet.
 * Never renders a number, only the lock glyph + explanatory tooltip. */
export function LockedCell({ message = "Needs Sales & Accounting data" }: { message?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span aria-disabled="true" className="inline-flex text-muted-foreground" />}>
        <Lock className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent>{message}</TooltipContent>
    </Tooltip>
  )
}
