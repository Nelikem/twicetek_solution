"use client"

import { useEffect, useState } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { toast } from "sonner"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ImageUp, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { ORGANIZATION_LOGO_ACCEPTED_TYPES, ORGANIZATION_LOGO_MAX_BYTES } from "@/utils/constants"

interface LogoDropzoneProps {
  disabled?: boolean
  signedUrl: string | undefined
  label: string
  helperText: string
  onUpload: (file: File) => Promise<{ logoPath: string; signedUrl: string }>
}

/**
 * Purely presentational: drag/drop, client-side compression trigger, and the
 * loading/preview/empty crossfade. The actual upload mechanics (which bucket, which
 * row gets patched) are the caller's responsibility via `onUpload` — this is what
 * lets the same component serve both organization and business logos.
 */
export function LogoDropzone({ disabled, signedUrl, label, helperText, onUpload }: LogoDropzoneProps) {
  const prefersReducedMotion = useReducedMotion()
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview)
    }
  }, [localPreview])

  async function onDrop(accepted: File[], rejections: FileRejection[]) {
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

    setIsUploading(true)
    try {
      await onUpload(file)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logo upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.fromEntries(ORGANIZATION_LOGO_ACCEPTED_TYPES.map((type) => [type, []])),
    maxSize: ORGANIZATION_LOGO_MAX_BYTES,
    maxFiles: 1,
    disabled: !!disabled || isUploading,
  })

  const previewSrc = localPreview ?? signedUrl
  const isDisabled = !!disabled || isUploading
  const visualState = isUploading ? "loading" : previewSrc ? "preview" : "empty"

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
        <input {...getInputProps()} aria-label={label} />
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
              alt={`${label} preview`}
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
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{helperText}</p>
      </div>
    </div>
  )
}
