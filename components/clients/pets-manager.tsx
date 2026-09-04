"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { getPetColumns } from "./pets-columns"
import { PetsFilters } from "./pets-filters"
import { PetFormDialog } from "./pet-form-dialog"
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
import type { PetListFilters } from "@/lib/constants/pet-filters"
import { deletePet } from "@/lib/supabase/mutations/pets"
import type { OwnerRow, PetRow } from "@/lib/supabase/types"

type PetsManagerProps = {
  pets: PetRow[]
  owners: OwnerRow[]
  filters: PetListFilters
}

export function PetsManager({
  pets,
  owners,
  filters,
}: PetsManagerProps) {
  const router = useRouter()
  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingPet, setEditingPet] =
    useState<PetRow | null>(null)
  const [deletingPet, setDeletingPet] =
    useState<PetRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingPet(null)
    setFormOpen(true)
  }

  function openEdit(pet: PetRow) {
    setEditingPet(pet)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingPet) return

    setIsDeleting(true)
    const result = await deletePet(deletingPet.id)
    setIsDeleting(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success("Pet deleted")
    setDeletingPet(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getPetColumns({
        onEdit: openEdit,
        onDelete: setDeletingPet,
      }),
    []
  )

  const emptyMessage =
    filters.search || filters.status !== "all"
      ? "No pets match your filters."
      : "No pets yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pets"
        description="Manage pets, their owners, and pet information. Search and status filters run on the server via URL params."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New pet
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={pets}
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

      <PetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        pet={editingPet}
        owners={owners}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingPet)}
        onOpenChange={(open) => {
          if (!open) setDeletingPet(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete pet?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deletingPet?.name}</strong>.
              Any appointments linked to this pet may be affected.
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
  filters: PetListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <PetsFilters
      initialSearch={filters.search ?? ""}
      initialStatus={filters.status ?? "all"}
      onLoadingChange={onLoadingChange}
    />
  )
}