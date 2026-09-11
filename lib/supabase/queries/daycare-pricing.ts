import { createClient } from "@/lib/supabase/server"
import type { DaycarePricingRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const DAYCARE_PRICING_COLUMNS =
  "id, full_day_price, half_day_price, updated_at" as const

/** Singleton daycare pricing */
export async function getDaycarePricing(): Promise<DaycarePricingRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_pricing")
    .select(DAYCARE_PRICING_COLUMNS)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daycare pricing"
      )
    )
  }

  return data
}