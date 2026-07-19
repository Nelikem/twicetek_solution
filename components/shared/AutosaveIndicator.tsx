"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Check, Loader2, CloudOff } from "lucide-react"

import { cn } from "@/lib/utils"
import type { AutosaveStatus } from "@/features/onboarding/types/onboarding.types"

const CONTENT: Record<AutosaveStatus, { icon: React.ReactNode; label: string; className: string } | null> = {
  idle: null,
  saving: {
    icon: <Loader2 className="size-3.5 animate-spin" />,
    label: "Saving...",
    className: "text-muted-foreground bg-muted",
  },
  saved: {
    icon: <Check className="size-3.5" />,
    label: "Saved",
    className: "text-emerald-700 bg-emerald-500/10 dark:text-emerald-400",
  },
  error: {
    icon: <CloudOff className="size-3.5" />,
    label: "Couldn't save — retrying",
    className: "text-destructive bg-destructive/10",
  },
}

export function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  const prefersReducedMotion = useReducedMotion()
  const content = CONTENT[status]

  return (
    <div className="flex h-7 items-center" aria-live="polite" role="status">
      <AnimatePresence mode="wait">
        {content && (
          <motion.span
            key={status}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              content.className
            )}
          >
            {content.icon}
            {content.label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
