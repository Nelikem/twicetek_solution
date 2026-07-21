import type { DashboardSnapshot, Insight, InsightRule } from "@/features/dashboard/lib/insights/types"

const newMembersRule: InsightRule = (snapshot) => {
  if (snapshot.newMembersLast30Days === 0) return null
  return {
    id: "new-members-30d",
    severity: "positive",
    message: `${snapshot.newMembersLast30Days} new team member${snapshot.newMembersLast30Days === 1 ? "" : "s"} joined in the last 30 days.`,
    href: "/dashboard/businesses",
  }
}

const businessesWithoutBranchesRule: InsightRule = (snapshot) => {
  const offenders = snapshot.branchesByBusiness.filter((b) => b.branchCount === 0)
  if (offenders.length === 0) return null
  return offenders.map((b) => ({
    id: `no-branches-${b.businessId}`,
    severity: "warning" as const,
    message: `${b.businessName} has no branches yet — consider adding one.`,
    href: "/dashboard/branches",
  }))
}

const noRecentActivityRule: InsightRule = (snapshot) => {
  if (snapshot.recentActivityCount7d > 0) return null
  return {
    id: "no-activity-7d",
    severity: "warning",
    message: "No activity recorded in the last 7 days.",
  }
}

const growthSlowdownRule: InsightRule = (snapshot) => {
  if (!(snapshot.newMembersLast30Days === 0 && snapshot.newMembersPrev30Days > 0)) return null
  return {
    id: "growth-slowdown",
    severity: "info",
    message: "Team growth has slowed — no new members in the last 30 days, after growth in the prior period.",
  }
}

export const DEFAULT_RULES: InsightRule[] = [
  newMembersRule,
  businessesWithoutBranchesRule,
  noRecentActivityRule,
  growthSlowdownRule,
]

/**
 * The seam for future phases: this is the only function ExecutiveInsightsWidget
 * calls. Swap DEFAULT_RULES for a different rule set, or replace the whole
 * function with an LLM call over the same DashboardSnapshot, without touching
 * the widget component.
 */
export function generateInsights(snapshot: DashboardSnapshot, rules: InsightRule[] = DEFAULT_RULES): Insight[] {
  const results: Insight[] = []
  for (const rule of rules) {
    const outcome = rule(snapshot)
    if (!outcome) continue
    if (Array.isArray(outcome)) results.push(...outcome)
    else results.push(outcome)
  }
  return results.slice(0, 5)
}
