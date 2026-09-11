import { createClient } from "@/lib/supabase/server"
import { getSupabaseErrorMessage } from "@/lib/supabase/errors"
import type { DaycarePackageRow } from "@/lib/supabase/types"

const DAYCARE_PACKAGE_COLUMNS =
  "id, name, visit_count, price, valid_days, is_active, created_at, updated_at" as const

export async function listDaycarePackages(): Promise<
  DaycarePackageRow[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_packages")
    .select(DAYCARE_PACKAGE_COLUMNS)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daycare packages"
      )
    )
  }

  return data ?? []
}

export async function listActiveDaycarePackages(): Promise<
  DaycarePackageRow[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_packages")
    .select(DAYCARE_PACKAGE_COLUMNS)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load active daycare packages"
      )
    )
  }

  return data ?? []
}

export async function getDaycarePackageById(
  id: string
): Promise<DaycarePackageRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("daycare_packages")
    .select(DAYCARE_PACKAGE_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Failed to load daycare package"
      )
    )
  }

  return data
}