"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { staggerContainerVariants, staggerItemVariants } from "@/lib/animation-variants"

export function LandingHero() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center lg:py-28"
      initial={prefersReducedMotion ? false : "hidden"}
      animate="visible"
      variants={staggerContainerVariants}
    >
      <motion.span
        variants={staggerItemVariants}
        className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
      >
        <Sparkles className="size-3.5 text-primary" />
        Enterprise multi-tenant platform
      </motion.span>

      <motion.h1
        variants={staggerItemVariants}
        className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
      >
        One workspace for every
        <br className="hidden sm:block" /> organization, business, and branch.
      </motion.h1>

      <motion.p
        variants={staggerItemVariants}
        className="mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg"
      >
        Twicetek provisions your entire enterprise hierarchy from a single onboarding
        flow — organizations, the businesses inside them, and every branch beneath
        those — with role-based access and row-level security built in from step one.
      </motion.p>

      <motion.div variants={staggerItemVariants} className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button render={<Link href="/onboarding/register" />} nativeButton={false} size="lg" className="gap-1.5">
          Start onboarding
          <ArrowRight className="size-4" />
        </Button>
        <Button render={<Link href="/login" />} nativeButton={false} variant="outline" size="lg">
          Sign in
        </Button>
      </motion.div>
    </motion.div>
  )
}
