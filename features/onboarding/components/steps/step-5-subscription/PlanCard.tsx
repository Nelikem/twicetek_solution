"use client"

import { Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { RadioGroupItem } from "@/components/ui/radio-group"
import { FieldLabel } from "@/components/ui/field"
import type { SubscriptionPlan } from "@/features/onboarding/config/subscription-plans.config"

interface PlanCardProps {
  plan: SubscriptionPlan
  billingCycle: "monthly" | "annual"
}

export function PlanCard({ plan, billingCycle }: PlanCardProps) {
  const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceAnnual
  const priceSuffix = billingCycle === "monthly" ? "/mo" : "/yr"

  return (
    // Base UI's Radio (non-native-button mode) puts an `id` prop on its internal
    // hidden <input>, not the visible role="radio" element -- a sibling
    // FieldLabel htmlFor={id} never associates. Nesting the RadioGroupItem inside
    // the label instead relies on native label-click delegation, which finds
    // that same hidden input and selects it correctly (same fix as SwitchField).
    <FieldLabel className="w-full flex-col items-start gap-3 rounded-xl border border-border/60 p-4 has-data-checked:border-primary/40 has-data-checked:bg-primary/5">
      <div className="flex w-full items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{plan.name}</p>
          <p className="text-xs text-muted-foreground">{plan.description}</p>
        </div>
        <RadioGroupItem value={plan.id} />
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold tracking-tight">${price}</span>
        <span className="text-xs text-muted-foreground">{priceSuffix}</span>
      </div>

      {plan.seatsLimit !== null ? (
        <Badge variant="outline">{plan.seatsLimit} seats</Badge>
      ) : (
        <Badge variant="outline">Unlimited seats</Badge>
      )}

      <ul className="space-y-1.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Check className="mt-0.5 size-3 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
    </FieldLabel>
  )
}
