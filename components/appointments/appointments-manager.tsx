"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getAppointmentColumns } from "@/components/appointments/appointments-columns"
import { AppointmentsFilters } from "@/components/appointments/appointments-filters"
import { AppointmentFormDialog } from "@/components/appointments/appointment-form-dialog"
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
import type { AppointmentListFilters } from "@/lib/constants/appointment-filters"
import { deleteAppointment } from "@/lib/supabase/mutations/appointment"
import type {
  AppointmentRow,
  EmployeeRow,
  OwnerRow,
  PetRow,
  ServicePackageRow,
  ServiceRow,
} from "@/lib/supabase/types"

type AppointmentsManagerProps = {
  appointments: AppointmentRow[]
  owners: OwnerRow[]
  pets: PetRow[]
  services: ServiceRow[]
  packages: ServicePackageRow[]
  employees: EmployeeRow[]
  filters: AppointmentListFilters
}

export function AppointmentsManager({
  appointments,
  owners,
  pets,
  services,
  packages,
  employees,
  filters,
}: AppointmentsManagerProps) {
  const router = useRouter()
  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] =
    useState<AppointmentRow | null>(null)
  const [deletingAppointment, setDeletingAppointment] =
    useState<AppointmentRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingAppointment(null)
    setFormOpen(true)
  }

  function openEdit(appointment: AppointmentRow) {
    setEditingAppointment(appointment)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingAppointment) return

    setIsDeleting(true)

    const result = await deleteAppointment(
      deletingAppointment.id
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
      description: "Appointment deleted",
      priority: "high",
    })
    setDeletingAppointment(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getAppointmentColumns({
        onEdit: openEdit,
        onDelete: setDeletingAppointment,
      }),
    []
  )

  const emptyMessage =
    filters.search || filters.status !== "all"
      ? "No appointments match your filters."
      : "No appointments yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Manage appointments, assign staff, and track appointment status. Search and status filters run on the server via URL params."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New appointment
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={appointments}
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

      <AppointmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        appointment={editingAppointment}
        owners={owners}
        pets={pets}
        services={services}
        packages={packages}
        employees={employees}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingAppointment)}
        onOpenChange={(open) => {
          if (!open) setDeletingAppointment(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete appointment?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete the appointment for{" "}
              <strong>
                {deletingAppointment?.pet?.name}
              </strong>{" "}
              owned by{" "}
              <strong>
                {deletingAppointment?.owner?.name}
              </strong>
              .
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

function ServerFiltersToolbar({
  filters,
  onLoadingChange,
}: {
  filters: AppointmentListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <AppointmentsFilters
      initialSearch={filters.search ?? ""}
      initialStatus={filters.status ?? "all"}
      onLoadingChange={onLoadingChange}
    />
  )
}