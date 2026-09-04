"use client"

import { MoreHorizontal, PencilIcon, Trash2Icon } from "lucide-react"

import {
  DataTableColumnHeader,
  type AdminColumnDef,
} from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ServicePackageStepListRow } from "@/lib/supabase/types"

type ServicePackageStepColumnActions = {
  onEdit: (step: ServicePackageStepListRow) => void
  onDelete: (step: ServicePackageStepListRow) => void
}

export function getServicePackageStepColumns({
  onEdit,
  onDelete,
}: ServicePackageStepColumnActions): AdminColumnDef<ServicePackageStepListRow>[] {
  return [
    {
      accessorKey: "package_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Package" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.package.name}
          </p>
        </div>
      ),
    },

    {
      accessorKey: "service_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Service" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.service.name}
          </p>
        </div>
      ),
    },

    {
      accessorKey: "step_order",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Step" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">
          Step {row.original.step_order}
        </Badge>
      ),
    },

    {
      accessorKey: "parallel_group",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Parallel Group" />
      ),
      cell: ({ row }) =>
        row.original.parallel_group !== null ? (
          <Badge variant="outline">
            Group {row.original.parallel_group}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">
            —
          </span>
        ),
    },

    {
      accessorKey: "override_duration_minutes",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Duration Override"
        />
      ),
      cell: ({ row }) =>
        row.original.override_duration_minutes !== null ? (
          <span className="text-sm">
            {row.original.override_duration_minutes} min
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            Default
          </span>
        ),
    },

    {
      accessorKey: "override_price",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Price Override"
        />
      ),
      cell: ({ row }) =>
        row.original.override_price !== null ? (
          <span className="text-sm">
            {row.original.override_price}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            Default
          </span>
        ),
    },

    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${row.original.service.name}`}
              />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => onEdit(row.original)}
              >
                <PencilIcon />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(row.original)}
              >
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}