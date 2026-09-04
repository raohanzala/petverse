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
import type { ServiceRow } from "@/lib/supabase/types"
import {
  createServiceSchema,
  deleteServiceSchema,
  updateServiceSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
} from "@/lib/validations/service"

const REVALIDATE_PATHS = [
  "/admin/catalog/services",
  "/admin/catalog/categories",
  "/book",
] as const

function revalidateServicePaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeDescription(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createService(
  input: CreateServiceInput
): Promise<MutationResult<ServiceRow>> {
  await requireStaff()

  const parsed = createServiceSchema.safeParse({
    ...input,
    description: normalizeDescription(input.description),
  })

  if (!parsed.success) {
    return mutationError(parsed.error.issues[0]?.message ?? "Invalid input")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("services")
    .insert({
      category_id: parsed.data.category_id,
      name: parsed.data.name.trim(),
      description: parsed.data.description,
      kind: parsed.data.kind,
      duration_minutes: parsed.data.duration_minutes,
      price: parsed.data.price,
      is_active: parsed.data.is_active,
      is_public: parsed.data.is_public,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(error, "Failed to create service")
    )
  }

  revalidateServicePaths()
  return mutationSuccess(data)
}

export async function updateService(
  input: UpdateServiceInput
): Promise<MutationResult<ServiceRow>> {
  await requireStaff()

  const parsed = updateServiceSchema.safeParse({
    ...input,
    description:
      input.description !== undefined
        ? normalizeDescription(input.description)
        : undefined,
  })

  if (!parsed.success) {
    return mutationError(parsed.error.issues[0]?.message ?? "Invalid input")
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.category_id !== undefined) {
    payload.category_id = updates.category_id
  }

  if (updates.name !== undefined) {
    payload.name = updates.name.trim()
  }

  if (updates.description !== undefined) {
    payload.description = updates.description
  }

  if (updates.kind !== undefined) {
    payload.kind = updates.kind
  }

  if (updates.duration_minutes !== undefined) {
    payload.duration_minutes = updates.duration_minutes
  }

  if (updates.price !== undefined) {
    payload.price = updates.price
  }

  if (updates.is_active !== undefined) {
    payload.is_active = updates.is_active
  }

  if (updates.is_public !== undefined) {
    payload.is_public = updates.is_public
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("services")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(error, "Failed to update service")
    )
  }

  revalidateServicePaths()
  return mutationSuccess(data)
}

export async function deleteService(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteServiceSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(parsed.error.issues[0]?.message ?? "Invalid service")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(error, "Failed to delete service")
    )
  }

  revalidateServicePaths()
  return mutationSuccess(undefined)
}