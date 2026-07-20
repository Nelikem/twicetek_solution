"use client"

import { motion } from "framer-motion"

import { staggerContainerVariants, staggerItemVariants } from "@/lib/animation-variants"
import { TotalBusinessesWidget } from "@/features/dashboard/components/widgets/TotalBusinessesWidget"
import { TotalBranchesWidget } from "@/features/dashboard/components/widgets/TotalBranchesWidget"
import { TeamMembersWidget } from "@/features/dashboard/components/widgets/TeamMembersWidget"
import { OrganizationStatusWidget } from "@/features/dashboard/components/widgets/OrganizationStatusWidget"
import { UnreadNotificationsWidget } from "@/features/dashboard/components/widgets/UnreadNotificationsWidget"
import { RecentActivityWidget } from "@/features/dashboard/components/widgets/RecentActivityWidget"
import { ActiveUsersWidget } from "@/features/dashboard/components/widgets/ActiveUsersWidget"

export function DashboardWidgetGrid() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainerVariants} className="flex flex-col gap-4">
      <motion.div variants={staggerItemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TotalBusinessesWidget />
        <TotalBranchesWidget />
        <TeamMembersWidget />
        <OrganizationStatusWidget />
      </motion.div>

      <motion.div variants={staggerItemVariants} className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivityWidget />
        </div>
        <div className="flex flex-col gap-4">
          <UnreadNotificationsWidget />
          <ActiveUsersWidget />
        </div>
      </motion.div>
    </motion.div>
  )
}
