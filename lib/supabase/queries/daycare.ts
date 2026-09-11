import { createClient } from "@/lib/supabase/server"
import type { DaycareTransactionRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const DAYCARE_TRANSACTION_COLUMNS = `
  id,
  pet_id,
  owner_id,
  wallet_id,
  status,
  scheduled_at,
  check_in_at,
  check_out_at,
  amount,
  notes,
  created_at,
  pet:pets (
    id,
    name
  ),
  owner:owners (
    id,
    name
  ),
  wallet:daycare_wallets (
    id,
    visits_remaining,
    expires_at,
    package:daycare_packages (
      id,
      name,
      visit_count
    )
  )
` as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Today's daycare sessions */
export async function listTodayDaycareTransactions(): Promise<
  DaycareTransactionRow[]
> {
  const supabase = await createClient()

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from("daycare_transactions")
    .select(DAYCARE_TRANSACTION_COLUMNS)
    .gte("check_in_at", startOfDay.toISOString())
    .lte("check_in_at", endOfDay.toISOString())
    .order("check_in_at", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load today's daycare sessions"
      )
    )
  }

  return data ?? []
}