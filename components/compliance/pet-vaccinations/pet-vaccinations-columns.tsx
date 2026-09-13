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
import type {
    PetVaccinationWithRelations,
} from "@/lib/supabase/types"

type PetVaccinationColumnActions = {
    onEdit: (
        vaccination: PetVaccinationWithRelations
    ) => void

    onDelete: (
        vaccination: PetVaccinationWithRelations
    ) => void
}

export function getPetVaccinationColumns({
    onEdit,
    onDelete,
}: PetVaccinationColumnActions): AdminColumnDef<PetVaccinationWithRelations>[] {
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
                <p className="font-medium text-foreground">
                    {row.original.pet?.name ?? "Unknown pet"}
                </p>
            ),
        },

        {
            accessorKey: "vaccine_type_id",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Vaccine"
                />
            ),
            cell: ({ row }) => (
                <p className="text-foreground">
                    {row.original.vaccine_type?.name ??
                        "Unknown vaccine"}
                </p>
            ),
        },

        {
            accessorKey: "administered_at",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Administered"
                />
            ),
            cell: ({ row }) => (
                <span>
                    {new Date(
                        row.original.administered_at
                    ).toLocaleDateString()}
                </span>
            ),
        },

        {
            accessorKey: "expires_at",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Expires"
                />
            ),
            cell: ({ row }) =>
                row.original.expires_at ? (
                    <span>
                        {new Date(
                            row.original.expires_at
                        ).toLocaleDateString()}
                    </span>
                ) : (
                    <span className="text-muted-foreground">
                        —
                    </span>
                ),
        },

        {
            accessorKey: "recorded_by",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Recorded by"
                />
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.employee?.display_name ?? "Unknown"}
                </span>
            ),
        },

        {
            accessorKey: "notes",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Notes"
                />
            ),
            cell: ({ row }) =>
                row.original.notes ? (
                    <p className="line-clamp-1 max-w-[240px] text-sm text-muted-foreground">
                        {row.original.notes}
                    </p>
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

            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Actions for ${row.original.pet?.name ??
                                    "vaccination"
                                    }`}
                            />
                        }
                    >
                        <MoreHorizontal />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={() =>
                                    onEdit(row.original)
                                }
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