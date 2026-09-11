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
import type { DaycarePackageRow, DaycareWalletRow, OwnerRow, PetRow } from "@/lib/supabase/types"

type DaycareWalletColumnActions = {
    onEdit: (wallet: DaycareWalletRow) => void
    onDelete: (wallet: DaycareWalletRow) => void
    owners: OwnerRow[]
    pets: PetRow[]
    packages: DaycarePackageRow[]
}

function getWalletStatus(wallet: DaycareWalletRow) {
    if (wallet.visits_remaining <= 0) {
        return "exhausted"
    }

    if (
        wallet.expires_at &&
        new Date(wallet.expires_at).getTime() < Date.now()
    ) {
        return "expired"
    }

    return "active"
}

export function getDaycareWalletColumns({
    onEdit,
    onDelete,
    owners,
    pets,
    packages
}: DaycareWalletColumnActions): AdminColumnDef<DaycareWalletRow>[] {
    return [
        {
            accessorKey: "owner_id",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Owner" />
            ),
            cell: ({ row }) => {
                const owner = owners.find(
                    (owner) => owner.id === row.original.owner_id
                )

                return (
                    <span className="font-medium">
                        {owner?.name ?? "Unknown Owner"}
                    </span>
                )
            },
        },
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
            accessorKey: "package_id",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Package" />
            ),
            cell: ({ row }) => {
                const packageName = packages.find(
                    (pkg) => pkg.id === row.original.package_id
                )

                return (
                    <span className="font-medium">
                        {packageName?.name ?? "Unknown pet"}
                    </span>
                )
            },
        },
        {
            accessorKey: "visits_remaining",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Visits remaining" />
            ),
            cell: ({ row }) => (
                <span className="font-medium">
                    {row.original.visits_remaining}
                </span>
            ),
        },
        {
            accessorKey: "expires_at",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Expires" />
            ),
            cell: ({ row }) =>
                row.original.expires_at ? (
                    <span>
                        {new Date(row.original.expires_at).toLocaleDateString()}
                    </span>
                ) : (
                    <span className="text-muted-foreground">No expiry</span>
                ),
        },
        {
            id: "status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => {
                const status = getWalletStatus(row.original)

                if (status === "active") {
                    return <Badge variant="completed">Active</Badge>
                }

                if (status === "expired") {
                    return <Badge variant="secondary">Expired</Badge>
                }

                return <Badge variant="secondary">Exhausted</Badge>
            },
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
                                aria-label={`Actions for wallet ${row.original.id}`}
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