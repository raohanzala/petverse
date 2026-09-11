"use client"

import { InvoicesManager } from "@/components/sales/billing/invoices/invoices-manager"
import type { InvoiceListFilters } from "@/lib/constants/invoice-filters"
import type { AppointmentRow, InvoiceRow, OwnerRow } from "@/lib/supabase/types"

type InvoicesTabProps = {
    invoices: InvoiceRow[]
    filters: InvoiceListFilters
    owners: OwnerRow[]
    appointments: AppointmentRow[]
}

export function InvoicesTab({
    invoices,
    filters,
    owners,
    appointments
}: InvoicesTabProps) {
    return (
        <InvoicesManager
            owners={owners}
            appointments={appointments}
            invoices={invoices}
            filters={filters}
        />
    )
}