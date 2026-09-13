import { createClient } from "@/lib/supabase/server"
import type { BusinessTargetListFilters } from "@/lib/constants/business-target-filters"
import type { BusinessTargetRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const BUSINESS_TARGET_COLUMNS =
  "id, metric_key, target_value, period_start, period_end, notes, created_at" as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

export async function listBusinessTargets(
  filters: BusinessTargetListFilters = {}
): Promise<BusinessTargetRow[]> {
  const supabase = await createClient()
  const {
    search,
    period = "all",
  } = filters

  let query = supabase
    .from("business_targets")
    .select(BUSINESS_TARGET_COLUMNS)

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `metric_key.ilike.${pattern},notes.ilike.${pattern}`
    )
  }

  const today = new Date().toISOString().slice(0, 10)

  if (period === "current") {
    query = query
      .lte("period_start", today)
      .gte("period_end", today)
  } else if (period === "upcoming") {
    query = query.gt("period_start", today)
  } else if (period === "past") {
    query = query.lt("period_end", today)
  }

  const { data, error } = await query
    .order("period_start", { ascending: false })
    .order("metric_key", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load business targets"
      )
    )
  }

  return data ?? []
}

export async function getBusinessTargetById(
  id: string
): Promise<BusinessTargetRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("business_targets")
    .select(BUSINESS_TARGET_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load business target"
      )
    )
  }

  return data
}