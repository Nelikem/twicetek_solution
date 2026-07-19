import type { OrganizationInfoDraftValues } from "@/features/onboarding/schemas/organization-info.schema"
import type { BusinessDraftValues } from "@/features/onboarding/schemas/business.schema"
import type { BranchDraftValues } from "@/features/onboarding/schemas/branch.schema"

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

/** Domain-shaped (camelCase) business row — the DB row mapped by the service layer. */
export interface Business extends BusinessDraftValues {
  id: string
  organizationId: string
  status: "draft" | "active" | "suspended" | "archived"
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/** Domain-shaped (camelCase) branch row — the DB row mapped by the service layer. */
export interface Branch extends BranchDraftValues {
  id: string
  organizationId: string
  businessId: string
  status: "draft" | "active" | "suspended" | "archived"
  sortOrder: number
  createdAt: string
  updatedAt: string
}
