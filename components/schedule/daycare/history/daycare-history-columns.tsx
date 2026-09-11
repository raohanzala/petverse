"use client"

import {
  DataTableColumnHeader,
  type AdminColumnDef,
} from "@/components/shared/data-table"

import type {
  DaycareTransactionRow,
  PetRow,
} from "@/lib/supabase/types"

import { DaycareSessionStatusBadge } from "../daycare-session-status-badge"

function formatDateTime(value: string | null) {
  if (!value) return "—"

  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

type DaycareHistoryColumnActions = {
  pets: PetRow[]
}

export function getDaycareHistoryColumns({
  pets,
}: DaycareHistoryColumnActions): AdminColumnDef<DaycareTransactionRow>[] {
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
        <span className="font-medium">
          {pets.find(
            (pet) => pet.id === row.original.pet_id
          )?.name ?? "Unknown pet"}
        </span>
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
        <span className="text-muted-foreground">
          {row.original.owner_id}
        </span>
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
        formatDateTime(row.original.scheduled_at),
    },

    {
      accessorKey: "check_in_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Check In"
        />
      ),
      cell: ({ row }) =>
        formatDateTime(row.original.check_in_at),
    },

    {
      accessorKey: "check_out_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Check Out"
        />
      ),
      cell: ({ row }) =>
        formatDateTime(row.original.check_out_at),
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
        <DaycareSessionStatusBadge
          status={row.original.status}
        />
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
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {row.original.amount !== null
            ? Number(row.original.amount).toLocaleString()
            : "—"}
        </div>
      ),
    },
  ]
}