export const branchKeys = {
  all: ["branches"] as const,
  list: (organizationId: string | null) => [...branchKeys.all, "list", organizationId] as const,
  overview: (organizationId: string | null, businessId: string | null) =>
    [...branchKeys.all, "overview", organizationId, businessId] as const,
}
