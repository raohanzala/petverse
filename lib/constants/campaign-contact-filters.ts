export const CAMPAIGN_CONTACT_STATUS_FILTERS = [
  "all",
  "pending",
  "sent",
  "delivered",
  "failed",
  "unsubscribed",
] as const

export type CampaignContactStatusFilter =
  (typeof CAMPAIGN_CONTACT_STATUS_FILTERS)[number]

export type CampaignContactListFilters = {
  search?: string
  status?: CampaignContactStatusFilter
}

export function parseCampaignContactListFilters(
  params: Record<string, string | string[] | undefined>
): CampaignContactListFilters {
  const rawStatus =
    typeof params.status === "string"
      ? params.status
      : "all"

  const status =
    CAMPAIGN_CONTACT_STATUS_FILTERS.includes(
      rawStatus as CampaignContactStatusFilter
    )
      ? (rawStatus as CampaignContactStatusFilter)
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