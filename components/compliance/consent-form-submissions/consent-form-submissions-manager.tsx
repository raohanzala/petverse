"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getConsentFormSubmissionColumns } from "@/components/compliance/consent-form-submissions/consent-form-submissions-columns"
import { ConsentFormSubmissionsFilters } from "@/components/compliance/consent-form-submissions/consent-form-submissions-filters"
import { ConsentFormSubmissionFormDialog } from "@/components/compliance/consent-form-submissions/consent-form-submission-form-dialog"
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

import type { ConsentFormSubmissionListFilters } from "@/lib/constants/consent-form-submission-filters"
import { deleteConsentFormSubmission } from "@/lib/supabase/mutations/consent-form-submissions"
import type {
  ConsentFormSubmissionAppointmentOption,
  ConsentFormSubmissionOwnerOption,
  ConsentFormSubmissionPetOption,
  ConsentFormSubmissionTemplateOption,
  ConsentFormSubmissionWithRelations,
} from "@/lib/supabase/types"

type ConsentFormSubmissionsManagerProps = {
  submissions: ConsentFormSubmissionWithRelations[]
  filters: ConsentFormSubmissionListFilters
  templates: ConsentFormSubmissionTemplateOption[]
  owners: ConsentFormSubmissionOwnerOption[]
  pets: ConsentFormSubmissionPetOption[]
  appointments: ConsentFormSubmissionAppointmentOption[]
}

export function ConsentFormSubmissionsManager({
  submissions,
  filters,
  templates,
  owners,
  pets,
  appointments,
}: ConsentFormSubmissionsManagerProps) {
  const router = useRouter()

  const [
    isFiltering,
    setIsFiltering,
  ] = useState(false)

  const [
    formOpen,
    setFormOpen,
  ] = useState(false)

  const [
    editingSubmission,
    setEditingSubmission,
  ] =
    useState<ConsentFormSubmissionWithRelations | null>(
      null
    )

  const [
    deletingSubmission,
    setDeletingSubmission,
  ] =
    useState<ConsentFormSubmissionWithRelations | null>(
      null
    )

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingSubmission(null)
    setFormOpen(true)
  }

  function openEdit(
    submission: ConsentFormSubmissionWithRelations
  ) {
    setEditingSubmission(
      submission
    )
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingSubmission) {
      return
    }

    setIsDeleting(true)

    const result =
      await deleteConsentFormSubmission(
        deletingSubmission.id
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
      description:
        "Consent form submission deleted",
      priority: "high",
    })

    setDeletingSubmission(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getConsentFormSubmissionColumns({
        onEdit: openEdit,
        onDelete:
          setDeletingSubmission,
      }),
    []
  )

  const emptyMessage =
    filters.search && "No consent form submissions yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consent form submissions"
        description="Manage signed consent forms submitted for owners, pets, and appointments. Search and filters run on the server via URL params."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New submission
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={submissions}
        pageSize={10}
        isLoading={isFiltering}
        enableColumnVisibility
        emptyMessage={
          emptyMessage
        }
        toolbar={
          <ServerFiltersToolbar
            filters={filters}
            onLoadingChange={
              setIsFiltering
            }
          />
        }
      />

      <ConsentFormSubmissionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        submission={
          editingSubmission
        }
        templates={templates}
        owners={owners}
        pets={pets}
        appointments={appointments}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(
          deletingSubmission
        )}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingSubmission(
              null
            )
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete consent form submission?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete
              the signed consent submission for{" "}
              <strong>
                {
                  deletingSubmission
                    ?.pet?.name
                }
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

function ServerFiltersToolbar({
  filters,
  onLoadingChange,
}: {
  filters: ConsentFormSubmissionListFilters
  onLoadingChange: (
    loading: boolean
  ) => void
}) {
  return (
    <ConsentFormSubmissionsFilters
      initialSearch={
        filters.search ?? ""
      }
      onLoadingChange={
        onLoadingChange
      }
    />
  )
}