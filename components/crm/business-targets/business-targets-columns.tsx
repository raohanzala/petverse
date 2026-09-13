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
import type { BusinessTargetRow } from "@/lib/supabase/types"

import { format } from "date-fns"

type BusinessTargetColumnActions = {
  onEdit: (target: BusinessTargetRow) => void
  onDelete: (target: BusinessTargetRow) => void
}

export function getBusinessTargetColumns({
  onEdit,
  onDelete,
}: BusinessTargetColumnActions): AdminColumnDef<BusinessTargetRow>[] {
  return [
    {
      accessorKey: "metric_key",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Metric"
        />
      ),
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
          {row.original.metric_key}
        </code>
      ),
    },

    {
      accessorKey: "target_value",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Target"
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {Number(row.original.target_value).toLocaleString()}
        </span>
      ),
    },

    {
      accessorKey: "period_start",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Period"
        />
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium">
            {format(
              new Date(row.original.period_start),
              "PP"
            )}
          </p>

          <p className="text-xs text-muted-foreground">
            to{" "}
            {format(
              new Date(row.original.period_end),
              "PP"
            )}
          </p>
        </div>
      ),
    },

    {
      id: "period_status",
      header: "Period status",
      enableSorting: false,
      cell: ({ row }) => {
        const today = new Date()
        const start = new Date(
          `${row.original.period_start}T00:00:00`
        )
        const end = new Date(
          `${row.original.period_end}T23:59:59`
        )

        if (today < start) {
          return (
            <Badge variant="secondary">
              Upcoming
            </Badge>
          )
        }

        if (today > end) {
          return (
            <Badge variant="secondary">
              Past
            </Badge>
          )
        }

        return (
          <Badge variant="completed">
            Current
          </Badge>
        )
      },
    },

    {
      accessorKey: "notes",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Notes"
        />
      ),
      cell: ({ row }) =>
        row.original.notes ? (
          <p className="line-clamp-2 max-w-[280px] text-sm text-muted-foreground">
            {row.original.notes}
          </p>
        ) : (
          <span className="text-sm text-muted-foreground">
            —
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
                aria-label={`Actions for ${row.original.metric_key}`}
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