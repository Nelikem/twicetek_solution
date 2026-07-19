"use client"

import { useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form"
import { useDebouncedCallback } from "use-debounce"
import { toast } from "sonner"
import { motion, useReducedMotion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { RadioGroup } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { AutosaveIndicator } from "@/components/shared/AutosaveIndicator"
import { PlanCard } from "@/features/onboarding/components/steps/step-5-subscription/PlanCard"
import { StepTransition } from "@/features/onboarding/components/StepTransition"
import { UnsavedChangesGuard } from "@/features/onboarding/components/UnsavedChangesGuard"
import { SUBSCRIPTION_PLANS } from "@/features/onboarding/config/subscription-plans.config"
import { useEnsureDraftMutation } from "@/features/onboarding/hooks/useEnsureDraftMutation"
import { useSubscriptionQuery } from "@/features/onboarding/hooks/useSubscriptionQuery"
import { useUpdateSubscriptionMutation } from "@/features/onboarding/hooks/useUpdateSubscriptionMutation"
import {
  SUBSCRIPTION_DEFAULT_VALUES,
  subscriptionDraftSchema,
  subscriptionSchema,
  type SubscriptionDraftValues,
} from "@/features/onboarding/schemas/subscription.schema"
import { staggerContainerVariants, staggerItemVariants } from "@/lib/animation-variants"
import { useOnboardingWizardStore } from "@/features/onboarding/store/onboarding-wizard.store"
import type { Subscription } from "@/features/onboarding/types/onboarding.types"

const AUTOSAVE_DEBOUNCE_MS = 800

function toFormValues(subscription: Subscription): SubscriptionDraftValues {
  return {
    planId: subscription.planId,
    billingCycle: subscription.billingCycle,
  }
}

export function Step5Form() {
  const prefersReducedMotion = useReducedMotion()
  const router = useRouter()
  const draftId = useOnboardingWizardStore((state) => state.draftId)
  const autosaveStatus = useOnboardingWizardStore((state) => state.autosaveStatus)
  const setAutosaveStatus = useOnboardingWizardStore((state) => state.setAutosaveStatus)

  const ensureDraft = useEnsureDraftMutation()
  const subscriptionQuery = useSubscriptionQuery(draftId)
  const updateMutation = useUpdateSubscriptionMutation(draftId)

  const hasHydrated = useRef(false)

  const form = useForm<SubscriptionDraftValues>({
    resolver: zodResolver(subscriptionDraftSchema),
    mode: "onBlur",
    defaultValues: SUBSCRIPTION_DEFAULT_VALUES,
  })
  const { watch, reset, control } = form

  const watchedValues = useWatch({ control })
  const isComplete = useMemo(
    () => subscriptionSchema.safeParse(watchedValues).success,
    [watchedValues]
  )

  useEffect(() => {
    if (!draftId && !ensureDraft.isPending && !ensureDraft.isSuccess) {
      ensureDraft.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount; ensureDraft identity changes every render
  }, [draftId])

  // No "ensure" RPC to wait on here -- hydration just means "we've checked, and
  // either got a row or confirmed there isn't one yet."
  useEffect(() => {
    if (!draftId || subscriptionQuery.isPending || hasHydrated.current) return
    hasHydrated.current = true
    if (subscriptionQuery.data) {
      reset(toFormValues(subscriptionQuery.data), { keepDefaultValues: false })
    }
  }, [draftId, subscriptionQuery.data, subscriptionQuery.isPending, reset])

  const debouncedSave = useDebouncedCallback((values: SubscriptionDraftValues) => {
    const filled = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== undefined && value !== "")
    )
    const parsed = subscriptionDraftSchema.safeParse(filled)
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
      debouncedSave(values as SubscriptionDraftValues)
    })
    return () => subscription.unsubscribe()
  }, [watch, debouncedSave])

  const isLoading = ensureDraft.isPending || (!!draftId && subscriptionQuery.isPending)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (ensureDraft.isError || subscriptionQuery.isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Something went wrong loading your subscription. Refresh the page to try again.
      </div>
    )
  }

  const billingCycle = watchedValues.billingCycle ?? "monthly"

  return (
    <StepTransition stepKey="step-5">
      <FormProvider {...form}>
        <UnsavedChangesGuard shouldWarn={autosaveStatus === "saving"} />
        <form noValidate>
          <motion.div
            className="space-y-8"
            initial={prefersReducedMotion ? false : "hidden"}
            animate="visible"
            variants={staggerContainerVariants}
          >
            <motion.div variants={staggerItemVariants} className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Subscription</h1>
                <p className="mt-1 text-sm text-muted-foreground">Choose a plan and billing cycle.</p>
              </div>
              <AutosaveIndicator status={autosaveStatus} />
            </motion.div>

            <motion.div variants={staggerItemVariants} className="flex justify-center gap-2">
              <Controller
                name="billingCycle"
                control={control}
                render={({ field }) => (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant={field.value === "monthly" ? "default" : "outline"}
                      onClick={() => field.onChange("monthly")}
                    >
                      Monthly
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={field.value === "annual" ? "default" : "outline"}
                      onClick={() => field.onChange("annual")}
                    >
                      Annual
                    </Button>
                  </>
                )}
              />
            </motion.div>

            <motion.div variants={staggerItemVariants}>
              <Controller
                name="planId"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value || null}
                    onValueChange={field.onChange}
                    className="grid gap-4 sm:grid-cols-3"
                  >
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <PlanCard key={plan.id} plan={plan} billingCycle={billingCycle} />
                    ))}
                  </RadioGroup>
                )}
              />
            </motion.div>

            <motion.div
              variants={staggerItemVariants}
              className="flex items-center justify-between border-t border-border/60 pt-6"
            >
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" onClick={() => router.push("/onboarding/step-4")}>
                  Back
                </Button>
                {isComplete && (
                  <motion.span
                    initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    Plan selected
                  </motion.span>
                )}
              </div>
              <Button
                type="button"
                disabled={!watchedValues.planId}
                onClick={() => router.push("/onboarding/step-6")}
              >
                Continue
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </FormProvider>
    </StepTransition>
  )
}
