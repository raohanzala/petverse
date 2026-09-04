export const EMPLOYEE_STATUS_FILTERS = [
  "all",
  "active",
  "inactive",
] as const

export type EmployeeStatusFilter =
  (typeof EMPLOYEE_STATUS_FILTERS)[number]

export type EmployeeListFilters = {
  search?: string
  status?: EmployeeStatusFilter
}

export function parseEmployeeListFilters(
  params: Record<string, string | string[] | undefined>
): EmployeeListFilters {
  const rawStatus =
    typeof params.status === "string" ? params.status : "all"

  const status = EMPLOYEE_STATUS_FILTERS.includes(
    rawStatus as EmployeeStatusFilter
  )
    ? (rawStatus as EmployeeStatusFilter)
    : "all"

  const search =
    typeof params.q === "string" ? params.q.trim() : undefined

  return {
    search: search || undefined,
    status,
  }
}