export const SUPPLIER_STATUS_FILTERS = [
  "all",
  "active",
  "inactive",
] as const

export type SupplierStatusFilter =
  (typeof SUPPLIER_STATUS_FILTERS)[number]

export const SUPPLIER_STATUS_LABELS: Record<
  SupplierStatusFilter,
  string
> = {
  all: "All statuses",
  active: "Active only",
  inactive: "Inactive only",
}

export type SupplierListFilters = {
  search?: string
  status?: SupplierStatusFilter
}

export function parseSupplierListFilters(
  params: Record<string, string | string[] | undefined>
): SupplierListFilters {
  const rawStatus =
    typeof params.status === "string"
      ? params.status
      : "all"

  const status = SUPPLIER_STATUS_FILTERS.includes(
    rawStatus as SupplierStatusFilter
  )
    ? (rawStatus as SupplierStatusFilter)
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