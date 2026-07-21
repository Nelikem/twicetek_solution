export interface DashboardSnapshot {
  organizationId: string
  businessCount: number
  branchesByBusiness: { businessId: string; businessName: string; branchCount: number }[]
  activeMemberCount: number
  newMembersLast30Days: number
  newMembersPrev30Days: number
  recentActivityCount7d: number
}

export type InsightSeverity = "info" | "positive" | "warning"

export interface Insight {
  id: string
  severity: InsightSeverity
  message: string
  href?: string
}

export type InsightRule = (snapshot: DashboardSnapshot) => Insight | Insight[] | null
