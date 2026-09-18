"use client"

import {
  EyeIcon,
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
import type { InvoiceRow } from "@/lib/supabase/types"

type InvoiceColumnActions = {
  onEdit: (invoice: InvoiceRow) => void
  onDelete: (invoice: InvoiceRow) => void
  onView: (invoice: InvoiceRow) => void
}

export function getInvoiceColumns({
  onEdit,
  onDelete,
  onView,
}: InvoiceColumnActions): AdminColumnDef<InvoiceRow>[] {
  return [
    {
      accessorKey: "number",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Invoice No."
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.number
            ? `#INV-00${row.original.number}`
            : "Unassigned"}
        </span>
      ),
    },

    {
      accessorKey: "issued_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Date"
        />
      ),
      cell: ({ row }) => {
        const date =
          row.original.issued_at ??
          row.original.created_at

        return (
          <span>
            {new Date(date).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )
      },
    },

    {
      id: "owner",
      accessorFn: (row) => row.owner?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Owner"
        />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.owner?.name ?? "—"}
        </span>
      ),
    },

    {
      id: "pet",
      accessorFn: (row) => row.pet?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Pet"
        />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.pet?.name ?? "—"}
        </span>
      ),
    },

    {
      accessorKey: "total",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Total"
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.currency}{" "}
          {Number(row.original.total).toFixed(2)}
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
      cell: ({ row }) => {
        const status = row.original.status

        if (status === "paid") {
          return <Badge variant="completed">Paid</Badge>
        }

        if (status === "open") {
          return <Badge variant="default">Open</Badge>
        }

        if (status === "void") {
          return (
            <Badge variant="destructive">
              Void
            </Badge>
          )
        }

        return (
          <Badge variant="secondary">
            Draft
          </Badge>
        )
      },
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
                aria-label={`Actions for invoice ${
                  row.original.number
                    ? `#${row.original.number}`
                    : row.original.id
                }`}
              />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => onView(row.original)}
              >
                <EyeIcon />
                View
              </DropdownMenuItem>

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