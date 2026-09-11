export const INVOICE_STATUS_FILTERS = [
  "all",
  "draft",
  "open",
  "paid",
  "void",
] as const

export type InvoiceStatusFilter =
  (typeof INVOICE_STATUS_FILTERS)[number]

export type InvoiceListFilters = {
  search?: string
  status?: InvoiceStatusFilter
}

export function parseInvoiceListFilters(
  params: Record<string, string | string[] | undefined>
): InvoiceListFilters {
  const rawStatus =
    typeof params.status === "string"
      ? params.status
      : "all"

  const status = INVOICE_STATUS_FILTERS.includes(
    rawStatus as InvoiceStatusFilter
  )
    ? (rawStatus as InvoiceStatusFilter)
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