export const notificationKeys = {
  all: ["notifications"] as const,
  list: (userId: string | null) => [...notificationKeys.all, "list", userId] as const,
}
