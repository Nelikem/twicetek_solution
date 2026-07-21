export const activityKeys = {
  all: ["activity"] as const,
  recent: (organizationId: string | null, businessId?: string | null, days?: number) =>
    [...activityKeys.all, "recent", organizationId, businessId ?? null, days ?? null] as const,
  count: (organizationId: string | null, days: number) => [...activityKeys.all, "count", organizationId, days] as const,
}
