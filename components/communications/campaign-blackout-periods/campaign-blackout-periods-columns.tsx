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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CampaignBlackoutPeriodRow } from "@/lib/supabase/types"

type CampaignBlackoutPeriodColumnActions = {
  onEdit: (period: CampaignBlackoutPeriodRow) => void
  onDelete: (period: CampaignBlackoutPeriodRow) => void
  campaigns: {
    id: string
    name: string
  }[]
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString()
}

export function getCampaignBlackoutPeriodColumns({
  onEdit,
  onDelete,
  campaigns
}: CampaignBlackoutPeriodColumnActions): AdminColumnDef<CampaignBlackoutPeriodRow>[] {
  return [
    {
      accessorKey: "campaign_id",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Campaign"
        />
      ),
      cell: ({ row }) => {
        const campaign = campaigns.find(
          (campaign) =>
            campaign.id === row.original.campaign_id
        )

        return (
          <span className="text-sm font-medium">
            {campaign?.name ?? "Unknown campaign"}
          </span>
        )
      },
    },
    {
      accessorKey: "starts_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Starts"
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {formatDateTime(row.original.starts_at)}
        </span>
      ),
    },
    {
      accessorKey: "ends_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Ends"
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {formatDateTime(row.original.ends_at)}
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
                aria-label={`Actions for campaign blackout period ${row.original.id}`}
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