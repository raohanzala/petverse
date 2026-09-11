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
import type { RoomTransferRow } from "@/lib/supabase/types"
import {
  createRoomTransferSchema,
  deleteRoomTransferSchema,
  updateRoomTransferSchema,
  type CreateRoomTransferInput,
  type UpdateRoomTransferInput,
} from "@/lib/validations/room-transfers"

const REVALIDATE_PATHS = [
  "/admin/scheduling/boarding",
] as const

function revalidateRoomTransferPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeNotes(
  value: string | null | undefined
) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createRoomTransfer(
  input: CreateRoomTransferInput
): Promise<MutationResult<RoomTransferRow>> {
  await requireStaff()

  const parsed = createRoomTransferSchema.safeParse({
    ...input,
    notes: normalizeNotes(input.notes),
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid input"
    )
  }

  const supabase = await createClient()

  const {
    data: reservation,
    error: reservationError,
  } = await supabase
    .from("reservations")
    .select("id, resource_id")
    .eq("id", parsed.data.reservation_id)
    .maybeSingle()

  if (reservationError) {
    return mutationError(
      getSupabaseErrorMessage(
        reservationError,
        "Failed to load reservation"
      )
    )
  }

  if (!reservation) {
    return mutationError("Reservation not found")
  }

  if (
    reservation.resource_id !==
    parsed.data.from_resource_id
  ) {
    return mutationError(
      "The source room does not match the reservation's current room"
    )
  }

  if (
    parsed.data.from_resource_id ===
    parsed.data.to_resource_id
  ) {
    return mutationError(
      "The destination room must be different from the current room"
    )
  }

  const {
    data: transfer,
    error: transferError,
  } = await supabase
    .from("room_transfers")
    .insert({
      reservation_id:
        parsed.data.reservation_id,
      from_resource_id:
        parsed.data.from_resource_id ?? null,
      to_resource_id:
        parsed.data.to_resource_id,
      transferred_at:
        parsed.data.transferred_at,
      notes: parsed.data.notes,
    })
    .select()
    .single()

  if (transferError) {
    return mutationError(
      getSupabaseErrorMessage(
        transferError,
        "Failed to create room transfer"
      )
    )
  }

  const {
    error: updateReservationError,
  } = await supabase
    .from("reservations")
    .update({
      resource_id:
        parsed.data.to_resource_id,
    })
    .eq(
      "id",
      parsed.data.reservation_id
    )

  if (updateReservationError) {
    return mutationError(
      getSupabaseErrorMessage(
        updateReservationError,
        "Failed to update reservation room"
      )
    )
  }

  revalidateRoomTransferPaths()

  return mutationSuccess(transfer)
}

export async function updateRoomTransfer(
  input: UpdateRoomTransferInput
): Promise<MutationResult<RoomTransferRow>> {
  await requireStaff()

  const parsed =
    updateRoomTransferSchema.safeParse({
      ...input,
      notes:
        input.notes !== undefined
          ? normalizeNotes(input.notes)
          : undefined,
    })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid input"
    )
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.reservation_id !== undefined) {
    payload.reservation_id =
      updates.reservation_id
  }

  if (updates.from_resource_id !== undefined) {
    payload.from_resource_id =
      updates.from_resource_id
  }

  if (updates.to_resource_id !== undefined) {
    payload.to_resource_id =
      updates.to_resource_id
  }

  if (updates.transferred_at !== undefined) {
    payload.transferred_at =
      updates.transferred_at
  }

  if (updates.notes !== undefined) {
    payload.notes = updates.notes
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const {
    data,
    error,
  } = await supabase
    .from("room_transfers")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update room transfer"
      )
    )
  }

  revalidateRoomTransferPaths()

  return mutationSuccess(data)
}

export async function deleteRoomTransfer(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed =
    deleteRoomTransferSchema.safeParse({
      id,
    })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid room transfer"
    )
  }

  const supabase = await createClient()

  const {
    data: transfer,
    error: transferError,
  } = await supabase
    .from("room_transfers")
    .select(
      `
        id,
        reservation_id,
        from_resource_id,
        to_resource_id
      `
    )
    .eq("id", parsed.data.id)
    .maybeSingle()

  if (transferError) {
    return mutationError(
      getSupabaseErrorMessage(
        transferError,
        "Failed to load room transfer"
      )
    )
  }

  if (!transfer) {
    return mutationError(
      "Room transfer not found"
    )
  }

  const {
    data: latestTransfer,
    error: latestTransferError,
  } = await supabase
    .from("room_transfers")
    .select(
      `
        id,
        transferred_at
      `
    )
    .eq(
      "reservation_id",
      transfer.reservation_id
    )
    .order("transferred_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle()

  if (latestTransferError) {
    return mutationError(
      getSupabaseErrorMessage(
        latestTransferError,
        "Failed to verify latest room transfer"
      )
    )
  }

  if (
    latestTransfer?.id !==
    transfer.id
  ) {
    return mutationError(
      "Only the latest room transfer can be deleted"
    )
  }

  const {
    error: deleteError,
  } = await supabase
    .from("room_transfers")
    .delete()
    .eq(
      "id",
      parsed.data.id
    )

  if (deleteError) {
    return mutationError(
      getSupabaseErrorMessage(
        deleteError,
        "Failed to delete room transfer"
      )
    )
  }

  if (transfer.from_resource_id) {
    const {
      error: reservationError,
    } = await supabase
      .from("reservations")
      .update({
        resource_id:
          transfer.from_resource_id,
      })
      .eq(
        "id",
        transfer.reservation_id
      )

    if (reservationError) {
      return mutationError(
        getSupabaseErrorMessage(
          reservationError,
          "Failed to restore reservation room"
        )
      )
    }
  }

  revalidateRoomTransferPaths()

  return mutationSuccess(undefined)
}