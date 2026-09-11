import { createClient } from "@/lib/supabase/server"
import type { DepositListFilters } from "@/lib/constants/deposit-filters"
import type { DepositRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const DEPOSIT_COLUMNS =
  "id, owner_id, appointment_id, invoice_id, amount, paid_at, provider_ref, created_at" as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

export async function listDeposits(
  filters: DepositListFilters = {}
): Promise<DepositRow[]> {
  const supabase = await createClient()

  const { search } = filters

  let query = supabase
    .from("deposits")
    .select(DEPOSIT_COLUMNS)

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `provider_ref.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load deposits"
      )
    )
  }

  return data ?? []
}

export async function getDepositById(
  id: string
): Promise<DepositRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("deposits")
    .select(DEPOSIT_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load deposit"
      )
    )
  }

  return data
}