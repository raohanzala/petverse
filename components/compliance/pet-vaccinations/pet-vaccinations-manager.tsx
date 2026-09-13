"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getPetVaccinationColumns } from "@/components/compliance/pet-vaccinations/pet-vaccinations-columns"
import { PetVaccinationsFilters } from "@/components/compliance/pet-vaccinations/pet-vaccinations-filters"
import { PetVaccinationFormDialog } from "@/components/compliance/pet-vaccinations/pet-vaccination-form-dialog"
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
import type { PetVaccinationListFilters } from "@/lib/constants/pet-vaccinations-filters"
import { deletePetVaccination } from "@/lib/supabase/mutations/pet-vaccinations"
import type {
    EmployeeRow,
    PetRow,
  PetVaccinationWithRelations,
  VaccineTypeRow,
} from "@/lib/supabase/types"

type PetVaccinationsManagerProps = {
  vaccinations: PetVaccinationWithRelations[]
  filters: PetVaccinationListFilters
  pets: PetRow[]
  employees: EmployeeRow[]
  vaccinationTypes: VaccineTypeRow[]
}

export function PetVaccinationsManager({
  vaccinations,
  filters,
  pets,
  employees,
  vaccinationTypes
}: PetVaccinationsManagerProps) {
  const router = useRouter()
  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingVaccination, setEditingVaccination] =
    useState<PetVaccinationWithRelations | null>(null)
  const [deletingVaccination, setDeletingVaccination] =
    useState<PetVaccinationWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingVaccination(null)
    setFormOpen(true)
  }

  function openEdit(
    vaccination: PetVaccinationWithRelations
  ) {
    setEditingVaccination(vaccination)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingVaccination) return

    setIsDeleting(true)

    const result = await deletePetVaccination(
      deletingVaccination.id
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
      description: "Vaccination deleted",
      priority: "high",
    })

    setDeletingVaccination(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getPetVaccinationColumns({
        onEdit: openEdit,
        onDelete: setDeletingVaccination,
      }),
    []
  )

  const emptyMessage = filters.search
    ? "No pet vaccinations match your filters."
    : "No pet vaccinations yet. Record the first vaccination to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pet vaccinations"
        description="Track vaccinations recorded for pets, including vaccine type, administration date, expiration, and notes."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            Record vaccination
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={vaccinations}
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

      <PetVaccinationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        vaccination={editingVaccination}
        pets={pets}
        vaccineTypes={vaccinationTypes}
        employees={employees}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingVaccination)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingVaccination(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete vaccination?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete the vaccination
              record for{" "}
              <strong>
                {deletingVaccination?.pet?.name ??
                  "this pet"}
              </strong>
              . This action cannot be undone.
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
  filters: PetVaccinationListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <PetVaccinationsFilters
      initialSearch={filters.search ?? ""}
      onLoadingChange={onLoadingChange}
    />
  )
}