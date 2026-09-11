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
import type { DaycarePricingRow } from "@/lib/supabase/types"
import {
  createDaycarePricingSchema,
  updateDaycarePricingSchema,
  type CreateDaycarePricingInput,
  type UpdateDaycarePricingInput,
} from "@/lib/validations/daycare-pricing"

const REVALIDATE_PATHS = [
  "/admin/scheduling/daycare",
] as const

function revalidateDaycarePricingPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

export async function createDaycarePricing(
  input: CreateDaycarePricingInput
): Promise<MutationResult<DaycarePricingRow>> {
  await requireStaff()

  const parsed = createDaycarePricingSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data: existingPricing, error: existingError } =
    await supabase
      .from("daycare_pricing")
      .select("id")
      .maybeSingle()

  if (existingError) {
    return mutationError(
      getSupabaseErrorMessage(
        existingError,
        "Failed to check daycare pricing"
      )
    )
  }

  if (existingPricing) {
    return mutationError("Daycare pricing already exists")
  }

  const { data, error } = await supabase
    .from("daycare_pricing")
    .insert({
      full_day_price: parsed.data.full_day_price,
      half_day_price: parsed.data.half_day_price,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create daycare pricing"
      )
    )
  }

  revalidateDaycarePricingPaths()

  return mutationSuccess(data)
}

export async function updateDaycarePricing(
  input: UpdateDaycarePricingInput
): Promise<MutationResult<DaycarePricingRow>> {
  await requireStaff()

  const parsed = updateDaycarePricingSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.full_day_price !== undefined) {
    payload.full_day_price = updates.full_day_price
  }

  if (updates.half_day_price !== undefined) {
    payload.half_day_price = updates.half_day_price
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_pricing")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update daycare pricing"
      )
    )
  }

  revalidateDaycarePricingPaths()

  return mutationSuccess(data)
}