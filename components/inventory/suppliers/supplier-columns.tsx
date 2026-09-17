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
import type { SupplierRow } from "@/lib/supabase/types"

type SupplierColumnActions = {
  onEdit: (supplier: SupplierRow) => void
  onDelete: (supplier: SupplierRow) => void
}

export function getSupplierColumns({
  onEdit,
  onDelete,
}: SupplierColumnActions): AdminColumnDef<SupplierRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Name"
        />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.name}
          </p>

          {row.original.contact_name ? (
            <p className="text-xs text-muted-foreground">
              {row.original.contact_name}
            </p>
          ) : null}
        </div>
      ),
    },

    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Email"
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.email ?? "—"}
        </span>
      ),
    },

    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Phone"
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.phone ?? "—"}
        </span>
      ),
    },

    {
      accessorKey: "address",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Address"
        />
      ),
      cell: ({ row }) => (
        <span className="max-w-[240px] truncate text-sm">
          {row.original.address ?? "—"}
        </span>
      ),
    },

    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Status"
        />
      ),
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge variant="completed">
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">
            Inactive
          </Badge>
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