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
import type { DaycareTransactionRow } from "@/lib/supabase/types"
import { z } from "zod"

const sessionIdSchema = z.object({
  id: z.string().uuid("Invalid session id"),
})

const REVALIDATE_PATHS = [
  "/admin/scheduling/daycare",
] as const

function revalidateDaycarePaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

export async function checkInDaycareSession(
  id: string
): Promise<MutationResult<DaycareTransactionRow>> {
  await requireStaff()

  const parsed = sessionIdSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid session"
    )
  }

  const supabase = await createClient()

  const { data: session, error: sessionError } = await supabase
    .from("daycare_transactions")
    .select("id, status, check_in_at, check_out_at")
    .eq("id", parsed.data.id)
    .maybeSingle()

  if (sessionError) {
    return mutationError(
      getSupabaseErrorMessage(
        sessionError,
        "Failed to load daycare session"
      )
    )
  }

  if (!session) {
    return mutationError("Daycare session not found")
  }

  if (session.status !== "scheduled") {
    return mutationError(
      "Only scheduled sessions can be checked in"
    )
  }

  const { data, error } = await supabase
    .from("daycare_transactions")
    .update({
      status: "checked_in",
      check_in_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to check in daycare session"
      )
    )
  }

  revalidateDaycarePaths()

  return mutationSuccess(data)
}

export async function checkOutDaycareSession(
  id: string
): Promise<MutationResult<DaycareTransactionRow>> {
  await requireStaff()

  const parsed = sessionIdSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid session"
    )
  }

  const supabase = await createClient()

  const { data: session, error: sessionError } = await supabase
    .from("daycare_transactions")
    .select("id, status, check_in_at, check_out_at")
    .eq("id", parsed.data.id)
    .maybeSingle()

  if (sessionError) {
    return mutationError(
      getSupabaseErrorMessage(
        sessionError,
        "Failed to load daycare session"
      )
    )
  }

  if (!session) {
    return mutationError("Daycare session not found")
  }

  if (session.status !== "checked_in") {
    return mutationError(
      "Only checked-in sessions can be checked out"
    )
  }

  const { data, error } = await supabase
    .from("daycare_transactions")
    .update({
      status: "checked_out",
      check_out_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to check out daycare session"
      )
    )
  }

  revalidateDaycarePaths()

  return mutationSuccess(data)
}

export async function cancelDaycareSession(
  id: string
): Promise<MutationResult<DaycareTransactionRow>> {
  await requireStaff()

  const parsed = sessionIdSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid session"
    )
  }

  const supabase = await createClient()

  const { data: session, error: sessionError } = await supabase
    .from("daycare_transactions")
    .select("id, status")
    .eq("id", parsed.data.id)
    .maybeSingle()

  if (sessionError) {
    return mutationError(
      getSupabaseErrorMessage(
        sessionError,
        "Failed to load daycare session"
      )
    )
  }

  if (!session) {
    return mutationError("Daycare session not found")
  }

  if (
    session.status === "checked_out" ||
    session.status === "cancelled"
  ) {
    return mutationError(
      "This daycare session cannot be cancelled"
    )
  }

  const { data, error } = await supabase
    .from("daycare_transactions")
    .update({
      status: "cancelled",
    })
    .eq("id", parsed.data.id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to cancel daycare session"
      )
    )
  }

  revalidateDaycarePaths()

  return mutationSuccess(data)
}