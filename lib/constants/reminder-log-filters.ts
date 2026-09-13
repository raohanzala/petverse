export const REMINDER_LOG_STATUS_FILTERS = [
  "all",
  "sent",
  "failed",
] as const

export type ReminderLogStatusFilter =
  (typeof REMINDER_LOG_STATUS_FILTERS)[number]

export const REMINDER_LOG_CHANNEL_FILTERS = [
  "all",
  "whatsapp",
  "sms",
  "email",
] as const

export type ReminderLogChannelFilter =
  (typeof REMINDER_LOG_CHANNEL_FILTERS)[number]

export type ReminderLogListFilters = {
  search?: string
  status?: ReminderLogStatusFilter
  channel?: ReminderLogChannelFilter
}

export function parseReminderLogListFilters(
  params: Record<string, string | string[] | undefined>
): ReminderLogListFilters {
  const rawStatus =
    typeof params.status === "string"
      ? params.status
      : "all"

  const status = REMINDER_LOG_STATUS_FILTERS.includes(
    rawStatus as ReminderLogStatusFilter
  )
    ? (rawStatus as ReminderLogStatusFilter)
    : "all"

  const rawChannel =
    typeof params.channel === "string"
      ? params.channel
      : "all"

  const channel = REMINDER_LOG_CHANNEL_FILTERS.includes(
    rawChannel as ReminderLogChannelFilter
  )
    ? (rawChannel as ReminderLogChannelFilter)
    : "all"

  const search =
    typeof params.q === "string"
      ? params.q.trim()
      : undefined

  return {
    search: search || undefined,
    status,
    channel,
  }
}