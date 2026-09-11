"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getFacilityResourceColumns } from "./facility-resources-columns"
import { FacilityResourcesFilters } from "./facility-resources-filters"
import { FacilityResourceFormDialog } from "./facility-resource-form-dialog"
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
import type { FacilityResourceListFilters } from "@/lib/constants/facility-resources-filters"
import { deleteFacilityResource } from "@/lib/supabase/mutations/facility-resources"
import type { FacilityResourceRow } from "@/lib/supabase/types"

type FacilityResourcesManagerProps = {
  resources: FacilityResourceRow[]
  filters: FacilityResourceListFilters
}

export function FacilityResourcesManager({
  resources,
  filters,
}: FacilityResourcesManagerProps) {
  const router = useRouter()
  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingResource, setEditingResource] =
    useState<FacilityResourceRow | null>(null)
  const [deletingResource, setDeletingResource] =
    useState<FacilityResourceRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingResource(null)
    setFormOpen(true)
  }

  function openEdit(resource: FacilityResourceRow) {
    setEditingResource(resource)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingResource) return

    setIsDeleting(true)

    const result = await deleteFacilityResource(deletingResource.id)

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
      description: "Facility resource deleted",
      priority: "high",
    })

    setDeletingResource(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getFacilityResourceColumns({
        onEdit: openEdit,
        onDelete: setDeletingResource,
      }),
    []
  )

  const emptyMessage =
    filters.search ||
    filters.status !== "all" ||
    filters.type !== "all"
      ? "No facility resources match your filters."
      : "No facility resources yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facility resources"
        description="Manage kennels, suites, playrooms, and other facility resources used by your team."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New resource
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={resources}
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

      <FacilityResourceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        resource={editingResource}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingResource)}
        onOpenChange={(open) => {
          if (!open) setDeletingResource(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete facility resource?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deletingResource?.name}</strong>.
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
  filters: FacilityResourceListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <FacilityResourcesFilters
      initialSearch={filters.search ?? ""}
      initialStatus={filters.status ?? "all"}
      initialType={filters.type ?? "all"}
      onLoadingChange={onLoadingChange}
    />
  )
}