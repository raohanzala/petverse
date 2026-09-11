"use client"

import { DepositsManager } from "@/components/sales/billing/deposits/deposits-manager"

import type { DepositListFilters } from "@/lib/constants/deposit-filters"

import type {
  AppointmentRow,
  DepositRow,
  InvoiceRow,
  OwnerRow,
} from "@/lib/supabase/types"

type DepositsTabProps = {
  deposits: DepositRow[]
  filters: DepositListFilters
  owners: OwnerRow[]
  appointments: AppointmentRow[]
  invoices: InvoiceRow[]
}

export function DepositsTab({
  deposits,
  filters,
  owners,
  appointments,
  invoices,
}: DepositsTabProps) {
  return (
    <DepositsManager
      deposits={deposits}
      filters={filters}
      owners={owners}
      appointments={appointments}
      invoices={invoices}
    />
  )
}