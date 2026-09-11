"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getInvoiceColumns } from "@/components/sales/billing/invoices/invoices-columns"
import { InvoiceFilters } from "./invoices-filters"
import { InvoiceFormDialog } from "@/components/sales/billing/invoices/invoice-form-dialog"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
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
import type { InvoiceListFilters } from "@/lib/constants/invoice-filters"
import { deleteInvoice } from "@/lib/supabase/mutations/invoices"
import type { AppointmentRow, InvoiceRow, OwnerRow } from "@/lib/supabase/types"

type InvoicesManagerProps = {
    invoices: InvoiceRow[]
    filters: InvoiceListFilters
    owners: OwnerRow[]
    appointments: AppointmentRow[]
}

export function InvoicesManager({
    invoices,
    filters,
    owners,
    appointments
}: InvoicesManagerProps) {
    const router = useRouter()
    const [isFiltering, setIsFiltering] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [editingInvoice, setEditingInvoice] =
        useState<InvoiceRow | null>(null)
    const [deletingInvoice, setDeletingInvoice] =
        useState<InvoiceRow | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    function refreshList() {
        router.refresh()
    }

    function openCreate() {
        setEditingInvoice(null)
        setFormOpen(true)
    }

    function openEdit(invoice: InvoiceRow) {
        setEditingInvoice(invoice)
        setFormOpen(true)
    }

    async function confirmDelete() {
        if (!deletingInvoice) return

        setIsDeleting(true)

        const result = await deleteInvoice(deletingInvoice.id)

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
            description: "Invoice deleted",
            priority: "high",
        })

        setDeletingInvoice(null)
        refreshList()
    }

    const columns = useMemo(
        () =>
            getInvoiceColumns({
                onEdit: openEdit,
                onDelete: setDeletingInvoice,
            }),
        []
    )

    const emptyMessage =
        filters.search || filters.status !== "all"
            ? "No invoices match your filters."
            : "No invoices yet. Create your first one to get started."

    return (
        <div className="space-y-6">
            <PageHeader
                title="Invoices"
                description="Create, manage, and track invoices for appointments and customer payments. Search and status filters run on the server via URL params."
                actions={
                    <Button onClick={openCreate}>
                        <Plus />
                        New invoice
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={invoices}
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

            <InvoiceFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                invoice={editingInvoice}
                owners={owners}
                appointments={appointments}
                onSuccess={refreshList}
            />

            <AlertDialog
                open={Boolean(deletingInvoice)}
                onOpenChange={(open) => {
                    if (!open) setDeletingInvoice(null)
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete invoice?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            This will permanently delete{" "}
                            {/* <strong/> */}
                            {deletingInvoice?.number
                                ? `Invoice #${deletingInvoice.number}`
                                : "this invoice"}
                            .
                            {" "}Its line items and payment link will also be
                            removed.
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

{/* Server-driven filters rendered in the DataTable toolbar row. */ }
function ServerFiltersToolbar({
    filters,
    onLoadingChange,
}: {
    filters: InvoiceListFilters
    onLoadingChange: (loading: boolean) => void
}) {
    return (
        <InvoiceFilters
            initialSearch={filters.search ?? ""}
            initialStatus={filters.status ?? "all"}
            onLoadingChange={onLoadingChange}
        />
    )
}