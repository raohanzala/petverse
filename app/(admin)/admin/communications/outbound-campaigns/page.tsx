import { Suspense } from "react"

import { OutboundCampaignsManager } from "@/components/communications/outbound-campaigns/outbound-campaigns-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseOutboundCampaignListFilters } from "@/lib/constants/outbound-campaign-filters"
import { listOutboundCampaigns } from "@/lib/supabase/queries/outbound-campaigns"

type OutboundCampaignsPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function OutboundCampaignsPage({
  searchParams,
}: OutboundCampaignsPageProps) {
  const params = await searchParams

  const filters =
    parseOutboundCampaignListFilters(params)

  const campaigns =
    await listOutboundCampaigns(filters)

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading outbound campaigns…" />
      }
    >
      <OutboundCampaignsManager
        campaigns={campaigns}
        filters={filters}
      />
    </Suspense>
  )
}