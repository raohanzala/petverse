export const SERVICE_CATEGORY_STATUS_FILTERS = [
  "all",
  "active",
  "inactive",
] as const

export type ServiceCategoryStatusFilter =
  (typeof SERVICE_CATEGORY_STATUS_FILTERS)[number]

export type ServiceCategoryListFilters = {
  search?: string
  status?: ServiceCategoryStatusFilter
}

export function parseServiceCategoryListFilters(
  params: Record<string, string | string[] | undefined>
): ServiceCategoryListFilters {
  const rawStatus = typeof params.status === "string" ? params.status : "all"
  const status = SERVICE_CATEGORY_STATUS_FILTERS.includes(
    rawStatus as ServiceCategoryStatusFilter
  )
    ? (rawStatus as ServiceCategoryStatusFilter)
    : "all"

  const search =
    typeof params.q === "string" ? params.q.trim() : undefined

  return {
    search: search || undefined,
    status,
  }
}
