"use client"

import { createContext, useContext } from "react"

import { useCurrentMembershipQuery } from "@/features/dashboard/hooks/useCurrentMembershipQuery"
import type { CurrentMembership, RoleSlug } from "@/services/memberships.service"

const MembershipContext = createContext<CurrentMembership | null | undefined>(undefined)

/**
 * Hydrates from a server-fetched membership (zero flicker on first paint —
 * shell chrome like the sidebar can't afford a loading beat on every
 * navigation), then keeps it live via TanStack Query's normal cache/refetch
 * behavior for any future mutation.
 */
export function MembershipProvider({
  initialMembership,
  children,
}: {
  initialMembership: CurrentMembership
  children: React.ReactNode
}) {
  const { data } = useCurrentMembershipQuery(initialMembership)

  return <MembershipContext.Provider value={data ?? null}>{children}</MembershipContext.Provider>
}

export function useMembership(): CurrentMembership {
  const membership = useContext(MembershipContext)
  if (membership === undefined) {
    throw new Error("useMembership must be used within a MembershipProvider")
  }
  if (membership === null) {
    throw new Error("No active membership for the current user")
  }
  return membership
}

export function useHasRole(...slugs: RoleSlug[]): boolean {
  const membership = useMembership()
  return membership.roleSlug !== null && slugs.includes(membership.roleSlug)
}
