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
import type { PetBoardingInstructionsListRow } from "@/lib/supabase/types"

type BoardingInstructionsColumnActions = {
  onEdit: (
    instructions: PetBoardingInstructionsListRow
  ) => void
  onDelete: (
    instructions: PetBoardingInstructionsListRow
  ) => void
}

export function getBoardingInstructionsColumns({
  onEdit,
  onDelete,
}: BoardingInstructionsColumnActions): AdminColumnDef<PetBoardingInstructionsListRow>[] {
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
      accessorKey: "feeding_notes",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Feeding"
        />
      ),
      cell: ({ row }) =>
        row.original.feeding_notes ? (
          <p className="line-clamp-2 max-w-[240px] text-sm text-muted-foreground">
            {row.original.feeding_notes}
          </p>
        ) : (
          <span className="text-sm text-muted-foreground">
            —
          </span>
        ),
    },
    {
      accessorKey: "medication_notes",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Medication"
        />
      ),
      cell: ({ row }) =>
        row.original.medication_notes ? (
          <p className="line-clamp-2 max-w-[240px] text-sm text-muted-foreground">
            {row.original.medication_notes}
          </p>
        ) : (
          <span className="text-sm text-muted-foreground">
            —
          </span>
        ),
    },
    {
      accessorKey: "behavior_notes",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Behavior"
        />
      ),
      cell: ({ row }) =>
        row.original.behavior_notes ? (
          <p className="line-clamp-2 max-w-[240px] text-sm text-muted-foreground">
            {row.original.behavior_notes}
          </p>
        ) : (
          <span className="text-sm text-muted-foreground">
            —
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
      cell: ({ row }) => {
        const date = new Date(
          row.original.updated_at
        )

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
      id: "actions",
      header: "Actions",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        const petName =
          row.original.pet?.name ??
          "this boarding instructions entry"

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
        )
      },
    },
  ]
}