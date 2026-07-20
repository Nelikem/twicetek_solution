"use client"

import { Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { SUBSCRIPTION_PLANS } from "@/features/onboarding/config/subscription-plans.config"
import { useSubscriptionQuery } from "@/features/onboarding/hooks/useSubscriptionQuery"
import { useMembership } from "@/features/dashboard/context/membership-context"
import { WidgetContainer } from "@/features/dashboard/components/widgets/WidgetContainer"

export function OrganizationStatusWidget() {
  const { organizationId } = useMembership()
  const { data: subscription, isLoading, isError } = useSubscriptionQuery(organizationId)
  const plan = subscription ? SUBSCRIPTION_PLANS.find((p) => p.id === subscription.planId) : undefined

  return (
    <WidgetContainer title="Plan" icon={Sparkles} isLoading={isLoading} isError={isError}>
      <div className="flex flex-col gap-1.5">
        <p className="text-2xl font-semibold">{plan?.name ?? "No plan"}</p>
        {subscription && (
          <Badge variant="outline" className="w-fit capitalize">
            {subscription.billingCycle}
          </Badge>
        )}
      </div>
    </WidgetContainer>
  )
}
