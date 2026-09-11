import { createClient } from "@/lib/supabase/server"
import type { InvoiceListFilters } from "@/lib/constants/invoice-filters"
import type { InvoiceRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const INVOICE_COLUMNS =
  "id, owner_id, appointment_id, number, status, subtotal, tax, total, currency, issued_at, paid_at, voided_at, notes, created_at, updated_at" as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search and status filter */
export async function listInvoices(
  filters: InvoiceListFilters = {}
): Promise<InvoiceRow[]> {
  const supabase = await createClient()
  const { search, status = "all" } = filters

  let query = supabase
    .from("invoices")
    .select(INVOICE_COLUMNS)

  if (status !== "all") {
    query = query.eq("status", status)
  }

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `notes.ilike.${pattern},currency.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .order("number", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to load invoices")
    )
  }

  return data ?? []
}

export async function getInvoiceById(
  id: string
): Promise<InvoiceRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("invoices")
    .select(INVOICE_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to load invoice")
    )
  }

  return data
}