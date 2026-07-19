"use client"

import { useUnsavedChangesWarning } from "@/features/onboarding/hooks/useUnsavedChangesWarning"

/**
 * Renders nothing — just wires the beforeunload warning declaratively into a step's
 * JSX. In-app route-change interception (e.g. leaving step 1 for step 2) is deferred
 * until a second in-app destination actually exists.
 */
export function UnsavedChangesGuard({ shouldWarn }: { shouldWarn: boolean }) {
  useUnsavedChangesWarning(shouldWarn)
  return null
}
