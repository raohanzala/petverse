export const OUTBOUND_CAMPAIGN_STATUS_FILTERS = [
  "all",
  "draft",
  "scheduled",
  "running",
  "completed",
  "cancelled",
] as const

export type OutboundCampaignStatusFilter =
  (typeof OUTBOUND_CAMPAIGN_STATUS_FILTERS)[number]

export type OutboundCampaignListFilters = {
  search?: string
  status?: OutboundCampaignStatusFilter
}

export function parseOutboundCampaignListFilters(
  params: Record<string, string | string[] | undefined>
): OutboundCampaignListFilters {
  const rawStatus =
    typeof params.status === "string"
      ? params.status
      : "all"

  const status =
    OUTBOUND_CAMPAIGN_STATUS_FILTERS.includes(
      rawStatus as OutboundCampaignStatusFilter
    )
      ? (rawStatus as OutboundCampaignStatusFilter)
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