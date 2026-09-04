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
import type { PetRow } from "@/lib/supabase/types"
import {
  createPetSchema,
  deletePetSchema,
  updatePetSchema,
  type CreatePetInput,
  type UpdatePetInput,
} from "@/lib/validations/pet"

const REVALIDATE_PATHS = [
  "/admin/pets",
  "/admin/appointments",
  "/book",
] as const

function revalidatePetPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createPet(
  input: CreatePetInput
): Promise<MutationResult<PetRow>> {
  await requireStaff()

  const parsed = createPetSchema.safeParse({
    ...input,
    breed: normalizeOptionalText(input.breed),
    color: normalizeOptionalText(input.color),
    notes: normalizeOptionalText(input.notes),
  })

  if (!parsed.success) {
    return mutationError(parsed.error.issues[0]?.message ?? "Invalid input")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pets")
    .insert({
      owner_id: parsed.data.owner_id,
      name: parsed.data.name.trim(),
      species: parsed.data.species.trim(),
      breed: parsed.data.breed,
      birth_date: parsed.data.birth_date || null,
      weight_kg: parsed.data.weight_kg ?? null,
      color: parsed.data.color,
      notes: parsed.data.notes,
      is_active: parsed.data.is_active,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(error, "Failed to create pet")
    )
  }

  revalidatePetPaths()
  return mutationSuccess(data)
}

export async function updatePet(
  input: UpdatePetInput
): Promise<MutationResult<PetRow>> {
  await requireStaff()

  const parsed = updatePetSchema.safeParse({
    ...input,
    breed:
      input.breed !== undefined
        ? normalizeOptionalText(input.breed)
        : undefined,
    color:
      input.color !== undefined
        ? normalizeOptionalText(input.color)
        : undefined,
    notes:
      input.notes !== undefined
        ? normalizeOptionalText(input.notes)
        : undefined,
  })

  if (!parsed.success) {
    return mutationError(parsed.error.issues[0]?.message ?? "Invalid input")
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.owner_id !== undefined) {
    payload.owner_id = updates.owner_id
  }

  if (updates.name !== undefined) {
    payload.name = updates.name.trim()
  }

  if (updates.species !== undefined) {
    payload.species = updates.species.trim()
  }

  if (updates.breed !== undefined) {
    payload.breed = updates.breed
  }

  if (updates.birth_date !== undefined) {
    payload.birth_date = updates.birth_date || null
  }

  if (updates.weight_kg !== undefined) {
    payload.weight_kg = updates.weight_kg ?? null
  }

  if (updates.color !== undefined) {
    payload.color = updates.color
  }

  if (updates.notes !== undefined) {
    payload.notes = updates.notes
  }

  if (updates.is_active !== undefined) {
    payload.is_active = updates.is_active
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pets")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(error, "Failed to update pet")
    )
  }

  revalidatePetPaths()
  return mutationSuccess(data)
}

export async function deletePet(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deletePetSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid pet"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("pets")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(error, "Failed to delete pet")
    )
  }

  revalidatePetPaths()
  return mutationSuccess(undefined)
}