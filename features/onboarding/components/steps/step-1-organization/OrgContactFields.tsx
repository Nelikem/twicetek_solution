import { Mail } from "lucide-react"

import { FieldGroup, FieldSet } from "@/components/ui/field"
import { SectionLegend } from "@/features/onboarding/components/steps/step-1-organization/fields/SectionLegend"
import { TextField } from "@/features/onboarding/components/steps/step-1-organization/fields/TextField"

export function OrgContactFields() {
  return (
    <FieldSet>
      <SectionLegend icon={Mail}>Contact information</SectionLegend>
      <FieldGroup>
        <TextField name="orgEmail" label="Organization email" type="email" autoComplete="email" />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="phone" label="Phone number" type="tel" autoComplete="tel" />
          <TextField name="website" label="Website" type="url" placeholder="https://example.com" />
        </div>
      </FieldGroup>
    </FieldSet>
  )
}
