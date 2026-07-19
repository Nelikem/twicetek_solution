export const organizationKeys = {
  all: ["organizations"] as const,
  draft: (id: string | null) => [...organizationKeys.all, "draft", id] as const,
}
