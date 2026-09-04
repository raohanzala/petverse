"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { getOwnerColumns } from "./owners-columns"
import { OwnersFilters } from "./owners-filters"
import { OwnerFormDialog } from "./owner-form-dialog"
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
import type { OwnerListFilters } from "@/lib/constants/owner-filters"
import { deleteOwner } from "@/lib/supabase/mutations/owners"
import type { OwnerRow } from "@/lib/supabase/types"

type OwnersManagerProps = {
  owners: OwnerRow[]
  filters: OwnerListFilters
}

export function OwnersManager({
  owners,
  filters,
}: OwnersManagerProps) {
  const router = useRouter()
  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingOwner, setEditingOwner] =
    useState<OwnerRow | null>(null)
  const [deletingOwner, setDeletingOwner] =
    useState<OwnerRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingOwner(null)
    setFormOpen(true)
  }

  function openEdit(owner: OwnerRow) {
    setEditingOwner(owner)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingOwner) return

    setIsDeleting(true)

    const result = await deleteOwner(deletingOwner.id)

    setIsDeleting(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success("Owner deleted")
    setDeletingOwner(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getOwnerColumns({
        onEdit: openEdit,
        onDelete: setDeletingOwner,
      }),
    []
  )

  const emptyMessage = filters.search
    ? "No owners match your search."
    : "No owners yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owners"
        description="Manage pet owners and their contact information. Search runs on the server via URL params."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New owner
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={owners}
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

      <OwnerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        owner={editingOwner}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingOwner)}
        onOpenChange={(open) => {
          if (!open) setDeletingOwner(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete owner?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deletingOwner?.name}</strong>.
              Any pets or appointments linked to this owner
              may be affected.
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
  filters: OwnerListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <OwnersFilters
      initialSearch={filters.search ?? ""}
      onLoadingChange={onLoadingChange}
    />
  )
}