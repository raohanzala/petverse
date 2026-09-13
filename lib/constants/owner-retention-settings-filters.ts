export const OWNER_RETENTION_SETTINGS_FILTERS = [
  "all",
  "opted_in",
  "opted_out",
] as const

export type OwnerRetentionSettingsFilter =
  (typeof OWNER_RETENTION_SETTINGS_FILTERS)[number]

export const OWNER_RETENTION_SETTINGS_LABELS: Record<
  OwnerRetentionSettingsFilter,
  string
> = {
  all: "All owners",
  opted_in: "Opted in only",
  opted_out: "Opted out only",
}

export type OwnerRetentionSettingsListFilters = {
  search?: string
  filter?: OwnerRetentionSettingsFilter
}

export function parseOwnerRetentionSettingsListFilters(
  params: Record<string, string | string[] | undefined>
): OwnerRetentionSettingsListFilters {
  const rawFilter =
    typeof params.filter === "string"
      ? params.filter
      : "all"

  const filter =
    OWNER_RETENTION_SETTINGS_FILTERS.includes(
      rawFilter as OwnerRetentionSettingsFilter
    )
      ? (rawFilter as OwnerRetentionSettingsFilter)
      : "all"

  const search =
    typeof params.q === "string"
      ? params.q.trim()
      : undefined

  return {
    search: search || undefined,
    filter,
  }
}