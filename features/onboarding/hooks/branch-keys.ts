export const branchKeys = {
  all: ["branches"] as const,
  list: (organizationId: string | null) => [...branchKeys.all, "list", organizationId] as const,
}
