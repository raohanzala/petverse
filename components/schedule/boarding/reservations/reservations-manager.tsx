"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getReservationColumns } from "./reservations-columns"
import { ReservationsFilters } from "./reservations-filters"
import { ReservationFormDialog } from "./reservations-form-dialog"
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
import type { ReservationListFilters } from "@/lib/constants/reservation-filters"
import { deleteReservation } from "@/lib/supabase/mutations/reservations"
import type { FacilityResourceRow, OwnerRow, PetRow, ReservationRow, ServiceListRow } from "@/lib/supabase/types"

type ReservationsManagerProps = {
  reservations: ReservationRow[]
  filters: ReservationListFilters
  pets: PetRow[]
  owners: OwnerRow[]
  resources: FacilityResourceRow[]
  services: ServiceListRow[]
}

export function ReservationsManager({
  reservations,
  filters,
  pets,
  owners,
  resources,
  services
}: ReservationsManagerProps) {
  const router = useRouter()
  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingReservation, setEditingReservation] =
    useState<ReservationRow | null>(null)
  const [deletingReservation, setDeletingReservation] =
    useState<ReservationRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingReservation(null)
    setFormOpen(true)
  }

  function openEdit(reservation: ReservationRow) {
    setEditingReservation(reservation)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingReservation) return

    setIsDeleting(true)
    const result = await deleteReservation(deletingReservation.id)
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
      description: "Reservation deleted",
      priority: "high",
    })

    setDeletingReservation(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getReservationColumns({
        onEdit: openEdit,
        onDelete: setDeletingReservation,
      }),
    []
  )

  const emptyMessage =
    filters.search || filters.status !== "all"
      ? "No reservations match your filters."
      : "No reservations yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservations"
        description="Manage pet reservations, facility resources, stay times, and reservation status."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New reservation
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={reservations}
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

      <ReservationFormDialog
        owners={owners}
        resources={resources}
        pets={pets}
        services={services}
        open={formOpen}
        onOpenChange={setFormOpen}
        reservation={editingReservation}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingReservation)}
        onOpenChange={(open) => {
          if (!open) setDeletingReservation(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete reservation?</AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>
                {deletingReservation?.pet?.name ?? "this reservation"}
              </strong>
              {" "}and its reservation record.
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
  filters: ReservationListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <ReservationsFilters
      initialSearch={filters.search ?? ""}
      initialStatus={filters.status ?? "all"}
      onLoadingChange={onLoadingChange}
    />
  )
}