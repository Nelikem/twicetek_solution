import { OnboardingWizardShell } from "@/features/onboarding/components/OnboardingWizardShell"

// Shell only — no auth check here. /onboarding/register must render inside this same
// shell without requiring a session; the auth guard for the numbered wizard steps
// lives one level down in app/onboarding/(protected)/layout.tsx.
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <OnboardingWizardShell>{children}</OnboardingWizardShell>
}
