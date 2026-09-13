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
import type { BusinessTargetRow } from "@/lib/supabase/types"
import {
  createBusinessTargetSchema,
  deleteBusinessTargetSchema,
  updateBusinessTargetSchema,
  type CreateBusinessTargetInput,
  type UpdateBusinessTargetInput,
} from "@/lib/validations/business-target"

const REVALIDATE_PATHS = [
  "/admin/crm/business-targets",
] as const

function revalidateBusinessTargetPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeNotes(value: string | null | undefined) {
  const trimmed = value?.trim()

  return trimmed ? trimmed : null
}

export async function createBusinessTarget(
  input: CreateBusinessTargetInput
): Promise<MutationResult<BusinessTargetRow>> {
  await requireStaff()

  const parsed = createBusinessTargetSchema.safeParse({
    ...input,
    metric_key: input.metric_key.trim(),
    notes: normalizeNotes(input.notes),
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("business_targets")
    .insert({
      metric_key: parsed.data.metric_key.trim(),
      target_value: parsed.data.target_value,
      period_start: parsed.data.period_start,
      period_end: parsed.data.period_end,
      notes: parsed.data.notes,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create business target"
      )
    )
  }

  revalidateBusinessTargetPaths()

  return mutationSuccess(data)
}

export async function updateBusinessTarget(
  input: UpdateBusinessTargetInput
): Promise<MutationResult<BusinessTargetRow>> {
  await requireStaff()

  const parsed = updateBusinessTargetSchema.safeParse({
    ...input,
    metric_key:
      input.metric_key !== undefined
        ? input.metric_key.trim()
        : undefined,
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

  if (updates.metric_key !== undefined) {
    payload.metric_key = updates.metric_key.trim()
  }

  if (updates.target_value !== undefined) {
    payload.target_value = updates.target_value
  }

  if (updates.period_start !== undefined) {
    payload.period_start = updates.period_start
  }

  if (updates.period_end !== undefined) {
    payload.period_end = updates.period_end
  }

  if (updates.notes !== undefined) {
    payload.notes = updates.notes
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("business_targets")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update business target"
      )
    )
  }

  revalidateBusinessTargetPaths()

  return mutationSuccess(data)
}

export async function deleteBusinessTarget(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteBusinessTargetSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid business target"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("business_targets")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete business target"
      )
    )
  }

  revalidateBusinessTargetPaths()

  return mutationSuccess(undefined)
}