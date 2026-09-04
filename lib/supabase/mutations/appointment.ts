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
import type { AppointmentRow } from "@/lib/supabase/types"
import {
  createAppointmentSchema,
  deleteAppointmentSchema,
  updateAppointmentSchema,
  type CreateAppointmentInput,
  type UpdateAppointmentInput,
} from "@/lib/validations/appointments"

const REVALIDATE_PATHS = [
  "/admin/appointments",
  "/admin/pets",
  "/admin/owners",
  "/book",
] as const

function revalidateAppointmentPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeOptionalText(
  value: string | null | undefined
) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createAppointment(
  input: CreateAppointmentInput
): Promise<MutationResult<AppointmentRow>> {
  await requireStaff()

  const parsed = createAppointmentSchema.safeParse({
    ...input,
    notes: normalizeOptionalText(input.notes),
    cancel_reason: normalizeOptionalText(input.cancel_reason),
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      owner_id: parsed.data.owner_id,
      pet_id: parsed.data.pet_id,
      service_id: parsed.data.service_id ?? null,
      package_id: parsed.data.package_id ?? null,
      employee_id: parsed.data.employee_id ?? null,
      preferred_employee_id:
        parsed.data.preferred_employee_id ?? null,
      status: parsed.data.status,
      source: parsed.data.source,
      starts_at: parsed.data.starts_at,
      ends_at: parsed.data.ends_at,
      duration_minutes: parsed.data.duration_minutes,
      price: parsed.data.price,
      group_id: parsed.data.group_id ?? null,
      step_order: parsed.data.step_order ?? null,
      notes: parsed.data.notes,
      cancelled_at: parsed.data.cancelled_at ?? null,
      cancel_reason: parsed.data.cancel_reason,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create appointment"
      )
    )
  }

  revalidateAppointmentPaths()
  return mutationSuccess(data)
}

export async function updateAppointment(
  input: UpdateAppointmentInput
): Promise<MutationResult<AppointmentRow>> {
  await requireStaff()

  const parsed = updateAppointmentSchema.safeParse({
    ...input,
    notes:
      input.notes !== undefined
        ? normalizeOptionalText(input.notes)
        : undefined,
    cancel_reason:
      input.cancel_reason !== undefined
        ? normalizeOptionalText(input.cancel_reason)
        : undefined,
  })

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

  if (updates.service_id !== undefined) {
    payload.service_id = updates.service_id
  }

  if (updates.package_id !== undefined) {
    payload.package_id = updates.package_id
  }

  if (updates.employee_id !== undefined) {
    payload.employee_id = updates.employee_id
  }

  if (updates.preferred_employee_id !== undefined) {
    payload.preferred_employee_id =
      updates.preferred_employee_id
  }

  if (updates.status !== undefined) {
    payload.status = updates.status
  }

  if (updates.source !== undefined) {
    payload.source = updates.source
  }

  if (updates.starts_at !== undefined) {
    payload.starts_at = updates.starts_at
  }

  if (updates.ends_at !== undefined) {
    payload.ends_at = updates.ends_at
  }

  if (updates.duration_minutes !== undefined) {
    payload.duration_minutes = updates.duration_minutes
  }

  if (updates.price !== undefined) {
    payload.price = updates.price
  }

  if (updates.group_id !== undefined) {
    payload.group_id = updates.group_id
  }

  if (updates.step_order !== undefined) {
    payload.step_order = updates.step_order
  }

  if (updates.notes !== undefined) {
    payload.notes = updates.notes
  }

  if (updates.cancelled_at !== undefined) {
    payload.cancelled_at = updates.cancelled_at
  }

  if (updates.cancel_reason !== undefined) {
    payload.cancel_reason = updates.cancel_reason
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("appointments")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update appointment"
      )
    )
  }

  revalidateAppointmentPaths()
  return mutationSuccess(data)
}

export async function deleteAppointment(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteAppointmentSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid appointment"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete appointment"
      )
    )
  }

  revalidateAppointmentPaths()
  return mutationSuccess(undefined)
}