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
import type { CampaignContactRow, CampaignContactWithRelations } from "@/lib/supabase/types"

type CampaignContactColumnActions = {
  onEdit: (contact: CampaignContactRow) => void
  onDelete: (contact: CampaignContactRow) => void
}

function getStatusVariant(
  status: CampaignContactRow["status"]
): "secondary" | "outline" | "completed" | "destructive" {
  if (status === "delivered") {
    return "completed"
  }

  if (status === "failed") {
    return "destructive"
  }

  if (status === "sent") {
    return "outline"
  }

  return "secondary"
}

function formatSentAt(value: string | null) {
  if (!value) return "—"

  return new Date(value).toLocaleString()
}

export function getCampaignContactColumns({
  onEdit,
  onDelete,
}: CampaignContactColumnActions): AdminColumnDef<CampaignContactWithRelations>[] {
  return [
    {
      accessorKey: "campaign_id",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Campaign"
        />
      ),
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {row.original.campaign?.name ?? "-"}
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
          {row.original.owner?.name ?? "-"}
        </code>
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
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "sent_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Sent At"
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatSentAt(row.original.sent_at)}
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
                aria-label={`Actions for campaign contact ${row.original.id}`}
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