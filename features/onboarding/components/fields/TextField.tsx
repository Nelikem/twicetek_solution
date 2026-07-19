"use client"

import { useFormContext, type FieldError, type FieldValues, type Path } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldError as FieldErrorMessage, FieldLabel } from "@/components/ui/field"

interface TextFieldProps<TValues extends FieldValues> {
  name: Path<TValues>
  label: string
  type?: string
  autoComplete?: string
  placeholder?: string
}

export function TextField<TValues extends FieldValues>({
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
}: TextFieldProps<TValues>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TValues>()
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
