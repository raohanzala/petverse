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
import type { OutboundCampaignRow } from "@/lib/supabase/types"

type OutboundCampaignColumnActions = {
  onEdit: (campaign: OutboundCampaignRow) => void
  onDelete: (campaign: OutboundCampaignRow) => void
}

function getStatusVariant(
  status: OutboundCampaignRow["status"]
): "secondary" | "outline" | "completed" | "destructive" {
  if (status === "scheduled") {
    return "outline"
  }

  if (status === "running") {
    return "completed"
  }

  if (status === "cancelled") {
    return "destructive"
  }

  return "secondary"
}

function formatScheduledAt(
  value: string | null
) {
  if (!value) return "—"

  return new Date(value).toLocaleString()
}

export function getOutboundCampaignColumns({
  onEdit,
  onDelete,
}: OutboundCampaignColumnActions): AdminColumnDef<OutboundCampaignRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Name"
        />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.name}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "channel",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Channel"
        />
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="capitalize"
        >
          {row.original.channel}
        </Badge>
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
          variant={getStatusVariant(row.original.status)}
          className="capitalize"
        >
          {row.original.status.replace("_", " ")}
        </Badge>
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
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatScheduledAt(row.original.scheduled_at)}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Created"
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(
            row.original.created_at
          ).toLocaleString()}
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