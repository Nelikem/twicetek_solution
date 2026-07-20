import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Building2,
  Calculator,
  Contact,
  CreditCard,
  FileBarChart,
  LayoutDashboard,
  MapPin,
  Network,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react"

import type { RoleSlug } from "@/services/memberships.service"

export interface DashboardNavItem {
  id: string
  key: string
  title: string
  icon: LucideIcon
  path: string
  status: "active" | "locked"
  visibleToRoles: readonly RoleSlug[]
}

export const ALL_ROLES: readonly RoleSlug[] = [
  "owner",
  "org_admin",
  "business_manager",
  "branch_manager",
  "employee",
  "finance",
  "inventory_manager",
  "hr",
  "sales",
  "read_only",
] as const

/**
 * "locked" items are shown (greyed, tooltip) because the role will eventually
 * have access once the module ships. Items a role architecturally never
 * accesses (regardless of module status) are simply omitted from
 * visibleToRoles -- DashboardSidebar filters those out entirely rather than
 * showing them locked, since "locked" implies "coming for you eventually".
 */
export const NAV_ITEMS: readonly DashboardNavItem[] = [
  {
    id: "dashboard",
    key: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    status: "active",
    visibleToRoles: ALL_ROLES,
  },
  {
    id: "businesses",
    key: "businesses",
    title: "Businesses",
    icon: Building2,
    path: "/dashboard/businesses",
    status: "active",
    visibleToRoles: ALL_ROLES,
  },
  {
    id: "branches",
    key: "branches",
    title: "Branches",
    icon: MapPin,
    path: "/dashboard/branches",
    status: "active",
    visibleToRoles: ALL_ROLES,
  },
  {
    id: "departments",
    key: "departments",
    title: "Departments",
    icon: Network,
    path: "/dashboard/departments",
    status: "locked",
    visibleToRoles: ["owner", "org_admin", "business_manager", "branch_manager", "hr"],
  },
  {
    id: "users",
    key: "users",
    title: "Users",
    icon: Users,
    path: "/dashboard/users",
    status: "locked",
    visibleToRoles: ["owner", "org_admin", "business_manager", "branch_manager", "hr"],
  },
  {
    id: "roles",
    key: "roles",
    title: "Roles",
    icon: ShieldCheck,
    path: "/dashboard/roles",
    status: "locked",
    visibleToRoles: ["owner", "org_admin"],
  },
  {
    id: "inventory",
    key: "inventory",
    title: "Inventory",
    icon: Package,
    path: "/dashboard/inventory",
    status: "locked",
    visibleToRoles: ["owner", "org_admin", "business_manager", "branch_manager", "inventory_manager"],
  },
  {
    id: "sales",
    key: "sales",
    title: "Sales",
    icon: TrendingUp,
    path: "/dashboard/sales",
    status: "locked",
    visibleToRoles: ["owner", "org_admin", "business_manager", "branch_manager", "sales"],
  },
  {
    id: "pos",
    key: "pos",
    title: "POS",
    icon: CreditCard,
    path: "/dashboard/pos",
    status: "locked",
    visibleToRoles: ["owner", "org_admin", "business_manager", "branch_manager", "sales"],
  },
  {
    id: "crm",
    key: "crm",
    title: "CRM",
    icon: Contact,
    path: "/dashboard/crm",
    status: "locked",
    visibleToRoles: ["owner", "org_admin", "business_manager", "branch_manager", "sales"],
  },
  {
    id: "accounting",
    key: "accounting",
    title: "Accounting",
    icon: Calculator,
    path: "/dashboard/accounting",
    status: "locked",
    visibleToRoles: ["owner", "org_admin", "business_manager", "finance"],
  },
  {
    id: "procurement",
    key: "procurement",
    title: "Procurement",
    icon: ShoppingCart,
    path: "/dashboard/procurement",
    status: "locked",
    visibleToRoles: ["owner", "org_admin", "business_manager", "inventory_manager"],
  },
  {
    id: "hr",
    key: "hr",
    title: "HR",
    icon: UserCog,
    path: "/dashboard/hr",
    status: "locked",
    visibleToRoles: ["owner", "org_admin", "business_manager", "branch_manager", "hr"],
  },
  {
    id: "reports",
    key: "reports",
    title: "Reports",
    icon: FileBarChart,
    path: "/dashboard/reports",
    status: "locked",
    visibleToRoles: ALL_ROLES,
  },
  {
    id: "analytics",
    key: "analytics",
    title: "Analytics",
    icon: BarChart3,
    path: "/dashboard/analytics",
    status: "locked",
    visibleToRoles: ["owner", "org_admin", "business_manager", "branch_manager", "finance"],
  },
  {
    id: "settings",
    key: "settings",
    title: "Settings",
    icon: Settings,
    path: "/dashboard/settings",
    status: "locked",
    visibleToRoles: ["owner", "org_admin"],
  },
] as const
