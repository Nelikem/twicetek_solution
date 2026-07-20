import { create } from "zustand"
import { persist } from "zustand/middleware"

interface DashboardUiState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

/**
 * Genuinely client-only UI state (sidebar collapse), same category as
 * onboarding-wizard.store.ts's navigation state -- persisted so the choice
 * survives reload, never used for server-sourced data.
 */
export const useDashboardUiStore = create<DashboardUiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: "twicetek:dashboard-ui",
    }
  )
)
