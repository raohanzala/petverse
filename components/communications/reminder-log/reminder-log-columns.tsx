"use client"

import {
  DataTableColumnHeader,
  type AdminColumnDef,
} from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import type { ReminderLogRow } from "@/lib/supabase/types"

function formatDateTime(value: string) {
  return new Date(value).toLocaleString()
}

function getStatusVariant(
  status: string
): "completed" | "destructive" | "secondary" {
  if (status === "sent") {
    return "completed"
  }

  if (status === "failed") {
    return "destructive"
  }

  return "secondary"
}

export function getReminderLogColumns(): AdminColumnDef<ReminderLogRow>[] {
  return [
    {
      accessorKey: "owner_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Owner" />
      ),
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {row.original.owner_id
            ? row.original.owner_id.slice(0, 8)
            : "Unmatched"}
        </code>
      ),
    },
    {
      accessorKey: "appointment_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Appointment" />
      ),
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {row.original.appointment_id
            ? row.original.appointment_id.slice(0, 8)
            : "—"}
        </code>
      ),
    },
    {
      accessorKey: "channel",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Channel" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.channel}
        </Badge>
      ),
    },
    {
      accessorKey: "template_key",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Template" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.template_key || "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "sent_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sent At" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(row.original.sent_at)}
        </span>
      ),
    },
    {
      accessorKey: "error_message",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Error" />
      ),
      cell: ({ row }) =>
        row.original.error_message ? (
          <p className="line-clamp-2 max-w-[320px] text-sm text-destructive">
            {row.original.error_message}
          </p>
        ) : (
          <span className="text-sm text-muted-foreground">
            —
          </span>
        ),
    },
  ]
}