import { createClient } from "@/lib/supabase/server"
import type { CampaignBlackoutPeriodListFilters } from "@/lib/constants/campaign-blackout-period-filters"
import type { CampaignBlackoutPeriodRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const CAMPAIGN_BLACKOUT_PERIOD_COLUMNS =
  "id, campaign_id, starts_at, ends_at" as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search */
export async function listCampaignBlackoutPeriods(
  filters: CampaignBlackoutPeriodListFilters = {}
): Promise<CampaignBlackoutPeriodRow[]> {
  const supabase = await createClient()
  const { search } = filters

  let query = supabase
    .from("campaign_blackout_periods")
    .select(CAMPAIGN_BLACKOUT_PERIOD_COLUMNS)

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `campaign_id.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("starts_at", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load campaign blackout periods"
      )
    )
  }

  return data ?? []
}

export async function getCampaignBlackoutPeriodById(
  id: string
): Promise<CampaignBlackoutPeriodRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("campaign_blackout_periods")
    .select(CAMPAIGN_BLACKOUT_PERIOD_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load campaign blackout period"
      )
    )
  }

  return data
}