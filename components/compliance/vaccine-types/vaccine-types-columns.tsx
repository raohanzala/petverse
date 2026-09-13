"use client"

import {
  MoreHorizontal,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"

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
import type { VaccineTypeRow } from "@/lib/supabase/types"

type VaccineTypeColumnActions = {
  onEdit: (vaccineType: VaccineTypeRow) => void
  onDelete: (vaccineType: VaccineTypeRow) => void
}

export function getVaccineTypeColumns({
  onEdit,
  onDelete,
}: VaccineTypeColumnActions): AdminColumnDef<VaccineTypeRow>[] {
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
      accessorKey: "species",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Species" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.species ?? "All species"}
        </span>
      ),
    },
    {
      accessorKey: "interval_months",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Interval"
        />
      ),
      cell: ({ row }) =>
        row.original.interval_months ? (
          <span>
            {row.original.interval_months}{" "}
            {row.original.interval_months === 1
              ? "month"
              : "months"}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
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