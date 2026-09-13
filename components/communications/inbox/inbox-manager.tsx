"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { ConversationThread } from "@/components/communications/inbox/conversation-thread"
import { InboxFilters } from "@/components/communications/inbox/inbox-filters"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type {
  ConversationMessageRow,
  ConversationRow,
} from "@/lib/supabase/types"
import type {
  ConversationStageFilter,
} from "@/lib/constants/conversations-filters"

type InboxOwnerOption = {
  id: string
  name: string
}

type InboxManagerProps = {
  conversations: ConversationRow[]
  messages: ConversationMessageRow[]
  owners: InboxOwnerOption[]
  selectedConversationId: string | null
  initialSearch?: string
  initialStage?: ConversationStageFilter
}

export function InboxManager({
  conversations,
  messages,
  owners,
  selectedConversationId,
  initialSearch = "",
  initialStage = "all",
}: InboxManagerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isRefreshing, setIsRefreshing] =
    useState(false)

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) =>
          conversation.id ===
          selectedConversationId
      ) ?? null,
    [conversations, selectedConversationId]
  )

  const ownerNames = useMemo(
    () =>
      new Map(
        owners.map((owner) => [
          owner.id,
          owner.name,
        ])
      ),
    [owners]
  )

  function getOwnerName(ownerId: string | null) {
    if (!ownerId) {
      return "Unmatched owner"
    }

    return (
      ownerNames.get(ownerId) ??
      "Unknown owner"
    )
  }

  function selectConversation(
    conversationId: string
  ) {
    const params = new URLSearchParams(
      searchParams.toString()
    )

    params.set("conversation", conversationId)

    router.push(
      `/admin/communications/inbox?${params.toString()}`
    )
  }

  function clearConversation() {
    const params = new URLSearchParams(
      searchParams.toString()
    )

    params.delete("conversation")

    const query = params.toString()

    router.push(
      query
        ? `/admin/communications/inbox?${query}`
        : "/admin/communications/inbox"
    )
  }

  function refreshInbox() {
    setIsRefreshing(true)

    router.refresh()

    setTimeout(() => {
      setIsRefreshing(false)
    }, 500)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbox"
        description="Manage customer conversations and messages from one place."
        actions={
          <Button
            variant="outline"
            onClick={refreshInbox}
            disabled={isRefreshing}
          >
            {isRefreshing
              ? "Refreshing…"
              : "Refresh"}
          </Button>
        }
      />

      <InboxFilters
        initialSearch={initialSearch}
        initialStage={initialStage}
      />

      <div className="grid min-h-[650px] grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-base">
              Conversations
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {conversations.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
                No conversations found.
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map(
                  (conversation) => {
                    const isSelected =
                      conversation.id ===
                      selectedConversationId

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() =>
                          selectConversation(
                            conversation.id
                          )
                        }
                        className={[
                          "flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors",
                          "hover:bg-muted/50",
                          isSelected
                            ? "bg-muted"
                            : "bg-background",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-medium">
                            {getOwnerName(
                              conversation.owner_id
                            )}
                          </span>

                          <span className="shrink-0 text-xs capitalize text-muted-foreground">
                            {conversation.stage.replace(
                              "_",
                              " "
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-xs capitalize text-muted-foreground">
                            {conversation.channel}
                          </span>

                          {conversation.ai_handled && (
                            <span className="shrink-0 text-xs text-muted-foreground">
                              AI
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  }
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex min-h-[650px] flex-col overflow-hidden">
          {!selectedConversation ? (
            <div className="flex flex-1 items-center justify-center px-6 text-center">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">
                  Select a conversation
                </h2>

                <p className="max-w-sm text-sm text-muted-foreground">
                  Choose a conversation from the
                  list to view its messages.
                </p>
              </div>
            </div>
          ) : (
            <ConversationThread
              conversation={selectedConversation}
              messages={messages}
              onClose={clearConversation}
            />
          )}
        </Card>
      </div>
    </div>
  )
}