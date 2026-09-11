"use client"

import { format } from "date-fns"
import {
  MoreHorizontal,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"

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
import type { BoardingWaitlistListRow } from "@/lib/supabase/types"

type BoardingWaitlistColumnActions = {
  onEdit: (entry: BoardingWaitlistListRow) => void
  onDelete: (entry: BoardingWaitlistListRow) => void
}

export function getBoardingWaitlistColumns({
  onEdit,
  onDelete,
}: BoardingWaitlistColumnActions): AdminColumnDef<BoardingWaitlistListRow>[] {
  return [
    {
      accessorKey: "pet",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Pet" />
      ),
      cell: ({ row }) => {
        const pet = row.original.pet

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
      accessorKey: "owner",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Owner" />
      ),
      cell: ({ row }) => {
        const owner = row.original.owner

        return (
          <div>
            <p className="font-medium text-foreground">
              {owner?.name ?? "Unknown owner"}
            </p>
            {owner?.phone ? (
              <p className="text-xs text-muted-foreground">
                {owner.phone}
              </p>
            ) : null}
          </div>
        )
      },
    },
    {
      accessorKey: "desired_from",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Desired from"
        />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.desired_from)

        return (
          <div>
            <p className="font-medium text-foreground">
              {format(date, "PPP")}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(date, "p")}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: "desired_to",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Desired to"
        />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.desired_to)

        return (
          <div>
            <p className="font-medium text-foreground">
              {format(date, "PPP")}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(date, "p")}
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
      cell: ({ row }) => {
        const petName =
          row.original.pet?.name ?? "this waitlist entry"

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${petName}`}
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
        )
      },
    },
  ]
}