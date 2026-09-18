"use client"

import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs"

import {
  BillingTabsNav,
  type BillingTab,
} from "@/components/sales/billing/billing-tabs-nav"

import { InvoicesTab } from "@/components/sales/billing/invoices/invoices-tab"
import { DepositsTab } from "./deposits/deposits-tab"
import { PaymentLinksTab } from "./payment-links/payment-links-tab"

import type { InvoiceListFilters } from "@/lib/constants/invoice-filters"
import type { DepositListFilters } from "@/lib/constants/deposit-filters"
import type { PaymentLinkListFilters } from "@/lib/constants/payment-link-filters"

import type {
  AppointmentRow,
  DepositRow,
  InvoiceRow,
  OwnerRow,
  PaymentLinkListRow,
} from "@/lib/supabase/types"

type BillingTabsProps = {
  owners: OwnerRow[]
  appointments: AppointmentRow[]
  invoices: InvoiceRow[]
  deposits: DepositRow[]
  paymentLinks: PaymentLinkListRow[]
  invoiceFilters: InvoiceListFilters
  depositFilters: DepositListFilters
  paymentLinkFilters: PaymentLinkListFilters
  tab: BillingTab
}

export function BillingTabs({
  invoices,
  invoiceFilters,
  tab,
  owners,
  appointments,
  deposits,
  depositFilters,
  paymentLinkFilters,
  paymentLinks,
}: BillingTabsProps) {
  return (
    <Tabs
      defaultValue={tab}
      className="w-full"
    >
      <BillingTabsNav />

      <TabsContent value="invoices">
        <InvoicesTab
          owners={owners}
          appointments={appointments}
          invoices={invoices}
          filters={invoiceFilters}
        />
      </TabsContent>

      <TabsContent value="deposits">
        <DepositsTab
          deposits={deposits}
          filters={depositFilters}
          owners={owners}
          appointments={appointments}
          invoices={invoices}
        />
      </TabsContent>

      <TabsContent value="payment-links">
        <PaymentLinksTab
          paymentLinks={paymentLinks}
          filters={paymentLinkFilters}
          invoices={invoices}
        />
      </TabsContent>
    </Tabs>
  )
}