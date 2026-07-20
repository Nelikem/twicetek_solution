"use client"

import { useEffect, useTransition } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { selectWorkspace } from "@/app/welcome/actions"

interface AutoSelectWorkspaceProps {
  businessId: string
}

/**
 * Renders when there's nothing meaningful to choose (one business, no branches).
 * Next.js only allows cookies().set() inside a real client-triggered Server Action
 * invocation or a Route Handler -- not when a Server Action is called directly
 * during a Server Component's render (confirmed: that throws "Cookies can only be
 * modified in a Server Action or Route Handler" at runtime). So the "auto-skip"
 * still has to happen from the client, via the exact same action WorkspaceSelector's
 * button uses -- this component just fires it immediately on mount instead of
 * waiting for a click, so the user never sees an actual choice to make.
 */
export function AutoSelectWorkspace({ businessId }: AutoSelectWorkspaceProps) {
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      try {
        await selectWorkspace(businessId, null)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't open your workspace")
      }
    })
  }, [businessId])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
      <Loader2 className="size-5 animate-spin text-primary" />
      Setting up your workspace…
    </div>
  )
}
