"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getMessageTemplateColumns } from "@/components/communications/message-templates/message-templates-columns"
import { MessageTemplatesFilters } from "@/components/communications/message-templates/message-templates-filters"
import { MessageTemplateFormDialog } from "@/components/communications/message-templates/message-template-form-dialog"
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
import type { MessageTemplateListFilters } from "@/lib/constants/message-template-filters"
import { deleteMessageTemplate } from "@/lib/supabase/mutations/message-templates"
import type { MessageTemplateRow } from "@/lib/supabase/types"

type MessageTemplatesManagerProps = {
  templates: MessageTemplateRow[]
  filters: MessageTemplateListFilters
}

export function MessageTemplatesManager({
  templates,
  filters,
}: MessageTemplatesManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] =
    useState<MessageTemplateRow | null>(null)
  const [deletingTemplate, setDeletingTemplate] =
    useState<MessageTemplateRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingTemplate(null)
    setFormOpen(true)
  }

  function openEdit(template: MessageTemplateRow) {
    setEditingTemplate(template)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingTemplate) return

    setIsDeleting(true)

    const result = await deleteMessageTemplate(
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
      description: "Message template deleted",
      priority: "high",
    })

    setDeletingTemplate(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getMessageTemplateColumns({
        onEdit: openEdit,
        onDelete: setDeletingTemplate,
      }),
    []
  )

  const emptyMessage =
    filters.search || filters.status !== "all"
      ? "No message templates match your filters."
      : "No message templates yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Message templates"
        description="Create reusable message templates for customer communications and outbound campaigns. Search and status filters run on the server via URL params."
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

      <MessageTemplateFormDialog
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
              Delete message template?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deletingTemplate?.name}</strong>. Any future
              messaging workflows using this template will no longer
              be able to use it.
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
  filters: MessageTemplateListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <MessageTemplatesFilters
      initialSearch={filters.search ?? ""}
      initialStatus={filters.status ?? "all"}
      onLoadingChange={onLoadingChange}
    />
  )
}