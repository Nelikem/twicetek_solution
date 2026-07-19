"use client"

import { useFormContext, type FieldError } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldError as FieldErrorMessage, FieldLabel } from "@/components/ui/field"
import type { OrganizationInfoDraftValues } from "@/features/onboarding/schemas/organization-info.schema"

interface TextFieldProps {
  name: keyof OrganizationInfoDraftValues
  label: string
  type?: string
  autoComplete?: string
  placeholder?: string
}

export function TextField({ name, label, type = "text", autoComplete, placeholder }: TextFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<OrganizationInfoDraftValues>()
  const error = errors[name] as FieldError | undefined

  return (
    <Field data-invalid={!!error}>
      <FieldContent>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        <Input
          id={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={!!error}
          {...register(name)}
        />
        <FieldErrorMessage errors={[error]} />
      </FieldContent>
    </Field>
  )
}
