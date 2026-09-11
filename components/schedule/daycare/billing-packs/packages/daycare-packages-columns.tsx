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
import type { DaycarePackageRow } from "@/lib/supabase/types"

type DaycarePackageColumnActions = {
  onEdit: (daycarePackage: DaycarePackageRow) => void
  onDelete: (daycarePackage: DaycarePackageRow) => void
}

export function getDaycarePackageColumns({
  onEdit,
  onDelete,
}: DaycarePackageColumnActions): AdminColumnDef<DaycarePackageRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <p className="font-medium text-foreground">
          {row.original.name}
        </p>
      ),
    },
    {
      accessorKey: "visit_count",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Visits" />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.visit_count}{" "}
          {row.original.visit_count === 1 ? "visit" : "visits"}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          PKR {row.original.price.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "valid_days",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Validity" />
      ),
      cell: ({ row }) =>
        row.original.valid_days ? (
          <span>
            {row.original.valid_days}{" "}
            {row.original.valid_days === 1 ? "day" : "days"}
          </span>
        ) : (
          <span className="text-muted-foreground">No expiry</span>
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
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
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