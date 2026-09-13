import { createClient } from "@/lib/supabase/server"
import type { ConversationMessageRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const CONVERSATION_MESSAGE_COLUMNS =
  "id, conversation_id, direction, body, sent_at, external_id" as const

/** Inbox — load all messages for a conversation thread */
export async function listConversationMessages(
  conversationId: string
): Promise<ConversationMessageRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("conversation_messages")
    .select(CONVERSATION_MESSAGE_COLUMNS)
    .eq("conversation_id", conversationId)
    .order("sent_at", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load conversation messages"
      )
    )
  }

  return data ?? []
}

export async function getConversationMessageById(
  id: string
): Promise<ConversationMessageRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("conversation_messages")
    .select(CONVERSATION_MESSAGE_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load conversation message"
      )
    )
  }

  return data
}