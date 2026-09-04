export const APPOINTMENT_STATUS_FILTERS = [
  "all",
  "requested",
  "confirmed",
  "arrived",
  "in_service",
  "completed",
  "cancelled",
  "no_show",
] as const

export type AppointmentStatusFilter =
  (typeof APPOINTMENT_STATUS_FILTERS)[number]

export type AppointmentListFilters = {
  search?: string
  status?: AppointmentStatusFilter
}

export function parseAppointmentListFilters(
  params: Record<string, string | string[] | undefined>
): AppointmentListFilters {
  const rawStatus =
    typeof params.status === "string"
      ? params.status
      : "all"

  const status = APPOINTMENT_STATUS_FILTERS.includes(
    rawStatus as AppointmentStatusFilter
  )
    ? (rawStatus as AppointmentStatusFilter)
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