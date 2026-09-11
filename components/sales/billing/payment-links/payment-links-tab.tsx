"use client"

import { PaymentLinksManager } from "@/components/sales/billing/payment-links/payment-links-manager"

import type { PaymentLinkListFilters } from "@/lib/constants/payment-link-filters"

import type {
  InvoiceRow,
  PaymentLinkListRow,
} from "@/lib/supabase/types"


type PaymentLinksTabProps = {
  paymentLinks: PaymentLinkListRow[]
  filters: PaymentLinkListFilters
  invoices: InvoiceRow[]
}

export function PaymentLinksTab({
  paymentLinks,
  filters,
  invoices,
}: PaymentLinksTabProps) {
  return (
    <PaymentLinksManager
      paymentLinks={paymentLinks}
      filters={filters}
      invoices={invoices}
    />
  )
}