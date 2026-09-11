import { createClient } from "@/lib/supabase/server"
import type { DaycareTransactionRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const DAYCARE_TRANSACTION_COLUMNS =
  "id, pet_id, owner_id, wallet_id, status, scheduled_at, check_in_at, check_out_at, amount, notes, created_at" as const

/** Admin list — all daycare transactions */
export async function listTodayDaycareTransactions(): Promise<
  DaycareTransactionRow[]
> {
  const supabase = await createClient()

  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  const { data, error } = await supabase
    .from("daycare_transactions")
    .select(DAYCARE_TRANSACTION_COLUMNS)
    .gte("scheduled_at", start.toISOString())
    .lt("scheduled_at", end.toISOString())
    .order("scheduled_at", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load today's daycare transactions"
      )
    )
  }

  return data ?? []
}

/** Transactions by status */
export async function listDaycareTransactionsByStatus(
  status: DaycareTransactionRow["status"]
): Promise<DaycareTransactionRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_transactions")
    .select(DAYCARE_TRANSACTION_COLUMNS)
    .eq("status", status)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daycare transactions"
      )
    )
  }

  return data ?? []
}

/** Transactions for a specific pet */
export async function listDaycareTransactionsByPetId(
  petId: string
): Promise<DaycareTransactionRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_transactions")
    .select(DAYCARE_TRANSACTION_COLUMNS)
    .eq("pet_id", petId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load pet daycare transactions"
      )
    )
  }

  return data ?? []
}

/** Transactions for a specific owner */
export async function listDaycareTransactionsByOwnerId(
  ownerId: string
): Promise<DaycareTransactionRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_transactions")
    .select(DAYCARE_TRANSACTION_COLUMNS)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load owner daycare transactions"
      )
    )
  }

  return data ?? []
}

/** Single daycare transaction */
export async function getDaycareTransactionById(
  id: string
): Promise<DaycareTransactionRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_transactions")
    .select(DAYCARE_TRANSACTION_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daycare transaction"
      )
    )
  }

  return data
}

export async function listDaycareTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<DaycareTransactionRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_transactions")
    .select(DAYCARE_TRANSACTION_COLUMNS)
    .gte("scheduled_at", startDate)
    .lt("scheduled_at", endDate)
    .order("scheduled_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daycare transaction history"
      )
    )
  }

  return data ?? []
}

type DaycareHistoryFilters = {
  from?: string
  to?: string
  petId?: string
  status?: DaycareTransactionRow["status"]
}

export async function listDaycareTransactionHistory(
  filters: DaycareHistoryFilters = {}
): Promise<DaycareTransactionRow[]> {
  const supabase = await createClient()

  let query = supabase
    .from("daycare_transactions")
    .select(DAYCARE_TRANSACTION_COLUMNS)
    .in("status", ["checked_out", "cancelled"])
    .order("scheduled_at", { ascending: false })

  if (filters.from) {
    query = query.gte(
      "scheduled_at",
      `${filters.from}T00:00:00`
    )
  }

  if (filters.to) {
    const endDate = new Date(`${filters.to}T00:00:00`)
    endDate.setDate(endDate.getDate() + 1)

    query = query.lt(
      "scheduled_at",
      endDate.toISOString()
    )
  }

  if (filters.petId) {
    query = query.eq("pet_id", filters.petId)
  }

  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daycare transaction history"
      )
    )
  }

  return data ?? []
}