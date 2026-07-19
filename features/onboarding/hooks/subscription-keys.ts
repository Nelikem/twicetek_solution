export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  detail: (organizationId: string | null) => [...subscriptionKeys.all, "detail", organizationId] as const,
}
