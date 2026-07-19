"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Check, Lock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { WIZARD_STEPS } from "@/features/onboarding/config/wizard-steps.config"

export function StepIndicator({ currentStep }: { currentStep: number }) {
  const prefersReducedMotion = useReducedMotion()
  const maxStepId = WIZARD_STEPS[WIZARD_STEPS.length - 1]?.id ?? 1
  const progress = Math.min(1, Math.max(0, currentStep / maxStepId))

  return (
    <nav aria-label="Onboarding progress" className="relative">
      <div aria-hidden className="absolute top-2 bottom-2 left-6 w-px bg-border" />
      <motion.div
        aria-hidden
        className="absolute top-2 left-6 w-px origin-top bg-gradient-to-b from-primary to-primary/30"
        style={{ height: "calc(100% - 1rem)" }}
        initial={false}
        animate={{ scaleY: progress }}
        transition={
          prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
        }
      />

      <ol role="list" className="relative flex flex-col gap-1">
        {WIZARD_STEPS.map((step) => {
          const isActive = step.id === currentStep
          const isComplete = step.id < currentStep
          const isLocked = step.status === "locked"

          const content = (
            <>
              <span className="relative mt-0.5 flex size-6 shrink-0 items-center justify-center">
                {isActive && !prefersReducedMotion && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/40 [animation-duration:2s]" />
                )}
                <span
                  className={cn(
                    "relative flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors duration-300",
                    isActive && "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30",
                    isComplete && "border-primary/40 bg-primary/10 text-primary",
                    !isActive && !isComplete && "border-border bg-background text-muted-foreground"
                  )}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={isComplete ? "complete" : isLocked ? "locked" : "number"}
                      initial={prefersReducedMotion ? undefined : { scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="flex items-center justify-center"
                    >
                      {isComplete ? (
                        <Check className="size-3.5" />
                      ) : isLocked ? (
                        <Lock className="size-3" />
                      ) : (
                        step.id
                      )}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </span>
              <span className="flex flex-col">
                <span
                  className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {step.description}
                </span>
              </span>
            </>
          )

          return (
            <li
              key={step.id}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "rounded-lg transition-colors duration-300",
                isActive && "bg-primary/5",
                isLocked && "opacity-50"
              )}
            >
              {isLocked ? (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <div aria-disabled="true" className="flex w-full items-start gap-3 px-3 py-2.5" />
                    }
                  >
                    {content}
                  </TooltipTrigger>
                  <TooltipContent side="right">Coming soon</TooltipContent>
                </Tooltip>
              ) : (
                <div className="flex items-start gap-3 px-3 py-2.5">{content}</div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
