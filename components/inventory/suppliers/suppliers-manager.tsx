"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getSupplierColumns } from "@/components/inventory/suppliers/supplier-columns"
import { SupplierFilters } from "@/components/inventory/suppliers/supplier-filters"
import { SupplierFormDialog } from "@/components/inventory/suppliers/supplier-form-dialog"
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
import type { SupplierListFilters } from "@/lib/constants/supplier-filters"
import { deleteSupplier } from "@/lib/supabase/mutations/suppliers"
import type { SupplierRow } from "@/lib/supabase/types"

type SuppliersManagerProps = {
  suppliers: SupplierRow[]
  filters: SupplierListFilters
}

export function SuppliersManager({
  suppliers,
  filters,
}: SuppliersManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const [editingSupplier, setEditingSupplier] =
    useState<SupplierRow | null>(null)

  const [deletingSupplier, setDeletingSupplier] =
    useState<SupplierRow | null>(null)

  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingSupplier(null)
    setFormOpen(true)
  }

  function openEdit(supplier: SupplierRow) {
    setEditingSupplier(supplier)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingSupplier) return

    setIsDeleting(true)

    const result = await deleteSupplier(deletingSupplier.id)

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
      description: "Supplier deleted",
      priority: "high",
    })

    setDeletingSupplier(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getSupplierColumns({
        onEdit: openEdit,
        onDelete: setDeletingSupplier,
      }),
    []
  )

  const emptyMessage =
    filters.search || filters.status !== "all"
      ? "No suppliers match your filters."
      : "No suppliers yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage your product suppliers, contact information, and active status. Search and status filters run on the server via URL params."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New supplier
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={suppliers}
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

      <SupplierFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        supplier={editingSupplier}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingSupplier)}
        onOpenChange={(open) => {
          if (!open) setDeletingSupplier(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete supplier?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deletingSupplier?.name}</strong>. Products linked to
              this supplier will keep their data but lose the supplier
              reference.
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
  filters: SupplierListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <SupplierFilters
      initialSearch={filters.search ?? ""}
      initialStatus={filters.status ?? "all"}
      onLoadingChange={onLoadingChange}
    />
  )
}