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
import type {
  PetBoardingInstructionsRow,
} from "@/lib/supabase/types"
import {
  createBoardingInstructionsSchema,
  deleteBoardingInstructionsSchema,
  updateBoardingInstructionsSchema,
  type CreateBoardingInstructionsInput,
  type UpdateBoardingInstructionsInput,
} from "@/lib/validations/boarding-instructions"

const REVALIDATE_PATHS = [
  "/admin/scheduling/boarding",
] as const

function revalidateBoardingInstructionsPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeText(
  value: string | null | undefined
) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createBoardingInstructions(
  input: CreateBoardingInstructionsInput
): Promise<MutationResult<PetBoardingInstructionsRow>> {
  await requireStaff()

  const parsed =
    createBoardingInstructionsSchema.safeParse({
      ...input,
      feeding_notes: normalizeText(
        input.feeding_notes
      ),
      medication_notes: normalizeText(
        input.medication_notes
      ),
      behavior_notes: normalizeText(
        input.behavior_notes
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
    .from("pet_boarding_instructions")
    .insert({
      pet_id: parsed.data.pet_id,
      reservation_id:
        parsed.data.reservation_id ?? null,
      feeding_notes: parsed.data.feeding_notes,
      medication_notes:
        parsed.data.medication_notes,
      behavior_notes:
        parsed.data.behavior_notes,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create boarding instructions"
      )
    )
  }

  revalidateBoardingInstructionsPaths()

  return mutationSuccess(data)
}

export async function updateBoardingInstructions(
  input: UpdateBoardingInstructionsInput
): Promise<MutationResult<PetBoardingInstructionsRow>> {
  await requireStaff()

  const parsed =
    updateBoardingInstructionsSchema.safeParse({
      ...input,
      feeding_notes:
        input.feeding_notes !== undefined
          ? normalizeText(input.feeding_notes)
          : undefined,
      medication_notes:
        input.medication_notes !== undefined
          ? normalizeText(input.medication_notes)
          : undefined,
      behavior_notes:
        input.behavior_notes !== undefined
          ? normalizeText(input.behavior_notes)
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

  if (updates.pet_id !== undefined) {
    payload.pet_id = updates.pet_id
  }

  if (updates.reservation_id !== undefined) {
    payload.reservation_id = updates.reservation_id
  }

  if (updates.feeding_notes !== undefined) {
    payload.feeding_notes =
      updates.feeding_notes
  }

  if (updates.medication_notes !== undefined) {
    payload.medication_notes =
      updates.medication_notes
  }

  if (updates.behavior_notes !== undefined) {
    payload.behavior_notes =
      updates.behavior_notes
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pet_boarding_instructions")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update boarding instructions"
      )
    )
  }

  revalidateBoardingInstructionsPaths()

  return mutationSuccess(data)
}

export async function deleteBoardingInstructions(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed =
    deleteBoardingInstructionsSchema.safeParse({
      id,
    })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid boarding instructions"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("pet_boarding_instructions")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete boarding instructions"
      )
    )
  }

  revalidateBoardingInstructionsPaths()

  return mutationSuccess(undefined)
}