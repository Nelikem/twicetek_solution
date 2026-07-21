export const businessKeys = {
  all: ["businesses"] as const,
  list: (organizationId: string | null) => [...businessKeys.all, "list", organizationId] as const,
  overview: (organizationId: string | null) => [...businessKeys.all, "overview", organizationId] as const,
}
