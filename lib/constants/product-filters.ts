export const PRODUCT_STATUS_FILTERS = [
  "all",
  "active",
  "inactive",
] as const

export type ProductStatusFilter =
  (typeof PRODUCT_STATUS_FILTERS)[number]

export type ProductListFilters = {
  search?: string
  status?: ProductStatusFilter
  supplierId?: string
}

export function parseProductListFilters(
  params: Record<string, string | string[] | undefined>
): ProductListFilters {
  const rawStatus =
    typeof params.status === "string"
      ? params.status
      : "all"

  const status = PRODUCT_STATUS_FILTERS.includes(
    rawStatus as ProductStatusFilter
  )
    ? (rawStatus as ProductStatusFilter)
    : "all"

  const search =
    typeof params.q === "string"
      ? params.q.trim()
      : undefined

  const supplierId =
    typeof params.supplier_id === "string"
      ? params.supplier_id.trim()
      : undefined

  return {
    search: search || undefined,
    status,
    supplierId: supplierId || undefined,
  }
}