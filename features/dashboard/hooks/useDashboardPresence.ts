import { useEffect, useState } from "react"

import { createClient } from "@/lib/supabase/client"

/**
 * Realtime Presence (not postgres_changes -- ephemeral, no publication/migration
 * needed) tracking how many distinct users currently have this organization's
 * dashboard open. Channel is scoped per-organization so presence doesn't leak
 * across tenants. Keying presence by user.id de-dupes multiple tabs from the
 * same person into one count.
 */
export function useDashboardPresence(organizationId: string | null, userId: string | null, name: string): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!organizationId || !userId) return

    const supabase = createClient()
    const channel = supabase.channel(`dashboard-presence-${organizationId}`, {
      config: { presence: { key: userId } },
    })

    channel
      .on("presence", { event: "sync" }, () => {
        setCount(Object.keys(channel.presenceState()).length)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: userId, name, online_at: new Date().toISOString() })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
    // name deliberately excluded -- re-subscribing the whole channel over a
    // display-name change (which can't happen mid-session anyway) would cause
    // the same churn this signature change was fixing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, userId])

  return count
}
