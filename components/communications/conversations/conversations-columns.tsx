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
import type {
  ConversationRow,
  ConversationStage,
} from "@/lib/supabase/types"

type ConversationColumnActions = {
  onEdit: (conversation: ConversationRow) => void
  onDelete: (conversation: ConversationRow) => void
}

const STAGE_LABELS: Record<ConversationStage, string> = {
  inquiry: "Inquiry",
  engaged: "Engaged",
  quoted: "Quoted",
  booked: "Booked",
  visited: "Visited",
  closed_lost: "Closed lost",
  closed_won: "Closed won",
}

function getStageBadgeVariant(
  stage: ConversationStage
) {
  switch (stage) {
    case "inquiry":
      return "secondary" as const

    case "engaged":
      return "default" as const

    case "quoted":
      return "warning" as const

    case "booked":
      return "completed" as const

    case "visited":
      return "default" as const

    case "closed_lost":
      return "destructive" as const

    case "closed_won":
      return "completed" as const

    default:
      return "secondary" as const
  }
}

function formatAmount(
  amount: number | null
) {
  if (amount === null) {
    return "—"
  }

  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  )
}

export function getConversationColumns({
  onEdit,
  onDelete,
}: ConversationColumnActions): AdminColumnDef<ConversationRow>[] {
  return [
    {
      accessorKey: "channel",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Channel"
        />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground capitalize">
            {row.original.channel}
          </p>
          {row.original.external_id ? (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {row.original.external_id}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "stage",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Stage"
        />
      ),
      cell: ({ row }) => (
        <Badge
          variant={getStageBadgeVariant(
            row.original.stage
          )}
        >
          {STAGE_LABELS[row.original.stage]}
        </Badge>
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
          {row.original.owner?.[0]?.name ?? "Unmatched"}
        </code>
      ),
    },
    {
      accessorKey: "assigned_employee_id",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Assigned Staff"
        />
      ),
      cell: ({ row }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {row.original.assigned_employee?.[0].display_name ?? "Unassigned"}
        </code>
      ),
    },
    {
      accessorKey: "quoted_amount",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Quoted"
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {formatAmount(row.original.quoted_amount)}
        </span>
      ),
    },
    {
      accessorKey: "lost_revenue",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Lost Revenue"
        />
      ),
      cell: ({ row }) => (
        <span>
          {formatAmount(row.original.lost_revenue)}
        </span>
      ),
    },
    {
      accessorKey: "ai_handled",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="AI"
        />
      ),
      cell: ({ row }) =>
        row.original.ai_handled ? (
          <Badge variant="completed">
            Handled
          </Badge>
        ) : (
          <Badge variant="secondary">
            Staff
          </Badge>
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
          {formatDate(row.original.created_at)}
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
                aria-label={`Actions for ${row.original.channel} conversation`}
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
                onClick={() =>
                  onDelete(row.original)
                }
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
