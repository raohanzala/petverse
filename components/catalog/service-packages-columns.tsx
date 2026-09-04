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
import type { ServicePackageRow } from "@/lib/supabase/types"

type ServicePackageColumnActions = {
  onEdit: (servicePackage: ServicePackageRow) => void
  onDelete: (servicePackage: ServicePackageRow) => void
}

export function getServicePackageColumns({
  onEdit,
  onDelete,
}: ServicePackageColumnActions): AdminColumnDef<ServicePackageRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.name}
          </p>

          {row.original.description ? (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {row.original.description}
            </p>
          ) : null}
        </div>
      ),
    },

    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.price.toLocaleString()}
        </span>
      ),
    },

    {
      accessorKey: "duration_minutes",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Duration" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.duration_minutes} min
        </span>
      ),
    },

    {
      accessorKey: "step_mode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Step Mode" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.step_mode === "sequential"
            ? "Sequential"
            : "Parallel"}
        </Badge>
      ),
    },

    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge variant="completed">Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
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
                aria-label={`Actions for ${row.original.name}`}
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