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
import type { EmployeeRow } from "@/lib/supabase/types"

type EmployeeColumnActions = {
  onEdit: (employee: EmployeeRow) => void
  onDelete: (employee: EmployeeRow) => void
}

export function getEmployeeColumns({
  onEdit,
  onDelete,
}: EmployeeColumnActions): AdminColumnDef<EmployeeRow>[] {
  return [
    {
      accessorKey: "display_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.avatar_url ? (
            <img
              src={row.original.avatar_url}
              alt={row.original.display_name}
              className="size-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {row.original.initials ||
                row.original.display_name
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
            </div>
          )}

          <div>
            <p className="font-medium text-foreground">
              {row.original.display_name}
            </p>

            {row.original.job_title ? (
              <p className="text-xs text-muted-foreground">
                {row.original.job_title}
              </p>
            ) : null}
          </div>
        </div>
      ),
    },

    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.role
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase())}
        </Badge>
      ),
    },

    {
      accessorKey: "job_title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Job title" />
      ),
      cell: ({ row }) =>
        row.original.job_title ? (
          <span>{row.original.job_title}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },

    {
      accessorKey: "initials",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Initials" />
      ),
      cell: ({ row }) =>
        row.original.initials ? (
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            {row.original.initials}
          </code>
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
                aria-label={`Actions for ${row.original.display_name}`}
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