import { createClient } from "@/lib/supabase/server"
import type { OutboundCampaignListFilters } from "@/lib/constants/outbound-campaign-filters"
import type { OutboundCampaignRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const OUTBOUND_CAMPAIGN_COLUMNS =
  "id, name, channel, status, scheduled_at, created_at" as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search and status filter */
export async function listOutboundCampaigns(
  filters: OutboundCampaignListFilters = {}
): Promise<OutboundCampaignRow[]> {
  const supabase = await createClient()

  const {
    search,
    status = "all",
  } = filters

  let query = supabase
    .from("outbound_campaigns")
    .select(OUTBOUND_CAMPAIGN_COLUMNS)

  if (status !== "all") {
    query = query.eq("status", status)
  }

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `name.ilike.${pattern},channel.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load outbound campaigns"
      )
    )
  }

  return data ?? []
}

export async function getOutboundCampaignById(
  id: string
): Promise<OutboundCampaignRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("outbound_campaigns")
    .select(OUTBOUND_CAMPAIGN_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load outbound campaign"
      )
    )
  }

  return data
}