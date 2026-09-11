"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { toast } from "@/components/ui/toast"

import { getDepositColumns } from "@/components/sales/billing/deposits/deposits-columns"
import { DepositsFilters } from "@/components/sales/billing/deposits/deposits-filters"
import { DepositFormDialog } from "@/components/sales/billing/deposits/deposit-form-dialog"

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

import type { DepositListFilters } from "@/lib/constants/deposit-filters"

import {
  deleteDeposit,
} from "@/lib/supabase/mutations/deposits"

import type {
  AppointmentRow,
  DepositRow,
  InvoiceRow,
  OwnerRow,
} from "@/lib/supabase/types"

type DepositsManagerProps = {
  deposits: DepositRow[]
  filters: DepositListFilters
  owners: OwnerRow[]
  appointments: AppointmentRow[]
  invoices: InvoiceRow[]
}

export function DepositsManager({
  deposits,
  filters,
  owners,
  appointments,
  invoices,
}: DepositsManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] =
    useState(false)

  const [formOpen, setFormOpen] =
    useState(false)

  const [editingDeposit, setEditingDeposit] =
    useState<DepositRow | null>(null)

  const [deletingDeposit, setDeletingDeposit] =
    useState<DepositRow | null>(null)

  const [isDeleting, setIsDeleting] =
    useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingDeposit(null)
    setFormOpen(true)
  }

  function openEdit(
    deposit: DepositRow
  ) {
    setEditingDeposit(deposit)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingDeposit) return

    setIsDeleting(true)

    const result =
      await deleteDeposit(
        deletingDeposit.id
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
      description: "Deposit deleted",
      priority: "high",
    })

    setDeletingDeposit(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getDepositColumns({
        onEdit: openEdit,
        onDelete: setDeletingDeposit,
        owners,
        appointments,
        invoices,
      }),
    [
      owners,
      appointments,
      invoices,
    ]
  )

  const emptyMessage =
    filters.search
      ? "No deposits match your search."
      : "No deposits yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deposits"
        description="Record and manage customer deposits linked to owners, appointments, and invoices."
        actions={
          <Button
            onClick={openCreate}
          >
            <Plus />
            New deposit
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={deposits}
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

      <DepositFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        deposit={editingDeposit}
        owners={owners}
        appointments={appointments}
        invoices={invoices}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(
          deletingDeposit
        )}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingDeposit(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete deposit?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete
              this deposit record. This
              action cannot be undone.
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

function ServerFiltersToolbar({
  filters,
  onLoadingChange,
}: {
  filters: DepositListFilters
  onLoadingChange: (
    loading: boolean
  ) => void
}) {
  return (
    <DepositsFilters
      initialSearch={
        filters.search ?? ""
      }
      onLoadingChange={
        onLoadingChange
      }
    />
  )
}