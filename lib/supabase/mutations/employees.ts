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
import type { EmployeeRow } from "@/lib/supabase/types"
import {
  createEmployeeSchema,
  deleteEmployeeSchema,
  updateEmployeeSchema,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from "@/lib/validations/employee"

const REVALIDATE_PATHS = [
  "/admin/staff/employees",
  "/admin/appointments",
  "/book",
] as const

function revalidateEmployeePaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

function normalizeOptionalString(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function createEmployee(
  input: CreateEmployeeInput
): Promise<MutationResult<EmployeeRow>> {
  await requireStaff()

  const parsed = createEmployeeSchema.safeParse({
    ...input,
    user_id: normalizeOptionalString(input.user_id),
    initials: normalizeOptionalString(input.initials),
    avatar_url: normalizeOptionalString(input.avatar_url),
    job_title: normalizeOptionalString(input.job_title),
    color: normalizeOptionalString(input.color),
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("employees")
    .insert({
      user_id: parsed.data.user_id,
      display_name: parsed.data.display_name.trim(),
      initials: parsed.data.initials,
      avatar_url: parsed.data.avatar_url,
      role: parsed.data.role,
      job_title: parsed.data.job_title,
      color: parsed.data.color,
      is_active: parsed.data.is_active,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(error, "Failed to create employee")
    )
  }

  revalidateEmployeePaths()
  return mutationSuccess(data)
}

export async function updateEmployee(
  input: UpdateEmployeeInput
): Promise<MutationResult<EmployeeRow>> {
  await requireStaff()

  const parsed = updateEmployeeSchema.safeParse({
    ...input,
    user_id:
      input.user_id !== undefined
        ? normalizeOptionalString(input.user_id)
        : undefined,
    initials:
      input.initials !== undefined
        ? normalizeOptionalString(input.initials)
        : undefined,
    avatar_url:
      input.avatar_url !== undefined
        ? normalizeOptionalString(input.avatar_url)
        : undefined,
    job_title:
      input.job_title !== undefined
        ? normalizeOptionalString(input.job_title)
        : undefined,
    color:
      input.color !== undefined
        ? normalizeOptionalString(input.color)
        : undefined,
  })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.user_id !== undefined) {
    payload.user_id = updates.user_id
  }

  if (updates.display_name !== undefined) {
    payload.display_name = updates.display_name.trim()
  }

  if (updates.initials !== undefined) {
    payload.initials = updates.initials
  }

  if (updates.avatar_url !== undefined) {
    payload.avatar_url = updates.avatar_url
  }

  if (updates.role !== undefined) {
    payload.role = updates.role
  }

  if (updates.job_title !== undefined) {
    payload.job_title = updates.job_title
  }

  if (updates.color !== undefined) {
    payload.color = updates.color
  }

  if (updates.is_active !== undefined) {
    payload.is_active = updates.is_active
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("employees")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(error, "Failed to update employee")
    )
  }

  revalidateEmployeePaths()
  return mutationSuccess(data)
}

export async function deleteEmployee(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteEmployeeSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid employee"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(error, "Failed to delete employee")
    )
  }

  revalidateEmployeePaths()
  return mutationSuccess(undefined)
}