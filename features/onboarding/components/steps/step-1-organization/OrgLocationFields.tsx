import { MapPin } from "lucide-react"

import { FieldGroup, FieldSet } from "@/components/ui/field"
import { SectionLegend } from "@/features/onboarding/components/steps/step-1-organization/fields/SectionLegend"
import { TextField } from "@/features/onboarding/components/steps/step-1-organization/fields/TextField"
import { TextareaField } from "@/features/onboarding/components/steps/step-1-organization/fields/TextareaField"
import { SelectField } from "@/features/onboarding/components/steps/step-1-organization/fields/SelectField"
import { COUNTRIES } from "@/utils/constants"

export function OrgLocationFields() {
  return (
    <FieldSet>
      <SectionLegend icon={MapPin}>Location</SectionLegend>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField name="country" label="Country" placeholder="Select" options={COUNTRIES} />
          <TextField name="state" label="State / region" />
          <TextField name="city" label="City" />
        </div>
        <TextareaField name="address" label="Business address" placeholder="Street, building, unit" />
      </FieldGroup>
    </FieldSet>
  )
}
