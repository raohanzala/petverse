"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getBoardingInstructionsColumns } from "./boarding-instructions-columns"
import { BoardingInstructionsFilters } from "./boarding-instructions-filters"
import { BoardingInstructionsFormDialog } from "./boarding-instructions-form-dialog"
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
import type { BoardingInstructionsListFilters } from "@/lib/constants/boarding-instructions-filters"
import { deleteBoardingInstructions } from "@/lib/supabase/mutations/boarding-instructions"
import type {
  PetBoardingInstructionsListRow,
  PetRow,
  ReservationRow,
} from "@/lib/supabase/types"

type BoardingInstructionsManagerProps = {
  entries: PetBoardingInstructionsListRow[]
  filters: BoardingInstructionsListFilters
  pets: PetRow[]
  reservations: ReservationRow[]
}

export function BoardingInstructionsManager({
  entries,
  filters,
  pets,
  reservations,
}: BoardingInstructionsManagerProps) {
  const router = useRouter()
  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const [
    editingInstructions,
    setEditingInstructions,
  ] = useState<PetBoardingInstructionsListRow | null>(null)

  const [
    deletingInstructions,
    setDeletingInstructions,
  ] = useState<PetBoardingInstructionsListRow | null>(null)

  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingInstructions(null)
    setFormOpen(true)
  }

  function openEdit(
    instructions: PetBoardingInstructionsListRow
  ) {
    setEditingInstructions(instructions)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingInstructions) return

    setIsDeleting(true)

    const result =
      await deleteBoardingInstructions(
        deletingInstructions.id
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
      description: "Boarding instructions deleted",
      priority: "high",
    })

    setDeletingInstructions(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getBoardingInstructionsColumns({
        onEdit: openEdit,
        onDelete: setDeletingInstructions,
      }),
    []
  )

  const emptyMessage = filters.search
    ? "No boarding instructions match your search."
    : "No boarding instructions yet. Create the first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Boarding instructions"
        description="Manage feeding, medication, and behavior instructions for boarding pets."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New instructions
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

      <BoardingInstructionsFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        instructions={editingInstructions}
        pets={pets}
        reservations={reservations}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingInstructions)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingInstructions(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete boarding instructions?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete the
              boarding instructions for{" "}
              <strong>
                {deletingInstructions?.pet?.name ??
                  "this pet"}
              </strong>
              .
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
  filters: BoardingInstructionsListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <BoardingInstructionsFilters
      initialSearch={filters.search ?? ""}
      onLoadingChange={onLoadingChange}
    />
  )
}