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
import type { SupplierRow } from "@/lib/supabase/types"
import {
  createSupplierSchema,
  deleteSupplierSchema,
  updateSupplierSchema,
  type CreateSupplierInput,
  type UpdateSupplierInput,
} from "@/lib/validations/supplier"

const REVALIDATE_PATHS = [
  "/admin/inventory/suppliers",
  "/admin/inventory/products",
] as const

function revalidateSupplierPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeOptionalText(
  value: string | null | undefined
) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createSupplier(
  input: CreateSupplierInput
): Promise<MutationResult<SupplierRow>> {
  await requireStaff()

  const parsed = createSupplierSchema.safeParse({
    ...input,
    contact_name: normalizeOptionalText(input.contact_name),
    email: normalizeOptionalText(input.email),
    phone: normalizeOptionalText(input.phone),
    notes: normalizeOptionalText(input.notes),
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      name: parsed.data.name.trim(),
      contact_name: parsed.data.contact_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      notes: parsed.data.notes,
      is_active: parsed.data.is_active,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create supplier"
      )
    )
  }

  revalidateSupplierPaths()

  return mutationSuccess(data)
}

export async function updateSupplier(
  input: UpdateSupplierInput
): Promise<MutationResult<SupplierRow>> {
  await requireStaff()

  const parsed = updateSupplierSchema.safeParse({
    ...input,

    contact_name:
      input.contact_name !== undefined
        ? normalizeOptionalText(input.contact_name)
        : undefined,

    email:
      input.email !== undefined
        ? normalizeOptionalText(input.email)
        : undefined,

    phone:
      input.phone !== undefined
        ? normalizeOptionalText(input.phone)
        : undefined,

    notes:
      input.notes !== undefined
        ? normalizeOptionalText(input.notes)
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

  if (updates.contact_name !== undefined) {
    payload.contact_name = updates.contact_name
  }

  if (updates.email !== undefined) {
    payload.email = updates.email
  }

  if (updates.phone !== undefined) {
    payload.phone = updates.phone
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
    .from("suppliers")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update supplier"
      )
    )
  }

  revalidateSupplierPaths()

  return mutationSuccess(data)
}

export async function deleteSupplier(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteSupplierSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid supplier"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("suppliers")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete supplier"
      )
    )
  }

  revalidateSupplierPaths()

  return mutationSuccess(undefined)
}