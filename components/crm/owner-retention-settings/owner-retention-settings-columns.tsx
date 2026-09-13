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
import type {
  OwnerRetentionSettingsWithOwner,
} from "@/lib/supabase/types"

type OwnerRetentionSettingsColumnActions =
  {
    onEdit: (
      settings: OwnerRetentionSettingsWithOwner
    ) => void

    onDelete: (
      settings: OwnerRetentionSettingsWithOwner
    ) => void
  }

export function getOwnerRetentionSettingsColumns({
  onEdit,
  onDelete,
}: OwnerRetentionSettingsColumnActions): AdminColumnDef<OwnerRetentionSettingsWithOwner>[] {
  return [
    {
      id: "owner",
      accessorKey: "owner",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Owner"
        />
      ),
      cell: ({ row }) => {
        const owner = row.original.owner

        if (!owner) {
          return (
            <span className="text-muted-foreground">
              Unknown owner
            </span>
          )
        }

        return (
          <div>
            <p className="font-medium text-foreground">
              {owner.name}
            </p>

            <p className="text-xs text-muted-foreground">
              {owner.phone}
              {owner.email
                ? ` · ${owner.email}`
                : ""}
            </p>
          </div>
        )
      },
    },

    {
      accessorKey:
        "lapsed_after_days",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Lapsed after"
        />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.lapsed_after_days}{" "}
          {row.original.lapsed_after_days ===
          1
            ? "day"
            : "days"}
        </span>
      ),
    },

    {
      accessorKey:
        "reengagement_queued_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Re-engagement queued"
        />
      ),
      cell: ({ row }) => {
        const value =
          row.original
            .reengagement_queued_at

        if (!value) {
          return (
            <span className="text-muted-foreground">
              Not queued
            </span>
          )
        }

        return (
          <div>
            <p className="font-medium">
              {format(
                new Date(value),
                "MMM d, yyyy"
              )}
            </p>

            <p className="text-xs text-muted-foreground">
              {format(
                new Date(value),
                "h:mm a"
              )}
            </p>
          </div>
        )
      },
    },

    {
      accessorKey: "opt_out",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Retention"
        />
      ),
      cell: ({ row }) =>
        row.original.opt_out ? (
          <Badge variant="secondary">
            Opted out
          </Badge>
        ) : (
          <Badge variant="completed">
            Opted in
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
                aria-label={`Actions for ${
                  row.original.owner
                    ?.name ?? "owner"
                }`}
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