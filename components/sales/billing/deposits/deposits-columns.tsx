"use client"

import { MoreHorizontal, PencilIcon, Trash2Icon } from "lucide-react"

import {
  DataTableColumnHeader,
  type AdminColumnDef,
} from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type {
  AppointmentRow,
  DepositRow,
  InvoiceRow,
  OwnerRow,
} from "@/lib/supabase/types"

type DepositColumnActions = {
  onEdit: (deposit: DepositRow) => void
  onDelete: (deposit: DepositRow) => void
}

type DepositColumnData = {
  owners: OwnerRow[]
  appointments: AppointmentRow[]
  invoices: InvoiceRow[]
}

export function getDepositColumns({
  onEdit,
  onDelete,
  owners,
  appointments,
  invoices,
}: DepositColumnActions & DepositColumnData): AdminColumnDef<DepositRow>[] {
  return [
    {
      accessorKey: "owner_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Owner" />
      ),
      cell: ({ row }) => {
        const owner = owners.find(
          (item) => item.id === row.original.owner_id
        )

        return owner?.name ?? "Unknown owner"
      },
    },
    {
      accessorKey: "invoice_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice" />
      ),
      cell: ({ row }) => {
        if (!row.original.invoice_id) {
          return (
            <Badge variant="secondary">
              Unlinked
            </Badge>
          )
        }

        const invoice = invoices.find(
          (item) => item.id === row.original.invoice_id
        )

        return invoice?.number
          ? `#${invoice.number}`
          : "Unknown invoice"
      },
    },
    {
      accessorKey: "appointment_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Appointment" />
      ),
      cell: ({ row }) => {
        if (!row.original.appointment_id) {
          return "—"
        }

        const appointment = appointments.find(
          (item) => item.id === row.original.appointment_id
        )

        return appointment
          ? `Appointment ${appointment.id.slice(0, 8)}`
          : "Unknown appointment"
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          ${row.original.amount.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "paid_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Paid" />
      ),
      cell: ({ row }) =>
        row.original.paid_at
          ? new Date(row.original.paid_at).toLocaleDateString()
          : "—",
    },
    {
      accessorKey: "provider_ref",
      header: "Provider reference",
      cell: ({ row }) =>
        row.original.provider_ref || "—",
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
                aria-label={`Actions for deposit ${row.original.id}`}
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