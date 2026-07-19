"use client"

import { useEffect, useMemo, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { useDebouncedCallback } from "use-debounce"
import { toast } from "sonner"
import { motion, useReducedMotion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AutosaveIndicator } from "@/components/shared/AutosaveIndicator"
import { StepTransition } from "@/features/onboarding/components/StepTransition"
import { UnsavedChangesGuard } from "@/features/onboarding/components/UnsavedChangesGuard"
import { LogoDropzone } from "@/features/onboarding/components/steps/step-1-organization/LogoDropzone"
import { OrgContactFields } from "@/features/onboarding/components/steps/step-1-organization/OrgContactFields"
import { OrgIdentityFields } from "@/features/onboarding/components/steps/step-1-organization/OrgIdentityFields"
import { OrgLocationFields } from "@/features/onboarding/components/steps/step-1-organization/OrgLocationFields"
import { OrgRegionalFields } from "@/features/onboarding/components/steps/step-1-organization/OrgRegionalFields"
import { staggerContainerVariants, staggerItemVariants } from "@/lib/animation-variants"
import { useEnsureDraftMutation } from "@/features/onboarding/hooks/useEnsureDraftMutation"
import { useOrganizationDraftQuery } from "@/features/onboarding/hooks/useOrganizationDraftQuery"
import { useUpdateOrganizationInfoMutation } from "@/features/onboarding/hooks/useUpdateOrganizationInfoMutation"
import {
  ORGANIZATION_INFO_DEFAULT_VALUES,
  organizationInfoDraftSchema,
  organizationInfoSchema,
  type OrganizationInfoDraftValues,
} from "@/features/onboarding/schemas/organization-info.schema"
import { useOnboardingWizardStore } from "@/features/onboarding/store/onboarding-wizard.store"
import type { OrganizationDraft } from "@/features/onboarding/types/onboarding.types"

const AUTOSAVE_DEBOUNCE_MS = 800

function toFormValues(draft: OrganizationDraft): OrganizationInfoDraftValues {
  return {
    logoPath: draft.logoPath,
    companyName: draft.companyName,
    legalBusinessName: draft.legalBusinessName,
    registrationNumber: draft.registrationNumber,
    taxId: draft.taxId,
    industry: draft.industry,
    orgEmail: draft.orgEmail,
    phone: draft.phone,
    website: draft.website,
    country: draft.country,
    state: draft.state,
    city: draft.city,
    address: draft.address,
    timezone: draft.timezone,
    currency: draft.currency,
    fiscalYearStartMonth: draft.fiscalYearStartMonth,
  }
}

export function Step1Form() {
  const prefersReducedMotion = useReducedMotion()
  const draftId = useOnboardingWizardStore((state) => state.draftId)
  const autosaveStatus = useOnboardingWizardStore((state) => state.autosaveStatus)
  const setAutosaveStatus = useOnboardingWizardStore((state) => state.setAutosaveStatus)

  const ensureDraft = useEnsureDraftMutation()
  const draftQuery = useOrganizationDraftQuery(draftId)
  const updateMutation = useUpdateOrganizationInfoMutation(draftId)

  const hasHydrated = useRef(false)

  const form = useForm<OrganizationInfoDraftValues>({
    resolver: zodResolver(organizationInfoDraftSchema),
    mode: "onBlur",
    defaultValues: ORGANIZATION_INFO_DEFAULT_VALUES,
  })
  const { watch, reset, formState, control } = form

  const watchedValues = useWatch({ control })
  const isComplete = useMemo(
    () => organizationInfoSchema.safeParse(watchedValues).success,
    [watchedValues]
  )

  useEffect(() => {
    if (!draftId && !ensureDraft.isPending && !ensureDraft.isSuccess) {
      ensureDraft.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount; ensureDraft identity changes every render
  }, [draftId])

  useEffect(() => {
    if (!draftQuery.data || hasHydrated.current) return
    hasHydrated.current = true
    reset(toFormValues(draftQuery.data), { keepDefaultValues: false })
  }, [draftQuery.data, reset])

  const debouncedSave = useDebouncedCallback((values: OrganizationInfoDraftValues) => {
    // Untouched fields default to "" rather than being absent, but "" fails each
    // field's own min-length validator — drop blanks so partial drafts still
    // autosave the fields that ARE filled in instead of failing the whole payload.
    const filled = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== undefined && value !== "")
    )
    const parsed = organizationInfoDraftSchema.safeParse(filled)
    if (!parsed.success || Object.keys(parsed.data).length === 0) return

    setAutosaveStatus("saving")
    updateMutation.mutate(parsed.data, {
      onSuccess: () => setAutosaveStatus("saved", new Date().toISOString()),
      onError: () => {
        setAutosaveStatus("error")
        toast.error("Couldn't save your changes", {
          action: { label: "Retry", onClick: () => debouncedSave(values) },
        })
      },
    })
  }, AUTOSAVE_DEBOUNCE_MS)

  useEffect(() => {
    const subscription = watch((values, info) => {
      if (!hasHydrated.current || info.type !== "change") return
      debouncedSave(values as OrganizationInfoDraftValues)
    })
    return () => subscription.unsubscribe()
  }, [watch, debouncedSave])

  const isLoading = ensureDraft.isPending || (!!draftId && draftQuery.isPending)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (ensureDraft.isError || draftQuery.isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Something went wrong loading your organization draft. Refresh the page to try again.
      </div>
    )
  }

  return (
    <StepTransition stepKey="step-1">
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
                <h1 className="text-xl font-semibold tracking-tight">Organization information</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tell us about the company that owns this workspace.
                </p>
              </div>
              <AutosaveIndicator status={autosaveStatus} />
            </motion.div>

            <motion.div variants={staggerItemVariants}>
              <LogoDropzone draftId={draftId} logoPath={watchedValues?.logoPath} />
            </motion.div>

            <motion.div variants={staggerItemVariants}>
              <OrgIdentityFields />
            </motion.div>
            <motion.div variants={staggerItemVariants}>
              <OrgContactFields />
            </motion.div>
            <motion.div variants={staggerItemVariants}>
              <OrgLocationFields />
            </motion.div>
            <motion.div variants={staggerItemVariants}>
              <OrgRegionalFields />
            </motion.div>

            <motion.div
              variants={staggerItemVariants}
              className="flex items-center justify-between border-t border-border/60 pt-6"
            >
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {isComplete && (
                  <motion.span
                    initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    All fields complete
                  </motion.span>
                )}
              </p>
              <Button type="button" disabled title="Steps 2-6 are coming in a future release">
                Continue
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </FormProvider>
    </StepTransition>
  )
}
