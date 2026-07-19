"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Building2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AutosaveIndicator } from "@/components/shared/AutosaveIndicator"
import { BusinessCard } from "@/features/onboarding/components/steps/step-2-businesses/BusinessCard"
import { StepTransition } from "@/features/onboarding/components/StepTransition"
import { UnsavedChangesGuard } from "@/features/onboarding/components/UnsavedChangesGuard"
import { useBusinessesQuery } from "@/features/onboarding/hooks/useBusinessesQuery"
import { useCreateBusinessMutation } from "@/features/onboarding/hooks/useCreateBusinessMutation"
import { useEnsureDraftMutation } from "@/features/onboarding/hooks/useEnsureDraftMutation"
import { useReorderBusinessesMutation } from "@/features/onboarding/hooks/useReorderBusinessesMutation"
import { staggerContainerVariants, staggerItemVariants } from "@/lib/animation-variants"
import { useOnboardingWizardStore } from "@/features/onboarding/store/onboarding-wizard.store"

export function Step2Form() {
  const prefersReducedMotion = useReducedMotion()
  const router = useRouter()
  const draftId = useOnboardingWizardStore((state) => state.draftId)
  const autosaveStatus = useOnboardingWizardStore((state) => state.autosaveStatus)

  const ensureDraft = useEnsureDraftMutation()
  const businessesQuery = useBusinessesQuery(draftId)
  const createMutation = useCreateBusinessMutation(draftId)
  const reorderMutation = useReorderBusinessesMutation(draftId)

  useEffect(() => {
    if (!draftId && !ensureDraft.isPending && !ensureDraft.isSuccess) {
      ensureDraft.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount; ensureDraft identity changes every render
  }, [draftId])

  const businesses = businessesQuery.data ?? []

  function handleMove(id: string, direction: "up" | "down") {
    const index = businesses.findIndex((b) => b.id === id)
    if (index === -1) return
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= businesses.length) return

    const reordered = [...businesses]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)
    reorderMutation.mutate(reordered)
  }

  const isLoading = ensureDraft.isPending || (!!draftId && businessesQuery.isPending)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (ensureDraft.isError || businessesQuery.isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Something went wrong loading your businesses. Refresh the page to try again.
      </div>
    )
  }

  return (
    <StepTransition stepKey="step-2">
      <UnsavedChangesGuard shouldWarn={autosaveStatus === "saving"} />
      <motion.div
        className="space-y-6"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        variants={staggerContainerVariants}
      >
        <motion.div variants={staggerItemVariants} className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Businesses</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add the businesses your organization operates. You can add as many as you need.
            </p>
          </div>
          <AutosaveIndicator status={autosaveStatus} />
        </motion.div>

        <motion.div variants={staggerItemVariants}>
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            disabled={!draftId || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            <Plus className="size-4" />
            Add business
          </Button>
        </motion.div>

        {businesses.length === 0 ? (
          <motion.div
            variants={staggerItemVariants}
            className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-14 text-center"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </div>
            <p className="text-sm font-medium">No businesses yet</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Add your first business to get started.
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="space-y-3">
            <AnimatePresence initial={false}>
              {businesses.map((business, index) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  organizationId={draftId as string}
                  isFirst={index === 0}
                  isLast={index === businesses.length - 1}
                  onMove={handleMove}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="flex items-center justify-between border-t border-border/60 pt-6">
          <Button type="button" variant="outline" onClick={() => router.push("/onboarding/step-1")}>
            Back
          </Button>
          <Button
            type="button"
            disabled={businesses.length === 0}
            title={businesses.length === 0 ? "Add at least one business to continue" : undefined}
            onClick={() => router.push("/onboarding/step-3")}
          >
            Continue
          </Button>
        </div>
      </motion.div>
    </StepTransition>
  )
}
