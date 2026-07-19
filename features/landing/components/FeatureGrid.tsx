"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Building2, ShieldCheck, Users, Zap, type LucideIcon } from "lucide-react"

import { staggerContainerVariants, staggerItemVariants } from "@/lib/animation-variants"

const FEATURES: readonly { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Building2,
    title: "Enterprise hierarchy",
    description:
      "Provision your organization, its businesses, and every branch beneath them from one guided flow.",
  },
  {
    icon: ShieldCheck,
    title: "Row-level security",
    description:
      "Every table is scoped and access-controlled at the database layer — not bolted on after the fact.",
  },
  {
    icon: Users,
    title: "Role-based access",
    description: "Owners, admins, managers, and employees each see exactly what they're meant to.",
  },
  {
    icon: Zap,
    title: "Fast onboarding",
    description: "Autosaving, validated, animated setup — minutes to a working workspace, not days.",
  },
]

export function FeatureGrid() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className="mx-auto grid w-full max-w-4xl gap-4 px-6 sm:grid-cols-2"
      initial={prefersReducedMotion ? undefined : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={staggerContainerVariants}
    >
      {FEATURES.map(({ icon: Icon, title, description }) => (
        <motion.div
          key={title}
          variants={staggerItemVariants}
          className="rounded-xl border border-border/60 bg-card/60 p-5 text-left backdrop-blur-sm"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4.5" />
          </div>
          <h3 className="mt-3 text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}
