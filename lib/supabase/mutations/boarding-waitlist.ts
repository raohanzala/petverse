"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"
import {
  createBoardingWaitlistSchema,
  deleteBoardingWaitlistSchema,
  updateBoardingWaitlistSchema,
  type CreateBoardingWaitlistInput,
  type UpdateBoardingWaitlistInput,
} from "@/lib/validations/boarding-waitlist"
import type { BoardingWaitlistRow } from "@/lib/supabase/types"

type MutationResult<T = void> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
    }

const BOARDING_PATH = "/admin/scheduling/boarding"

export async function createBoardingWaitlist(
  input: CreateBoardingWaitlistInput
): Promise<MutationResult<BoardingWaitlistRow>> {
  try {
    const values = createBoardingWaitlistSchema.parse(input)

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("boarding_waitlist")
      .insert({
        pet_id: values.pet_id,
        owner_id: values.owner_id,
        desired_from: values.desired_from,
        desired_to: values.desired_to,
        notes: values.notes || null,
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: getSupabaseErrorMessage(
          error,
          "Failed to add pet to waitlist"
        ),
      }
    }

    revalidatePath(BOARDING_PATH)

    return {
      success: true,
      data: data as BoardingWaitlistRow,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to add pet to waitlist",
    }
  }
}

export async function updateBoardingWaitlist(
  input: UpdateBoardingWaitlistInput
): Promise<MutationResult<BoardingWaitlistRow>> {
  try {
    const values = updateBoardingWaitlistSchema.parse(input)

    const supabase = await createClient()

    const { id, ...updateData } = values

    const { data, error } = await supabase
      .from("boarding_waitlist")
      .update({
        ...updateData,
        notes: updateData.notes || null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: getSupabaseErrorMessage(
          error,
          "Failed to update waitlist entry"
        ),
      }
    }

    revalidatePath(BOARDING_PATH)

    return {
      success: true,
      data: data as BoardingWaitlistRow,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update waitlist entry",
    }
  }
}

export async function deleteBoardingWaitlist(
  id: string
): Promise<MutationResult> {
  try {
    const values = deleteBoardingWaitlistSchema.parse({ id })

    const supabase = await createClient()

    const { error } = await supabase
      .from("boarding_waitlist")
      .delete()
      .eq("id", values.id)

    if (error) {
      return {
        success: false,
        error: getSupabaseErrorMessage(
          error,
          "Failed to remove waitlist entry"
        ),
      }
    }

    revalidatePath(BOARDING_PATH)

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
          : "Failed to remove waitlist entry",
    }
  }
}