"use client"

import { MoreHorizontal, PencilIcon, Trash2Icon } from "lucide-react"

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
import type { EmployeeScheduleRow } from "@/lib/supabase/types"

type EmployeeScheduleColumnActions = {
    onEdit: (schedule: EmployeeScheduleRow) => void
    onDelete: (schedule: EmployeeScheduleRow) => void
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

function formatDay(dayOfWeek: number) {
    return DAYS_OF_WEEK[dayOfWeek] ?? "Unknown"
}

function formatTime(time: string) {
    const [hours, minutes] = time.split(":").map(Number)

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return time
    }

    const date = new Date()
    date.setHours(hours, minutes, 0, 0)

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    })
}

export function getEmployeeScheduleColumns({
    onEdit,
    onDelete,
}: EmployeeScheduleColumnActions): AdminColumnDef<EmployeeScheduleRow>[] {
    return [
        {
            accessorKey: "employee_id",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Employee" />
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {row.original.employee[0]?.initials ||
                            row.original.employee[0]?.display_name
                                .split(" ")
                                .map((name) => name[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                    </div>

                    <span className="font-medium text-foreground">
                        {row.original.employee[0]?.display_name}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "day_of_week",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Day" />
            ),
            cell: ({ row }) => (
                <span>{formatDay(row.original.day_of_week)}</span>
            ),
        },
        {
            accessorKey: "start_time",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Start time" />
            ),
            cell: ({ row }) => (
                <span>{formatTime(row.original.start_time)}</span>
            ),
        },
        {
            accessorKey: "end_time",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="End time" />
            ),
            cell: ({ row }) => (
                <span>{formatTime(row.original.end_time)}</span>
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
                                aria-label={`Actions for schedule ${row.original.id}`}
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