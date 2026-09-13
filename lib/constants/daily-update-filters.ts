export const DAILY_UPDATE_DELIVERY_FILTERS = [
  "all",
  "sent",
  "pending",
] as const

export type DailyUpdateDeliveryFilter =
  (typeof DAILY_UPDATE_DELIVERY_FILTERS)[number]

export const DAILY_UPDATE_DELIVERY_LABELS: Record<
  DailyUpdateDeliveryFilter,
  string
> = {
  all: "All updates",
  sent: "Sent to owner",
  pending: "Not sent",
}

export type DailyUpdateListFilters = {
  search?: string
  delivery?: DailyUpdateDeliveryFilter
}

export function parseDailyUpdateListFilters(
  params: Record<string, string | string[] | undefined>
): DailyUpdateListFilters {
  const rawDelivery =
    typeof params.delivery === "string"
      ? params.delivery
      : "all"

  const delivery = DAILY_UPDATE_DELIVERY_FILTERS.includes(
    rawDelivery as DailyUpdateDeliveryFilter
  )
    ? (rawDelivery as DailyUpdateDeliveryFilter)
    : "all"

  const search =
    typeof params.q === "string"
      ? params.q.trim()
      : undefined

  return {
    search: search || undefined,
    delivery,
  }
}