"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { getDailyUpdateColumns } from "./daily-updates-columns"
import { DailyUpdatesFilters } from "./daily-updates-filters"
import { DailyUpdateFormDialog } from "./daily-update-form-dialog"
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
import type {
  DailyUpdateListFilters,
} from "@/lib/constants/daily-update-filters"
import {
  deleteDailyUpdate,
} from "@/lib/supabase/mutations/daily-updates"
import type {
  DailyUpdateAppointmentOption,
  DailyUpdateEmployeeOption,
  DailyUpdatePetOption,
  DailyUpdateWithRelations,
} from "@/lib/supabase/types"

type DailyUpdatesManagerProps = {
  updates: DailyUpdateWithRelations[]
  filters: DailyUpdateListFilters
  pets: DailyUpdatePetOption[]
  appointments: DailyUpdateAppointmentOption[]
  employees: DailyUpdateEmployeeOption[]
}

export function DailyUpdatesManager({
  updates,
  filters,
  pets,
  appointments,
  employees,
}: DailyUpdatesManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] =
    useState(false)

  const [formOpen, setFormOpen] =
    useState(false)

  const [
    editingUpdate,
    setEditingUpdate,
  ] = useState<DailyUpdateWithRelations | null>(
    null
  )

  const [
    deletingUpdate,
    setDeletingUpdate,
  ] = useState<DailyUpdateWithRelations | null>(
    null
  )

  const [isDeleting, setIsDeleting] =
    useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingUpdate(null)
    setFormOpen(true)
  }

  function openEdit(
    update: DailyUpdateWithRelations
  ) {
    setEditingUpdate(update)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingUpdate) return

    setIsDeleting(true)

    const result = await deleteDailyUpdate(
      deletingUpdate.id
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
      description: "Daily update deleted",
      priority: "high",
    })

    setDeletingUpdate(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getDailyUpdateColumns({
        onEdit: openEdit,
        onDelete: setDeletingUpdate,
      }),
    []
  )

  const emptyMessage =
    filters.search ||
    filters.delivery !== "all"
      ? "No daily updates match your filters."
      : "No daily updates yet. Create your first update to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily updates"
        description="Create and manage updates shared with pet owners during appointments and stays."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New update
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={updates}
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

      <DailyUpdateFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        update={editingUpdate}
        pets={pets}
        appointments={appointments}
        employees={employees}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingUpdate)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingUpdate(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete daily update?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete the
              daily update for{" "}
              <strong>
                {deletingUpdate?.pet?.name ??
                  "this pet"}
              </strong>
              . The pet and appointment will not
              be deleted.
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
  filters: DailyUpdateListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <DailyUpdatesFilters
      initialSearch={filters.search ?? ""}
      initialDelivery={
        filters.delivery ?? "all"
      }
      onLoadingChange={onLoadingChange}
    />
  )
}