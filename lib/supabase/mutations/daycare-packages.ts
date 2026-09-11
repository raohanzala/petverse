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
import type { DaycarePackageRow } from "@/lib/supabase/types"
import {
  createDaycarePackageSchema,
  deleteDaycarePackageSchema,
  updateDaycarePackageSchema,
  type CreateDaycarePackageInput,
  type UpdateDaycarePackageInput,
} from "@/lib/validations/daycare-package"

const REVALIDATE_PATHS = [
  "/admin/scheduling/daycare",
] as const

function revalidateDaycarePackagePaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeName(value: string) {
  return value.trim()
}

export async function createDaycarePackage(
  input: CreateDaycarePackageInput
): Promise<MutationResult<DaycarePackageRow>> {
  await requireStaff()

  const parsed = createDaycarePackageSchema.safeParse({
    ...input,
    name: normalizeName(input.name),
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_packages")
    .insert({
      name: parsed.data.name,
      visit_count: parsed.data.visit_count,
      price: parsed.data.price,
      valid_days: parsed.data.valid_days ?? null,
      is_active: parsed.data.is_active,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create daycare package"
      )
    )
  }

  revalidateDaycarePackagePaths()

  return mutationSuccess(data)
}

export async function updateDaycarePackage(
  input: UpdateDaycarePackageInput
): Promise<MutationResult<DaycarePackageRow>> {
  await requireStaff()

  const parsed = updateDaycarePackageSchema.safeParse({
    ...input,
    name:
      input.name !== undefined
        ? normalizeName(input.name)
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
    payload.name = updates.name
  }

  if (updates.visit_count !== undefined) {
    payload.visit_count = updates.visit_count
  }

  if (updates.price !== undefined) {
    payload.price = updates.price
  }

  if (updates.valid_days !== undefined) {
    payload.valid_days = updates.valid_days
  }

  if (updates.is_active !== undefined) {
    payload.is_active = updates.is_active
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_packages")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update daycare package"
      )
    )
  }

  revalidateDaycarePackagePaths()

  return mutationSuccess(data)
}

export async function deleteDaycarePackage(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteDaycarePackageSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid package"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("daycare_packages")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete daycare package"
      )
    )
  }

  revalidateDaycarePackagePaths()

  return mutationSuccess(undefined)
}