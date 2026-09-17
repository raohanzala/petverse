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
import type { ProductRow } from "@/lib/supabase/types"

type ProductColumnActions = {
  onEdit: (product: ProductRow) => void
  onDelete: (product: ProductRow) => void
}

export function getProductColumns({
  onEdit,
  onDelete,
}: ProductColumnActions): AdminColumnDef<ProductRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.name}
          </p>

          {row.original.sku ? (
            <code className="text-xs text-muted-foreground">
              {row.original.sku}
            </code>
          ) : null}
        </div>
      ),
    },

    {
      accessorKey: "brand",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Brand" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.brand ?? "—"}
        </span>
      ),
    },

    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.category ?? "—"}
        </span>
      ),
    },

    {
      id: "supplier",
      accessorFn: (row) => row.supplier?.name ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Supplier" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.supplier?.name ?? "—"}
        </span>
      ),
    },

    {
      accessorKey: "retail_price",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Retail Price"
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {Number(row.original.retail_price).toFixed(2)}
        </span>
      ),
    },

    {
      accessorKey: "cost_price",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Cost Price"
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {Number(row.original.cost_price).toFixed(2)}
        </span>
      ),
    },

    {
      accessorKey: "stock_qty",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stock" />
      ),
      cell: ({ row }) => (
        <span>{row.original.stock_qty}</span>
      ),
    },

    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge variant="completed">
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">
            Inactive
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
                aria-label={`Actions for ${row.original.name}`}
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