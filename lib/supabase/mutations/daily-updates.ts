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

import type { DailyUpdateRow } from "@/lib/supabase/types"

import {
  createDailyUpdateSchema,
  deleteDailyUpdateSchema,
  updateDailyUpdateSchema,
  type CreateDailyUpdateInput,
  type UpdateDailyUpdateInput,
} from "@/lib/validations/daily-update"

const REVALIDATE_PATHS = [
  "/admin/communications/daily-updates",
] as const

function revalidateDailyUpdatePaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

export async function createDailyUpdate(
  input: CreateDailyUpdateInput
): Promise<MutationResult<DailyUpdateRow>> {
  await requireStaff()

  const parsed = createDailyUpdateSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daily_updates")
    .insert({
      pet_id: parsed.data.pet_id,
      appointment_id:
        parsed.data.appointment_id ?? null,
      author_id:
        parsed.data.author_id ?? null,
      body: parsed.data.body.trim(),
      sent_to_owner_at:
        parsed.data.sent_to_owner_at ?? null,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create daily update"
      )
    )
  }

  revalidateDailyUpdatePaths()

  return mutationSuccess(data)
}

export async function updateDailyUpdate(
  input: UpdateDailyUpdateInput
): Promise<MutationResult<DailyUpdateRow>> {
  await requireStaff()

  const parsed =
    updateDailyUpdateSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid input"
    )
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.pet_id !== undefined) {
    payload.pet_id = updates.pet_id
  }

  if (updates.appointment_id !== undefined) {
    payload.appointment_id = updates.appointment_id
  }

  if (updates.author_id !== undefined) {
    payload.author_id = updates.author_id
  }

  if (updates.body !== undefined) {
    payload.body = updates.body.trim()
  }

  if (updates.sent_to_owner_at !== undefined) {
    payload.sent_to_owner_at =
      updates.sent_to_owner_at
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daily_updates")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update daily update"
      )
    )
  }

  revalidateDailyUpdatePaths()

  return mutationSuccess(data)
}

export async function deleteDailyUpdate(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed =
    deleteDailyUpdateSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid daily update"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("daily_updates")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete daily update"
      )
    )
  }

  revalidateDailyUpdatePaths()

  return mutationSuccess(undefined)
}