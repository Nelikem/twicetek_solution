import { Building2 } from "lucide-react"

import { FieldGroup, FieldSet } from "@/components/ui/field"
import { SectionLegend } from "@/features/onboarding/components/fields/SectionLegend"
import { TextField } from "@/features/onboarding/components/fields/TextField"
import { SelectField } from "@/features/onboarding/components/fields/SelectField"
import { INDUSTRIES } from "@/utils/constants"

export function OrgIdentityFields() {
  return (
    <FieldSet>
      <SectionLegend icon={Building2}>Company identity</SectionLegend>
      <FieldGroup>
        <TextField name="companyName" label="Company name" autoComplete="organization" />
        <TextField name="legalBusinessName" label="Legal business name" />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="registrationNumber" label="Business registration number" />
          <TextField name="taxId" label="Tax identification number" />
        </div>
        <SelectField name="industry" label="Industry" placeholder="Select an industry" options={INDUSTRIES} />
      </FieldGroup>
    </FieldSet>
  )
}
