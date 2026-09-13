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
import type { ProductRow } from "@/lib/supabase/types"
import {
  createProductSchema,
  deleteProductSchema,
  updateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "@/lib/validations/product"

const REVALIDATE_PATHS = [
  "/admin/inventory/products",
  "/admin/inventory/suppliers",
] as const

function revalidateProductPaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeOptionalString(
  value: string | null | undefined
) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createProduct(
  input: CreateProductInput
): Promise<MutationResult<ProductRow>> {
  await requireStaff()

  const parsed = createProductSchema.safeParse({
    ...input,
    sku: normalizeOptionalString(input.sku),
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .insert({
      supplier_id: parsed.data.supplier_id,
      sku: parsed.data.sku,
      name: parsed.data.name.trim(),
      price: parsed.data.price,
      stock_qty: parsed.data.stock_qty,
      is_active: parsed.data.is_active,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create product"
      )
    )
  }

  revalidateProductPaths()
  return mutationSuccess(data)
}

export async function updateProduct(
  input: UpdateProductInput
): Promise<MutationResult<ProductRow>> {
  await requireStaff()

  const parsed = updateProductSchema.safeParse({
    ...input,
    sku:
      input.sku !== undefined
        ? normalizeOptionalString(input.sku)
        : undefined,
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.supplier_id !== undefined) {
    payload.supplier_id = updates.supplier_id
  }

  if (updates.sku !== undefined) {
    payload.sku = updates.sku
  }

  if (updates.name !== undefined) {
    payload.name = updates.name.trim()
  }

  if (updates.price !== undefined) {
    payload.price = updates.price
  }

  if (updates.stock_qty !== undefined) {
    payload.stock_qty = updates.stock_qty
  }

  if (updates.is_active !== undefined) {
    payload.is_active = updates.is_active
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update product"
      )
    )
  }

  revalidateProductPaths()
  return mutationSuccess(data)
}

export async function deleteProduct(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteProductSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid product"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete product"
      )
    )
  }

  revalidateProductPaths()
  return mutationSuccess(undefined)
}