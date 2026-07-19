"use client"

import { Controller, useFormContext, type FieldError } from "react-hook-form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldContent, FieldError as FieldErrorMessage, FieldLabel } from "@/components/ui/field"
import type { OrganizationInfoDraftValues } from "@/features/onboarding/schemas/organization-info.schema"
import type { SelectOption } from "@/utils/constants"

interface SelectFieldProps {
  name: keyof OrganizationInfoDraftValues
  label: string
  placeholder: string
  options: readonly SelectOption[]
}

export function SelectField({ name, label, placeholder, options }: SelectFieldProps) {
  const { control } = useFormContext<OrganizationInfoDraftValues>()

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
