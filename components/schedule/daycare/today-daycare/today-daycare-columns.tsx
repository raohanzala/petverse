"use client"

import { MoreHorizontal } from "lucide-react"

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
import type { DaycareTransactionRow } from "@/lib/supabase/types"

type TodayDaycareColumnActions = {
  onCheckIn: (
    transaction: DaycareTransactionRow
  ) => void
  onCheckOut: (
    transaction: DaycareTransactionRow
  ) => void
  onCancel: (
    transaction: DaycareTransactionRow
  ) => void
  isActionLoading: boolean
}

const STATUS_LABELS = {
  scheduled: "Scheduled",
  checked_in: "Checked in",
  checked_out: "Checked out",
  cancelled: "Cancelled",
} as const

function getStatusVariant(
  status: DaycareTransactionRow["status"]
) {
  if (status === "scheduled") {
    return "secondary" as const
  }

  if (status === "checked_in") {
    return "completed" as const
  }

  if (status === "checked_out") {
    return "completed" as const
  }

  return "secondary" as const
}

export function getTodayDaycareColumns({
  onCheckIn,
  onCheckOut,
  onCancel,
  isActionLoading,
}: TodayDaycareColumnActions): AdminColumnDef<DaycareTransactionRow>[] {
  return [
    {
      accessorKey: "pet_id",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Pet"
        />
      ),
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {row.original.pet_id}
        </code>
      ),
    },

    {
      accessorKey: "owner_id",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Owner"
        />
      ),
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {row.original.owner_id}
        </code>
      ),
    },

    {
      accessorKey: "scheduled_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Scheduled"
        />
      ),
      cell: ({ row }) =>
        row.original.scheduled_at ? (
          <span>
            {new Date(
              row.original.scheduled_at
            ).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        ) : (
          <span className="text-muted-foreground">
            —
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
        <Badge
          variant={getStatusVariant(
            row.original.status
          )}
        >
          {STATUS_LABELS[
            row.original.status
          ]}
        </Badge>
      ),
    },

    {
      accessorKey: "check_in_at",
      header: "Check in",
      cell: ({ row }) =>
        row.original.check_in_at ? (
          <span>
            {new Date(
              row.original.check_in_at
            ).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        ) : (
          <span className="text-muted-foreground">
            —
          </span>
        ),
    },

    {
      accessorKey: "check_out_at",
      header: "Check out",
      cell: ({ row }) =>
        row.original.check_out_at ? (
          <span>
            {new Date(
              row.original.check_out_at
            ).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        ) : (
          <span className="text-muted-foreground">
            —
          </span>
        ),
    },

    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Amount"
        />
      ),
      cell: ({ row }) =>
        row.original.amount !== null ? (
          <span className="font-medium">
            PKR{" "}
            {row.original.amount.toLocaleString()}
          </span>
        ) : (
          <span className="text-muted-foreground">
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
        const transaction = row.original

        if (
          transaction.status === "checked_out" ||
          transaction.status === "cancelled"
        ) {
          return null
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isActionLoading}
                  aria-label="Session actions"
                />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                {transaction.status === "scheduled" && (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        onCheckIn(transaction)
                      }
                    >
                      Check in
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() =>
                        onCancel(transaction)
                      }
                    >
                      Cancel
                    </DropdownMenuItem>
                  </>
                )}

                {transaction.status === "checked_in" && (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        onCheckOut(transaction)
                      }
                    >
                      Check out
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() =>
                        onCancel(transaction)
                      }
                    >
                      Cancel
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}