import { Suspense } from "react"

import { FacilityResourcesManager } from "@/components/schedule/boarding/facilities/facility-resources-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseFacilityResourceListFilters } from "@/lib/constants/facility-resources-filters"
import { listFacilityResources } from "@/lib/supabase/queries/facility-resources"

type FacilitiesTabProps = {
  params?: {
    reservationId?: string
  }
  searchParams: Record<
    string,
    string | string[] | undefined
  >
}

export async function FacilitiesTab({
  searchParams,
}: FacilitiesTabProps) {
  const filters =
    parseFacilityResourceListFilters(searchParams)

  const resources = await listFacilityResources(filters)

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading facility resources…" />
      }
    >
      <FacilityResourcesManager
        resources={resources}
        filters={filters}
      />
    </Suspense>
  )
}