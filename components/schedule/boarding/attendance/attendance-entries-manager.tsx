"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getAttendanceEntryColumns } from "@/components/schedule/boarding/attendance/attendance-entries-columns"
import { AttendanceEntriesFilters } from "@/components/schedule/boarding/attendance/attendance-entries-filters"
import { AttendanceEntryFormDialog } from "./attendance-entries-form-dialog"
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
import type { AttendanceEntryListFilters } from "@/lib/constants/attendance-entries-filters"
import { deleteAttendanceEntry } from "@/lib/supabase/mutations/attendance-entries"
import type { AttendanceEntryRow, ReservationRow } from "@/lib/supabase/types"

type AttendanceEntriesManagerProps = {
  entries: AttendanceEntryRow[]
  filters: AttendanceEntryListFilters
  reservations: ReservationRow[]
}

export function AttendanceEntriesManager({
  entries,
  filters,
  reservations
}: AttendanceEntriesManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const [editingEntry, setEditingEntry] =
    useState<AttendanceEntryRow | null>(null)

  const [deletingEntry, setDeletingEntry] =
    useState<AttendanceEntryRow | null>(null)

  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingEntry(null)
    setFormOpen(true)
  }

  function openEdit(entry: AttendanceEntryRow) {
    setEditingEntry(entry)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingEntry) return

    setIsDeleting(true)

    const result = await deleteAttendanceEntry(
      deletingEntry.id
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
      description: "Attendance entry deleted",
      priority: "high",
    })

    setDeletingEntry(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getAttendanceEntryColumns({
        onEdit: openEdit,
        onDelete: setDeletingEntry,
      }),
    []
  )

  const emptyMessage =
    filters.search || filters.type !== "all"
      ? "No attendance entries match your filters."
      : "No attendance entries yet. Create your first entry to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance entries"
        description="Track check-ins, check-outs, notes, and incidents recorded during reservations."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New entry
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={entries}
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

      <AttendanceEntryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={editingEntry}
        reservations={reservations}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingEntry)}
        onOpenChange={(open) => {
          if (!open) setDeletingEntry(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete attendance entry?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete this{" "}
              <strong>
                {deletingEntry?.type.replace("_", " ")}
              </strong>{" "}
              attendance record. This action cannot be undone.
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
  filters: AttendanceEntryListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <AttendanceEntriesFilters
      initialSearch={filters.search ?? ""}
      initialType={filters.type ?? "all"}
      onLoadingChange={onLoadingChange}
    />
  )
}