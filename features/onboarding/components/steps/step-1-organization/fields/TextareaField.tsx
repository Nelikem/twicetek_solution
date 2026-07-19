"use client"

import { useFormContext, type FieldError } from "react-hook-form"

import { Textarea } from "@/components/ui/textarea"
import { Field, FieldContent, FieldError as FieldErrorMessage, FieldLabel } from "@/components/ui/field"
import type { OrganizationInfoDraftValues } from "@/features/onboarding/schemas/organization-info.schema"

interface TextareaFieldProps {
  name: keyof OrganizationInfoDraftValues
  label: string
  placeholder?: string
}

export function TextareaField({ name, label, placeholder }: TextareaFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<OrganizationInfoDraftValues>()
  const error = errors[name] as FieldError | undefined

  return (
    <Field data-invalid={!!error}>
      <FieldContent>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        <Textarea id={name} placeholder={placeholder} aria-invalid={!!error} {...register(name)} />
        <FieldErrorMessage errors={[error]} />
      </FieldContent>
    </Field>
  )
}
