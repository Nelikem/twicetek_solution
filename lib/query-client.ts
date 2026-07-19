import { QueryClient } from "@tanstack/react-query"

function isAuthError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: number }).status === 401
  )
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => failureCount < 3 && !isAuthError(error),
      },
      mutations: {
        retry: false,
      },
    },
  })
}
