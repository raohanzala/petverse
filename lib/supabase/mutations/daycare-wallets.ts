"use server"

import { revalidatePath } from "next/cache"

import { requireStaff } from "@/lib/auth/session"
import {
  getSupabaseErrorMessage,
  mutationError,
  mutationSuccess,
  type MutationResult,
} from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"
import type { DaycareWalletRow } from "@/lib/supabase/types"
import {
  createDaycareWalletSchema,
  deleteDaycareWalletSchema,
  updateDaycareWalletSchema,
  type CreateDaycareWalletInput,
  type UpdateDaycareWalletInput,
} from "@/lib/validations/daycare-wallet"

const REVALIDATE_PATHS = [
  "/admin/scheduling/daycare",
] as const

function revalidateDaycareWalletPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

export async function createDaycareWallet(
  input: CreateDaycareWalletInput
): Promise<MutationResult<DaycareWalletRow>> {
  await requireStaff()

  const parsed = createDaycareWalletSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_wallets")
    .insert({
      owner_id: parsed.data.owner_id,
      pet_id: parsed.data.pet_id ?? null,
      package_id: parsed.data.package_id,
      visits_remaining: parsed.data.visits_remaining,
      expires_at: parsed.data.expires_at ?? null,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create daycare wallet"
      )
    )
  }

  revalidateDaycareWalletPaths()

  return mutationSuccess(data)
}

export async function updateDaycareWallet(
  input: UpdateDaycareWalletInput
): Promise<MutationResult<DaycareWalletRow>> {
  await requireStaff()

  const parsed = updateDaycareWalletSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.owner_id !== undefined) {
    payload.owner_id = updates.owner_id
  }

  if (updates.pet_id !== undefined) {
    payload.pet_id = updates.pet_id
  }

  if (updates.package_id !== undefined) {
    payload.package_id = updates.package_id
  }

  if (updates.visits_remaining !== undefined) {
    payload.visits_remaining = updates.visits_remaining
  }

  if (updates.expires_at !== undefined) {
    payload.expires_at = updates.expires_at
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_wallets")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update daycare wallet"
      )
    )
  }

  revalidateDaycareWalletPaths()

  return mutationSuccess(data)
}

export async function deleteDaycareWallet(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteDaycareWalletSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid wallet"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("daycare_wallets")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete daycare wallet"
      )
    )
  }

  revalidateDaycareWalletPaths()

  return mutationSuccess(undefined)
}