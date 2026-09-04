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
import type { ServicePackageStepRow } from "@/lib/supabase/types"
import {
  createServicePackageStepSchema,
  deleteServicePackageStepSchema,
  updateServicePackageStepSchema,
  type CreateServicePackageStepInput,
  type UpdateServicePackageStepInput,
} from "@/lib/validations/service-package-step"

const REVALIDATE_PATHS = [
  "/admin/catalog/package-steps",
  "/admin/catalog/packages",
  "/admin/catalog/services",
  "/book",
] as const

function revalidatePackageStepPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

export async function createServicePackageStep(
  input: CreateServicePackageStepInput
): Promise<MutationResult<ServicePackageStepRow>> {
  await requireStaff()

  const parsed = createServicePackageStepSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("service_package_steps")
    .insert({
      package_id: parsed.data.package_id,
      service_id: parsed.data.service_id,
      step_order: parsed.data.step_order,
      parallel_group: parsed.data.parallel_group,
      override_duration_minutes:
        parsed.data.override_duration_minutes,
      override_price: parsed.data.override_price,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create package step"
      )
    )
  }

  revalidatePackageStepPaths()
  return mutationSuccess(data)
}

export async function updateServicePackageStep(
  input: UpdateServicePackageStepInput
): Promise<MutationResult<ServicePackageStepRow>> {
  await requireStaff()

  const parsed = updateServicePackageStepSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.package_id !== undefined) {
    payload.package_id = updates.package_id
  }

  if (updates.service_id !== undefined) {
    payload.service_id = updates.service_id
  }

  if (updates.step_order !== undefined) {
    payload.step_order = updates.step_order
  }

  if (updates.parallel_group !== undefined) {
    payload.parallel_group = updates.parallel_group
  }

  if (
    updates.override_duration_minutes !== undefined
  ) {
    payload.override_duration_minutes =
      updates.override_duration_minutes
  }

  if (updates.override_price !== undefined) {
    payload.override_price = updates.override_price
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("service_package_steps")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update package step"
      )
    )
  }

  revalidatePackageStepPaths()
  return mutationSuccess(data)
}

export async function deleteServicePackageStep(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteServicePackageStepSchema.safeParse({
    id,
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid package step"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("service_package_steps")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete package step"
      )
    )
  }

  revalidatePackageStepPaths()
  return mutationSuccess(undefined)
}