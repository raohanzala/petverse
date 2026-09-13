import { createClient } from "@/lib/supabase/server"
import type { ConversationListFilters } from "@/lib/constants/conversations-filters"
import type { ConversationRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const CONVERSATION_COLUMNS =
  "id, owner_id, channel, external_id, stage, closed_lost_reason, quoted_amount, lost_revenue, assigned_employee_id, first_staff_response_at, ai_handled, created_at, updated_at" as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search and stage filter */
export async function listConversations(
  filters: ConversationListFilters = {}
): Promise<ConversationRow[]> {
  const supabase = await createClient()
  const { search, stage = "all" } = filters

  let query = supabase
    .from("conversations")
    .select(CONVERSATION_COLUMNS)

  if (stage !== "all") {
    query = query.eq("stage", stage)
  }

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `channel.ilike.${pattern},external_id.ilike.${pattern},closed_lost_reason.ilike.${pattern}`
    )
  }

  const { data, error } = await query.order(
    "created_at",
    { ascending: false }
  )

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load conversations"
      )
    )
  }

  return data ?? []
}

export async function getConversationById(
  id: string
): Promise<ConversationRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("conversations")
    .select(CONVERSATION_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load conversation"
      )
    )
  }

  return data
}
