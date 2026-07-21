"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { Info, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { BranchOverviewRow } from "@/services/branches.service"
import { LockedCell } from "@/features/dashboard/components/LockedCell"

const STATUS_VARIANT: Record<BranchOverviewRow["status"], "default" | "secondary" | "outline"> = {
  draft: "outline",
  active: "default",
  suspended: "secondary",
  archived: "secondary",
}

const columns: ColumnDef<BranchOverviewRow, unknown>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name || "Untitled branch"}</span>,
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
    accessorKey: "businessName",
    header: "Business",
  },
  {
    accessorKey: "managerName",
    header: "Manager",
    cell: ({ row }) => row.original.managerName || "—",
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

export function BranchOverviewTable({
  branches,
  filteredBusinessName,
}: {
  branches: BranchOverviewRow[]
  filteredBusinessName?: string
}) {
  return (
    <div className="flex flex-col gap-3">
      {filteredBusinessName && (
        <div className="flex w-fit items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-sm">
          <span>
            Filtered by <span className="font-medium">{filteredBusinessName}</span>
          </span>
          <Link href="/dashboard/branches" className="text-muted-foreground hover:text-foreground">
            <X className="size-3.5" />
          </Link>
        </div>
      )}
      <DataTable columns={columns} data={branches} emptyMessage="No branches yet." searchPlaceholder="Search branches..." />
    </div>
  )
}
