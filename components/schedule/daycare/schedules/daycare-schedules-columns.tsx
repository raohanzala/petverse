"use client"

import { EyeIcon } from "lucide-react"

import {
  DataTableColumnHeader,
  type AdminColumnDef,
} from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type {
  DaycareScheduleListRow,
} from "@/lib/supabase/types"

type DaycareScheduleColumnActions = {
  onPreview: (schedule: DaycareScheduleListRow) => void
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const

function formatDays(days?: number[] | null) {
  if (!Array.isArray(days) || days.length === 0) {
    return "No days selected"
  }

  return [...days]
    .sort((a, b) => a - b)
    .map((day) => DAYS_OF_WEEK[day])
    .filter(Boolean)
    .join(", ")
}

function formatDate(value: string) {
  if (!value) return "—"

  return new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function getDaycareScheduleColumns({
  onPreview,
}: DaycareScheduleColumnActions): AdminColumnDef<DaycareScheduleListRow>[] {
  return [
    {
      accessorKey: "pet_id",

      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Pet"
        />
      ),

      cell: ({ row }) => {
        const pet = row.original.pet

        return (
          <div className="min-w-0">
            <p className="font-medium">
              {pet?.name ?? "Unknown pet"}
            </p>

            <p className="text-xs text-muted-foreground">
              {pet?.species ?? "Unknown species"}
            </p>
          </div>
        )
      },
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
        <span>
          {row.original.owner?.name ?? "Unknown owner"}
        </span>
      ),
    },

    {
      accessorKey: "resource_id",

      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Resource"
        />
      ),

      cell: ({ row }) => {
        const resource = row.original.resource

        return (
          <div>
            <p className="font-medium">
              {resource?.name ?? "Unassigned"}
            </p>

            {resource?.type && (
              <p className="text-xs text-muted-foreground capitalize">
                {resource.type}
              </p>
            )}
          </div>
        )
      },
    },

    {
      accessorKey: "days_of_week",

      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Days"
        />
      ),

      cell: ({ row }) => (
        <div className="max-w-[240px]">
          <span className="text-sm">
            {formatDays(row.original.days_of_week)}
          </span>
        </div>
      ),
    },

    {
      id: "date_range",

      header: "Date Range",

      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          <p className="text-sm">
            {formatDate(row.original.starts_at)}
          </p>

          <p className="text-xs text-muted-foreground">
            to {formatDate(row.original.ends_at)}
          </p>
        </div>
      ),
    },

    {
      accessorKey: "is_active",

      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Status"
        />
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
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Preview schedule for ${
            row.original.pet?.name ?? "pet"
          }`}
          onClick={() => onPreview(row.original)}
        >
          <EyeIcon />
        </Button>
      ),
    },
  ]
}