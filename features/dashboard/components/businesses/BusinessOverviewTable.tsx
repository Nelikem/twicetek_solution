"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { Info } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { BusinessOverviewRow } from "@/services/businesses.service"
import { LockedCell } from "@/features/dashboard/components/LockedCell"

const STATUS_VARIANT: Record<BusinessOverviewRow["status"], "default" | "secondary" | "outline"> = {
  draft: "outline",
  active: "default",
  suspended: "secondary",
  archived: "secondary",
}

const columns: ColumnDef<BusinessOverviewRow, unknown>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/dashboard/branches?business=${row.original.businessId}`} className="font-medium hover:underline">
        {row.original.name || "Untitled business"}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status]} className="capitalize">
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "managerName",
    header: "Manager",
    cell: ({ row }) => row.original.managerName || "—",
  },
  {
    accessorKey: "branchCount",
    header: "Branches",
  },
  {
    accessorKey: "employeeCount",
    header: () => (
      <span className="inline-flex items-center gap-1">
        Employees
        <Tooltip>
          <TooltipTrigger render={<span className="text-muted-foreground" />}>
            <Info className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent>Populates once team invitations go live</TooltipContent>
        </Tooltip>
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: "revenue",
    header: "Revenue",
    enableSorting: false,
    cell: () => <LockedCell />,
  },
  {
    id: "profit",
    header: "Profit",
    enableSorting: false,
    cell: () => <LockedCell />,
  },
  {
    id: "healthScore",
    header: "Health Score",
    enableSorting: false,
    cell: () => <LockedCell />,
  },
]

export function BusinessOverviewTable({ businesses }: { businesses: BusinessOverviewRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={businesses}
      emptyMessage="No businesses yet."
      searchPlaceholder="Search businesses..."
    />
  )
}
