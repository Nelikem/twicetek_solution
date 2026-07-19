"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Building2, GitBranch, Store } from "lucide-react"

import { staggerContainerVariants, staggerItemVariants } from "@/lib/animation-variants"

const BUSINESSES = [
  { name: "Restaurant Division", branches: ["Accra", "Kumasi", "Takoradi"] },
  { name: "Retail Division", branches: ["Downtown", "Airport Mall"] },
] as const

export function HierarchyShowcase() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className="mx-auto w-full max-w-3xl px-6"
      initial={prefersReducedMotion ? undefined : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      variants={staggerContainerVariants}
    >
      <motion.div
        variants={staggerItemVariants}
        className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-xl shadow-black/[0.03] backdrop-blur-xl sm:p-8"
      >
        {/* Organization */}
        <div className="flex items-center gap-3">
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <div aria-hidden className="absolute inset-0 rounded-xl bg-primary opacity-60 blur-md" />
            <Building2 className="relative size-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">Acme Inc.</p>
            <p className="text-xs text-muted-foreground">Organization</p>
          </div>
        </div>

        {/* Businesses */}
        <div className="mt-6 grid gap-4 border-l-2 border-dashed border-border pl-6 sm:grid-cols-2">
          {BUSINESSES.map((business) => (
            <motion.div
              key={business.name}
              variants={staggerItemVariants}
              className="rounded-xl border border-border/60 bg-background/60 p-4 text-left"
            >
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Store className="size-3.5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{business.name}</p>
                  <p className="text-[11px] text-muted-foreground">Business</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 border-l border-dashed border-border pl-4">
                {business.branches.map((branch) => (
                  <span
                    key={branch}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    <GitBranch className="size-3" />
                    {branch}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
