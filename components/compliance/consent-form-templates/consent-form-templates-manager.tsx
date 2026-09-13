"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getConsentFormTemplateColumns } from "@/components/compliance/consent-form-templates/consent-form-templates-columns"
import { ConsentFormTemplatesFilters } from "@/components/compliance/consent-form-templates/consent-form-templates-filters"
import { ConsentFormTemplateFormDialog } from "@/components/compliance/consent-form-templates/consent-form-template-form-dialog"
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
import type { ConsentFormTemplateListFilters } from "@/lib/constants/consent-form-template-filters"
import { deleteConsentFormTemplate } from "@/lib/supabase/mutations/consent-form-templates"
import type { ConsentFormTemplateRow } from "@/lib/supabase/types"

type ConsentFormTemplatesManagerProps = {
  templates: ConsentFormTemplateRow[]
  filters: ConsentFormTemplateListFilters
}

export function ConsentFormTemplatesManager({
  templates,
  filters,
}: ConsentFormTemplatesManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] =
    useState(false)

  const [formOpen, setFormOpen] =
    useState(false)

  const [editingTemplate, setEditingTemplate] =
    useState<ConsentFormTemplateRow | null>(
      null
    )

  const [deletingTemplate, setDeletingTemplate] =
    useState<ConsentFormTemplateRow | null>(
      null
    )

  const [isDeleting, setIsDeleting] =
    useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingTemplate(null)
    setFormOpen(true)
  }

  function openEdit(
    template: ConsentFormTemplateRow
  ) {
    setEditingTemplate(template)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingTemplate) return

    setIsDeleting(true)

    const result =
      await deleteConsentFormTemplate(
        deletingTemplate.id
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
        "Consent form template deleted",
      priority: "high",
    })

    setDeletingTemplate(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getConsentFormTemplateColumns({
        onEdit: openEdit,
        onDelete: setDeletingTemplate,
      }),
    []
  )

  const emptyMessage =
    filters.search ||
    filters.status !== "all"
      ? "No consent form templates match your filters."
      : "No consent form templates yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consent form templates"
        description="Create reusable consent form templates for services and appointments. Search and status filters run on the server via URL params."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New template
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={templates}
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

      <ConsentFormTemplateFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        template={editingTemplate}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingTemplate)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTemplate(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete consent form template?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>
                {deletingTemplate?.name}
              </strong>
              . Any consent form configuration
              linked to this template may also be
              affected.
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

/** Server-driven filters rendered in the DataTable toolbar row. */
function ServerFiltersToolbar({
  filters,
  onLoadingChange,
}: {
  filters: ConsentFormTemplateListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <ConsentFormTemplatesFilters
      initialSearch={filters.search ?? ""}
      initialStatus={
        filters.status ?? "all"
      }
      onLoadingChange={onLoadingChange}
    />
  )
}