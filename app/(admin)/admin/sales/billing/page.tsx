import { BillingPageContent } from "@/components/sales/billing/billing-page-content"

import { parseInvoiceListFilters } from "@/lib/constants/invoice-filters"
import { parseDepositListFilters } from "@/lib/constants/deposit-filters"
import { parsePaymentLinkListFilters } from "@/lib/constants/payment-link-filters"

import { listAppointments } from "@/lib/supabase/queries/appointments"
import { listDeposits } from "@/lib/supabase/queries/deposits"
import { listInvoices } from "@/lib/supabase/queries/invoices"
import { listOwners } from "@/lib/supabase/queries/owners"
import { listPaymentTokens } from "@/lib/supabase/queries/payment-tokens"

type BillingPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function BillingPage({
  searchParams,
}: BillingPageProps) {
  const params = await searchParams

  const invoiceFilters =
    parseInvoiceListFilters(params)

  const depositFilters =
    parseDepositListFilters(params)

  const paymentLinkFilters =
    parsePaymentLinkListFilters(params)

  const invoices =
    await listInvoices(invoiceFilters)

  const deposits =
    await listDeposits(depositFilters)

  const paymentLinks =
    await listPaymentTokens(
      paymentLinkFilters
    )

  const owners =
    await listOwners()

  const appointments =
    await listAppointments()

  const tab =
    typeof params.tab === "string"
      ? params.tab
      : "invoices"

  return (
    <BillingPageContent
      tab={
        tab as
        | "invoices"
        | "deposits"
        | "payment-links"
      }
      owners={owners}
      appointments={appointments}
      invoices={invoices}
      deposits={deposits}
      paymentLinks={paymentLinks}
      invoiceFilters={invoiceFilters}
      depositFilters={depositFilters}
      paymentLinkFilters={
        paymentLinkFilters
      }
    />
  )
}