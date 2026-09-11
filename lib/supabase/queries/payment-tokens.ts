import { createClient } from "@/lib/supabase/server"
import type {
  PaymentLinkListFilters,
} from "@/lib/constants/payment-link-filters"
import type {
  PaymentLinkListRow,
} from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"
import { getPaymentLinkStatus } from "@/lib/constants/payment-link-status"

const PAYMENT_LINK_COLUMNS = `
  id,
  token,
  invoice_id,
  expires_at,
  used_at,
  created_at,
  invoice:invoices(
    id,
    number,
    total,
    currency,
    status
  )
` as const

type PaymentLinkQueryRow = {
  id: string
  token: string
  invoice_id: string
  expires_at: string
  used_at: string | null
  created_at: string

  invoice: {
    id: string
    number: number | null
    total: number
    currency: string
    status: string
  }[] | null
}

function normalizePaymentLink(
  row: PaymentLinkQueryRow
): PaymentLinkListRow {
  const invoice = row.invoice?.[0]

  return {
    id: row.id,
    token: row.token,
    invoice_id: row.invoice_id,
    expires_at: row.expires_at,
    used_at: row.used_at,
    created_at: row.created_at,

    invoice: invoice
      ? {
          id: invoice.id,
          number: invoice.number,
          total: invoice.total,
          currency: invoice.currency,
          status: invoice.status,
        }
      : null,
  }
}

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

export async function listPaymentTokens(
  filters: PaymentLinkListFilters = {}
): Promise<PaymentLinkListRow[]> {
  const supabase = await createClient()

  const {
    search,
    status = "all",
  } = filters

  const { data, error } = await supabase
    .from("payment_tokens")
    .select(PAYMENT_LINK_COLUMNS)
    .order("created_at", {
      ascending: false,
    })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load payment links"
      )
    )
  }

  let rows = (data ?? []).map((row) =>
    normalizePaymentLink(
      row as PaymentLinkQueryRow
    )
  )

  if (search) {
    const pattern =
      escapeIlikePattern(search).toLowerCase()

    rows = rows.filter((row) => {
      const invoiceNumber =
        row.invoice?.number
          ? String(row.invoice.number)
          : ""

      const token =
        row.token.toLowerCase()

      return (
        invoiceNumber
          .toLowerCase()
          .includes(pattern) ||
        token.includes(pattern)
      )
    })
  }

  if (status !== "all") {
    rows = rows.filter(
      (row) =>
        getPaymentLinkStatus(row) ===
        status
    )
  }

  return rows
}

export async function getPaymentTokenById(
  id: string
): Promise<PaymentLinkListRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("payment_tokens")
    .select(PAYMENT_LINK_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load payment link"
      )
    )
  }

  return data
    ? normalizePaymentLink(
        data as PaymentLinkQueryRow
      )
    : null
}

export { getPaymentLinkStatus }