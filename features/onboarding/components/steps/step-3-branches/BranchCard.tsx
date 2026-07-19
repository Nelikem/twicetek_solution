"use client"

import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { useDebouncedCallback } from "use-debounce"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { ArrowDown, ArrowUp, ChevronDown, Copy, Mail, MapPin, Store, Trash2, Warehouse } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldGroup, FieldSet } from "@/components/ui/field"
import { SectionLegend } from "@/features/onboarding/components/fields/SectionLegend"
import { SwitchField } from "@/features/onboarding/components/fields/SwitchField"
import { TextField } from "@/features/onboarding/components/fields/TextField"
import { TextareaField } from "@/features/onboarding/components/fields/TextareaField"
import { useDeleteBranchMutation } from "@/features/onboarding/hooks/useDeleteBranchMutation"
import { useDuplicateBranchMutation } from "@/features/onboarding/hooks/useDuplicateBranchMutation"
import { useUpdateBranchMutation } from "@/features/onboarding/hooks/useUpdateBranchMutation"
import {
  BRANCH_DEFAULT_VALUES,
  branchDraftSchema,
  type BranchDraftValues,
} from "@/features/onboarding/schemas/branch.schema"
import { useOnboardingWizardStore } from "@/features/onboarding/store/onboarding-wizard.store"
import type { Branch } from "@/features/onboarding/types/onboarding.types"

const AUTOSAVE_DEBOUNCE_MS = 800

function toFormValues(branch: Branch): BranchDraftValues {
  return {
    name: branch.name,
    managerName: branch.managerName,
    email: branch.email,
    phone: branch.phone,
    gpsAddress: branch.gpsAddress,
    physicalAddress: branch.physicalAddress,
    openingHours: branch.openingHours,
    warehouseEnabled: branch.warehouseEnabled,
    posEnabled: branch.posEnabled,
    deliveryEnabled: branch.deliveryEnabled,
  }
}

interface BranchCardProps {
  branch: Branch
  organizationId: string
  isFirst: boolean
  isLast: boolean
  onMove: (id: string, direction: "up" | "down") => void
}

export function BranchCard({ branch, organizationId, isFirst, isLast, onMove }: BranchCardProps) {
  const setAutosaveStatus = useOnboardingWizardStore((state) => state.setAutosaveStatus)
  const [expanded, setExpanded] = useState(() => !branch.name)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const hasHydrated = useRef(false)

  const updateMutation = useUpdateBranchMutation(branch.id, organizationId)
  const duplicateMutation = useDuplicateBranchMutation(organizationId)
  const deleteMutation = useDeleteBranchMutation(organizationId)

  const form = useForm<BranchDraftValues>({
    resolver: zodResolver(branchDraftSchema),
    mode: "onBlur",
    defaultValues: BRANCH_DEFAULT_VALUES,
  })
  const { watch, reset, control } = form
  const watchedValues = useWatch({ control })

  useEffect(() => {
    if (hasHydrated.current) return
    hasHydrated.current = true
    reset(toFormValues(branch), { keepDefaultValues: false })
  }, [branch, reset])

  const debouncedSave = useDebouncedCallback((values: BranchDraftValues) => {
    const filled = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== undefined && value !== "")
    )
    const parsed = branchDraftSchema.safeParse(filled)
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
      debouncedSave(values as BranchDraftValues)
    })
    return () => subscription.unsubscribe()
  }, [watch, debouncedSave])

  const displayName = watchedValues?.name || "Untitled branch"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/60 text-muted-foreground">
          <Store className="size-4" />
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={expanded}
        >
          <span className="truncate text-sm font-medium">{displayName}</span>
          <Badge variant="secondary" className="shrink-0 capitalize">
            {branch.status}
          </Badge>
        </button>

        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isFirst}
            onClick={() => onMove(branch.id, "up")}
            aria-label="Move branch up"
          >
            <ArrowUp className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isLast}
            onClick={() => onMove(branch.id, "down")}
            aria-label="Move branch down"
          >
            <ArrowDown className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => duplicateMutation.mutate(branch)}
            aria-label="Duplicate branch"
          >
            <Copy className="size-3.5" />
          </Button>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Delete branch" />}>
              <Trash2 className="size-3.5" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete {displayName}?</DialogTitle>
                <DialogDescription>This can&apos;t be undone.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    deleteMutation.mutate(branch.id)
                    setDeleteDialogOpen(false)
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
        <FormProvider {...form}>
          <form noValidate className="space-y-6 border-t border-border/60 px-4 pt-6 pb-4">
            <FieldSet>
              <SectionLegend icon={Store}>Branch identity</SectionLegend>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField<BranchDraftValues> name="name" label="Branch name" />
                  <TextField<BranchDraftValues> name="managerName" label="Branch manager" />
                </div>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <SectionLegend icon={Mail}>Contact</SectionLegend>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField<BranchDraftValues> name="email" label="Email" type="email" />
                  <TextField<BranchDraftValues> name="phone" label="Phone" type="tel" />
                </div>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <SectionLegend icon={MapPin}>Location</SectionLegend>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField<BranchDraftValues> name="gpsAddress" label="GPS address" />
                  <TextField<BranchDraftValues> name="physicalAddress" label="Physical address" />
                </div>
                <TextareaField<BranchDraftValues>
                  name="openingHours"
                  label="Opening hours"
                  placeholder="e.g. Mon-Fri 8am-6pm, Sat 9am-1pm"
                />
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <SectionLegend icon={Warehouse}>Capabilities</SectionLegend>
              <FieldGroup>
                <SwitchField<BranchDraftValues> name="warehouseEnabled" label="Warehouse enabled" />
                <SwitchField<BranchDraftValues> name="posEnabled" label="POS enabled" />
                <SwitchField<BranchDraftValues> name="deliveryEnabled" label="Delivery enabled" />
              </FieldGroup>
            </FieldSet>
          </form>
        </FormProvider>
      </motion.div>
    </motion.div>
  )
}
