"use server"

import { randomBytes } from "crypto"
import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import {
    createPaymentTokenSchema,
    updatePaymentTokenSchema,
    deletePaymentTokenSchema,
} from "@/lib/validations/payment-token"
import type {
    PaymentTokenRow,
} from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const BILLING_PATH = "/admin/sales/billing"

type MutationResult<T = void> =
    | {
        success: true
        data: T
    }
    | {
        success: false
        error: string
    }

export async function createPaymentToken(
    input: unknown
): Promise<PaymentTokenRow> {
    const parsed =
        createPaymentTokenSchema.safeParse(input)

    if (!parsed.success) {
        throw new Error(
            parsed.error.issues[0]?.message ??
            "Invalid payment link data"
        )
    }

    const supabase = await createClient()

    const {
        invoice_id,
        expires_at,
    } = parsed.data

    /*
     * Payment links should only be created
     * for open invoices.
     */
    const { data: invoice, error: invoiceError } =
        await supabase
            .from("invoices")
            .select("id, status")
            .eq("id", invoice_id)
            .maybeSingle()

    if (invoiceError) {
        throw new Error(
            getSupabaseErrorMessage(
                invoiceError,
                "Failed to verify invoice"
            )
        )
    }

    if (!invoice) {
        throw new Error("Invoice not found")
    }

    if (invoice.status !== "open") {
        throw new Error(
            "Payment links can only be created for open invoices"
        )
    }

    /*
     * invoice_id is UNIQUE in payment_tokens,
     * so an invoice can only have one link.
     */
    const { data: existingLink, error: existingError } =
        await supabase
            .from("payment_tokens")
            .select("id, used_at, expires_at")
            .eq("invoice_id", invoice_id)
            .maybeSingle()

    if (existingError) {
        throw new Error(
            getSupabaseErrorMessage(
                existingError,
                "Failed to check existing payment link"
            )
        )
    }

    if (existingLink) {
        throw new Error(
            "This invoice already has a payment link. Edit or delete the existing link."
        )
    }

    if (
        new Date(expires_at).getTime() <=
        Date.now()
    ) {
        throw new Error(
            "Expiration date must be in the future"
        )
    }

    /*
     * Generate a cryptographically secure token.
     *
     * 32 random bytes = 256 bits of entropy.
     */
    const token =
        randomBytes(32).toString("hex")

    const { data, error } = await supabase
        .from("payment_tokens")
        .insert({
            token,
            invoice_id,
            expires_at,
            used_at: null,
        })
        .select()
        .single()

    if (error) {
        throw new Error(
            getSupabaseErrorMessage(
                error,
                "Failed to create payment link"
            )
        )
    }

    revalidatePath(BILLING_PATH)

    return data
}

export async function updatePaymentToken(
    input: unknown
): Promise<PaymentTokenRow> {
    const parsed =
        updatePaymentTokenSchema.safeParse(input)

    if (!parsed.success) {
        throw new Error(
            parsed.error.issues[0]?.message ??
            "Invalid payment link data"
        )
    }

    const supabase = await createClient()

    const {
        id,
        expires_at,
    } = parsed.data

    if (!expires_at) {
        throw new Error(
            "Expiration date is required"
        )
    }

    if (
        new Date(expires_at).getTime() <=
        Date.now()
    ) {
        throw new Error(
            "Expiration date must be in the future"
        )
    }

    const { data: existing, error: existingError } =
        await supabase
            .from("payment_tokens")
            .select("id, used_at")
            .eq("id", id)
            .maybeSingle()

    if (existingError) {
        throw new Error(
            getSupabaseErrorMessage(
                existingError,
                "Failed to load payment link"
            )
        )
    }

    if (!existing) {
        throw new Error(
            "Payment link not found"
        )
    }

    if (existing.used_at) {
        throw new Error(
            "A used payment link cannot be edited"
        )
    }

    const { data, error } = await supabase
        .from("payment_tokens")
        .update({
            expires_at,
        })
        .eq("id", id)
        .select()
        .single()

    if (error) {
        throw new Error(
            getSupabaseErrorMessage(
                error,
                "Failed to update payment link"
            )
        )
    }

    revalidatePath(BILLING_PATH)

    return data
}

export async function deletePaymentToken(
  id: string
): Promise<MutationResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("payment_tokens")
      .delete()
      .eq("id", id)

    if (error) {
      return {
        success: false,
        error: getSupabaseErrorMessage(
          error,
          "Failed to delete payment link"
        ),
      }
    }

    revalidatePath(BILLING_PATH)

    return {
      success: true,
      data: undefined,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete payment link",
    }
  }
}