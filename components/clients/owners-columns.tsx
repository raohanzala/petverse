"use client"

import { MoreHorizontal, PencilIcon, Trash2Icon } from "lucide-react"

import {
  DataTableColumnHeader,
  type AdminColumnDef,
} from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { OwnerRow } from "@/lib/supabase/types"

type OwnerColumnActions = {
  onEdit: (owner: OwnerRow) => void
  onDelete: (owner: OwnerRow) => void
}

export function getOwnerColumns({
  onEdit,
  onDelete,
}: OwnerColumnActions): AdminColumnDef<OwnerRow>[] {
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
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.email || "—"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Created"
        />
      ),
      cell: ({ row }) => (
        <span>
          {new Date(row.original.created_at).toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      accessorKey: "total_sales",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Sales"
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          ${row.original.total_sales.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      accessorKey: "preferred_contact",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Preferred contact"
        />
      ),
      cell: ({ row }) => (
        <span className="capitalize">
          {row.original.preferred_contact || "—"}
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