"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { toast } from "@/components/ui/toast"

import { getBusinessTargetColumns } from "./business-targets-columns"
import { BusinessTargetsFilters } from "./business-targets-filters"
import { BusinessTargetFormDialog } from "./business-target-form-dialog"

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

import type { BusinessTargetListFilters } from "@/lib/constants/business-target-filters"
import { deleteBusinessTarget } from "@/lib/supabase/mutations/business-targets"
import type { BusinessTargetRow } from "@/lib/supabase/types"

type BusinessTargetsManagerProps = {
  targets: BusinessTargetRow[]
  filters: BusinessTargetListFilters
}

export function BusinessTargetsManager({
  targets,
  filters,
}: BusinessTargetsManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] =
    useState(false)

  const [formOpen, setFormOpen] =
    useState(false)

  const [editingTarget, setEditingTarget] =
    useState<BusinessTargetRow | null>(null)

  const [deletingTarget, setDeletingTarget] =
    useState<BusinessTargetRow | null>(null)

  const [isDeleting, setIsDeleting] =
    useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingTarget(null)
    setFormOpen(true)
  }

  function openEdit(target: BusinessTargetRow) {
    setEditingTarget(target)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingTarget) return

    setIsDeleting(true)

    const result = await deleteBusinessTarget(
      deletingTarget.id
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
      description: "Business target deleted",
      priority: "high",
    })

    setDeletingTarget(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getBusinessTargetColumns({
        onEdit: openEdit,
        onDelete: setDeletingTarget,
      }),
    []
  )

  const emptyMessage =
    filters.search ||
    filters.period !== "all"
      ? "No business targets match your filters."
      : "No business targets yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business targets"
        description="Define measurable targets for revenue, appointments, clients, and other business metrics."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New target
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={targets}
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

      <BusinessTargetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        target={editingTarget}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTarget(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete business target?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete the{" "}
              <strong>
                {deletingTarget?.metric_key}
              </strong>{" "}
              target for the selected period.
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
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/**
 * Server-driven filters rendered in the DataTable toolbar row.
 */
function ServerFiltersToolbar({
  filters,
  onLoadingChange,
}: {
  filters: BusinessTargetListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <BusinessTargetsFilters
      initialSearch={filters.search ?? ""}
      initialPeriod={filters.period ?? "all"}
      onLoadingChange={onLoadingChange}
    />
  )
}