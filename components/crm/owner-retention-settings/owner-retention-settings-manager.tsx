"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getOwnerRetentionSettingsColumns } from "@/components/crm/owner-retention-settings/owner-retention-settings-columns"
import { OwnerRetentionSettingsFilters } from "@/components/crm/owner-retention-settings/owner-retention-settings-filters"
import { OwnerRetentionSettingsFormDialog } from "@/components/crm/owner-retention-settings/owner-retention-settings-form-dialog"
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
import type {
  OwnerRetentionSettingsListFilters,
} from "@/lib/constants/owner-retention-settings-filters"
import {
  deleteOwnerRetentionSettings,
} from "@/lib/supabase/mutations/owner-retention-settings"
import type {
  OwnerRetentionSettingsOwnerOption,
  OwnerRetentionSettingsWithOwner,
} from "@/lib/supabase/types"

type OwnerRetentionSettingsManagerProps = {
  settings: OwnerRetentionSettingsWithOwner[]
  filters: OwnerRetentionSettingsListFilters
  owners: OwnerRetentionSettingsOwnerOption[]
}

export function OwnerRetentionSettingsManager({
  settings,
  filters,
  owners,
}: OwnerRetentionSettingsManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] =
    useState(false)

  const [formOpen, setFormOpen] =
    useState(false)

  const [
    editingSettings,
    setEditingSettings,
  ] =
    useState<OwnerRetentionSettingsWithOwner | null>(
      null
    )

  const [
    deletingSettings,
    setDeletingSettings,
  ] =
    useState<OwnerRetentionSettingsWithOwner | null>(
      null
    )

  const [isDeleting, setIsDeleting] =
    useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingSettings(null)
    setFormOpen(true)
  }

  function openEdit(
    row: OwnerRetentionSettingsWithOwner
  ) {
    setEditingSettings(row)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingSettings) return

    setIsDeleting(true)

    const result =
      await deleteOwnerRetentionSettings(
        deletingSettings.id
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
        "Retention settings deleted",
      priority: "high",
    })

    setDeletingSettings(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getOwnerRetentionSettingsColumns({
        onEdit: openEdit,
        onDelete: setDeletingSettings,
      }),
    []
  )

  const emptyMessage =
    filters.search ||
    filters.filter !== "all"
      ? "No retention settings match your filters."
      : "No retention settings yet. Create settings for your first owner to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owner retention settings"
        description="Configure lapsed-owner timing and re-engagement preferences for your clients."
        actions={
          <Button
            onClick={openCreate}
          >
            <Plus />
            New settings
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={settings}
        pageSize={10}
        isLoading={isFiltering}
        enableColumnVisibility
        emptyMessage={emptyMessage}
        toolbar={
          <ServerFiltersToolbar
            filters={filters}
            onLoadingChange={
              setIsFiltering
            }
          />
        }
      />

      <OwnerRetentionSettingsFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        settings={editingSettings}
        owners={owners}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(
          deletingSettings
        )}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingSettings(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete retention settings?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete
              the retention settings for{" "}
              <strong>
                {
                  deletingSettings?.owner
                    ?.name
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
  filters: OwnerRetentionSettingsListFilters
  onLoadingChange: (
    loading: boolean
  ) => void
}) {
  return (
    <OwnerRetentionSettingsFilters
      initialSearch={
        filters.search ?? ""
      }
      initialFilter={
        filters.filter ?? "all"
      }
      onLoadingChange={
        onLoadingChange
      }
    />
  )
}