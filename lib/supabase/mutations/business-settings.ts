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
import type { BusinessSettingsRow } from "@/lib/supabase/types"
import {
  createBusinessSettingsSchema,
  updateBusinessSettingsSchema,
  type CreateBusinessSettingsInput,
  type UpdateBusinessSettingsInput,
} from "@/lib/validations/business-settings"

const REVALIDATE_PATHS = [
  "/admin/settings/business",
  "/",
  "/book",
] as const

function revalidateBusinessSettingsPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeOptionalString(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createBusinessSettings(
  input: CreateBusinessSettingsInput
): Promise<MutationResult<BusinessSettingsRow>> {
  await requireStaff()

  const parsed = createBusinessSettingsSchema.safeParse({
    ...input,
    logo_url: normalizeOptionalString(input.logo_url),
    phone: normalizeOptionalString(input.phone),
    email: normalizeOptionalString(input.email),
    address: normalizeOptionalString(input.address),
    hero_title: normalizeOptionalString(input.hero_title),
    hero_subtitle: normalizeOptionalString(input.hero_subtitle),
  })

  if (!parsed.success) {
    return mutationError(parsed.error.issues[0]?.message ?? "Invalid input")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("business_settings")
    .insert({
      business_name: parsed.data.business_name.trim(),
      logo_url: parsed.data.logo_url,
      timezone: parsed.data.timezone.trim(),
      currency: parsed.data.currency.trim(),
      phone: parsed.data.phone,
      email: parsed.data.email,
      address: parsed.data.address,
      hero_title: parsed.data.hero_title,
      hero_subtitle: parsed.data.hero_subtitle,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(error, "Failed to create business settings")
    )
  }

  revalidateBusinessSettingsPaths()
  return mutationSuccess(data)
}

export async function updateBusinessSettings(
  input: UpdateBusinessSettingsInput
): Promise<MutationResult<BusinessSettingsRow>> {
  await requireStaff()

  const parsed = updateBusinessSettingsSchema.safeParse({
    ...input,
    logo_url:
      input.logo_url !== undefined
        ? normalizeOptionalString(input.logo_url)
        : undefined,
    phone:
      input.phone !== undefined
        ? normalizeOptionalString(input.phone)
        : undefined,
    email:
      input.email !== undefined
        ? normalizeOptionalString(input.email)
        : undefined,
    address:
      input.address !== undefined
        ? normalizeOptionalString(input.address)
        : undefined,
    hero_title:
      input.hero_title !== undefined
        ? normalizeOptionalString(input.hero_title)
        : undefined,
    hero_subtitle:
      input.hero_subtitle !== undefined
        ? normalizeOptionalString(input.hero_subtitle)
        : undefined,
  })

  if (!parsed.success) {
    return mutationError(parsed.error.issues[0]?.message ?? "Invalid input")
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.business_name !== undefined) {
    payload.business_name = updates.business_name.trim()
  }

  if (updates.logo_url !== undefined) {
    payload.logo_url = updates.logo_url
  }

  if (updates.timezone !== undefined) {
    payload.timezone = updates.timezone.trim()
  }

  if (updates.currency !== undefined) {
    payload.currency = updates.currency.trim()
  }

  if (updates.phone !== undefined) {
    payload.phone = updates.phone
  }

  if (updates.email !== undefined) {
    payload.email = updates.email
  }

  if (updates.address !== undefined) {
    payload.address = updates.address
  }

  if (updates.hero_title !== undefined) {
    payload.hero_title = updates.hero_title
  }

  if (updates.hero_subtitle !== undefined) {
    payload.hero_subtitle = updates.hero_subtitle
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("business_settings")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(error, "Failed to update business settings")
    )
  }

  revalidateBusinessSettingsPaths()
  return mutationSuccess(data)
}