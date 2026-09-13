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
import type { PetVaccinationRow } from "@/lib/supabase/types"
import {
  createPetVaccinationSchema,
  deletePetVaccinationSchema,
  updatePetVaccinationSchema,
  type CreatePetVaccinationInput,
  type UpdatePetVaccinationInput,
} from "@/lib/validations/pet-vaccinations"

const REVALIDATE_PATHS = [
  "/admin/compliance/pet-vaccinations",
] as const

function revalidatePetVaccinationPaths() {
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

export async function createPetVaccination(
  input: CreatePetVaccinationInput
): Promise<MutationResult<PetVaccinationRow>> {
  await requireStaff()

  const parsed =
    createPetVaccinationSchema.safeParse({
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

  const { data, error } = await supabase
    .from("pet_vaccinations")
    .insert({
      pet_id: parsed.data.pet_id,
      vaccine_type_id: parsed.data.vaccine_type_id,
      administered_at: parsed.data.administered_at,
      expires_at: parsed.data.expires_at,
      notes: parsed.data.notes,
      recorded_by: parsed.data.recorded_by,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create pet vaccination"
      )
    )
  }

  revalidatePetVaccinationPaths()
  return mutationSuccess(data)
}

export async function updatePetVaccination(
  input: UpdatePetVaccinationInput
): Promise<MutationResult<PetVaccinationRow>> {
  await requireStaff()

  const parsed =
    updatePetVaccinationSchema.safeParse({
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

  if (updates.pet_id !== undefined) {
    payload.pet_id = updates.pet_id
  }

  if (updates.vaccine_type_id !== undefined) {
    payload.vaccine_type_id =
      updates.vaccine_type_id
  }

  if (updates.administered_at !== undefined) {
    payload.administered_at =
      updates.administered_at
  }

  if (updates.expires_at !== undefined) {
    payload.expires_at = updates.expires_at
  }

  if (updates.notes !== undefined) {
    payload.notes = updates.notes
  }

  if (updates.recorded_by !== undefined) {
    payload.recorded_by = updates.recorded_by
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pet_vaccinations")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update pet vaccination"
      )
    )
  }

  revalidatePetVaccinationPaths()
  return mutationSuccess(data)
}

export async function deletePetVaccination(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed =
    deletePetVaccinationSchema.safeParse({
      id,
    })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid vaccination"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("pet_vaccinations")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete pet vaccination"
      )
    )
  }

  revalidatePetVaccinationPaths()
  return mutationSuccess(undefined)
}