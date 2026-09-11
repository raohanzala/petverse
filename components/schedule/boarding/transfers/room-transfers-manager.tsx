"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getRoomTransferColumns } from "./room-transfers-columns"
import { RoomTransfersFilters } from "./room-transfers-filters"
import { RoomTransferFormDialog } from "./room-transfer-form-dialog"
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
import type { RoomTransferListFilters } from "@/lib/constants/room-transfer-filters"
import { deleteRoomTransfer } from "@/lib/supabase/mutations/room-transfers"
import type {
  FacilityResourceRow,
  ReservationRow,
  RoomTransferListRow,
} from "@/lib/supabase/types"

type RoomTransfersManagerProps = {
  transfers: RoomTransferListRow[]
  filters: RoomTransferListFilters
  reservations: ReservationRow[]
  resources: FacilityResourceRow[]
}

export function RoomTransfersManager({
  transfers,
  filters,
  reservations,
  resources,
}: RoomTransfersManagerProps) {
  const router = useRouter()
  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [deletingTransfer, setDeletingTransfer] =
    useState<RoomTransferListRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingTransfer) return

    setIsDeleting(true)

    const result = await deleteRoomTransfer(
      deletingTransfer.id
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
      description: "Room transfer deleted",
      priority: "high",
    })

    setDeletingTransfer(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getRoomTransferColumns({
        onDelete: setDeletingTransfer,
      }),
    []
  )

  const emptyMessage = filters.search
    ? "No room transfers match your search."
    : "No room transfers yet. Create your first transfer to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Room transfers"
        description="Track boarding reservations as they move between rooms and facility resources. Search runs on the server via URL params."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New transfer
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={transfers}
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

      <RoomTransferFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        reservations={reservations}
        resources={resources}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingTransfer)}
        onOpenChange={(open) => {
          if (!open) setDeletingTransfer(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete room transfer?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete this room transfer
              record
              {deletingTransfer?.to_resource?.name ? (
                <>
                  {" "}
                  to{" "}
                  <strong>
                    {deletingTransfer.to_resource.name}
                  </strong>
                </>
              ) : null}
              . If this is the latest transfer for the
              reservation, the reservation's room will be
              restored to the previous resource.
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
  filters: RoomTransferListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <RoomTransfersFilters
      initialSearch={filters.search ?? ""}
      onLoadingChange={onLoadingChange}
    />
  )
}