"use client"

import {
  MoreHorizontal,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"

import { format } from "date-fns"

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

import type { DailyUpdateWithRelations } from "@/lib/supabase/types"

type DailyUpdateColumnActions = {
  onEdit: (update: DailyUpdateWithRelations) => void
  onDelete: (update: DailyUpdateWithRelations) => void
}

export function getDailyUpdateColumns({
  onEdit,
  onDelete,
}: DailyUpdateColumnActions): AdminColumnDef<DailyUpdateWithRelations>[] {
  return [
    {
      accessorKey: "pet",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Pet"
        />
      ),
      cell: ({ row }) => {
        const pet = row.original.pet

        return (
          <div>
            <p className="font-medium text-foreground">
              {pet?.name ?? "Unknown pet"}
            </p>

            {pet?.owner ? (
              <p className="text-xs text-muted-foreground">
                {pet.owner.name}
              </p>
            ) : null}
          </div>
        )
      },
    },

    {
      accessorKey: "body",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Update"
        />
      ),
      cell: ({ row }) => (
        <p className="max-w-[420px] truncate text-sm">
          {row.original.body}
        </p>
      ),
    },

    {
      accessorKey: "appointment_id",
      header: "Appointment",
      enableSorting: false,
      cell: ({ row }) =>
        row.original.appointment ? (
          <div>
            <p className="text-sm">
              {format(
                new Date(
                  row.original.appointment.starts_at
                ),
                "PP"
              )}
            </p>

            <p className="text-xs text-muted-foreground">
              {format(
                new Date(
                  row.original.appointment.starts_at
                ),
                "p"
              )}
            </p>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">
            —
          </span>
        ),
    },

    {
      accessorKey: "author",
      header: "Author",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.author?.display_name ??
            "Unassigned"}
        </span>
      ),
    },

    {
      accessorKey: "sent_to_owner_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Delivery"
        />
      ),
      cell: ({ row }) => {
        const sentAt =
          row.original.sent_to_owner_at

        return sentAt ? (
          <div>
            <Badge variant="completed">
              Sent
            </Badge>

            <p className="mt-1 text-xs text-muted-foreground">
              {format(
                new Date(sentAt),
                "PP p"
              )}
            </p>
          </div>
        ) : (
          <Badge variant="secondary">
            Not sent
          </Badge>
        )
      },
    },

    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Created"
        />
      ),
      cell: ({ row }) =>
        format(
          new Date(row.original.created_at),
          "PP p"
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
                aria-label={`Actions for ${
                  row.original.pet?.name ??
                  "daily update"
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