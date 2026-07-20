export const activityKeys = {
  all: ["activity"] as const,
  recent: (organizationId: string | null) => [...activityKeys.all, "recent", organizationId] as const,
}
