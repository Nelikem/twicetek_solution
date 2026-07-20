import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { sessionKeys } from "@/features/auth/hooks/session-keys"
import type { Session } from "@/features/auth/types/auth.types"
import { revokeSession } from "@/services/security.service"
import { createClient } from "@/lib/supabase/client"

/** Optimistic: removes from the cache immediately, rolls back on error. */
export function useRevokeSessionMutation() {
  const queryClient = useQueryClient()
  const queryKey = sessionKeys.list()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const supabase = createClient()
      await revokeSession(supabase, sessionId)
      return sessionId
    },
    onMutate: async (sessionId: string) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Session[]>(queryKey)
      queryClient.setQueryData<Session[]>(queryKey, (old) => old?.filter((s) => s.id !== sessionId))
      return { previous }
    },
    onError: (error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
      toast.error(error instanceof Error ? error.message : "Couldn't revoke that session")
    },
  })
}
