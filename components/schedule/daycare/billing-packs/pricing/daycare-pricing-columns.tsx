"use client"

import { MoreHorizontal, PencilIcon } from "lucide-react"

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
import type { DaycarePricingRow } from "@/lib/supabase/types"

type DaycarePricingColumnActions = {
  onEdit: (pricing: DaycarePricingRow) => void
}

export function getDaycarePricingColumns({
  onEdit,
}: DaycarePricingColumnActions): AdminColumnDef<DaycarePricingRow>[] {
  return [
    {
      accessorKey: "full_day_price",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Full day"
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          PKR {row.original.full_day_price.toLocaleString()}
        </span>
      ),
    },

    {
      accessorKey: "half_day_price",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Half day"
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          PKR {row.original.half_day_price.toLocaleString()}
        </span>
      ),
    },

    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Last updated"
        />
      ),
      cell: ({ row }) => (
        <span>
          {new Date(
            row.original.updated_at
          ).toLocaleDateString()}
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
                aria-label="Pricing actions"
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
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}