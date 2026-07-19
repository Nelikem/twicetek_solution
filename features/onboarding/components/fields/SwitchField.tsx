"use client"

import { Controller, useFormContext, type FieldValues, type Path } from "react-hook-form"

import { Switch } from "@/components/ui/switch"
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field"

interface SwitchFieldProps<TValues extends FieldValues> {
  name: Path<TValues>
  label: string
  description?: string
}

/**
 * Base UI's Switch (non-native-button mode) puts an `id` prop on its internal
 * hidden `<input>`, not the visible `role="switch"` element — so a sibling
 * `FieldLabel htmlFor={id}` never actually associates. Nesting the Switch
 * inside the label instead relies on native label-click delegation, which
 * finds that same hidden input and toggles it correctly.
 */
export function SwitchField<TValues extends FieldValues>({ name, label, description }: SwitchFieldProps<TValues>) {
  const { control } = useFormContext<TValues>()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Field orientation="horizontal">
          <FieldLabel className="w-full items-center justify-between gap-3">
            <FieldContent>
              <FieldTitle>{label}</FieldTitle>
              {description && <FieldDescription>{description}</FieldDescription>}
            </FieldContent>
            <Switch checked={!!field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} />
          </FieldLabel>
        </Field>
      )}
    />
  )
}
