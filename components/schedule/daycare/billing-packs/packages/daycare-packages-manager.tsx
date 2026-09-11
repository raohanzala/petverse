"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getDaycarePackageColumns } from "./daycare-packages-columns"
import { DaycarePackageFormDialog } from "./daycare-package-form-dialog"
import { DaycarePackagesFilters } from "./daycare-packages-filters"
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
import type { DaycarePackageListFilters } from "@/lib/constants/daycare-billing-filters"
import { deleteDaycarePackage } from "@/lib/supabase/mutations/daycare-packages"
import type { DaycarePackageRow } from "@/lib/supabase/types"

type DaycarePackagesManagerProps = {
  packages: DaycarePackageRow[]
  filters: DaycarePackageListFilters
}

export function DaycarePackagesManager({
  packages,
  filters,
}: DaycarePackagesManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingPackage, setEditingPackage] =
    useState<DaycarePackageRow | null>(null)
  const [deletingPackage, setDeletingPackage] =
    useState<DaycarePackageRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingPackage(null)
    setFormOpen(true)
  }

  function openEdit(daycarePackage: DaycarePackageRow) {
    setEditingPackage(daycarePackage)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingPackage) return

    setIsDeleting(true)

    const result = await deleteDaycarePackage(deletingPackage.id)

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
      description: "Daycare package deleted",
      priority: "high",
    })

    setDeletingPackage(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getDaycarePackageColumns({
        onEdit: openEdit,
        onDelete: setDeletingPackage,
      }),
    []
  )

  const emptyMessage =
    filters.search || filters.status !== "all"
      ? "No daycare packages match your filters."
      : "No daycare packages yet. Create your first package to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daycare packages"
        description="Create visit packages that customers can purchase for daycare sessions."
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

      <DaycarePackageFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        package={editingPackage}
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
              Delete daycare package?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deletingPackage?.name}</strong>.
              Packages that are already assigned to customer wallets
              cannot be deleted.
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
  filters: DaycarePackageListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <DaycarePackagesFilters
      initialSearch={filters.search ?? ""}
      initialStatus={filters.status ?? "all"}
      onLoadingChange={onLoadingChange}
    />
  )
}