"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getVaccineTypeColumns } from "@/components/compliance/vaccine-types/vaccine-types-columns"
import { VaccineTypesFilters } from "@/components/compliance/vaccine-types/vaccine-types-filters"
import { VaccineTypeFormDialog } from "@/components/compliance/vaccine-types/vaccine-type-form-dialog"
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
import type { VaccineTypeListFilters } from "@/lib/constants/vaccine-types-filters"
import { deleteVaccineType } from "@/lib/supabase/mutations/vaccine-types"
import type { VaccineTypeRow } from "@/lib/supabase/types"

type VaccineTypesManagerProps = {
  vaccineTypes: VaccineTypeRow[]
  filters: VaccineTypeListFilters
}

export function VaccineTypesManager({
  vaccineTypes,
  filters,
}: VaccineTypesManagerProps) {
  const router = useRouter()
  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingVaccineType, setEditingVaccineType] =
    useState<VaccineTypeRow | null>(null)
  const [deletingVaccineType, setDeletingVaccineType] =
    useState<VaccineTypeRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingVaccineType(null)
    setFormOpen(true)
  }

  function openEdit(vaccineType: VaccineTypeRow) {
    setEditingVaccineType(vaccineType)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingVaccineType) return

    setIsDeleting(true)

    const result = await deleteVaccineType(
      deletingVaccineType.id
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
      description: "Vaccine type deleted",
      priority: "high",
    })

    setDeletingVaccineType(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getVaccineTypeColumns({
        onEdit: openEdit,
        onDelete: setDeletingVaccineType,
      }),
    []
  )

  const emptyMessage =
    filters.search || filters.status !== "all"
      ? "No vaccine types match your filters."
      : "No vaccine types yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vaccine types"
        description="Manage vaccines that can be recorded for pets, including species and renewal intervals."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New vaccine type
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={vaccineTypes}
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

      <VaccineTypeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        vaccineType={editingVaccineType}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingVaccineType)}
        onOpenChange={(open) => {
          if (!open) setDeletingVaccineType(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete vaccine type?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>
                {deletingVaccineType?.name}
              </strong>
              . Existing pet vaccination records that
              reference this vaccine type will prevent the
              deletion.
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
  filters: VaccineTypeListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <VaccineTypesFilters
      initialSearch={filters.search ?? ""}
      initialStatus={filters.status ?? "all"}
      onLoadingChange={onLoadingChange}
    />
  )
}