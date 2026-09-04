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
import type { EmployeeScheduleRow } from "@/lib/supabase/types"
import {
  createEmployeeScheduleSchema,
  deleteEmployeeScheduleSchema,
  updateEmployeeScheduleSchema,
  type CreateEmployeeScheduleInput,
  type UpdateEmployeeScheduleInput,
} from "@/lib/validations/employee-schedule"

const REVALIDATE_PATHS = [
  "/admin/staff/schedules",
  "/admin/staff/employees",
  "/admin/appointments",
  "/book",
] as const

function revalidateEmployeeSchedulePaths() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

export async function createEmployeeSchedule(
  input: CreateEmployeeScheduleInput
): Promise<MutationResult<EmployeeScheduleRow>> {
  await requireStaff()

  const parsed = createEmployeeScheduleSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("employee_schedules")
    .insert({
      employee_id: parsed.data.employee_id,
      day_of_week: parsed.data.day_of_week,
      start_time: parsed.data.start_time,
      end_time: parsed.data.end_time,
    })
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to create employee schedule"
      )
    )
  }

  revalidateEmployeeSchedulePaths()
  return mutationSuccess(data)
}

export async function updateEmployeeSchedule(
  input: UpdateEmployeeScheduleInput
): Promise<MutationResult<EmployeeScheduleRow>> {
  await requireStaff()

  const parsed = updateEmployeeScheduleSchema.safeParse(input)

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid input"
    )
  }

  const { id, ...updates } = parsed.data

  const payload: Record<string, unknown> = {}

  if (updates.employee_id !== undefined) {
    payload.employee_id = updates.employee_id
  }

  if (updates.day_of_week !== undefined) {
    payload.day_of_week = updates.day_of_week
  }

  if (updates.start_time !== undefined) {
    payload.start_time = updates.start_time
  }

  if (updates.end_time !== undefined) {
    payload.end_time = updates.end_time
  }

  if (Object.keys(payload).length === 0) {
    return mutationError("No changes to save")
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("employee_schedules")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to update employee schedule"
      )
    )
  }

  revalidateEmployeeSchedulePaths()
  return mutationSuccess(data)
}

export async function deleteEmployeeSchedule(
  id: string
): Promise<MutationResult> {
  await requireStaff()

  const parsed = deleteEmployeeScheduleSchema.safeParse({ id })

  if (!parsed.success) {
    return mutationError(
      parsed.error.issues[0]?.message ?? "Invalid schedule"
    )
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("employee_schedules")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    return mutationError(
      getSupabaseErrorMessage(
        error,
        "Failed to delete employee schedule"
      )
    )
  }

  revalidateEmployeeSchedulePaths()
  return mutationSuccess(undefined)
}