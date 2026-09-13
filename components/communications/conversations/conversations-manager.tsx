"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "@/components/ui/toast"

import { getConversationColumns } from "@/components/communications/conversations/conversations-columns"
import { ConversationsFilters } from "@/components/communications/conversations/conversations-filters"
import { ConversationFormDialog } from "@/components/communications/conversations/conversation-form-dialog"
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
import type { ConversationListFilters } from "@/lib/constants/conversations-filters"
import { deleteConversation } from "@/lib/supabase/mutations/conversations"
import type { ConversationEmployeeOption, ConversationRow, OwnerRow } from "@/lib/supabase/types"

type ConversationsManagerProps = {
    conversations: ConversationRow[]
    filters: ConversationListFilters
    owners: OwnerRow[]
    employees: ConversationEmployeeOption[]
}

export function ConversationsManager({
    conversations,
    filters,
    owners,
    employees
}: ConversationsManagerProps) {
    const router = useRouter()
    const [isFiltering, setIsFiltering] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [editingConversation, setEditingConversation] =
        useState<ConversationRow | null>(null)
    const [deletingConversation, setDeletingConversation] =
        useState<ConversationRow | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    function refreshList() {
        router.refresh()
    }

    function openCreate() {
        setEditingConversation(null)
        setFormOpen(true)
    }

    function openEdit(conversation: ConversationRow) {
        setEditingConversation(conversation)
        setFormOpen(true)
    }

    async function confirmDelete() {
        if (!deletingConversation) return

        setIsDeleting(true)

        const result = await deleteConversation(
            deletingConversation.id
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
            description: "Conversation deleted",
            priority: "high",
        })

        setDeletingConversation(null)
        refreshList()
    }

    const columns = useMemo(
        () =>
            getConversationColumns({
                onEdit: openEdit,
                onDelete: setDeletingConversation,
            }),
        []
    )

    const emptyMessage =
        filters.search || filters.stage !== "all"
            ? "No conversations match your filters."
            : "No conversations yet. Create your first one to get started."

    return (
        <div className="space-y-6">
            <PageHeader
                title="Conversations"
                description="Manage WhatsApp conversations, customer stages, assignments, quotes, and outcomes."
                actions={
                    <Button onClick={openCreate}>
                        <Plus />
                        New conversation
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={conversations}
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

            <ConversationFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                conversation={editingConversation}
                owners={owners}
                employees={employees}
                onSuccess={refreshList}
            />

            <AlertDialog
                open={Boolean(deletingConversation)}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingConversation(null)
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete conversation?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            This will permanently delete the{" "}
                            <strong>
                                {deletingConversation?.channel}
                            </strong>{" "}
                            conversation and its stored conversation
                            record.
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
    filters: ConversationListFilters
    onLoadingChange: (loading: boolean) => void
}) {
    return (
        <ConversationsFilters
            initialSearch={filters.search ?? ""}
            initialStage={filters.stage ?? "all"}
            onLoadingChange={onLoadingChange}
        />
    )
}