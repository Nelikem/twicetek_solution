"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { Building2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AutosaveIndicator } from "@/components/shared/AutosaveIndicator"
import { BusinessBranchesSection } from "@/features/onboarding/components/steps/step-3-branches/BusinessBranchesSection"
import { StepTransition } from "@/features/onboarding/components/StepTransition"
import { UnsavedChangesGuard } from "@/features/onboarding/components/UnsavedChangesGuard"
import { useBranchesQuery } from "@/features/onboarding/hooks/useBranchesQuery"
import { useBusinessesQuery } from "@/features/onboarding/hooks/useBusinessesQuery"
import { useEnsureDraftMutation } from "@/features/onboarding/hooks/useEnsureDraftMutation"
import { staggerContainerVariants, staggerItemVariants } from "@/lib/animation-variants"
import { useOnboardingWizardStore } from "@/features/onboarding/store/onboarding-wizard.store"
import type { Branch } from "@/features/onboarding/types/onboarding.types"

export function Step3Form() {
  const prefersReducedMotion = useReducedMotion()
  const router = useRouter()
  const draftId = useOnboardingWizardStore((state) => state.draftId)
  const autosaveStatus = useOnboardingWizardStore((state) => state.autosaveStatus)

  const ensureDraft = useEnsureDraftMutation()
  const businessesQuery = useBusinessesQuery(draftId)
  const branchesQuery = useBranchesQuery(draftId)

  useEffect(() => {
    if (!draftId && !ensureDraft.isPending && !ensureDraft.isSuccess) {
      ensureDraft.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount; ensureDraft identity changes every render
  }, [draftId])

  const businesses = businessesQuery.data ?? []

  const branchesByBusiness = useMemo(() => {
    const map = new Map<string, Branch[]>()
    for (const branch of branchesQuery.data ?? []) {
      const existing = map.get(branch.businessId)
      if (existing) existing.push(branch)
      else map.set(branch.businessId, [branch])
    }
    return map
  }, [branchesQuery.data])

  const isLoading =
    ensureDraft.isPending || (!!draftId && (businessesQuery.isPending || branchesQuery.isPending))

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (ensureDraft.isError || businessesQuery.isError || branchesQuery.isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Something went wrong loading your branches. Refresh the page to try again.
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <StepTransition stepKey="step-3">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-14 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Building2 className="size-5" />
          </div>
          <p className="text-sm font-medium">Add at least one business before registering branches</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Branches belong to a business — go back and add one first.
          </p>
          <Button type="button" className="mt-2" onClick={() => router.push("/onboarding/step-2")}>
            Go to Businesses
          </Button>
        </div>
      </StepTransition>
    )
  }

  return (
    <StepTransition stepKey="step-3">
      <UnsavedChangesGuard shouldWarn={autosaveStatus === "saving"} />
      <motion.div
        className="space-y-6"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        variants={staggerContainerVariants}
      >
        <motion.div variants={staggerItemVariants} className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Branches</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add branches under each business. You can add as many as you need.
            </p>
          </div>
          <AutosaveIndicator status={autosaveStatus} />
        </motion.div>

        <motion.div variants={staggerContainerVariants} className="space-y-4">
          {businesses.map((business) => (
            <BusinessBranchesSection
              key={business.id}
              business={business}
              branches={branchesByBusiness.get(business.id) ?? []}
              organizationId={draftId as string}
            />
          ))}
        </motion.div>

        <div className="flex items-center justify-between border-t border-border/60 pt-6">
          <Button type="button" variant="outline" onClick={() => router.push("/onboarding/step-2")}>
            Back
          </Button>
          <Button type="button" disabled title="Steps 4-6 are coming in a future release">
            Continue
          </Button>
        </div>
      </motion.div>
    </StepTransition>
  )
}
