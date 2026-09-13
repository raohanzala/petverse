import { createClient } from "@/lib/supabase/server"
import type { MessageTemplateListFilters } from "@/lib/constants/message-template-filters"
import type { MessageTemplateRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const MESSAGE_TEMPLATE_COLUMNS =
  "id, name, channel, body, is_active, created_at, updated_at" as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search and status filter */
export async function listMessageTemplates(
  filters: MessageTemplateListFilters = {}
): Promise<MessageTemplateRow[]> {
  const supabase = await createClient()
  const { search, status = "all" } = filters

  let query = supabase
    .from("message_templates")
    .select(MESSAGE_TEMPLATE_COLUMNS)

  if (status === "active") {
    query = query.eq("is_active", true)
  } else if (status === "inactive") {
    query = query.eq("is_active", false)
  }

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `name.ilike.${pattern},channel.ilike.${pattern},body.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load message templates"
      )
    )
  }

  return data ?? []
}

/** Active templates only — for messaging / outbound usage */
export async function listActiveMessageTemplates(): Promise<
  MessageTemplateRow[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("message_templates")
    .select(MESSAGE_TEMPLATE_COLUMNS)
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load message templates"
      )
    )
  }

  return data ?? []
}

export async function getMessageTemplateById(
  id: string
): Promise<MessageTemplateRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("message_templates")
    .select(MESSAGE_TEMPLATE_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load message template"
      )
    )
  }

  return data
}