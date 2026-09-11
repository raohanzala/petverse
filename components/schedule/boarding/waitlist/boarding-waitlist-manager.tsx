"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getBoardingWaitlistColumns } from "./boarding-waitlist-columns"
import { BoardingWaitlistFilters } from "./boarding-waitlist-filters"
import { BoardingWaitlistFormDialog } from "./boarding-waitlist-form-dialog"
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
import type { BoardingWaitlistListFilters } from "@/lib/constants/boarding-waitlist-filters"
import { deleteBoardingWaitlist } from "@/lib/supabase/mutations/boarding-waitlist"
import type {
  BoardingWaitlistListRow,
  OwnerRow,
  PetRow,
} from "@/lib/supabase/types"

type BoardingWaitlistManagerProps = {
  entries: BoardingWaitlistListRow[]
  filters: BoardingWaitlistListFilters
  pets: PetRow[]
  owners: OwnerRow[]
}

export function BoardingWaitlistManager({
  entries,
  filters,
  pets,
  owners,
}: BoardingWaitlistManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const [editingEntry, setEditingEntry] =
    useState<BoardingWaitlistListRow | null>(null)

  const [deletingEntry, setDeletingEntry] =
    useState<BoardingWaitlistListRow | null>(null)

  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingEntry(null)
    setFormOpen(true)
  }

  function openEdit(entry: BoardingWaitlistListRow) {
    setEditingEntry(entry)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingEntry) return

    setIsDeleting(true)

    const result = await deleteBoardingWaitlist(
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
      description: "Waitlist entry deleted",
      priority: "high",
    })

    setDeletingEntry(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getBoardingWaitlistColumns({
        onEdit: openEdit,
        onDelete: setDeletingEntry,
      }),
    []
  )

  const emptyMessage = filters.search
    ? "No waitlist entries match your filters."
    : "No waitlist entries yet. Add a pet to the waitlist when boarding availability is full."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Boarding waitlist"
        description="Manage pets waiting for boarding availability. Search by pet or owner."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New waitlist entry
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

      <BoardingWaitlistFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={editingEntry}
        pets={pets}
        owners={owners}
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
              Delete waitlist entry?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently remove{" "}
              <strong>
                {deletingEntry?.pet?.name ??
                  "this pet"}
              </strong>{" "}
              from the boarding waitlist.
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
  filters: BoardingWaitlistListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <BoardingWaitlistFilters
      initialSearch={filters.search ?? ""}
      onLoadingChange={onLoadingChange}
    />
  )
}