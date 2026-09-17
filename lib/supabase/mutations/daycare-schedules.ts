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
import type { DaycareScheduleRow } from "@/lib/supabase/types"
import {
  createDaycareScheduleSchema,
  deleteDaycareScheduleSchema,
  updateDaycareScheduleSchema,
  type CreateDaycareScheduleInput,
  type UpdateDaycareScheduleInput,
} from "@/lib/validations/daycare-schedule"

const REVALIDATE_PATHS = [
  "/admin/schedule/daycare",
] as const

function revalidateDaycareSchedulePaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

export async function createDaycareSchedule(
  input: CreateDaycareScheduleInput
): Promise<MutationResult<DaycareScheduleRow>> {
  await requireStaff()

  const parsed = createDaycareScheduleSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_schedules")
    .insert({
      pet_id: parsed.data.pet_id,
      owner_id: parsed.data.owner_id,
      resource_id: parsed.data.resource_id,
      days_of_week: parsed.data.days_of_week,
      starts_at: parsed.data.starts_at,
      ends_at: parsed.data.ends_at,
      is_active: parsed.data.is_active,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create daycare schedule"
      )
    )
  }

  revalidateDaycareSchedulePaths()

  return mutationSuccess(data)
}

export async function updateDaycareSchedule(
  input: UpdateDaycareScheduleInput
): Promise<MutationResult<DaycareScheduleRow>> {
  await requireStaff()

  const parsed = updateDaycareScheduleSchema.safeParse(input)

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

  if (updates.resource_id !== undefined) {
    payload.resource_id = updates.resource_id
  }

  if (updates.days_of_week !== undefined) {
    payload.days_of_week = updates.days_of_week
  }

  if (updates.starts_at !== undefined) {
    payload.starts_at = updates.starts_at
  }

  if (updates.ends_at !== undefined) {
    payload.ends_at = updates.ends_at
  }

  if (updates.is_active !== undefined) {
    payload.is_active = updates.is_active
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_schedules")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update daycare schedule"
      )
    )
  }

  revalidateDaycareSchedulePaths()

  return mutationSuccess(data)
}

export async function deleteDaycareSchedule(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteDaycareScheduleSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid schedule"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("daycare_schedules")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete daycare schedule"
      )
    )
  }

  revalidateDaycareSchedulePaths()

  return mutationSuccess(undefined)
}