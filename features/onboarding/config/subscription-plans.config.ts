export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  priceMonthly: number
  priceAnnual: number
  seatsLimit: number | null
  features: readonly string[]
}

/** Placeholder pricing/copy — no spec exists for real tiers yet. Swap in real
 * figures before this reaches real users. */
export const SUBSCRIPTION_PLANS: readonly SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "For getting started",
    priceMonthly: 0,
    priceAnnual: 0,
    seatsLimit: 3,
    features: ["Up to 3 team members", "1 business", "Basic support"],
  },
  {
    id: "starter",
    name: "Starter",
    description: "For growing teams",
    priceMonthly: 29,
    priceAnnual: 290,
    seatsLimit: 10,
    features: ["Up to 10 team members", "Unlimited businesses & branches", "Priority support"],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For established organizations",
    priceMonthly: 99,
    priceAnnual: 990,
    seatsLimit: null,
    features: ["Unlimited team members", "Unlimited businesses & branches", "Dedicated support"],
  },
] as const
