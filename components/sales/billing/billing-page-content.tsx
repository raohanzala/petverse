"use client"

import { BillingTabs } from "@/components/sales/billing/billing-tabs"

import type {
  AppointmentRow,
  DepositRow,
  InvoiceRow,
  OwnerRow,
  PaymentLinkListRow,
} from "@/lib/supabase/types"

import type {
  InvoiceListFilters,
} from "@/lib/constants/invoice-filters"

import type {
  DepositListFilters,
} from "@/lib/constants/deposit-filters"

import type {
  PaymentLinkListFilters,
} from "@/lib/constants/payment-link-filters"

type BillingTab =
  | "invoices"
  | "deposits"
  | "payment-links"

type BillingPageContentProps = {
  tab: BillingTab
  owners: OwnerRow[]
  appointments: AppointmentRow[]
  invoices: InvoiceRow[]
  deposits: DepositRow[]
  paymentLinks: PaymentLinkListRow[]
  invoiceFilters: InvoiceListFilters
  depositFilters: DepositListFilters
  paymentLinkFilters: PaymentLinkListFilters
}

export function BillingPageContent({
  tab,
  owners,
  appointments,
  invoices,
  deposits,
  paymentLinks,
  invoiceFilters,
  depositFilters,
  paymentLinkFilters,
}: BillingPageContentProps) {
  return (
    <BillingTabs
      tab={tab}
      owners={owners}
      appointments={appointments}
      invoices={invoices}
      deposits={deposits}
      paymentLinks={paymentLinks}
      invoiceFilters={invoiceFilters}
      depositFilters={depositFilters}
      paymentLinkFilters={paymentLinkFilters}
    />
  )
}