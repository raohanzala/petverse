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
import type { AppointmentRow } from "@/lib/supabase/types"

type AppointmentColumnActions = {
  onEdit: (appointment: AppointmentRow) => void
  onDelete: (appointment: AppointmentRow) => void
}

const STATUS_LABELS: Record<
  AppointmentRow["status"],
  string
> = {
  requested: "Requested",
  confirmed: "Confirmed",
  arrived: "Arrived",
  in_service: "In service",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
}

const STATUS_VARIANTS: Record<
  AppointmentRow["status"],
  "secondary" | "completed" | "destructive" | "outline"
> = {
  requested: "secondary",
  confirmed: "outline",
  arrived: "outline",
  in_service: "outline",
  completed: "completed",
  cancelled: "destructive",
  no_show: "destructive",
}

function formatAppointmentDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function getAppointmentColumns({
  onEdit,
  onDelete,
}: AppointmentColumnActions): AdminColumnDef<AppointmentRow>[] {
  return [
    {
      accessorKey: "starts_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Date & Time"
        />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {formatAppointmentDate(row.original.starts_at)}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.duration_minutes} min
          </p>
        </div>
      ),
    },
    {
      accessorKey: "owner",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Owner"
        />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.owner.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.owner.phone}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "pet",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Pet"
        />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.pet.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.pet.species}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "service",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Service"
        />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.service?.name ??
            row.original.package?.name ??
            "—"}
        </span>
      ),
    },
    {
      accessorKey: "employee",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Staff"
        />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.employee?.display_name ?? "Unassigned"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Status"
        />
      ),
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANTS[row.original.status]}>
          {STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Price"
        />
      ),
      cell: ({ row }) => (
        <span>
          {Number(row.original.price).toLocaleString("en-PK", {
            style: "currency",
            currency: "PKR",
          })}
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
                aria-label={`Actions for ${row.original.pet.name} appointment`}
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