export type CampaignBlackoutPeriodListFilters = {
  search?: string
}

export function parseCampaignBlackoutPeriodListFilters(
  params: Record<string, string | string[] | undefined>
): CampaignBlackoutPeriodListFilters {
  const search =
    typeof params.q === "string"
      ? params.q.trim()
      : undefined

  return {
    search: search || undefined,
  }
}