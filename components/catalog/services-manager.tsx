"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getServiceColumns } from "@/components/catalog/services-columns"
import { ServicesFilters } from "@/components/catalog/services-filters"
import { ServiceFormDialog } from "@/components/catalog/service-form-dialog"
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

import type { ServiceListFilters } from "@/lib/constants/service-filters"
import { deleteService } from "@/lib/supabase/mutations/services"
import type {
  ServiceCategoryRow,
  ServiceListRow,
} from "@/lib/supabase/types"

type ServicesManagerProps = {
  services: ServiceListRow[]
  categories: ServiceCategoryRow[]
  filters: ServiceListFilters
}

export function ServicesManager({
  services,
  categories,
  filters,
}: ServicesManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] = useState(false)

  const [formOpen, setFormOpen] = useState(false)

  const [editingService, setEditingService] =
    useState<ServiceListRow | null>(null)

  const [deletingService, setDeletingService] =
    useState<ServiceListRow | null>(null)

  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingService(null)
    setFormOpen(true)
  }

  function openEdit(service: ServiceListRow) {
    setEditingService(service)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingService) return

    setIsDeleting(true)

    const result = await deleteService(deletingService.id)

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
      description: "Service deleted",
      priority: "high",
    })

    setDeletingService(null)

    refreshList()
  }

  const columns = useMemo(
    () =>
      getServiceColumns({
        onEdit: openEdit,
        onDelete: setDeletingService,
      }),
    []
  )

  const hasFilters =
    Boolean(filters.search) ||
    Boolean(filters.categoryId) ||
    filters.kind !== "all" ||
    filters.status !== "all" ||
    filters.visibility !== "all"

  const emptyMessage = hasFilters
    ? "No services match your filters."
    : "No services yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Manage the services available in your catalog, booking flow, and admin."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New service
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={services}
        pageSize={10}
        isLoading={isFiltering}
        enableColumnVisibility
        emptyMessage={emptyMessage}
        toolbar={
          <ServerFiltersToolbar
            filters={filters}
            categories={categories}
            onLoadingChange={setIsFiltering}
          />
        }
      />

      <ServiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        service={editingService}
        categories={categories}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingService)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingService(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete service?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deletingService?.name}</strong>.
              This action cannot be undone.
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
  categories,
  onLoadingChange,
}: {
  filters: ServiceListFilters
  categories: ServiceCategoryRow[]
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <ServicesFilters
      initialSearch={filters.search ?? ""}
      initialCategoryId={filters.categoryId}
      initialKind={filters.kind ?? "all"}
      initialStatus={filters.status ?? "all"}
      initialVisibility={filters.visibility ?? "all"}
      categories={categories}
      onLoadingChange={onLoadingChange}
    />
  )
}