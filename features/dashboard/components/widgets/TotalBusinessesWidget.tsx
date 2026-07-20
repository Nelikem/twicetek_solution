"use client"

import { Building2 } from "lucide-react"

import { useBusinessesQuery } from "@/features/onboarding/hooks/useBusinessesQuery"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { WidgetContainer } from "@/features/dashboard/components/widgets/WidgetContainer"

export function TotalBusinessesWidget() {
  const { organizationId } = useMembership()
  const { data, isLoading, isError } = useBusinessesQuery(organizationId)

  return (
    <WidgetContainer title="Businesses" icon={Building2} isLoading={isLoading} isError={isError}>
      <p className="text-3xl font-semibold">{data?.length ?? 0}</p>
    </WidgetContainer>
  )
}
