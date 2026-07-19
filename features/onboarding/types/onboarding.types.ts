import type { OrganizationInfoDraftValues } from "@/features/onboarding/schemas/organization-info.schema"

export type AutosaveStatus = "idle" | "saving" | "saved" | "error"

export type WizardStepStatus = "active" | "locked"

export interface WizardStepConfig {
  id: number
  key: string
  title: string
  description: string
  path: string
  status: WizardStepStatus
}

/** Domain-shaped (camelCase) organization draft — the DB row mapped by the service layer. */
export interface OrganizationDraft extends OrganizationInfoDraftValues {
  id: string
  status: "draft" | "active" | "suspended" | "archived"
  ownerUserId: string
  onboardingCurrentStep: number
  onboardingLastSavedAt: string | null
  createdAt: string
  updatedAt: string
}
