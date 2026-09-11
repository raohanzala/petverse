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
import type { ReservationRow } from "@/lib/supabase/types"

type ReservationColumnActions = {
  onEdit: (reservation: ReservationRow) => void
  onDelete: (reservation: ReservationRow) => void
}

const STATUS_LABELS: Record<ReservationRow["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  checked_out: "Checked Out",
  cancelled: "Cancelled",
}

const STATUS_VARIANTS: Record<
  ReservationRow["status"],
  "secondary" | "completed" | "default" | "destructive"
> = {
  pending: "secondary",
  confirmed: "default",
  checked_in: "completed",
  checked_out: "secondary",
  cancelled: "destructive",
}

export function getReservationColumns({
  onEdit,
  onDelete,
}: ReservationColumnActions): AdminColumnDef<ReservationRow>[] {
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
      accessorKey: "resource",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Resource" />
      ),
      cell: ({ row }) => {
        const resource = row.original.resource

        return resource ? (
          <div>
            <p className="font-medium text-foreground">{resource.name}</p>
            <p className="text-xs capitalize text-muted-foreground">
              {resource.type}
            </p>
          </div>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        )
      },
    },
    {
      accessorKey: "service",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Service" />
      ),
      cell: ({ row }) => {
        const service = row.original.service

        return service ? (
          <span className="text-foreground">{service.name}</span>
        ) : (
          <span className="text-muted-foreground">No service</span>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status

        return (
          <Badge variant={STATUS_VARIANTS[status]}>
            {STATUS_LABELS[status]}
          </Badge>
        )
      },
    },
    {
      accessorKey: "check_in_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Check In" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {new Date(row.original.check_in_at).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(row.original.check_in_at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "check_out_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Check Out" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {new Date(row.original.check_out_at).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(row.original.check_out_at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        const pet = row.original.pet

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${pet?.name ?? "reservation"}`}
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
        )
      },
    },
  ]
}