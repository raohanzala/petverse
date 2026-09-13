import { Suspense } from "react"

import { CampaignContactsManager } from "@/components/communications/campaign-contacts/campaign-contacts-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseCampaignContactListFilters } from "@/lib/constants/campaign-contact-filters"
import { listCampaignContacts } from "@/lib/supabase/queries/campaign-contacts"
import { listOutboundCampaigns } from "@/lib/supabase/queries/outbound-campaigns"
import { listOwners } from "@/lib/supabase/queries/owners"

type CampaignContactsPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function CampaignContactsPage({
  searchParams,
}: CampaignContactsPageProps) {
  const params = await searchParams

  const filters =
    parseCampaignContactListFilters(params)

  const [contacts, campaigns, owners] =
    await Promise.all([
      listCampaignContacts(filters),
      listOutboundCampaigns(),
      listOwners(),
    ])

  const campaignOptions = campaigns.map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
  }))

  const ownerOptions = owners.map((owner) => ({
    id: owner.id,
    name: owner.name,
  }))

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading campaign contacts…" />
      }
    >
      <CampaignContactsManager
        contacts={contacts}
        filters={filters}
        campaigns={campaignOptions}
        owners={ownerOptions}
      />
    </Suspense>
  )
}