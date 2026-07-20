import { MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Branch } from "@/features/onboarding/types/onboarding.types"

const STATUS_VARIANT: Record<Branch["status"], "default" | "secondary" | "outline"> = {
  draft: "outline",
  active: "default",
  suspended: "secondary",
  archived: "secondary",
}

export function BranchesTable({
  branches,
  businessNamesById,
}: {
  branches: Branch[]
  businessNamesById: Map<string, string>
}) {
  if (branches.length === 0) {
    return (
      <Card className="items-center justify-center py-12 text-center text-sm text-muted-foreground">
        No branches yet.
      </Card>
    )
  }

  return (
    <Card className="py-0">
      {branches.map((branch, index) => (
        <div key={branch.id}>
          {index > 0 && <Separator />}
          <div className="flex items-center gap-4 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{branch.name || "Untitled branch"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {businessNamesById.get(branch.businessId) ?? "Unknown business"}
                {branch.physicalAddress && ` · ${branch.physicalAddress}`}
              </p>
            </div>
            <Badge variant={STATUS_VARIANT[branch.status]} className="capitalize">
              {branch.status}
            </Badge>
          </div>
        </div>
      ))}
    </Card>
  )
}
