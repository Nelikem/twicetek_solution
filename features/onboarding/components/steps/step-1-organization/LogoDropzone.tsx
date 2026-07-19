"use client"

import { useEffect, useState } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { toast } from "sonner"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ImageUp, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { useOrganizationLogoUrlQuery } from "@/features/onboarding/hooks/useOrganizationLogoUrlQuery"
import { useUploadLogoMutation } from "@/features/onboarding/hooks/useUploadLogoMutation"
import { ORGANIZATION_LOGO_ACCEPTED_TYPES, ORGANIZATION_LOGO_MAX_BYTES } from "@/utils/constants"

interface LogoDropzoneProps {
  draftId: string | null
  logoPath: string | null | undefined
}

export function LogoDropzone({ draftId, logoPath }: LogoDropzoneProps) {
  const prefersReducedMotion = useReducedMotion()
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const uploadMutation = useUploadLogoMutation(draftId)
  const { data: signedUrl } = useOrganizationLogoUrlQuery(localPreview ? null : logoPath)

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview)
    }
  }, [localPreview])

  function onDrop(accepted: File[], rejections: FileRejection[]) {
    if (rejections.length > 0) {
      toast.error(rejections[0]?.errors[0]?.message ?? "This file can't be used as a logo")
      return
    }

    const file = accepted[0]
    if (!file) return

    setLocalPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return URL.createObjectURL(file)
    })

    uploadMutation.mutate(file, {
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Logo upload failed")
      },
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.fromEntries(ORGANIZATION_LOGO_ACCEPTED_TYPES.map((type) => [type, []])),
    maxSize: ORGANIZATION_LOGO_MAX_BYTES,
    maxFiles: 1,
    disabled: !draftId || uploadMutation.isPending,
  })

  const previewSrc = localPreview ?? signedUrl
  const isDisabled = !draftId || uploadMutation.isPending
  const visualState = uploadMutation.isPending ? "loading" : previewSrc ? "preview" : "empty"

  return (
    <div className="flex items-center gap-4">
      {/* Plain div (not motion.div) for the getRootProps() spread — react-dropzone's
          native onAnimationStart/onAnimationEnd handler types collide with
          framer-motion's own same-named animation-lifecycle props. Hover/drag scale
          is done with CSS transforms instead; the AnimatePresence crossfade below
          (on inner elements only) still gets full framer-motion treatment. */}
      <div
        {...getRootProps()}
        className={cn(
          "group relative flex size-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-input bg-muted/40 outline-none transition-[transform,colors,box-shadow] duration-200 ease-out focus-visible:ring-3 focus-visible:ring-ring/50",
          !isDisabled && "hover:scale-[1.04] active:scale-[0.97]",
          isDragActive && "scale-[1.06] border-primary bg-primary/5 shadow-lg shadow-primary/20",
          isDisabled && "cursor-not-allowed opacity-60"
        )}
      >
        <input {...getInputProps()} aria-label="Company logo" />
        <AnimatePresence mode="wait" initial={false}>
          {visualState === "loading" ? (
            <motion.div
              key="loading"
              initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </motion.div>
          ) : visualState === "preview" ? (
            <motion.img
              key="preview"
              src={previewSrc}
              alt="Company logo preview"
              initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 1.15 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="size-full object-cover"
            />
          ) : (
            <motion.div
              key="empty"
              initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <ImageUp className="size-5 text-muted-foreground transition-transform group-hover:scale-110" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium">Company logo</p>
        <p className="text-xs text-muted-foreground">
          Drag & drop, or click to upload. PNG, JPG, or WebP — compressed automatically.
        </p>
      </div>
    </div>
  )
}
