"use client"

import { Radio } from "lucide-react"

import { useDashboardPresence } from "@/features/dashboard/hooks/useDashboardPresence"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { WidgetContainer } from "@/features/dashboard/components/widgets/WidgetContainer"

export function ActiveUsersWidget() {
  const { organizationId, userId, fullName } = useMembership()
  const count = useDashboardPresence(organizationId, userId, fullName)

  return (
    <WidgetContainer title="Active now" icon={Radio}>
      <p className="text-3xl font-semibold">{count}</p>
    </WidgetContainer>
  )
}
