"use client"

import { Loader2, Monitor } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRevokeSessionMutation } from "@/features/auth/hooks/useRevokeSessionMutation"
import { useSessionsQuery } from "@/features/auth/hooks/useSessionsQuery"

export function SessionsList() {
  const sessionsQuery = useSessionsQuery()
  const revokeMutation = useRevokeSessionMutation()

  if (sessionsQuery.isPending) {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />
  }

  if (sessionsQuery.isError) {
    return <p className="text-sm text-destructive">Couldn&apos;t load your sessions. Refresh the page to try again.</p>
  }

  const sessions = sessionsQuery.data ?? []

  if (sessions.length === 0) {
    return <p className="text-sm text-muted-foreground">No active sessions found.</p>
  }

  return (
    <ul className="space-y-3">
      {sessions.map((session) => (
        <li
          key={session.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-4"
        >
          <div className="flex items-center gap-3">
            <Monitor className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="flex items-center gap-2 text-sm font-medium">
                {session.userAgent ?? "Unknown device"}
                {session.isCurrent && <Badge variant="secondary">This device</Badge>}
              </p>
              <p className="text-xs text-muted-foreground">
                {session.ip ?? "Unknown location"} · Last active{" "}
                {new Date(session.refreshedAt ?? session.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={session.isCurrent || revokeMutation.isPending}
            onClick={() => revokeMutation.mutate(session.id)}
          >
            {session.isCurrent ? "Current" : "Revoke"}
          </Button>
        </li>
      ))}
    </ul>
  )
}
