"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getDaycareWalletColumns } from "./daycare-wallets-columns"
import { DaycareWalletsFilters } from "./daycare-wallets-filters"
import { DaycareWalletFormDialog } from "./daycare-wallet-form-dialog"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import type { DaycareWalletListFilters } from "@/lib/constants/daycare-billing-filters"
import { deleteDaycareWallet } from "@/lib/supabase/mutations/daycare-wallets"
import type { DaycarePackageRow, DaycareWalletRow, OwnerRow, PetRow } from "@/lib/supabase/types"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type DaycareWalletsManagerProps = {
  wallets: DaycareWalletRow[]
  filters: DaycareWalletListFilters
  owners: OwnerRow[]
  pets: PetRow[]
  packages: DaycarePackageRow[]
}

export function DaycareWalletsManager({
    wallets,
    filters,
    owners,
    pets,
    packages
}: DaycareWalletsManagerProps) {
    const router = useRouter()

    const [isFiltering, setIsFiltering] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [editingWallet, setEditingWallet] =
        useState<DaycareWalletRow | null>(null)
    const [deletingWallet, setDeletingWallet] =
        useState<DaycareWalletRow | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    function refreshList() {
        router.refresh()
    }

    function openCreate() {
        setEditingWallet(null)
        setFormOpen(true)
    }

    function openEdit(wallet: DaycareWalletRow) {
        setEditingWallet(wallet)
        setFormOpen(true)
    }

    async function confirmDelete() {
        if (!deletingWallet) return

        setIsDeleting(true)

        const result = await deleteDaycareWallet(deletingWallet.id)

        setIsDeleting(false)

        if (!result.success) {
            toast.add({
                type: "error",
                description: result.error,
                priority: "high",
            })
            return
        }

        toast.add({
            type: "success",
            description: "Daycare wallet deleted",
            priority: "high",
        })

        setDeletingWallet(null)
        refreshList()
    }

    const columns = useMemo(
        () =>
            getDaycareWalletColumns({
                owners,
                pets,
                packages,
                onEdit: openEdit,
                onDelete: setDeletingWallet,
            }),
        []
    )

    const emptyMessage =
        filters.search || filters.status !== "all"
            ? "No daycare wallets match your filters."
            : "No daycare wallets yet. Assign a package to a customer to get started."

    return (
        <div className="space-y-6">
            <PageHeader
                title="Daycare wallets"
                description="Manage purchased daycare packages and remaining visits for customers."
                actions={
                    <Button onClick={openCreate}>
                        <Plus />
                        Assign package
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={wallets}
                pageSize={10}
                isLoading={isFiltering}
                enableColumnVisibility
                emptyMessage={emptyMessage}
                toolbar={
                    <ServerFiltersToolbar
                        filters={filters}
                        onLoadingChange={setIsFiltering}
                    />
                }
            />

            <DaycareWalletFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                wallet={editingWallet}
                owners={owners}
                pets={pets}
                packages={packages}
                onSuccess={refreshList}
            />

            <AlertDialog
                open={Boolean(deletingWallet)}
                onOpenChange={(open) => {
                    if (!open) setDeletingWallet(null)
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete daycare wallet?</AlertDialogTitle>

                        <AlertDialogDescription>
                            This will permanently delete this daycare wallet and its
                            remaining visit balance. Existing daycare transactions will
                            keep their historical data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={(event) => {
                                event.preventDefault()
                                void confirmDelete()
                            }}
                        >
                            {isDeleting ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

/** Server-driven filters rendered in the DataTable toolbar row. */
function ServerFiltersToolbar({
    filters,
    onLoadingChange,
}: {
    filters: DaycareWalletListFilters
    onLoadingChange: (loading: boolean) => void
}) {
    return (
        <DaycareWalletsFilters
            initialSearch={filters.search ?? ""}
            initialStatus={filters.status ?? "all"}
            onLoadingChange={onLoadingChange}
        />
    )
}