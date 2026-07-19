"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, MapPinned, Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BranchCard } from "@/features/onboarding/components/steps/step-3-branches/BranchCard"
import { useCreateBranchMutation } from "@/features/onboarding/hooks/useCreateBranchMutation"
import { useReorderBranchesMutation } from "@/features/onboarding/hooks/useReorderBranchesMutation"
import { staggerContainerVariants, staggerItemVariants } from "@/lib/animation-variants"
import type { Branch, Business } from "@/features/onboarding/types/onboarding.types"

interface BusinessBranchesSectionProps {
  business: Business
  branches: Branch[]
  organizationId: string
}

export function BusinessBranchesSection({ business, branches, organizationId }: BusinessBranchesSectionProps) {
  const [expanded, setExpanded] = useState(true)

  const createMutation = useCreateBranchMutation(organizationId, business.id)
  const reorderMutation = useReorderBranchesMutation(organizationId)

  function handleMove(id: string, direction: "up" | "down") {
    const index = branches.findIndex((b) => b.id === id)
    if (index === -1) return
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= branches.length) return

    const reordered = [...branches]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)
    reorderMutation.mutate({ businessId: business.id, reordered })
  }

  return (
    <motion.div
      variants={staggerItemVariants}
      className="overflow-hidden rounded-xl border border-border/60 bg-background/40"
    >
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={expanded}
        >
          <span className="truncate text-sm font-semibold">{business.name || "Untitled business"}</span>
          <Badge variant="outline" className="shrink-0">
            {branches.length} {branches.length === 1 ? "branch" : "branches"}
          </Badge>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            <Plus className="size-3.5" />
            Add branch
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setExpanded((value) => !value)}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <ChevronDown className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <div className="border-t border-border/60 p-4">
          {branches.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/60 py-8 text-center">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPinned className="size-4" />
              </div>
              <p className="text-sm text-muted-foreground">No branches yet for {business.name || "this business"}</p>
            </div>
          ) : (
            <motion.div
              layout
              className="space-y-3"
              initial="hidden"
              animate="visible"
              variants={staggerContainerVariants}
            >
              <AnimatePresence initial={false}>
                {branches.map((branch, index) => (
                  <BranchCard
                    key={branch.id}
                    branch={branch}
                    organizationId={organizationId}
                    isFirst={index === 0}
                    isLast={index === branches.length - 1}
                    onMove={handleMove}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
