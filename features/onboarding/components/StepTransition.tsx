"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

export function StepTransition({
  stepKey,
  children,
}: {
  stepKey: string
  children: React.ReactNode
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={prefersReducedMotion ? undefined : { opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0, x: -16 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
