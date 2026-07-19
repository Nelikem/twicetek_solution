import { z } from "zod"

export const subscriptionSchema = z.object({
  planId: z.string().min(1, "Select a plan"),
  billingCycle: z.enum(["monthly", "annual"]),
})

export type SubscriptionValues = z.infer<typeof subscriptionSchema>

/** Autosave payloads may touch any subset of fields as the user edits one at a time. */
export const subscriptionDraftSchema = subscriptionSchema.partial()
export type SubscriptionDraftValues = z.infer<typeof subscriptionDraftSchema>

export const SUBSCRIPTION_DEFAULT_VALUES: SubscriptionDraftValues = {
  planId: "",
  billingCycle: "monthly",
}
