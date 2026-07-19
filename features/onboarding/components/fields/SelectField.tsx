"use client"

import { Controller, useFormContext, type FieldError, type FieldValues, type Path } from "react-hook-form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldContent, FieldError as FieldErrorMessage, FieldLabel } from "@/components/ui/field"
import type { SelectOption } from "@/utils/constants"

interface SelectFieldProps<TValues extends FieldValues> {
  name: Path<TValues>
  label: string
  placeholder: string
  options: readonly SelectOption[]
}

export function SelectField<TValues extends FieldValues>({
  name,
  label,
  placeholder,
  options,
}: SelectFieldProps<TValues>) {
  const { control } = useFormContext<TValues>()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const error = fieldState.error as FieldError | undefined
        return (
          <Field data-invalid={!!error}>
            <FieldContent>
              <FieldLabel htmlFor={name}>{label}</FieldLabel>
              <Select
                value={field.value === undefined || field.value === "" ? null : String(field.value)}
                onValueChange={(value) => field.onChange(value ?? "")}
              >
                <SelectTrigger id={name} className="w-full" aria-invalid={!!error} onBlur={field.onBlur}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldErrorMessage errors={[error]} />
            </FieldContent>
          </Field>
        )
      }}
    />
  )
}
