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
import type { InvoiceRow } from "@/lib/supabase/types"

type InvoiceColumnActions = {
  onEdit: (invoice: InvoiceRow) => void
  onDelete: (invoice: InvoiceRow) => void
}

const INVOICE_STATUS_LABELS: Record<
  InvoiceRow["status"],
  string
> = {
  draft: "Draft",
  open: "Open",
  paid: "Paid",
  void: "Void",
}

export function getInvoiceColumns({
  onEdit,
  onDelete,
}: InvoiceColumnActions): AdminColumnDef<InvoiceRow>[] {
  return [
    {
      accessorKey: "number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.number
              ? `#${row.original.number}`
              : "Unassigned"}
          </p>

          {row.original.notes ? (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {row.original.notes}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
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
          return <Badge variant="destructive">Void</Badge>
        }

        return <Badge variant="secondary">Draft</Badge>
      },
    },
    {
      accessorKey: "subtotal",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subtotal" />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.currency}{" "}
          {row.original.subtotal.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "tax",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tax" />
      ),
      cell: ({ row }) => (
        <span>
          {row.original.currency}{" "}
          {row.original.tax.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.currency}{" "}
          {row.original.total.toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "issued_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Issued" />
      ),
      cell: ({ row }) =>
        row.original.issued_at
          ? new Date(row.original.issued_at).toLocaleDateString()
          : "—",
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