import { Suspense } from "react"

import { OwnerRetentionSettingsManager } from "@/components/crm/owner-retention-settings/owner-retention-settings-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseOwnerRetentionSettingsListFilters } from "@/lib/constants/owner-retention-settings-filters"
import {
  listOwnerRetentionSettings,
  listOwnerRetentionSettingsOwners,
} from "@/lib/supabase/queries/owner-retention-settings"

type OwnerRetentionSettingsPageProps = {
  searchParams: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >
}

export default async function OwnerRetentionSettingsPage({
  searchParams,
}: OwnerRetentionSettingsPageProps) {
  const params =
    await searchParams

  const filters =
    parseOwnerRetentionSettingsListFilters(
      params
    )

  const [
    settings,
    owners,
  ] = await Promise.all([
    listOwnerRetentionSettings(
      filters
    ),
    listOwnerRetentionSettingsOwners(),
  ])

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading retention settings…" />
      }
    >
      <OwnerRetentionSettingsManager
        settings={settings}
        filters={filters}
        owners={owners}
      />
    </Suspense>
  )
}