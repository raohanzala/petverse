"use server"

import { revalidatePath } from "next/cache"

import type { DepositRow } from "@/lib/supabase/types"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

import {
  createDepositSchema,
  updateDepositSchema,
  deleteDepositSchema,
  type CreateDepositInput,
  type UpdateDepositInput,
} from "@/lib/validations/deposit"

type MutationResult<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
    }

function mutationError(
  error: string
): MutationResult<never> {
  return {
    success: false,
    error,
  }
}

function mutationSuccess<T>(
  data: T
): MutationResult<T> {
  return {
    success: true,
    data,
  }
}

function normalizeProviderRef(
  value?: string | null
) {
  const normalized = value?.trim()

  return normalized || null
}

function revalidateDepositPaths() {
  revalidatePath("/admin/sales/billing")
}

export async function createDeposit(
  input: CreateDepositInput
): Promise<MutationResult<DepositRow>> {
  const parsed =
    createDepositSchema.safeParse({
      ...input,
      provider_ref: normalizeProviderRef(
        input.provider_ref
      ),
    })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("deposits")
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create deposit"
      )
    )
  }

  revalidateDepositPaths()

  return mutationSuccess(data)
}

export async function updateDeposit(
  input: UpdateDepositInput
): Promise<MutationResult<DepositRow>> {
  const parsed =
    updateDepositSchema.safeParse({
      ...input,
      provider_ref:
        input.provider_ref === undefined
          ? undefined
          : normalizeProviderRef(
              input.provider_ref
            ),
    })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid input"
    )
  }

  const {
    id,
    ...updates
  } = parsed.data

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("deposits")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update deposit"
      )
    )
  }

  revalidateDepositPaths()

  return mutationSuccess(data)
}

export async function deleteDeposit(
  id: string
): Promise<MutationResult<{ id: string }>> {
  const parsed =
    deleteDepositSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid deposit id"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("deposits")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete deposit"
      )
    )
  }

  revalidateDepositPaths()

  return mutationSuccess({
    id: parsed.data.id,
  })
}