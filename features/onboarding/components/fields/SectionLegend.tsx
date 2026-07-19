import type { LucideIcon } from "lucide-react"

import { FieldLegend } from "@/components/ui/field"

export function SectionLegend({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <FieldLegend className="flex items-center gap-2">
      <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-3.5" />
      </span>
      {children}
    </FieldLegend>
  )
}
