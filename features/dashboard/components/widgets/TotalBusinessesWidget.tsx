"use client"

import { Building2 } from "lucide-react"

import { useBusinessesQuery } from "@/features/onboarding/hooks/useBusinessesQuery"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { KpiCard } from "@/features/dashboard/components/widgets/KpiCard"

export function TotalBusinessesWidget() {
  const { organizationId } = useMembership()
  const { data, isLoading, isError } = useBusinessesQuery(organizationId)

  return (
    <KpiCard
      title="Businesses"
      icon={Building2}
      value={data ? data.length : null}
      isLoading={isLoading}
      isError={isError}
      href="/dashboard/businesses"
    />
  )
}
