import { Building2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Business } from "@/features/onboarding/types/onboarding.types"

const STATUS_VARIANT: Record<Business["status"], "default" | "secondary" | "outline"> = {
  draft: "outline",
  active: "default",
  suspended: "secondary",
  archived: "secondary",
}

export function BusinessesTable({ businesses }: { businesses: Business[] }) {
  if (businesses.length === 0) {
    return (
      <Card className="items-center justify-center py-12 text-center text-sm text-muted-foreground">
        No businesses yet.
      </Card>
    )
  }

  return (
    <Card className="py-0">
      {businesses.map((business, index) => (
        <div key={business.id}>
          {index > 0 && <Separator />}
          <div className="flex items-center gap-4 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{business.name || "Untitled business"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {business.industry || "No industry set"}
                {business.managerName && ` · ${business.managerName}`}
              </p>
            </div>
            <Badge variant={STATUS_VARIANT[business.status]} className="capitalize">
              {business.status}
            </Badge>
          </div>
        </div>
      ))}
    </Card>
  )
}
