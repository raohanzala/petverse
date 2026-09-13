import { Suspense } from "react"

import { InboxManager } from "@/components/communications/inbox/inbox-manager"
import { PageLoader } from "@/components/shared/page-loader"
import {
  parseConversationListFilters,
} from "@/lib/constants/conversations-filters"
import {
  listConversationMessages,
} from "@/lib/supabase/queries/conversation-messages"
import {
  listConversations,
} from "@/lib/supabase/queries/conversations"
import {
  listOwners,
} from "@/lib/supabase/queries/owners"

type InboxPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function InboxPage({
  searchParams,
}: InboxPageProps) {
  const params = await searchParams

  const {
    search,
    stage,
  } = parseConversationListFilters(params)

  const conversationId =
    typeof params.conversation === "string"
      ? params.conversation
      : undefined

  const [
    conversations,
    owners,
    messages,
  ] = await Promise.all([
    listConversations({
      search,
      stage,
    }),
    listOwners(),
    conversationId
      ? listConversationMessages(
          conversationId
        )
      : Promise.resolve([]),
  ])

  const ownerOptions = owners.map((owner) => ({
    id: owner.id,
    name: owner.name,
  }))

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading inbox…" />
      }
    >
      <InboxManager
        conversations={conversations}
        messages={messages}
        owners={ownerOptions}
        selectedConversationId={
          conversationId ?? null
        }
        initialSearch={search ?? ""}
        initialStage={stage}
      />
    </Suspense>
  )
}