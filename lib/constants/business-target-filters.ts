export const BUSINESS_TARGET_PERIOD_FILTERS = [
  "all",
  "current",
  "upcoming",
  "past",
] as const

export type BusinessTargetPeriodFilter =
  (typeof BUSINESS_TARGET_PERIOD_FILTERS)[number]

export const BUSINESS_TARGET_PERIOD_LABELS: Record<
  BusinessTargetPeriodFilter,
  string
> = {
  all: "All periods",
  current: "Current",
  upcoming: "Upcoming",
  past: "Past",
}

export type BusinessTargetListFilters = {
  search?: string
  period?: BusinessTargetPeriodFilter
}

export function parseBusinessTargetListFilters(
  params: Record<string, string | string[] | undefined>
): BusinessTargetListFilters {
  const rawPeriod =
    typeof params.period === "string" ? params.period : "all"

  const period = BUSINESS_TARGET_PERIOD_FILTERS.includes(
    rawPeriod as BusinessTargetPeriodFilter
  )
    ? (rawPeriod as BusinessTargetPeriodFilter)
    : "all"

  const search =
    typeof params.q === "string" ? params.q.trim() : undefined

  return {
    search: search || undefined,
    period,
  }
}