"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getServicePackageColumns } from "@/components/catalog/service-packages-columns"
import { ServicePackagesFilters } from "@/components/catalog/service-packages-filters"
import { ServicePackageFormDialog } from "@/components/catalog/service-package-form-dialog"
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
import type { ServicePackageListFilters } from "@/lib/constants/service-package-filters"
import { deleteServicePackage } from "@/lib/supabase/mutations/service-packages"
import type { ServicePackageRow } from "@/lib/supabase/types"

type ServicePackagesManagerProps = {
  packages: ServicePackageRow[]
  filters: ServicePackageListFilters
}

export function ServicePackagesManager({
  packages,
  filters,
}: ServicePackagesManagerProps) {
  const router = useRouter()
  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingPackage, setEditingPackage] =
    useState<ServicePackageRow | null>(null)
  const [deletingPackage, setDeletingPackage] =
    useState<ServicePackageRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingPackage(null)
    setFormOpen(true)
  }

  function openEdit(servicePackage: ServicePackageRow) {
    setEditingPackage(servicePackage)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingPackage) return

    setIsDeleting(true)
    const result = await deleteServicePackage(
      deletingPackage.id
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
      description: "Package deleted",
      priority: "high",
    })
    setDeletingPackage(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getServicePackageColumns({
        onEdit: openEdit,
        onDelete: setDeletingPackage,
      }),
    []
  )

  const emptyMessage =
    filters.search ||
    filters.stepMode !== "all" ||
    filters.status !== "all"
      ? "No packages match your filters."
      : "No packages yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service packages"
        description="Create packages that combine multiple service steps for booking and staff workflows. Search and filters run on the server via URL params."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New package
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={packages}
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

      <ServicePackageFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        servicePackage={editingPackage}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingPackage)}
        onOpenChange={(open) => {
          if (!open) setDeletingPackage(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete package?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deletingPackage?.name}</strong>.
              Any package steps linked to this package may
              also be affected.
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
  filters: ServicePackageListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <ServicePackagesFilters
      initialSearch={filters.search ?? ""}
      initialStepMode={filters.stepMode ?? "all"}
      initialStatus={filters.status ?? "all"}
      onLoadingChange={onLoadingChange}
    />
  )
}