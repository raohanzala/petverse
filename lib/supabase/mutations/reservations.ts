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
import type { ReservationRow } from "@/lib/supabase/types"
import {
  createReservationSchema,
  deleteReservationSchema,
  updateReservationSchema,
  type CreateReservationInput,
  type UpdateReservationInput,
} from "@/lib/validations/reservation"

const REVALIDATE_PATHS = [
  "/admin/reservations",
  "/admin/appointments",
  "/book",
] as const

function revalidateReservationPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeNotes(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createReservation(
  input: CreateReservationInput
): Promise<MutationResult<ReservationRow>> {
  await requireStaff()

  const parsed = createReservationSchema.safeParse({
    ...input,
    notes: normalizeNotes(input.notes),
  })

  if (!parsed.success) {
    return mutationError(parsed.error.issues[0]?.message ?? "Invalid input")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      pet_id: parsed.data.pet_id,
      owner_id: parsed.data.owner_id,
      resource_id: parsed.data.resource_id,
      service_id: parsed.data.service_id,
      status: parsed.data.status,
      check_in_at: parsed.data.check_in_at,
      check_out_at: parsed.data.check_out_at,
      notes: parsed.data.notes,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(error, "Failed to create reservation")
    )
  }

  revalidateReservationPaths()
  return mutationSuccess(data)
}

export async function updateReservation(
  input: UpdateReservationInput
): Promise<MutationResult<ReservationRow>> {
  await requireStaff()

  const parsed = updateReservationSchema.safeParse({
    ...input,
    notes:
      input.notes !== undefined
        ? normalizeNotes(input.notes)
        : undefined,
  })

  if (!parsed.success) {
    return mutationError(parsed.error.issues[0]?.message ?? "Invalid input")
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.pet_id !== undefined) payload.pet_id = updates.pet_id
  if (updates.owner_id !== undefined) payload.owner_id = updates.owner_id
  if (updates.resource_id !== undefined) {
    payload.resource_id = updates.resource_id
  }
  if (updates.service_id !== undefined) {
    payload.service_id = updates.service_id
  }
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.check_in_at !== undefined) {
    payload.check_in_at = updates.check_in_at
  }
  if (updates.check_out_at !== undefined) {
    payload.check_out_at = updates.check_out_at
  }
  if (updates.notes !== undefined) payload.notes = updates.notes

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("reservations")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(error, "Failed to update reservation")
    )
  }

  revalidateReservationPaths()
  return mutationSuccess(data)
}

export async function deleteReservation(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteReservationSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid reservation"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("reservations")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(error, "Failed to delete reservation")
    )
  }

  revalidateReservationPaths()
  return mutationSuccess(undefined)
}