import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { AutosaveStatus } from "@/features/onboarding/types/onboarding.types"

interface OnboardingWizardState {
  draftId: string | null
  currentStep: number
  autosaveStatus: AutosaveStatus
  lastSavedAt: string | null
  setDraftId: (draftId: string) => void
  setCurrentStep: (step: number) => void
  setAutosaveStatus: (status: AutosaveStatus, lastSavedAt?: string) => void
  reset: () => void
}

const initialState = {
  draftId: null,
  currentStep: 1,
  autosaveStatus: "idle" as AutosaveStatus,
  lastSavedAt: null,
}

/**
 * Persists only navigation/identity state to localStorage — never form field values.
 * The Supabase draft row is the source of truth for form data, hydrated via
 * useOrganizationDraftQuery on mount. This keeps drafts resumable cross-device and
 * avoids stale-cache bugs from two divergent copies of the same data.
 */
export const useOnboardingWizardStore = create<OnboardingWizardState>()(
  persist(
    (set) => ({
      ...initialState,
      setDraftId: (draftId) => set({ draftId }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      setAutosaveStatus: (autosaveStatus, lastSavedAt) =>
        set((state) => ({
          autosaveStatus,
          lastSavedAt: lastSavedAt ?? state.lastSavedAt,
        })),
      reset: () => set(initialState),
    }),
    {
      name: "twicetek:onboarding-draft",
      partialize: (state) => ({ draftId: state.draftId, currentStep: state.currentStep }),
    }
  )
)
