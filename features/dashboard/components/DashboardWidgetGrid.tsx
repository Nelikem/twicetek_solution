"use client"

import { motion } from "framer-motion"

import { staggerContainerVariants, staggerItemVariants } from "@/lib/animation-variants"
import { TotalBusinessesWidget } from "@/features/dashboard/components/widgets/TotalBusinessesWidget"
import { TotalBranchesWidget } from "@/features/dashboard/components/widgets/TotalBranchesWidget"
import { TeamMembersWidget } from "@/features/dashboard/components/widgets/TeamMembersWidget"
import { NewMembersWidget } from "@/features/dashboard/components/widgets/NewMembersWidget"
import { OrganizationStatusWidget } from "@/features/dashboard/components/widgets/OrganizationStatusWidget"
import { RecentActivityWidget } from "@/features/dashboard/components/widgets/RecentActivityWidget"
import { ExecutiveInsightsWidget } from "@/features/dashboard/components/widgets/ExecutiveInsightsWidget"
import { NeedsAttentionWidget } from "@/features/dashboard/components/widgets/NeedsAttentionWidget"
import { ActiveUsersWidget } from "@/features/dashboard/components/widgets/ActiveUsersWidget"
import { ComingWithFutureModules } from "@/features/dashboard/components/ComingWithFutureModules"

export function DashboardWidgetGrid() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainerVariants} className="flex flex-col gap-6">
      <motion.div variants={staggerItemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TotalBusinessesWidget />
        <TotalBranchesWidget />
        <TeamMembersWidget />
        <NewMembersWidget />
      </motion.div>

      <motion.div variants={staggerItemVariants} className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <RecentActivityWidget />
          <ExecutiveInsightsWidget />
        </div>
        <div className="flex flex-col gap-4">
          <OrganizationStatusWidget />
          <NeedsAttentionWidget />
          <ActiveUsersWidget />
        </div>
      </motion.div>

      <motion.div variants={staggerItemVariants}>
        <ComingWithFutureModules />
      </motion.div>
    </motion.div>
  )
}
