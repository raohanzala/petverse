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
import type { AttendanceEntryRow } from "@/lib/supabase/types"
import {
  createAttendanceEntrySchema,
  deleteAttendanceEntrySchema,
  updateAttendanceEntrySchema,
  type CreateAttendanceEntryInput,
  type UpdateAttendanceEntryInput,
} from "@/lib/validations/attendance-entries"

const REVALIDATE_PATHS = [
  "/admin/boarding",
  "/admin/reservations",
] as const

function revalidateAttendancePaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeNotes(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createAttendanceEntry(
  input: CreateAttendanceEntryInput
): Promise<MutationResult<AttendanceEntryRow>> {
  await requireStaff()

  const parsed = createAttendanceEntrySchema.safeParse({
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
    .from("attendance_entries")
    .insert({
      reservation_id: parsed.data.reservation_id,
      type: parsed.data.type,
      recorded_by: parsed.data.recorded_by,
      flags: parsed.data.flags,
      notes: parsed.data.notes,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create attendance entry"
      )
    )
  }

  revalidateAttendancePaths()
  return mutationSuccess(data)
}

export async function updateAttendanceEntry(
  input: UpdateAttendanceEntryInput
): Promise<MutationResult<AttendanceEntryRow>> {
  await requireStaff()

  const parsed = updateAttendanceEntrySchema.safeParse({
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

  if (updates.reservation_id !== undefined) {
    payload.reservation_id = updates.reservation_id
  }

  if (updates.type !== undefined) {
    payload.type = updates.type
  }

  if (updates.recorded_by !== undefined) {
    payload.recorded_by = updates.recorded_by
  }

  if (updates.flags !== undefined) {
    payload.flags = updates.flags
  }

  if (updates.notes !== undefined) {
    payload.notes = updates.notes
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("attendance_entries")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update attendance entry"
      )
    )
  }

  revalidateAttendancePaths()
  return mutationSuccess(data)
}

export async function deleteAttendanceEntry(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteAttendanceEntrySchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid attendance entry"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("attendance_entries")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete attendance entry"
      )
    )
  }

  revalidateAttendancePaths()
  return mutationSuccess(undefined)
}