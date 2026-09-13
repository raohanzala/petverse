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
import type { ConsentFormTemplateRow } from "@/lib/supabase/types"

type ConsentFormTemplateColumnActions = {
  onEdit: (
    template: ConsentFormTemplateRow
  ) => void
  onDelete: (
    template: ConsentFormTemplateRow
  ) => void
}

export function getConsentFormTemplateColumns({
  onEdit,
  onDelete,
}: ConsentFormTemplateColumnActions): AdminColumnDef<ConsentFormTemplateRow>[] {
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

          {row.original.body_html ? (
            <p className="line-clamp-1 max-w-[320px] text-xs text-muted-foreground">
              {row.original.body_html}
            </p>
          ) : null}
        </div>
      ),
    },

    {
      accessorKey: "version",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Version"
        />
      ),
      cell: ({ row }) => (
        <span>
          v{row.original.version}
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
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Created"
        />
      ),
      cell: ({ row }) => (
        <span>
          {new Date(
            row.original.created_at
          ).toLocaleDateString()}
        </span>
      ),
    },

    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Updated"
        />
      ),
      cell: ({ row }) => (
        <span>
          {new Date(
            row.original.updated_at
          ).toLocaleDateString()}
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
                onClick={() =>
                  onEdit(row.original)
                }
              >
                <PencilIcon />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                variant="destructive"
                onClick={() =>
                  onDelete(row.original)
                }
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