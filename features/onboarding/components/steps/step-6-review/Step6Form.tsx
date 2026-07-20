"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion, useReducedMotion } from "framer-motion"
import { Building2, CheckCircle2, Mail, MapPin, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StepTransition } from "@/features/onboarding/components/StepTransition"
import { SUBSCRIPTION_PLANS } from "@/features/onboarding/config/subscription-plans.config"
import { useAdministratorQuery } from "@/features/onboarding/hooks/useAdministratorQuery"
import { useBranchesQuery } from "@/features/onboarding/hooks/useBranchesQuery"
import { useBusinessesQuery } from "@/features/onboarding/hooks/useBusinessesQuery"
import { useCompleteOnboardingMutation } from "@/features/onboarding/hooks/useCompleteOnboardingMutation"
import { useEnsureDraftMutation } from "@/features/onboarding/hooks/useEnsureDraftMutation"
import { useOrganizationDraftQuery } from "@/features/onboarding/hooks/useOrganizationDraftQuery"
import { useSubscriptionQuery } from "@/features/onboarding/hooks/useSubscriptionQuery"
import { staggerContainerVariants, staggerItemVariants } from "@/lib/animation-variants"
import { useOnboardingWizardStore } from "@/features/onboarding/store/onboarding-wizard.store"

export function Step6Form() {
  const prefersReducedMotion = useReducedMotion()
  const router = useRouter()
  const draftId = useOnboardingWizardStore((state) => state.draftId)

  const ensureDraft = useEnsureDraftMutation()
  const organizationQuery = useOrganizationDraftQuery(draftId)
  const businessesQuery = useBusinessesQuery(draftId)
  const branchesQuery = useBranchesQuery(draftId)
  const administratorQuery = useAdministratorQuery(draftId)
  const subscriptionQuery = useSubscriptionQuery(draftId)
  const completeMutation = useCompleteOnboardingMutation(draftId)

  useEffect(() => {
    if (!draftId && !ensureDraft.isPending && !ensureDraft.isSuccess) {
      ensureDraft.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount; ensureDraft identity changes every render
  }, [draftId])

  // Covers both a fresh "Complete Setup" click and re-visiting this step after a
  // prior session already completed onboarding -- the query just comes back active.
  const isComplete = organizationQuery.data?.status === "active" || completeMutation.isSuccess

  useEffect(() => {
    if (isComplete) router.push("/welcome")
  }, [isComplete, router])

  const isLoading =
    ensureDraft.isPending ||
    (!!draftId &&
      (organizationQuery.isPending ||
        businessesQuery.isPending ||
        branchesQuery.isPending ||
        administratorQuery.isPending ||
        subscriptionQuery.isPending))

  const isError =
    ensureDraft.isError ||
    organizationQuery.isError ||
    businessesQuery.isError ||
    branchesQuery.isError ||
    administratorQuery.isError ||
    subscriptionQuery.isError

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Something went wrong loading your review. Refresh the page to try again.
      </div>
    )
  }

  // Redirecting to /dashboard (see effect above) -- render a skeleton for the one
  // render tick before navigation commits, rather than flashing review content.
  if (isComplete) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const org = organizationQuery.data
  const businesses = businessesQuery.data ?? []
  const branches = branchesQuery.data ?? []
  const administrator = administratorQuery.data
  const subscription = subscriptionQuery.data
  const plan = subscription ? SUBSCRIPTION_PLANS.find((p) => p.id === subscription.planId) : undefined

  function branchesForBusiness(businessId: string) {
    return branches.filter((branch) => branch.businessId === businessId)
  }

  return (
    <StepTransition stepKey="step-6">
      <motion.div
        className="space-y-6"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        variants={staggerContainerVariants}
      >
        <motion.div variants={staggerItemVariants}>
          <h1 className="text-xl font-semibold tracking-tight">Review</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Confirm everything below, then complete setup to activate your organization.
          </p>
        </motion.div>

        <motion.section variants={staggerItemVariants} className="space-y-2 rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Building2 className="size-4 text-primary" />
            Organization
          </div>
          <dl className="grid gap-1 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Company name</dt>
              <dd>{org?.companyName || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Industry</dt>
              <dd>{org?.industry || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{org?.orgEmail || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Location</dt>
              <dd>{[org?.city, org?.country].filter(Boolean).join(", ") || "—"}</dd>
            </div>
          </dl>
        </motion.section>

        <motion.section variants={staggerItemVariants} className="space-y-3 rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="size-4 text-primary" />
            Businesses & branches
          </div>
          {businesses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No businesses added.</p>
          ) : (
            <ul className="space-y-2">
              {businesses.map((business) => {
                const businessBranches = branchesForBusiness(business.id)
                return (
                  <li key={business.id} className="rounded-lg bg-muted/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{business.name || "Untitled business"}</span>
                      <Badge variant="secondary">
                        {businessBranches.length} {businessBranches.length === 1 ? "branch" : "branches"}
                      </Badge>
                    </div>
                    {businessBranches.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {businessBranches.map((b) => b.name || "Untitled branch").join(", ")}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </motion.section>

        <motion.section variants={staggerItemVariants} className="space-y-2 rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="size-4 text-primary" />
            Administrator
          </div>
          <dl className="grid gap-1 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Full name</dt>
              <dd>{administrator?.fullName || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Job title</dt>
              <dd>{administrator?.jobTitle || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{administrator?.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Role</dt>
              <dd>Owner</dd>
            </div>
          </dl>
        </motion.section>

        <motion.section variants={staggerItemVariants} className="space-y-2 rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Mail className="size-4 text-primary" />
            Plan
          </div>
          {plan ? (
            <div className="flex items-center justify-between">
              <span className="text-sm">{plan.name}</span>
              <Badge variant="outline" className="capitalize">
                {subscription?.billingCycle}
              </Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No plan selected.</p>
          )}
        </motion.section>

        <motion.div
          variants={staggerItemVariants}
          className="flex items-center justify-between border-t border-border/60 pt-6"
        >
          <Button type="button" variant="outline" onClick={() => router.push("/onboarding/step-5")}>
            Back
          </Button>
          <Button
            type="button"
            disabled={completeMutation.isPending}
            onClick={() =>
              completeMutation.mutate(undefined, {
                onError: (error) => {
                  toast.error(error instanceof Error ? error.message : "Couldn't complete setup")
                },
              })
            }
          >
            <CheckCircle2 className="size-4" />
            Complete Setup
          </Button>
        </motion.div>
      </motion.div>
    </StepTransition>
  )
}
