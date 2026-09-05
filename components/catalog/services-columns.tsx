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
import type { ServiceListRow } from "@/lib/supabase/types"

type ServiceColumnActions = {
  onEdit: (service: ServiceListRow) => void
  onDelete: (service: ServiceListRow) => void
}

export function getServiceColumns({
  onEdit,
  onDelete,
}: ServiceColumnActions): AdminColumnDef<ServiceListRow>[] {
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
      accessorKey: "category_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.category?.name ?? "Uncategorized"}
        </span>
      ),
    },

    {
      accessorKey: "kind",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.kind}
        </Badge>
      ),
    },

    {
      accessorKey: "duration_minutes",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Duration" />
      ),
      cell: ({ row }) => (
        <span>{row.original.duration_minutes} min</span>
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
      accessorKey: "is_public",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Visibility" />
      ),
      cell: ({ row }) =>
        row.original.is_public ? (
          <Badge variant="completed">Public</Badge>
        ) : (
          <Badge variant="secondary">Private</Badge>
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