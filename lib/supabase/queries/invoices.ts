import { createClient } from "@/lib/supabase/server"
import type { InvoiceListFilters } from "@/lib/constants/invoice-filters"
import type { InvoiceRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const INVOICE_COLUMNS = `
  id,
  owner_id,
  appointment_id,
  number,
  status,
  subtotal,
  tax,
  total,
  currency,
  issued_at,
  paid_at,
  voided_at,
  notes,
  created_at,
  updated_at,

  owner:owners (
    id,
    name,
    phone,
    email
  ),

  appointment:appointments (
    pet:pets (
      id,
      name,
      species
    )
  )
`

const INVOICE_DETAIL_COLUMNS = `
  id,
  owner_id,
  appointment_id,
  number,
  status,
  subtotal,
  tax,
  total,
  currency,
  issued_at,
  paid_at,
  voided_at,
  notes,
  created_at,
  updated_at,

  owner:owners (
    id,
    name,
    phone,
    email
  ),

  appointment:appointments (
    pet:pets (
      id,
      name,
      species
    )
  ),

  invoice_line_items (
    id,
    description,
    quantity,
    unit_price,
    total
  )
`

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

type InvoiceRelation<T> = T | T[] | null

type RawInvoiceRow = Omit<
  InvoiceRow,
  "owner" | "pet"
> & {
  owner: InvoiceRelation<InvoiceRow["owner"]>
  appointment:
    | {
        pet: InvoiceRelation<InvoiceRow["pet"]>
      }
    | Array<{
        pet: InvoiceRelation<InvoiceRow["pet"]>
      }>
    | null
}

function normalizeInvoice(invoice: RawInvoiceRow): InvoiceRow {
  const appointment = Array.isArray(invoice.appointment)
    ? invoice.appointment[0] ?? null
    : invoice.appointment

  const pet = appointment?.pet
    ? Array.isArray(appointment.pet)
      ? appointment.pet[0] ?? null
      : appointment.pet
    : null

  return {
    ...invoice,
    owner: Array.isArray(invoice.owner)
      ? invoice.owner[0] ?? null
      : invoice.owner,
    pet,
  }
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
      getSupabaseErrorMessage(
        error,
        "Failed to load invoices"
      )
    )
  }

  return (data ?? []).map(normalizeInvoice)
}

export async function getInvoiceById(
  id: string
): Promise<InvoiceRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("invoices")
    .select(INVOICE_DETAIL_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load invoice"
      )
    )
  }

  if (!data) {
    return null
  }

  return normalizeInvoice(data)
}