import { useQuery } from "@tanstack/react-query"

import { sessionKeys } from "@/features/auth/hooks/session-keys"
import { listMySessions } from "@/services/security.service"
import { createClient } from "@/lib/supabase/client"

export function useSessionsQuery() {
  return useQuery({
    queryKey: sessionKeys.list(),
    queryFn: async () => {
      const supabase = createClient()
      return listMySessions(supabase)
    },
  })
}
