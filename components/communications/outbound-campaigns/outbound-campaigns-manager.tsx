"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getOutboundCampaignColumns } from "@/components/communications/outbound-campaigns/outbound-campaigns-columns"
import { OutboundCampaignsFilters } from "@/components/communications/outbound-campaigns/outbound-campaigns-filters"
import { OutboundCampaignFormDialog } from "@/components/communications/outbound-campaigns/outbound-campaign-form-dialog"
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
import type { OutboundCampaignListFilters } from "@/lib/constants/outbound-campaign-filters"
import { deleteOutboundCampaign } from "@/lib/supabase/mutations/outbound-campaigns"
import type { OutboundCampaignRow } from "@/lib/supabase/types"

type OutboundCampaignsManagerProps = {
  campaigns: OutboundCampaignRow[]
  filters: OutboundCampaignListFilters
}

export function OutboundCampaignsManager({
  campaigns,
  filters,
}: OutboundCampaignsManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] =
    useState<OutboundCampaignRow | null>(null)
  const [deletingCampaign, setDeletingCampaign] =
    useState<OutboundCampaignRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingCampaign(null)
    setFormOpen(true)
  }

  function openEdit(campaign: OutboundCampaignRow) {
    setEditingCampaign(campaign)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingCampaign) return

    setIsDeleting(true)

    const result = await deleteOutboundCampaign(
      deletingCampaign.id
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
      description: "Campaign deleted",
      priority: "high",
    })

    setDeletingCampaign(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getOutboundCampaignColumns({
        onEdit: openEdit,
        onDelete: setDeletingCampaign,
      }),
    []
  )

  const emptyMessage =
    filters.search || filters.status !== "all"
      ? "No campaigns match your filters."
      : "No campaigns yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outbound campaigns"
        description="Create and manage outbound customer communication campaigns. Search and status filters run on the server via URL params."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New campaign
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={campaigns}
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

      <OutboundCampaignFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        campaign={editingCampaign}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingCampaign)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingCampaign(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete campaign?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deletingCampaign?.name}</strong>. Any campaign
              contacts linked to this campaign may also be affected
              depending on the database relationship.
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
  filters: OutboundCampaignListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <OutboundCampaignsFilters
      initialSearch={filters.search ?? ""}
      initialStatus={filters.status ?? "all"}
      onLoadingChange={onLoadingChange}
    />
  )
}