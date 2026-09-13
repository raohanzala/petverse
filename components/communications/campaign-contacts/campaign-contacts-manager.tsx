"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getCampaignContactColumns } from "@/components/communications/campaign-contacts/campaign-contacts-columns"
import { CampaignContactsFilters } from "@/components/communications/campaign-contacts/campaign-contacts-filters"
import { CampaignContactFormDialog } from "@/components/communications/campaign-contacts/campaign-contact-form-dialog"
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
import type { CampaignContactListFilters } from "@/lib/constants/campaign-contact-filters"
import { deleteCampaignContact } from "@/lib/supabase/mutations/campaign-contacts"
import type {
  CampaignContactRow,
  CampaignContactWithRelations,
} from "@/lib/supabase/types"

type CampaignContactsManagerProps = {
  contacts: CampaignContactWithRelations[]
  filters: CampaignContactListFilters
  campaigns: {
    id: string
    name: string
  }[]
  owners: {
    id: string
    name: string
  }[]
}

export function CampaignContactsManager({
  contacts,
  filters,
  campaigns,
  owners,
}: CampaignContactsManagerProps) {
  const router = useRouter()

  const [isFiltering, setIsFiltering] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingContact, setEditingContact] =
    useState<CampaignContactRow | null>(null)
  const [deletingContact, setDeletingContact] =
    useState<CampaignContactRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function refreshList() {
    router.refresh()
  }

  function openCreate() {
    setEditingContact(null)
    setFormOpen(true)
  }

  function openEdit(contact: CampaignContactRow) {
    setEditingContact(contact)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deletingContact) return

    setIsDeleting(true)

    const result = await deleteCampaignContact(
      deletingContact.id
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
      description: "Campaign contact deleted",
      priority: "high",
    })

    setDeletingContact(null)
    refreshList()
  }

  const columns = useMemo(
    () =>
      getCampaignContactColumns({
        onEdit: openEdit,
        onDelete: setDeletingContact,
      }),
    []
  )

  const emptyMessage =
    filters.search || filters.status !== "all"
      ? "No campaign contacts match your filters."
      : "No campaign contacts yet. Create your first one to get started."

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaign contacts"
        description="Manage campaign recipients and track their delivery status. Search and status filters run on the server via URL params."
        actions={
          <Button onClick={openCreate}>
            <Plus />
            New contact
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={contacts}
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

      <CampaignContactFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={editingContact}
        campaigns={campaigns}
        owners={owners}
        onSuccess={refreshList}
      />

      <AlertDialog
        open={Boolean(deletingContact)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingContact(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete campaign contact?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently remove this owner from the campaign.
              Their campaign delivery record will be deleted.
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
  filters: CampaignContactListFilters
  onLoadingChange: (loading: boolean) => void
}) {
  return (
    <CampaignContactsFilters
      initialSearch={filters.search ?? ""}
      initialStatus={filters.status ?? "all"}
      onLoadingChange={onLoadingChange}
    />
  )
}