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
import type { ServiceCategoryRow } from "@/lib/supabase/types"
import {
  createServiceCategorySchema,
  deleteServiceCategorySchema,
  updateServiceCategorySchema,
  type CreateServiceCategoryInput,
  type UpdateServiceCategoryInput,
} from "@/lib/validations/service-category"

const REVALIDATE_PATHS = [
  "/admin/catalog/categories",
  "/admin/catalog/services",
  "/book",
] as const

function revalidateCategoryPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeDescription(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createServiceCategory(
  input: CreateServiceCategoryInput
): Promise<MutationResult<ServiceCategoryRow>> {
  await requireStaff()

  const parsed = createServiceCategorySchema.safeParse({
    ...input,
    description: normalizeDescription(input.description),
  })

  if (!parsed.success) {
    return mutationError(parsed.error.issues[0]?.message ?? "Invalid input")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("service_categories")
    .insert({
      name: parsed.data.name.trim(),
      slug: parsed.data.slug.trim(),
      description: parsed.data.description,
      sort_order: parsed.data.sort_order,
      is_active: parsed.data.is_active,
    })
    .select()
    .single()

  if (error) {
    return mutationError(getSupabaseErrorMessage(error, "Failed to create category"))
  }

  revalidateCategoryPaths()
  return mutationSuccess(data)
}

export async function updateServiceCategory(
  input: UpdateServiceCategoryInput
): Promise<MutationResult<ServiceCategoryRow>> {
  await requireStaff()

  const parsed = updateServiceCategorySchema.safeParse({
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

  if (updates.name !== undefined) payload.name = updates.name.trim()
  if (updates.slug !== undefined) payload.slug = updates.slug.trim()
  if (updates.description !== undefined) payload.description = updates.description
  if (updates.sort_order !== undefined) payload.sort_order = updates.sort_order
  if (updates.is_active !== undefined) payload.is_active = updates.is_active

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("service_categories")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(getSupabaseErrorMessage(error, "Failed to update category"))
  }

  revalidateCategoryPaths()
  return mutationSuccess(data)
}

export async function deleteServiceCategory(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteServiceCategorySchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(parsed.error.issues[0]?.message ?? "Invalid category")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("service_categories")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(getSupabaseErrorMessage(error, "Failed to delete category"))
  }

  revalidateCategoryPaths()
  return mutationSuccess(undefined)
}
