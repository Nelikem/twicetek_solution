"use client"

import { useFormContext, type FieldError, type FieldValues, type Path } from "react-hook-form"

import { Textarea } from "@/components/ui/textarea"
import { Field, FieldContent, FieldError as FieldErrorMessage, FieldLabel } from "@/components/ui/field"

interface TextareaFieldProps<TValues extends FieldValues> {
  name: Path<TValues>
  label: string
  placeholder?: string
}

export function TextareaField<TValues extends FieldValues>({
  name,
  label,
  placeholder,
}: TextareaFieldProps<TValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TValues>()
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
