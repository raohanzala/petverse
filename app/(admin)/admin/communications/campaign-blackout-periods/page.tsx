import { Suspense } from "react"

import { CampaignBlackoutPeriodsManager } from "@/components/communications/campaign-blackout-periods/campaign-blackout-periods-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseCampaignBlackoutPeriodListFilters } from "@/lib/constants/campaign-blackout-period-filters"
import { listCampaignBlackoutPeriods } from "@/lib/supabase/queries/campaign-blackout-periods"
import { listOutboundCampaigns } from "@/lib/supabase/queries/outbound-campaigns"

type CampaignBlackoutPeriodsPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function CampaignBlackoutPeriodsPage({
  searchParams,
}: CampaignBlackoutPeriodsPageProps) {
  const params = await searchParams

  const filters =
    parseCampaignBlackoutPeriodListFilters(params)

  const [periods, campaigns] = await Promise.all([
    listCampaignBlackoutPeriods(filters),
    listOutboundCampaigns(),
  ])

  const campaignOptions = campaigns.map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
  }))

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading campaign blackout periods…" />
      }
    >
      <CampaignBlackoutPeriodsManager
        periods={periods}
        filters={filters}
        campaigns={campaignOptions}
      />
    </Suspense>
  )
}