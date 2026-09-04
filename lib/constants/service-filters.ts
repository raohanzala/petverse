export const SERVICE_KINDS = [
  "grooming",
  "veterinary",
  "boarding",
  "daycare",
  "other",
] as const

export type ServiceKindFilter =
  (typeof SERVICE_KINDS)[number]

export const SERVICE_STATUS_FILTERS = [
  "all",
  "active",
  "inactive",
] as const

export type ServiceStatusFilter =
  (typeof SERVICE_STATUS_FILTERS)[number]

export const SERVICE_VISIBILITY_FILTERS = [
  "all",
  "public",
  "private",
] as const

export type ServiceVisibilityFilter =
  (typeof SERVICE_VISIBILITY_FILTERS)[number]

export type ServiceListFilters = {
  search?: string
  categoryId?: string
  kind?: ServiceKindFilter | "all"
  status?: ServiceStatusFilter
  visibility?: ServiceVisibilityFilter
}

export function parseServiceListFilters(
  params: Record<string, string | string[] | undefined>
): ServiceListFilters {
  const rawKind =
    typeof params.kind === "string"
      ? params.kind
      : "all"

  const kind =
    SERVICE_KINDS.includes(
      rawKind as ServiceKindFilter
    )
      ? (rawKind as ServiceKindFilter)
      : "all"

  const rawStatus =
    typeof params.status === "string"
      ? params.status
      : "all"

  const status =
    SERVICE_STATUS_FILTERS.includes(
      rawStatus as ServiceStatusFilter
    )
      ? (rawStatus as ServiceStatusFilter)
      : "all"

  const rawVisibility =
    typeof params.visibility === "string"
      ? params.visibility
      : "all"

  const visibility =
    SERVICE_VISIBILITY_FILTERS.includes(
      rawVisibility as ServiceVisibilityFilter
    )
      ? (rawVisibility as ServiceVisibilityFilter)
      : "all"

  const categoryId =
    typeof params.categoryId === "string"
      ? params.categoryId
      : undefined

  const search =
    typeof params.q === "string"
      ? params.q.trim()
      : undefined

  return {
    search: search || undefined,
    categoryId: categoryId || undefined,
    kind,
    status,
    visibility,
  }
}