import { createClient } from "@/lib/supabase/server"
import type { ReminderLogListFilters } from "@/lib/constants/reminder-log-filters"
import type { ReminderLogRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const REMINDER_LOG_COLUMNS =
  "id, owner_id, appointment_id, channel, template_key, status, sent_at, error_message" as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search, status, and channel filters */
export async function listReminderLogs(
  filters: ReminderLogListFilters = {}
): Promise<ReminderLogRow[]> {
  const supabase = await createClient()

  const {
    search,
    status = "all",
    channel = "all",
  } = filters

  let query = supabase
    .from("reminder_log")
    .select(REMINDER_LOG_COLUMNS)

  if (status !== "all") {
    query = query.eq("status", status)
  }

  if (channel !== "all") {
    query = query.eq("channel", channel)
  }

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `channel.ilike.${pattern},template_key.ilike.${pattern},status.ilike.${pattern},error_message.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("sent_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load reminder logs"
      )
    )
  }

  return data ?? []
}

export async function getReminderLogById(
  id: string
): Promise<ReminderLogRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("reminder_log")
    .select(REMINDER_LOG_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load reminder log"
      )
    )
  }

  return data
}