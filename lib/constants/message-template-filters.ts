export const MESSAGE_TEMPLATE_STATUS_FILTERS = [
  "all",
  "active",
  "inactive",
] as const

export type MessageTemplateStatusFilter =
  (typeof MESSAGE_TEMPLATE_STATUS_FILTERS)[number]

export type MessageTemplateListFilters = {
  search?: string
  status?: MessageTemplateStatusFilter
}

export function parseMessageTemplateListFilters(
  params: Record<string, string | string[] | undefined>
): MessageTemplateListFilters {
  const rawStatus =
    typeof params.status === "string"
      ? params.status
      : "all"

  const status =
    MESSAGE_TEMPLATE_STATUS_FILTERS.includes(
      rawStatus as MessageTemplateStatusFilter
    )
      ? (rawStatus as MessageTemplateStatusFilter)
      : "all"

  const search =
    typeof params.q === "string"
      ? params.q.trim()
      : undefined

  return {
    search: search || undefined,
    status,
  }
}