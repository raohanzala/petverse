export const ATTENDANCE_ENTRY_TYPE_FILTERS = [
  "all",
  "check_in",
  "check_out",
  "note",
  "incident",
] as const

export type AttendanceEntryTypeFilter =
  (typeof ATTENDANCE_ENTRY_TYPE_FILTERS)[number]

export type AttendanceEntryListFilters = {
  search?: string
  type?: AttendanceEntryTypeFilter
}

export function parseAttendanceEntryListFilters(
  params: Record<
    string,
    string | string[] | undefined
  >
): AttendanceEntryListFilters {
  const rawType =
    typeof params.type === "string"
      ? params.type
      : "all"

  const type =
    ATTENDANCE_ENTRY_TYPE_FILTERS.includes(
      rawType as AttendanceEntryTypeFilter
    )
      ? (rawType as AttendanceEntryTypeFilter)
      : "all"

  const search =
    typeof params.q === "string"
      ? params.q.trim()
      : undefined

  return {
    search: search || undefined,
    type,
  }
}