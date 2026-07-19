"use client"

import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { useDebouncedCallback } from "use-debounce"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { ArrowDown, ArrowUp, Building2, ChevronDown, Copy, Mail, MapPin, Trash2 } from "lucide-react"

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
import { LogoDropzone } from "@/features/onboarding/components/shared/LogoDropzone"
import { SectionLegend } from "@/features/onboarding/components/fields/SectionLegend"
import { SelectField } from "@/features/onboarding/components/fields/SelectField"
import { TextField } from "@/features/onboarding/components/fields/TextField"
import { TextareaField } from "@/features/onboarding/components/fields/TextareaField"
import { useBusinessLogoUrlQuery } from "@/features/onboarding/hooks/useBusinessLogoUrlQuery"
import { useDeleteBusinessMutation } from "@/features/onboarding/hooks/useDeleteBusinessMutation"
import { useDuplicateBusinessMutation } from "@/features/onboarding/hooks/useDuplicateBusinessMutation"
import { useUpdateBusinessMutation } from "@/features/onboarding/hooks/useUpdateBusinessMutation"
import { useUploadBusinessLogoMutation } from "@/features/onboarding/hooks/useUploadBusinessLogoMutation"
import {
  BUSINESS_DEFAULT_VALUES,
  businessDraftSchema,
  type BusinessDraftValues,
} from "@/features/onboarding/schemas/business.schema"
import { useOnboardingWizardStore } from "@/features/onboarding/store/onboarding-wizard.store"
import type { Business } from "@/features/onboarding/types/onboarding.types"
import { INDUSTRIES } from "@/utils/constants"

const AUTOSAVE_DEBOUNCE_MS = 800

function toFormValues(business: Business): BusinessDraftValues {
  return {
    logoPath: business.logoPath,
    name: business.name,
    legalName: business.legalName,
    registrationNumber: business.registrationNumber,
    taxId: business.taxId,
    industry: business.industry,
    description: business.description,
    email: business.email,
    phone: business.phone,
    website: business.website,
    managerName: business.managerName,
    address: business.address,
  }
}

interface BusinessCardProps {
  business: Business
  organizationId: string
  isFirst: boolean
  isLast: boolean
  onMove: (id: string, direction: "up" | "down") => void
}

export function BusinessCard({ business, organizationId, isFirst, isLast, onMove }: BusinessCardProps) {
  const setAutosaveStatus = useOnboardingWizardStore((state) => state.setAutosaveStatus)
  const [expanded, setExpanded] = useState(() => !business.name)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const hasHydrated = useRef(false)

  const updateMutation = useUpdateBusinessMutation(business.id, organizationId)
  const duplicateMutation = useDuplicateBusinessMutation(organizationId)
  const deleteMutation = useDeleteBusinessMutation(organizationId)
  const uploadLogo = useUploadBusinessLogoMutation(business.id, organizationId)

  const form = useForm<BusinessDraftValues>({
    resolver: zodResolver(businessDraftSchema),
    mode: "onBlur",
    defaultValues: BUSINESS_DEFAULT_VALUES,
  })
  const { watch, reset, control } = form
  const watchedValues = useWatch({ control })
  const { data: logoSignedUrl } = useBusinessLogoUrlQuery(watchedValues?.logoPath)

  useEffect(() => {
    if (hasHydrated.current) return
    hasHydrated.current = true
    reset(toFormValues(business), { keepDefaultValues: false })
  }, [business, reset])

  const debouncedSave = useDebouncedCallback((values: BusinessDraftValues) => {
    const filled = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== undefined && value !== "")
    )
    const parsed = businessDraftSchema.safeParse(filled)
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
      debouncedSave(values as BusinessDraftValues)
    })
    return () => subscription.unsubscribe()
  }, [watch, debouncedSave])

  const displayName = watchedValues?.name || "Untitled business"

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
          {logoSignedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed URL preview, not a next/image-compatible remote pattern
            <img src={logoSignedUrl} alt="" className="size-full object-cover" />
          ) : (
            <Building2 className="size-4" />
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={expanded}
        >
          <span className="truncate text-sm font-medium">{displayName}</span>
          <Badge variant="secondary" className="shrink-0 capitalize">
            {business.status}
          </Badge>
        </button>

        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isFirst}
            onClick={() => onMove(business.id, "up")}
            aria-label="Move business up"
          >
            <ArrowUp className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isLast}
            onClick={() => onMove(business.id, "down")}
            aria-label="Move business down"
          >
            <ArrowDown className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => duplicateMutation.mutate(business)}
            aria-label="Duplicate business"
          >
            <Copy className="size-3.5" />
          </Button>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Delete business" />}>
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
                    deleteMutation.mutate(business.id)
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
            <LogoDropzone
              signedUrl={logoSignedUrl}
              label="Business logo"
              helperText="Drag & drop, or click to upload. PNG, JPG, or WebP."
              onUpload={(file) => uploadLogo.mutateAsync(file)}
            />

            <FieldSet>
              <SectionLegend icon={Building2}>Business identity</SectionLegend>
              <FieldGroup>
                <TextField<BusinessDraftValues> name="name" label="Business name" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField<BusinessDraftValues> name="legalName" label="Legal name" />
                  <SelectField<BusinessDraftValues>
                    name="industry"
                    label="Industry"
                    placeholder="Select an industry"
                    options={INDUSTRIES}
                  />
                </div>
                <TextareaField<BusinessDraftValues> name="description" label="Description" />
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <SectionLegend icon={Mail}>Contact</SectionLegend>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField<BusinessDraftValues> name="email" label="Email" type="email" />
                  <TextField<BusinessDraftValues> name="phone" label="Phone" type="tel" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField<BusinessDraftValues> name="website" label="Website" placeholder="https://example.com" />
                  <TextField<BusinessDraftValues> name="managerName" label="Business manager" />
                </div>
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <SectionLegend icon={MapPin}>Location</SectionLegend>
              <FieldGroup>
                <TextField<BusinessDraftValues> name="address" label="Business address" />
              </FieldGroup>
            </FieldSet>
          </form>
        </FormProvider>
      </motion.div>
    </motion.div>
  )
}
