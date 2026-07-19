import { Globe } from "lucide-react"

import { FieldGroup, FieldSet } from "@/components/ui/field"
import { SectionLegend } from "@/features/onboarding/components/fields/SectionLegend"
import { SelectField } from "@/features/onboarding/components/fields/SelectField"
import { CURRENCIES, FISCAL_YEAR_START_MONTHS, TIMEZONES } from "@/utils/constants"

export function OrgRegionalFields() {
  return (
    <FieldSet>
      <SectionLegend icon={Globe}>Regional settings</SectionLegend>
      <FieldGroup>
        <SelectField name="timezone" label="Timezone" placeholder="Select a timezone" options={TIMEZONES} />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField name="currency" label="Currency" placeholder="Select" options={CURRENCIES} />
          <SelectField
            name="fiscalYearStartMonth"
            label="Fiscal year starts"
            placeholder="Select a month"
            options={FISCAL_YEAR_START_MONTHS}
          />
        </div>
      </FieldGroup>
    </FieldSet>
  )
}
