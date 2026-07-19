export const administratorKeys = {
  all: ["administrators"] as const,
  detail: (organizationId: string | null) => [...administratorKeys.all, "detail", organizationId] as const,
}
