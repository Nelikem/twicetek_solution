"use client"

import { usePathname } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { Building2 } from "lucide-react"

import { MeshGradientBackground } from "@/components/shared/MeshGradientBackground"
import { StepIndicator } from "@/features/onboarding/components/StepIndicator"
import { WIZARD_STEPS } from "@/features/onboarding/config/wizard-steps.config"

export function OnboardingWizardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  // Derived from the route rather than the wizard store: the store's currentStep
  // tracks onboarding *progress* for resuming later, but the indicator's active
  // highlight should always reflect where you actually are right now — including
  // pre-auth, on /onboarding/register, before any draft (and thus any progress) exists.
  const currentStep = WIZARD_STEPS.find((step) => step.path === pathname)?.id ?? 0

  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <MeshGradientBackground />

      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-0 py-0 lg:px-6 lg:py-8">
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex min-h-svh w-full flex-1 flex-col overflow-hidden border-border/60 bg-card/60 shadow-black/[0.03] backdrop-blur-xl lg:min-h-0 lg:flex-row lg:rounded-3xl lg:border lg:shadow-2xl"
        >
          <aside className="border-b border-border/60 px-6 py-8 lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:bg-muted/20 lg:px-4">
            <div className="mb-8 flex items-center gap-2.5 px-3">
              <div className="relative flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-lg bg-primary opacity-60 blur-md"
                />
                <Building2 className="relative size-4" />
              </div>
              <span className="text-sm font-semibold tracking-tight">Organization setup</span>
            </div>
            <StepIndicator currentStep={currentStep} />
          </aside>

          <main className="flex-1 px-6 py-10 lg:px-12 lg:py-14">
            <div className="mx-auto w-full max-w-2xl">{children}</div>
          </main>
        </motion.div>
      </div>
    </div>
  )
}
