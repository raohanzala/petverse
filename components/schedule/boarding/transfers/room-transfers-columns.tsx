"use client"

import { MoreHorizontal, Trash2Icon } from "lucide-react"

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
import type { RoomTransferListRow } from "@/lib/supabase/types"

type RoomTransferColumnActions = {
  onDelete: (transfer: RoomTransferListRow) => void
}

export function getRoomTransferColumns({
  onDelete,
}: RoomTransferColumnActions): AdminColumnDef<RoomTransferListRow>[] {
  return [
    {
      id: "pet",
      accessorFn: (row) => row.reservation?.pet?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Pet" />
      ),
      cell: ({ row }) => {
        const pet = row.original.reservation?.pet

        return (
          <div>
            <p className="font-medium text-foreground">
              {pet?.name ?? "Unknown pet"}
            </p>
            {pet?.species ? (
              <p className="text-xs text-muted-foreground">
                {pet.species}
              </p>
            ) : null}
          </div>
        )
      },
    },
    {
      id: "from_resource",
      accessorFn: (row) => row.from_resource?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="From room" />
      ),
      cell: ({ row }) => {
        const resource = row.original.from_resource

        return resource ? (
          <div>
            <p className="font-medium text-foreground">
              {resource.name}
            </p>
            <Badge variant="secondary" className="mt-1">
              {resource.type}
            </Badge>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">
            Unassigned
          </span>
        )
      },
    },
    {
      id: "to_resource",
      accessorFn: (row) => row.to_resource?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="To room" />
      ),
      cell: ({ row }) => {
        const resource = row.original.to_resource

        return (
          <div>
            <p className="font-medium text-foreground">
              {resource.name}
            </p>
            <Badge variant="completed" className="mt-1">
              {resource.type}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "transferred_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Transferred"
        />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.transferred_at)

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
      accessorKey: "notes",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Notes" />
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
                aria-label={`Actions for ${row.original.reservation?.pet?.name ?? "room transfer"}`}
              />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
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