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
import type { VaccineTypeRow } from "@/lib/supabase/types"
import {
  createVaccineTypeSchema,
  deleteVaccineTypeSchema,
  updateVaccineTypeSchema,
  type CreateVaccineTypeInput,
  type UpdateVaccineTypeInput,
} from "@/lib/validations/vaccine-types"

const REVALIDATE_PATHS = [
  "/admin/compliance/vaccine-types",
] as const

function revalidateVaccineTypePaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeSpecies(
  value: string | null | undefined
) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createVaccineType(
  input: CreateVaccineTypeInput
): Promise<MutationResult<VaccineTypeRow>> {
  await requireStaff()

  const parsed = createVaccineTypeSchema.safeParse({
    ...input,
    species: normalizeSpecies(input.species),
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("vaccine_types")
    .insert({
      name: parsed.data.name.trim(),
      species: parsed.data.species,
      interval_months: parsed.data.interval_months,
      is_active: parsed.data.is_active,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create vaccine type"
      )
    )
  }

  revalidateVaccineTypePaths()
  return mutationSuccess(data)
}

export async function updateVaccineType(
  input: UpdateVaccineTypeInput
): Promise<MutationResult<VaccineTypeRow>> {
  await requireStaff()

  const parsed = updateVaccineTypeSchema.safeParse({
    ...input,
    species:
      input.species !== undefined
        ? normalizeSpecies(input.species)
        : undefined,
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.name !== undefined) {
    payload.name = updates.name.trim()
  }

  if (updates.species !== undefined) {
    payload.species = updates.species
  }

  if (updates.interval_months !== undefined) {
    payload.interval_months = updates.interval_months
  }

  if (updates.is_active !== undefined) {
    payload.is_active = updates.is_active
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("vaccine_types")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update vaccine type"
      )
    )
  }

  revalidateVaccineTypePaths()
  return mutationSuccess(data)
}

export async function deleteVaccineType(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteVaccineTypeSchema.safeParse({
    id,
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ??
        "Invalid vaccine type"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("vaccine_types")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete vaccine type"
      )
    )
  }

  revalidateVaccineTypePaths()
  return mutationSuccess(undefined)
}