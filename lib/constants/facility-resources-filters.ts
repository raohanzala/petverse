export const FACILITY_RESOURCE_STATUS_FILTERS = [
  "all",
  "active",
  "inactive",
] as const

export type FacilityResourceStatusFilter =
  (typeof FACILITY_RESOURCE_STATUS_FILTERS)[number]

export const FACILITY_RESOURCE_TYPE_FILTERS = [
  "all",
  "kennel",
  "suite",
  "playroom",
  "other",
] as const

export type FacilityResourceTypeFilter =
  (typeof FACILITY_RESOURCE_TYPE_FILTERS)[number]

export type FacilityResourceListFilters = {
  search?: string
  status?: FacilityResourceStatusFilter
  type?: FacilityResourceTypeFilter
}

export function parseFacilityResourceListFilters(
  params: Record<string, string | string[] | undefined>
): FacilityResourceListFilters {
  const rawStatus =
    typeof params.status === "string"
      ? params.status
      : "all"

  const status = FACILITY_RESOURCE_STATUS_FILTERS.includes(
    rawStatus as FacilityResourceStatusFilter
  )
    ? (rawStatus as FacilityResourceStatusFilter)
    : "all"

  const rawType =
    typeof params.type === "string"
      ? params.type
      : "all"

  const type = FACILITY_RESOURCE_TYPE_FILTERS.includes(
    rawType as FacilityResourceTypeFilter
  )
    ? (rawType as FacilityResourceTypeFilter)
    : "all"

  const search =
    typeof params.q === "string"
      ? params.q.trim()
      : undefined

  return {
    search: search || undefined,
    status,
    type,
  }
}