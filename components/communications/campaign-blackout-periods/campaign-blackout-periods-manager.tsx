"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getCampaignBlackoutPeriodColumns } from "@/components/communications/campaign-blackout-periods/campaign-blackout-periods-columns"
import { CampaignBlackoutPeriodsFilters } from "@/components/communications/campaign-blackout-periods/campaign-blackout-periods-filters"
import { CampaignBlackoutPeriodFormDialog } from "@/components/communications/campaign-blackout-periods/campaign-blackout-period-form-dialog"
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
import type { CampaignBlackoutPeriodListFilters } from "@/lib/constants/campaign-blackout-period-filters"
import { deleteCampaignBlackoutPeriod } from "@/lib/supabase/mutations/campaign-blackout-periods"
import type { CampaignBlackoutPeriodRow } from "@/lib/supabase/types"

type CampaignBlackoutPeriodsManagerProps = {
  periods: CampaignBlackoutPeriodRow[]
  filters: CampaignBlackoutPeriodListFilters
  campaigns: {
    id: string
    name: string
  }[]
}

export function CampaignBlackoutPeriodsManager({
  periods,
  filters,
  campaigns,
}: CampaignBlackoutPeriodsManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingPeriod, setEditingPeriod] =
    useState<CampaignBlackoutPeriodRow | null>(null)
  const [deletingPeriod, setDeletingPeriod] =
    useState<CampaignBlackoutPeriodRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingPeriod(null)
    setFormOpen(true)
  }

  function openEdit(period: CampaignBlackoutPeriodRow) {
    setEditingPeriod(period)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingPeriod) return

    setIsDeleting(true)

    const result = await deleteCampaignBlackoutPeriod(
      deletingPeriod.id
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
      description: "Blackout period deleted",
      priority: "high",
    })

    setDeletingPeriod(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getCampaignBlackoutPeriodColumns({
        onEdit: openEdit,
        onDelete: setDeletingPeriod,
        campaigns: campaigns
      }),
    []
  )

  const emptyMessage = filters.search
    ? "No blackout periods match your filters."
    : "No blackout periods yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaign blackout periods"
        description="Prevent outbound campaigns from sending during specific time periods. Search filters run on the server via URL params."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New blackout period
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={periods}
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

      <CampaignBlackoutPeriodFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        period={editingPeriod}
        campaigns={campaigns}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingPeriod)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingPeriod(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete blackout period?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete this campaign blackout
              period. The campaign will no longer be blocked during
              this time.
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
  filters: CampaignBlackoutPeriodListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <CampaignBlackoutPeriodsFilters
      initialSearch={filters.search ?? ""}
      onLoadingChange={onLoadingChange}
    />
  )
}