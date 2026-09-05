"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getServicePackageStepColumns } from "@/components/catalog/service-package-step-columns"
import { ServicePackageStepsFilters } from "./service-package-steps-filters"
import { ServicePackageStepFormDialog } from "./service-package-step-form-dialog"
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
import type { ServicePackageStepListFilters } from "@/lib/constants/service-package-step-filters"
import { deleteServicePackageStep } from "@/lib/supabase/mutations/service-package-steps"
import type { ServicePackageStepListRow } from "@/lib/supabase/types"

type ServicePackageStepsManagerProps = {
  steps: ServicePackageStepListRow[]
  filters: ServicePackageStepListFilters
  packages: {
    id: number
    name: string
  }[]
  services: {
    id: string
    name: string
  }[]
}

export function ServicePackageStepsManager({
  steps,
  filters,
  packages,
  services,
}: ServicePackageStepsManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const [editingStep, setEditingStep] =
    useState<ServicePackageStepListRow | null>(null)

  const [deletingStep, setDeletingStep] =
    useState<ServicePackageStepListRow | null>(null)

  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingStep(null)
    setFormOpen(true)
  }

  function openEdit(step: ServicePackageStepListRow) {
    setEditingStep(step)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingStep) return

    setIsDeleting(true)

    const result = await deleteServicePackageStep(
      deletingStep.id
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
      description: "Package step deleted",
      priority: "high",
    })

    setDeletingStep(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getServicePackageStepColumns({
        onEdit: openEdit,
        onDelete: setDeletingStep,
      }),
    []
  )

  const emptyMessage =
    filters.search ||
    filters.packageId !== undefined ||
    filters.serviceId
      ? "No package steps match your filters."
      : "No package steps yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Package steps"
        description="Build service packages by defining the services included in each package and their execution order."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New package step
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={steps}
        pageSize={10}
        isLoading={isFiltering}
        enableColumnVisibility
        emptyMessage={emptyMessage}
        toolbar={
          <ServerFiltersToolbar
            filters={filters}
            packages={packages}
            services={services}
            onLoadingChange={setIsFiltering}
          />
        }
      />

      <ServicePackageStepFormDialog
        open={formOpen}
        services={services}
        packages={packages}
        onOpenChange={setFormOpen}
        step={editingStep}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingStep)}
        onOpenChange={(open) => {
          if (!open) setDeletingStep(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete package step?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently remove the{" "}
              <strong>
                {deletingStep?.service.name}
              </strong>{" "}
              step from{" "}
              <strong>
                {deletingStep?.package.name}
              </strong>
              .
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
  packages,
  services,
  onLoadingChange,
}: {
  filters: ServicePackageStepListFilters
  packages: {
    id: number
    name: string
  }[]
  services: {
    id: string
    name: string
  }[]
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <ServicePackageStepsFilters
      initialSearch={filters.search ?? ""}
      initialPackageId={filters.packageId}
      initialServiceId={filters.serviceId}
      packages={packages}
      services={services}
      onLoadingChange={onLoadingChange}
    />
  )
}