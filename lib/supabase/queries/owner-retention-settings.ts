import { createClient } from "@/lib/supabase/server"
import type {
  OwnerRetentionSettingsListFilters,
} from "@/lib/constants/owner-retention-settings-filters"
import type {
  OwnerRetentionSettingsOwnerOption,
  OwnerRetentionSettingsWithOwner,
} from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const OWNER_RETENTION_SETTINGS_COLUMNS = `
  id,
  owner_id,
  lapsed_after_days,
  reengagement_queued_at,
  opt_out,
  owner:owners (
    id,
    name,
    phone,
    email
  )
` as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

type QueryRow = {
  id: string
  owner_id: string
  lapsed_after_days: number
  reengagement_queued_at: string | null
  opt_out: boolean
  owner:
    | {
        id: string
        name: string
        phone: string
        email: string | null
      }[]
    | null
}

function normalizeRow(
  row: QueryRow
): OwnerRetentionSettingsWithOwner {
  return {
    id: row.id,
    owner_id: row.owner_id,
    lapsed_after_days:
      row.lapsed_after_days,
    reengagement_queued_at:
      row.reengagement_queued_at,
    opt_out: row.opt_out,
    owner: row.owner?.[0] ?? null,
  }
}

export async function listOwnerRetentionSettings(
  filters: OwnerRetentionSettingsListFilters = {}
): Promise<OwnerRetentionSettingsWithOwner[]> {
  const supabase = await createClient()

  const {
    search,
    filter = "all",
  } = filters

  let query = supabase
    .from("owner_retention_settings")
    .select(
      OWNER_RETENTION_SETTINGS_COLUMNS
    )

  if (filter === "opted_in") {
    query = query.eq("opt_out", false)
  } else if (filter === "opted_out") {
    query = query.eq("opt_out", true)
  }

  if (search) {
    const pattern =
      `%${escapeIlikePattern(search)}%`

    const { data: matchingOwners, error } =
      await supabase
        .from("owners")
        .select("id")
        .or(
          `name.ilike.${pattern},phone.ilike.${pattern},email.ilike.${pattern}`
        )

    if (error) {
      throw new Error(
        getSupabaseErrorMessage(
          error,
          "Failed to search owners"
        )
      )
    }

    const ownerIds =
      matchingOwners?.map(
        (owner) => owner.id
      ) ?? []

    if (ownerIds.length === 0) {
      return []
    }

    query = query.in(
      "owner_id",
      ownerIds
    )
  }

  const { data, error } =
    await query.order(
      "reengagement_queued_at",
      {
        ascending: false,
        nullsFirst: false,
      }
    )

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load retention settings"
      )
    )
  }

  return (
    (data as QueryRow[] | null)?.map(
      normalizeRow
    ) ?? []
  )
}

export async function listOwnerRetentionSettingsOwners(): Promise<
  OwnerRetentionSettingsOwnerOption[]
> {
  const supabase = await createClient()

  const { data, error } =
    await supabase
      .from("owners")
      .select(
        "id, name, phone, email"
      )
      .order("name", {
        ascending: true,
      })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load owners"
      )
    )
  }

  return data ?? []
}

export async function getOwnerRetentionSettingsById(
  id: string
): Promise<OwnerRetentionSettingsWithOwner | null> {
  const supabase = await createClient()

  const { data, error } =
    await supabase
      .from("owner_retention_settings")
      .select(
        OWNER_RETENTION_SETTINGS_COLUMNS
      )
      .eq("id", id)
      .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load retention settings"
      )
    )
  }

  if (!data) {
    return null
  }

  return normalizeRow(
    data as QueryRow
  )
}