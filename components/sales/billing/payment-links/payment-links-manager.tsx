"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getPaymentLinksColumns } from "@/components/sales/billing/payment-links/payment-links-columns"
import { PaymentLinksFilters } from "@/components/sales/billing/payment-links/payment-links-filters"
import { PaymentLinkFormDialog } from "@/components/sales/billing/payment-links/payment-link-form-dialog"
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

import type { PaymentLinkListFilters } from "@/lib/constants/payment-link-filters"
import { deletePaymentToken } from "@/lib/supabase/mutations/payment-tokens"
import type {
    InvoiceRow,
    PaymentLinkListRow
} from "@/lib/supabase/types"


type PaymentLinksManagerProps = {
    paymentLinks: PaymentLinkListRow[]
    invoices: InvoiceRow[]
    filters: PaymentLinkListFilters
}

export function PaymentLinksManager({
    paymentLinks,
    invoices,
    filters,
}: PaymentLinksManagerProps) {
    const router = useRouter()

    const [isFiltering, setIsFiltering] =
        useState(false)

    const [formOpen, setFormOpen] =
        useState(false)

    const [editingPaymentLink, setEditingPaymentLink] =
        useState<PaymentLinkListRow | null>(null)

    const [deletingPaymentLink, setDeletingPaymentLink] =
        useState<PaymentLinkListRow | null>(null)

    const [isDeleting, setIsDeleting] =
        useState(false)

    function refreshList() {
        router.refresh()
    }

    function openCreate() {
        setEditingPaymentLink(null)
        setFormOpen(true)
    }

    function openEdit(
        paymentLink: PaymentLinkListRow
    ) {
        setEditingPaymentLink(paymentLink)
        setFormOpen(true)
    }

    async function confirmDelete() {
        if (!deletingPaymentLink) return

        setIsDeleting(true)

        const result =
            await deletePaymentToken(
                deletingPaymentLink.id
            )

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
            description: "Payment link deleted",
            priority: "high",
        })

        setDeletingPaymentLink(null)
        refreshList()
    }

    const columns = useMemo(
        () =>
            getPaymentLinksColumns({
                onEdit: openEdit,
                onDelete: setDeletingPaymentLink,
            }),
        []
    )

    const emptyMessage =
        filters.search ||
            filters.status !== "all"
            ? "No payment links match your filters."
            : "No payment links yet. Create your first one to get started."

    return (
        <div className="space-y-6">
            <PageHeader
                title="Payment links"
                description="Create secure payment links for open invoices and share them with customers."
                actions={
                    <Button onClick={openCreate}>
                        <Plus />
                        New payment link
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={paymentLinks}
                pageSize={10}
                isLoading={isFiltering}
                enableColumnVisibility
                emptyMessage={emptyMessage}
                toolbar={
                    <ServerFiltersToolbar
                        filters={filters}
                        onLoadingChange={
                            setIsFiltering
                        }
                    />
                }
            />

            <PaymentLinkFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                invoices={invoices}
                paymentLink={
                    editingPaymentLink
                }
                onSuccess={refreshList}
            />

            <AlertDialog
                open={Boolean(
                    deletingPaymentLink
                )}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingPaymentLink(null)
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete payment link?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            This will permanently revoke
                            this payment link. Anyone with
                            the link will no longer be able
                            to use it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isDeleting}
                        >
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
                            {isDeleting
                                ? "Deleting…"
                                : "Delete"}
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
    filters: PaymentLinkListFilters
    onLoadingChange: (loading: boolean) => void
}) {
    return (
        <PaymentLinksFilters
            initialSearch={
                filters.search ?? ""
            }
            initialStatus={
                filters.status ?? "all"
            }
            onLoadingChange={
                onLoadingChange
            }
        />
    )
}