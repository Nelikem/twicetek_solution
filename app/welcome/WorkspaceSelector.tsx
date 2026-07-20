"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { motion, useReducedMotion } from "framer-motion"
import { Building2, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { selectWorkspace } from "@/app/welcome/actions"
import { staggerContainerVariants, staggerItemVariants } from "@/lib/animation-variants"
import type { Branch, Business } from "@/features/onboarding/types/onboarding.types"

interface WorkspaceSelectorProps {
  businesses: Business[]
  branchesByBusiness: Record<string, Branch[]>
  companyName: string
}

const BUSINESS_LEVEL_SUFFIX = ""

function encodeValue(businessId: string, branchId: string | null) {
  return `${businessId}:${branchId ?? BUSINESS_LEVEL_SUFFIX}`
}

function decodeValue(value: string): { businessId: string; branchId: string | null } {
  const [businessId, branchId] = value.split(":")
  return { businessId, branchId: branchId || null }
}

export function WorkspaceSelector({ businesses, branchesByBusiness, companyName }: WorkspaceSelectorProps) {
  const prefersReducedMotion = useReducedMotion()
  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleContinue() {
    if (!selectedValue) return
    const { businessId, branchId } = decodeValue(selectedValue)
    startTransition(async () => {
      try {
        await selectWorkspace(businessId, branchId)
      } catch (error) {
        // redirect() inside the action throws internally on success -- only a
        // genuine failure (business/branch not found) reaches this catch.
        toast.error(error instanceof Error ? error.message : "Couldn't open that workspace")
      }
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-16">
      <motion.div
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        variants={staggerContainerVariants}
        className="space-y-8"
      >
        <motion.div variants={staggerItemVariants} className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to {companyName}</h1>
          <p className="text-sm text-muted-foreground">Choose which workspace you&apos;d like to open.</p>
        </motion.div>

        <motion.div variants={staggerItemVariants}>
          <RadioGroup value={selectedValue} onValueChange={setSelectedValue} className="gap-4">
            {businesses.map((business) => {
              const branches = branchesByBusiness[business.id] ?? []
              return (
                <div key={business.id} className="space-y-2 rounded-xl border border-border/60 p-4">
                  <FieldLabel className="w-full items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-primary" />
                      <span className="text-sm font-semibold">{business.name || "Untitled business"}</span>
                      {branches.length > 0 && (
                        <Badge variant="secondary">
                          {branches.length} {branches.length === 1 ? "branch" : "branches"}
                        </Badge>
                      )}
                    </div>
                    <RadioGroupItem value={encodeValue(business.id, null)} />
                  </FieldLabel>

                  {branches.length > 0 && (
                    <div className="ml-6 space-y-1.5 border-l border-border/60 pl-4">
                      {branches.map((branch) => (
                        <FieldLabel
                          key={branch.id}
                          className="w-full items-center justify-between gap-3 rounded-lg py-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="size-3.5 text-muted-foreground" />
                            <span className="text-sm">{branch.name || "Untitled branch"}</span>
                          </div>
                          <RadioGroupItem value={encodeValue(business.id, branch.id)} />
                        </FieldLabel>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </RadioGroup>
        </motion.div>

        <motion.div variants={staggerItemVariants} className="flex justify-end border-t border-border/60 pt-6">
          <Button type="button" disabled={!selectedValue || isPending} onClick={handleContinue}>
            Continue to Dashboard
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
