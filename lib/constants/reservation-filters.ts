export const RESERVATION_STATUS_FILTERS = [
  "all",
  "pending",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
] as const

export type ReservationStatusFilter =
  (typeof RESERVATION_STATUS_FILTERS)[number]

export const RESERVATION_STATUS_LABELS: Record<
  ReservationStatusFilter,
  string
> = {
  all: "All Reservations",
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  checked_out: "Checked Out",
  cancelled: "Cancelled",
}

export type ReservationListFilters = {
  search?: string
  status?: ReservationStatusFilter
}

export function parseReservationListFilters(
  params: Record<string, string | string[] | undefined>
): ReservationListFilters {
  const rawStatus =
    typeof params.status === "string"
      ? params.status
      : "all"

  const status = RESERVATION_STATUS_FILTERS.includes(
    rawStatus as ReservationStatusFilter
  )
    ? (rawStatus as ReservationStatusFilter)
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