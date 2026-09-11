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
import type { DaycareTransactionRow } from "@/lib/supabase/types"
import {
  createDaycareTransactionSchema,
  deleteDaycareTransactionSchema,
  updateDaycareTransactionSchema,
  type CreateDaycareTransactionInput,
  type UpdateDaycareTransactionInput,
} from "@/lib/validations/daycare-transaction"

const REVALIDATE_PATHS = [
  "/admin/scheduling/daycare",
] as const

function revalidateDaycareTransactionPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeNotes(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createDaycareTransaction(
  input: CreateDaycareTransactionInput
): Promise<MutationResult<DaycareTransactionRow>> {
  await requireStaff()

  const parsed = createDaycareTransactionSchema.safeParse({
    ...input,
    notes: normalizeNotes(input.notes),
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_transactions")
    .insert({
      pet_id: parsed.data.pet_id,
      owner_id: parsed.data.owner_id,
      wallet_id: parsed.data.wallet_id ?? null,
      status: parsed.data.status,
      scheduled_at: parsed.data.scheduled_at ?? null,
      check_in_at: parsed.data.check_in_at ?? null,
      check_out_at: parsed.data.check_out_at ?? null,
      amount: parsed.data.amount ?? null,
      notes: parsed.data.notes,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create daycare transaction"
      )
    )
  }

  revalidateDaycareTransactionPaths()

  return mutationSuccess(data)
}

export async function updateDaycareTransaction(
  input: UpdateDaycareTransactionInput
): Promise<MutationResult<DaycareTransactionRow>> {
  await requireStaff()

  const parsed = updateDaycareTransactionSchema.safeParse({
    ...input,
    notes:
      input.notes !== undefined
        ? normalizeNotes(input.notes)
        : undefined,
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.pet_id !== undefined) {
    payload.pet_id = updates.pet_id
  }

  if (updates.owner_id !== undefined) {
    payload.owner_id = updates.owner_id
  }

  if (updates.wallet_id !== undefined) {
    payload.wallet_id = updates.wallet_id
  }

  if (updates.status !== undefined) {
    payload.status = updates.status
  }

  if (updates.scheduled_at !== undefined) {
    payload.scheduled_at = updates.scheduled_at
  }

  if (updates.check_in_at !== undefined) {
    payload.check_in_at = updates.check_in_at
  }

  if (updates.check_out_at !== undefined) {
    payload.check_out_at = updates.check_out_at
  }

  if (updates.amount !== undefined) {
    payload.amount = updates.amount
  }

  if (updates.notes !== undefined) {
    payload.notes = updates.notes
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_transactions")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update daycare transaction"
      )
    )
  }

  revalidateDaycareTransactionPaths()

  return mutationSuccess(data)
}

export async function deleteDaycareTransaction(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteDaycareTransactionSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid transaction"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("daycare_transactions")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete daycare transaction"
      )
    )
  }

  revalidateDaycareTransactionPaths()

  return mutationSuccess(undefined)
}