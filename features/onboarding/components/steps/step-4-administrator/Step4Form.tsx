"use client"

import { useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { useDebouncedCallback } from "use-debounce"
import { toast } from "sonner"
import { motion, useReducedMotion } from "framer-motion"
import { CheckCircle2, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FieldGroup, FieldSet } from "@/components/ui/field"
import { AutosaveIndicator } from "@/components/shared/AutosaveIndicator"
import { SectionLegend } from "@/features/onboarding/components/fields/SectionLegend"
import { TextField } from "@/features/onboarding/components/fields/TextField"
import { StepTransition } from "@/features/onboarding/components/StepTransition"
import { UnsavedChangesGuard } from "@/features/onboarding/components/UnsavedChangesGuard"
import { useAdministratorQuery } from "@/features/onboarding/hooks/useAdministratorQuery"
import { useEnsureDraftMutation } from "@/features/onboarding/hooks/useEnsureDraftMutation"
import { useEnsureOwnerMembershipMutation } from "@/features/onboarding/hooks/useEnsureOwnerMembershipMutation"
import { useUpdateAdministratorMutation } from "@/features/onboarding/hooks/useUpdateAdministratorMutation"
import {
  ADMINISTRATOR_DEFAULT_VALUES,
  administratorDraftSchema,
  administratorSchema,
  type AdministratorDraftValues,
} from "@/features/onboarding/schemas/administrator.schema"
import { staggerContainerVariants, staggerItemVariants } from "@/lib/animation-variants"
import { useOnboardingWizardStore } from "@/features/onboarding/store/onboarding-wizard.store"
import type { Administrator } from "@/features/onboarding/types/onboarding.types"

const AUTOSAVE_DEBOUNCE_MS = 800

function toFormValues(admin: Administrator): AdministratorDraftValues {
  return {
    fullName: admin.fullName,
    jobTitle: admin.jobTitle,
    phone: admin.phone,
  }
}

export function Step4Form() {
  const prefersReducedMotion = useReducedMotion()
  const router = useRouter()
  const draftId = useOnboardingWizardStore((state) => state.draftId)
  const autosaveStatus = useOnboardingWizardStore((state) => state.autosaveStatus)
  const setAutosaveStatus = useOnboardingWizardStore((state) => state.setAutosaveStatus)

  const ensureDraft = useEnsureDraftMutation()
  const ensureMembership = useEnsureOwnerMembershipMutation(draftId)
  const administratorQuery = useAdministratorQuery(draftId)
  const updateMutation = useUpdateAdministratorMutation(draftId)

  const hasHydrated = useRef(false)

  const form = useForm<AdministratorDraftValues>({
    resolver: zodResolver(administratorDraftSchema),
    mode: "onBlur",
    defaultValues: ADMINISTRATOR_DEFAULT_VALUES,
  })
  const { watch, reset, formState, control } = form

  const watchedValues = useWatch({ control })
  const isComplete = useMemo(
    () => administratorSchema.safeParse(watchedValues).success,
    [watchedValues]
  )

  // Stage 1: ensure the draft org exists (fallback for deep-linking straight to step-4).
  useEffect(() => {
    if (!draftId && !ensureDraft.isPending && !ensureDraft.isSuccess) {
      ensureDraft.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount; ensureDraft identity changes every render
  }, [draftId])

  // Stage 2: once the org exists, ensure the owner's organization_members row exists.
  useEffect(() => {
    if (draftId && !ensureMembership.isPending && !ensureMembership.isSuccess) {
      ensureMembership.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once draftId arrives; ensureMembership identity changes every render
  }, [draftId])

  useEffect(() => {
    if (!administratorQuery.data || hasHydrated.current) return
    hasHydrated.current = true
    reset(toFormValues(administratorQuery.data), { keepDefaultValues: false })
  }, [administratorQuery.data, reset])

  const debouncedSave = useDebouncedCallback((values: AdministratorDraftValues) => {
    const filled = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== undefined && value !== "")
    )
    const parsed = administratorDraftSchema.safeParse(filled)
    if (!parsed.success || Object.keys(parsed.data).length === 0) return
    if (!administratorQuery.data) return

    setAutosaveStatus("saving")
    updateMutation.mutate(
      {
        membershipId: administratorQuery.data.membershipId,
        userId: administratorQuery.data.userId,
        patch: parsed.data,
      },
      {
        onSuccess: () => setAutosaveStatus("saved", new Date().toISOString()),
        onError: () => {
          setAutosaveStatus("error")
          toast.error("Couldn't save your changes", {
            action: { label: "Retry", onClick: () => debouncedSave(values) },
          })
        },
      }
    )
  }, AUTOSAVE_DEBOUNCE_MS)

  useEffect(() => {
    const subscription = watch((values, info) => {
      if (!hasHydrated.current || info.type !== "change") return
      debouncedSave(values as AdministratorDraftValues)
    })
    return () => subscription.unsubscribe()
  }, [watch, debouncedSave])

  const isLoading =
    ensureDraft.isPending || (!!draftId && (ensureMembership.isPending || administratorQuery.isPending))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (ensureDraft.isError || ensureMembership.isError || administratorQuery.isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Something went wrong loading your administrator details. Refresh the page to try again.
      </div>
    )
  }

  return (
    <StepTransition stepKey="step-4">
      <FormProvider {...form}>
        <UnsavedChangesGuard shouldWarn={formState.isDirty && autosaveStatus !== "saved"} />
        <form noValidate>
          <motion.div
            className="space-y-8"
            initial={prefersReducedMotion ? false : "hidden"}
            animate="visible"
            variants={staggerContainerVariants}
          >
            <motion.div variants={staggerItemVariants} className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Enterprise administrator</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  You&apos;re the administrator for this organization. Confirm your details below.
                </p>
              </div>
              <AutosaveIndicator status={autosaveStatus} />
            </motion.div>

            <motion.div variants={staggerItemVariants} className="flex items-center gap-2">
              <Badge variant="secondary" className="shrink-0">
                Owner
              </Badge>
              <Badge variant="secondary" className="shrink-0 capitalize">
                {administratorQuery.data?.status}
              </Badge>
            </motion.div>

            <motion.div variants={staggerItemVariants}>
              <FieldSet>
                <SectionLegend icon={ShieldCheck}>Administrator details</SectionLegend>
                <FieldGroup>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField<AdministratorDraftValues> name="fullName" label="Full name" />
                    <TextField<AdministratorDraftValues> name="jobTitle" label="Job title" />
                  </div>
                  <TextField<AdministratorDraftValues> name="phone" label="Direct phone" type="tel" />
                </FieldGroup>
              </FieldSet>
            </motion.div>

            <motion.div
              variants={staggerItemVariants}
              className="flex items-center justify-between border-t border-border/60 pt-6"
            >
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" onClick={() => router.push("/onboarding/step-3")}>
                  Back
                </Button>
                {isComplete && (
                  <motion.span
                    initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    All fields complete
                  </motion.span>
                )}
              </div>
              <Button type="button" disabled title="Steps 5-6 are coming in a future release">
                Continue
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </FormProvider>
    </StepTransition>
  )
}
