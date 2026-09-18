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
import type { AttendanceEntryRow } from "@/lib/supabase/types"

type AttendanceEntryColumnActions = {
  onEdit: (entry: AttendanceEntryRow) => void
  onDelete: (entry: AttendanceEntryRow) => void
}

export function getAttendanceEntryColumns({
  onEdit,
  onDelete,
}: AttendanceEntryColumnActions): AdminColumnDef<AttendanceEntryRow>[] {
  return [
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.original.type

        if (type === "check_in") {
          return <Badge variant="completed">Check In</Badge>
        }

        if (type === "check_out") {
          return <Badge variant="secondary">Check Out</Badge>
        }

        if (type === "incident") {
          return <Badge variant="destructive">Incident</Badge>
        }

        return <Badge variant="outline">Note</Badge>
      },
    },

    {
      id: "pet",
      header: "Pet",
      enableSorting: false,
      cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">
              {row.original.reservation?.pet?.name ?? "Unknown pet"}
            </p>
            {row.original.reservation?.pet?.species ? (
              <p className="text-xs text-muted-foreground">
                {row.original.reservation.pet.species}
              </p>
            ) : null}
          </div>
      ),
    },

    {
      id: "employee",
      header: "Recorded By",
      enableSorting: false,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.employee?.display_name ?? "System"}
          </p>
          {row.original.employee?.initials ? (
            <p className="text-xs text-muted-foreground">
              {row.original.employee.initials}
            </p>
          ) : null}
        </div>
      ),
    },

    {
      accessorKey: "recorded_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Recorded At" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.recorded_at)

        return (
          <div>
            <p className="font-medium text-foreground">
              {date.toLocaleDateString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {date.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        )
      },
    },

    {
      accessorKey: "flags",
      header: "Flags",
      enableSorting: false,
      cell: ({ row }) => {
        const flags = Array.isArray(row.original.flags)
          ? row.original.flags
          : []

        if (!flags.length) {
          return (
            <span className="text-sm text-muted-foreground">
              None
            </span>
          )
        }

        return (
          <div className="flex flex-wrap gap-1">
            {flags.length > 0 ? (
              flags.map((flag) => (
                <Badge key={flag} variant="outline">
                  {flag}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                —
              </span>
            )}
          </div>
        )
      },
    },

    {
      accessorKey: "notes",
      header: "Notes",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.notes ? (
          <p className="max-w-[240px] truncate text-sm text-muted-foreground">
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
                aria-label={`Actions for ${row.original.reservation?.pet?.name ?? "attendance entry"
                  }`}
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