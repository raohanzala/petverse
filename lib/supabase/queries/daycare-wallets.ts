import { createClient } from "@/lib/supabase/server"
import type { DaycareWalletRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const DAYCARE_WALLET_COLUMNS =
  "id, owner_id, pet_id, package_id, visits_remaining, expires_at, created_at, updated_at" as const

/** Admin list — all daycare wallets */
export async function listDaycareWallets(): Promise<
  DaycareWalletRow[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_wallets")
    .select(DAYCARE_WALLET_COLUMNS)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daycare wallets"
      )
    )
  }

  return data ?? []
}

/** Owner wallets */
export async function listDaycareWalletsByOwnerId(
  ownerId: string
): Promise<DaycareWalletRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_wallets")
    .select(DAYCARE_WALLET_COLUMNS)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load owner daycare wallets"
      )
    )
  }

  return data ?? []
}

/** Pet-specific wallets */
export async function listDaycareWalletsByPetId(
  petId: string
): Promise<DaycareWalletRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_wallets")
    .select(DAYCARE_WALLET_COLUMNS)
    .eq("pet_id", petId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load pet daycare wallets"
      )
    )
  }

  return data ?? []
}

/** Wallet with remaining visits */
export async function listActiveDaycareWallets(): Promise<
  DaycareWalletRow[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_wallets")
    .select(DAYCARE_WALLET_COLUMNS)
    .gt("visits_remaining", 0)
    .or(
      "expires_at.is.null,expires_at.gt.now()"
    )
    .order("expires_at", {
      ascending: true,
      nullsFirst: false,
    })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load active daycare wallets"
      )
    )
  }

  return data ?? []
}

/** Single daycare wallet */
export async function getDaycareWalletById(
  id: string
): Promise<DaycareWalletRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_wallets")
    .select(DAYCARE_WALLET_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daycare wallet"
      )
    )
  }

  return data
}