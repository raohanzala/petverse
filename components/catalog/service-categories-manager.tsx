"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getServiceCategoryColumns } from "@/components/catalog/service-categories-columns"
import { ServiceCategoriesFilters } from "@/components/catalog/service-categories-filters"
import { ServiceCategoryFormDialog } from "@/components/catalog/service-category-form-dialog"
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
import type { ServiceCategoryListFilters } from "@/lib/constants/service-category-filters"
import { deleteServiceCategory } from "@/lib/supabase/mutations/service-categories"
import type { ServiceCategoryRow } from "@/lib/supabase/types"

type ServiceCategoriesManagerProps = {
  categories: ServiceCategoryRow[]
  filters: ServiceCategoryListFilters
}

export function ServiceCategoriesManager({
  categories,
  filters,
}: ServiceCategoriesManagerProps) {
  const router = useRouter()
  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] =
    useState<ServiceCategoryRow | null>(null)
  const [deletingCategory, setDeletingCategory] =
    useState<ServiceCategoryRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingCategory(null)
    setFormOpen(true)
  }

  function openEdit(category: ServiceCategoryRow) {
    setEditingCategory(category)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingCategory) return

    setIsDeleting(true)
    const result = await deleteServiceCategory(deletingCategory.id)
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
      description: "Category deleted",
      priority: "high",
    })
    setDeletingCategory(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getServiceCategoryColumns({
        onEdit: openEdit,
        onDelete: setDeletingCategory,
      }),
    []
  )

  const emptyMessage =
    filters.search || filters.status !== "all"
      ? "No categories match your filters."
      : "No categories yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service categories"
        description="Organize your catalog into groups shown in booking and admin. Search and status filters run on the server via URL params."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New category
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={categories}
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

      <ServiceCategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deletingCategory?.name}</strong>. Services linked to this
              category will keep their data but lose the category reference.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
  filters: ServiceCategoryListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <ServiceCategoriesFilters
      initialSearch={filters.search ?? ""}
      initialStatus={filters.status ?? "all"}
      onLoadingChange={onLoadingChange}
    />
  )
}
