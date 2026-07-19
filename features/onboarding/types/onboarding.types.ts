import type { OrganizationInfoDraftValues } from "@/features/onboarding/schemas/organization-info.schema"
import type { BusinessDraftValues } from "@/features/onboarding/schemas/business.schema"
import type { BranchDraftValues } from "@/features/onboarding/schemas/branch.schema"
import type { AdministratorDraftValues } from "@/features/onboarding/schemas/administrator.schema"
import type { SubscriptionDraftValues } from "@/features/onboarding/schemas/subscription.schema"

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

/** Domain-shaped (camelCase) administrator — combines organization_members +
 * profiles for the current user within one organization. The only step whose
 * entity spans two tables; the service layer hides that split behind this type. */
export interface Administrator extends AdministratorDraftValues {
  membershipId: string
  organizationId: string
  userId: string
  roleId: string | null
  status: "invited" | "active" | "suspended"
  joinedAt: string | null
  createdAt: string
  updatedAt: string
}

/** Domain-shaped (camelCase) subscription row — at most one per organization
 * during onboarding. */
export interface Subscription extends SubscriptionDraftValues {
  id: string
  organizationId: string
  status: "trialing" | "active" | "past_due" | "canceled" | "incomplete"
  createdAt: string
  updatedAt: string
}
