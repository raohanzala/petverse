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
import type { InvoiceRow } from "@/lib/supabase/types"
import {
  createInvoiceSchema,
  deleteInvoiceSchema,
  updateInvoiceSchema,
  type CreateInvoiceInput,
  type UpdateInvoiceInput,
} from "@/lib/validations/invoice"

const REVALIDATE_PATHS = [
  "/admin/sales/billing",
  "/admin/sales/checkout",
] as const

function revalidateInvoicePaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeNotes(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function normalizeCurrency(value: string) {
  return value.trim().toUpperCase()
}

export async function createInvoice(
  input: CreateInvoiceInput
): Promise<MutationResult<InvoiceRow>> {
  await requireStaff()

  const parsed = createInvoiceSchema.safeParse({
    ...input,
    notes: normalizeNotes(input.notes),
    currency: normalizeCurrency(input.currency),
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const lineItems = normalizeLineItems(
    parsed.data.line_items
  )

  const { data, error } = await supabase.rpc(
    "create_invoice_with_items",
    {
      p_owner_id: parsed.data.owner_id,
      p_appointment_id:
        parsed.data.appointment_id ?? null,
      p_status: parsed.data.status,
      p_tax: parsed.data.tax,
      p_currency: parsed.data.currency,
      p_issued_at: parsed.data.issued_at ?? null,
      p_paid_at: parsed.data.paid_at ?? null,
      p_voided_at: parsed.data.voided_at ?? null,
      p_notes: parsed.data.notes ?? null,
      p_line_items: lineItems,
    }
  )

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create invoice"
      )
    )
  }

  revalidateInvoicePaths()

  return mutationSuccess(data)
}

export async function updateInvoice(
  input: UpdateInvoiceInput
): Promise<MutationResult<InvoiceRow>> {
  await requireStaff()

  const parsed = updateInvoiceSchema.safeParse({
    ...input,
    ...(input.notes !== undefined
      ? {
        notes: normalizeNotes(input.notes),
      }
      : {}),
    ...(input.currency !== undefined
      ? {
        currency: normalizeCurrency(input.currency),
      }
      : {}),
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.owner_id !== undefined) {
    payload.owner_id = updates.owner_id
  }

  if (updates.appointment_id !== undefined) {
    payload.appointment_id = updates.appointment_id
  }

  if (updates.number !== undefined) {
    payload.number = updates.number
  }

  if (updates.status !== undefined) {
    payload.status = updates.status
  }

  if (updates.subtotal !== undefined) {
    payload.subtotal = updates.subtotal
  }

  if (updates.tax !== undefined) {
    payload.tax = updates.tax
  }

  if (updates.total !== undefined) {
    payload.total = updates.total
  }

  if (updates.currency !== undefined) {
    payload.currency = updates.currency
  }

  if (updates.issued_at !== undefined) {
    payload.issued_at = updates.issued_at
  }

  if (updates.paid_at !== undefined) {
    payload.paid_at = updates.paid_at
  }

  if (updates.voided_at !== undefined) {
    payload.voided_at = updates.voided_at
  }

  if (updates.notes !== undefined) {
    payload.notes = updates.notes
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("invoices")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(error, "Failed to update invoice")
    )
  }

  revalidateInvoicePaths()
  return mutationSuccess(data)
}

export async function deleteInvoice(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteInvoiceSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid invoice"
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  console.log("AUTH USER:", user?.id)
  console.log("AUTH ERROR:", authError)

  if (user) {
    const { data: employee, error: employeeError } =
      await supabase
        .from("employees")
        .select("id, user_id, display_name")
        .eq("user_id", user.id)
        .maybeSingle()

    console.log("EMPLOYEE:", employee)
    console.log("EMPLOYEE ERROR:", employeeError)
  }

  const { data, error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", parsed.data.id)
    .select("id")

  console.log("DELETE DATA:", data)
  console.log("DELETE ERROR:", error)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete invoice"
      )
    )
  }

  if (!data || data.length === 0) {
    return mutationError(
      "Invoice could not be deleted. It may not exist or you may not have permission to delete it."
    )
  }

  revalidateInvoicePaths()

  return mutationSuccess(undefined)
}

function normalizeLineItems(
  items: CreateInvoiceInput["line_items"] = []
) {
  return items.map((item) => ({
    id: item.id ?? null,
    appointment_id: item.appointment_id ?? null,
    product_id: item.product_id ?? null,
    description: item.description.trim(),
    quantity: item.quantity,
    unit_price: Number(item.unit_price),
    total: Number(
      (item.quantity * item.unit_price).toFixed(2)
    ),
  }))
}