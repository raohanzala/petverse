import { createClient } from "@/lib/supabase/server"
import type { OwnerListFilters } from "@/lib/constants/owner-filters"
import type { OwnerRow } from "@/lib/supabase/types"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"

const OWNER_COLUMNS =
  "id, name, phone, email, preferred_contact, created_at, updated_at" as const

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&")
}

/** Admin list — supports server-side search */
export async function listOwners(
  filters: OwnerListFilters = {}
): Promise<OwnerRow[]> {
  const supabase = await createClient()
  const { search } = filters

  let query = supabase
    .from("owners")
    .select(OWNER_COLUMNS)

  if (search) {
    const pattern = `%${escapeIlikePattern(search)}%`

    query = query.or(
      `name.ilike.${pattern},phone.ilike.${pattern},email.ilike.${pattern}`
    )
  }

  const { data, error } = await query
    .order("name", { ascending: true })

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

/** Booking / appointment — all owners available for selection */
export async function listOwnersForSelection(): Promise<
  OwnerRow[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("owners")
    .select(OWNER_COLUMNS)
    .order("name", { ascending: true })

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

export async function getOwnerById(
  id: string
): Promise<OwnerRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("owners")
    .select(OWNER_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load owner"
      )
    )
  }

  return data
}