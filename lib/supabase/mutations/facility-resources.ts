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
import type { FacilityResourceRow } from "@/lib/supabase/types"
import {
  createFacilityResourceSchema,
  deleteFacilityResourceSchema,
  updateFacilityResourceSchema,
  type CreateFacilityResourceInput,
  type UpdateFacilityResourceInput,
} from "@/lib/validations/facility-resources"

const REVALIDATE_PATHS = [
  "/admin/facility-resources",
] as const

function revalidateFacilityResourcePaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeColumnLabel(
  value: string | null | undefined
) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createFacilityResource(
  input: CreateFacilityResourceInput
): Promise<MutationResult<FacilityResourceRow>> {
  await requireStaff()

  const parsed = createFacilityResourceSchema.safeParse({
    ...input,
    column_label: normalizeColumnLabel(input.column_label),
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("facility_resources")
    .insert({
      name: parsed.data.name.trim(),
      type: parsed.data.type,
      column_label: parsed.data.column_label,
      row_number: parsed.data.row_number,
      capacity: parsed.data.capacity,
      is_active: parsed.data.is_active,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create facility resource"
      )
    )
  }

  revalidateFacilityResourcePaths()
  return mutationSuccess(data)
}

export async function updateFacilityResource(
  input: UpdateFacilityResourceInput
): Promise<MutationResult<FacilityResourceRow>> {
  await requireStaff()

  const parsed = updateFacilityResourceSchema.safeParse({
    ...input,
    column_label:
      input.column_label !== undefined
        ? normalizeColumnLabel(input.column_label)
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

  if (updates.type !== undefined) {
    payload.type = updates.type
  }

  if (updates.column_label !== undefined) {
    payload.column_label = updates.column_label
  }

  if (updates.row_number !== undefined) {
    payload.row_number = updates.row_number
  }

  if (updates.capacity !== undefined) {
    payload.capacity = updates.capacity
  }

  if (updates.is_active !== undefined) {
    payload.is_active = updates.is_active
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("facility_resources")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update facility resource"
      )
    )
  }

  revalidateFacilityResourcePaths()
  return mutationSuccess(data)
}

export async function deleteFacilityResource(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteFacilityResourceSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid resource"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("facility_resources")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete facility resource"
      )
    )
  }

  revalidateFacilityResourcePaths()
  return mutationSuccess(undefined)
}