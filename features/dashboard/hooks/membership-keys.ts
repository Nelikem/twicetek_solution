export const membershipKeys = {
  all: ["memberships"] as const,
  current: () => [...membershipKeys.all, "current"] as const,
  count: (organizationId: string | null) => [...membershipKeys.all, "count", organizationId] as const,
  growth: (organizationId: string | null) => [...membershipKeys.all, "growth", organizationId] as const,
}
