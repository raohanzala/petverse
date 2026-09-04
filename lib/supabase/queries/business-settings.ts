import { createClient } from "@/lib/supabase/server"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"
import type { BusinessSettingsRow } from "@/lib/supabase/types"

const BUSINESS_SETTINGS_COLUMNS =
  "id, business_name, logo_url, timezone, currency, phone, email, address, hero_title, hero_subtitle, created_at, updated_at" as const

export async function getBusinessSettings(): Promise<BusinessSettingsRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("business_settings")
    .select(BUSINESS_SETTINGS_COLUMNS)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to load business settings")
    )
  }

  return data
}