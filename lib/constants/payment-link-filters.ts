export const PAYMENT_LINK_STATUS_FILTERS = [
  "all",
  "active",
  "used",
  "expired",
] as const

export type PaymentLinkStatusFilter =
  (typeof PAYMENT_LINK_STATUS_FILTERS)[number]

export type PaymentLinkListFilters = {
  search?: string
  status?: PaymentLinkStatusFilter
}

export function parsePaymentLinkListFilters(
  params: Record<string, string | string[] | undefined>
): PaymentLinkListFilters {
  const rawStatus =
    typeof params.payment_link_status === "string"
      ? params.payment_link_status
      : "all"

  const status =
    PAYMENT_LINK_STATUS_FILTERS.includes(
      rawStatus as PaymentLinkStatusFilter
    )
      ? (rawStatus as PaymentLinkStatusFilter)
      : "all"

  const search =
    typeof params.payment_link_q === "string"
      ? params.payment_link_q.trim()
      : undefined

  return {
    search: search || undefined,
    status,
  }
}