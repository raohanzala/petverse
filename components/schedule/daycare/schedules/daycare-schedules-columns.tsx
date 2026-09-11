"use client"

import { MoreHorizontal, PencilIcon, Trash2Icon } from "lucide-react"

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
import type { DaycareScheduleRow, PetRow } from "@/lib/supabase/types"

type DaycareScheduleColumnActions = {
    pets: PetRow[]
    onEdit: (schedule: DaycareScheduleRow) => void
    onDelete: (schedule: DaycareScheduleRow) => void
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

function formatTime(value: string) {
    const [hours, minutes] = value.split(":").map(Number)

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return value
    }

    const date = new Date()
    date.setHours(hours, minutes, 0, 0)

    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    })
}

export function getDaycareScheduleColumns({
    pets,
    onEdit,
    onDelete,
}: DaycareScheduleColumnActions): AdminColumnDef<DaycareScheduleRow>[] {
    return [
        {
            accessorKey: "pet_id",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Pet" />
            ),
            cell: ({ row }) => {
                const pet = pets.find(
                    (pet) => pet.id === row.original.pet_id
                )

                return (
                    <span className="font-medium">
                        {pet?.name ?? "Unknown pet"}
                    </span>
                )
            },
        },
        {
            accessorKey: "day_of_week",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Day" />
            ),
            cell: ({ row }) => (
                <span className="font-medium">
                    {formatDay(row.original.day_of_week)}
                </span>
            ),
        },
        {
            accessorKey: "start_time",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Start Time" />
            ),
            cell: ({ row }) => (
                <span>{formatTime(row.original.start_time)}</span>
            ),
        },
        {
            accessorKey: "end_time",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="End Time" />
            ),
            cell: ({ row }) => (
                <span>{formatTime(row.original.end_time)}</span>
            ),
        },
        {
            accessorKey: "is_active",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) =>
                row.original.is_active ? (
                    <Badge variant="completed">Active</Badge>
                ) : (
                    <Badge variant="secondary">Inactive</Badge>
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
                            <DropdownMenuItem onClick={() => onEdit(row.original)}>
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