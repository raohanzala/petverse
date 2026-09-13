import { createClient } from "@/lib/supabase/server"
import type { CampaignContactListFilters } from "@/lib/constants/campaign-contact-filters"
import type {
  CampaignContactWithRelations,
} from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const CAMPAIGN_CONTACT_COLUMNS = `
  id,
  campaign_id,
  owner_id,
  status,
  sent_at,
  campaign:outbound_campaigns (
    id,
    name
  ),
  owner:owners (
    id,
    name
  )
` as const

function normalizeRelation<T>(
  value: T | T[] | null | undefined
): T | null {
  if (value == null) return null

  return Array.isArray(value)
    ? value[0] ?? null
    : value
}

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search and status filter */
export async function listCampaignContacts(
  filters: CampaignContactListFilters = {}
): Promise<CampaignContactWithRelations[]> {
  const supabase = await createClient()
  const { search, status = "all" } = filters

  let query = supabase
    .from("campaign_contacts")
    .select(CAMPAIGN_CONTACT_COLUMNS)

  if (status !== "all") {
    query = query.eq("status", status)
  }

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `campaign_id.ilike.${pattern},owner_id.ilike.${pattern},status.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("sent_at", {
      ascending: false,
      nullsFirst: false,
    })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load campaign contacts"
      )
    )
  }

  return (data ?? []).map((row) => ({
    ...row,
    campaign: normalizeRelation(row.campaign),
    owner: normalizeRelation(row.owner),
  }))
}

export async function getCampaignContactById(
  id: string
): Promise<CampaignContactWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("campaign_contacts")
    .select(CAMPAIGN_CONTACT_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load campaign contact"
      )
    )
  }

  if (!data) return null

  return {
    ...data,
    campaign: normalizeRelation(data.campaign),
    owner: normalizeRelation(data.owner),
  }
}