import type { WizardStepConfig } from "@/features/onboarding/types/onboarding.types"

/**
 * The registration gate (id 0) plus the full 6-step onboarding flow. Registration
 * and step 1 are implemented and routable; steps 2-6 render as locked entries in the
 * step indicator so the shell, animations, and progress model are already shaped for
 * the full wizard. `path` doubles as the lookup key OnboardingWizardShell uses to
 * derive which step is "active" from the current route.
 */
export const WIZARD_STEPS: readonly WizardStepConfig[] = [
  {
    id: 0,
    key: "register",
    title: "Create account",
    description: "Set up the account that will own your organization.",
    path: "/onboarding/register",
    status: "active",
  },
  {
    id: 1,
    key: "organization",
    title: "Organization",
    description: "Company details, contact info, and branding.",
    path: "/onboarding/step-1",
    status: "active",
  },
  {
    id: 2,
    key: "businesses",
    title: "Businesses",
    description: "Register the businesses your organization operates.",
    path: "/onboarding/step-2",
    status: "active",
  },
  {
    id: 3,
    key: "branches",
    title: "Branches",
    description: "Add branches under each business.",
    path: "/onboarding/step-3",
    status: "active",
  },
  {
    id: 4,
    key: "administrator",
    title: "Administrator",
    description: "Create the enterprise owner account.",
    path: "/onboarding/step-4",
    status: "active",
  },
  {
    id: 5,
    key: "subscription",
    title: "Subscription",
    description: "Choose a plan and billing method.",
    path: "/onboarding/step-5",
    status: "locked",
  },
  {
    id: 6,
    key: "review",
    title: "Review",
    description: "Confirm everything and create your organization.",
    path: "/onboarding/step-6",
    status: "locked",
  },
] as const
