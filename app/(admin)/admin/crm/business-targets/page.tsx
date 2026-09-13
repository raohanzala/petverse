import { Suspense } from "react"

import { BusinessTargetsManager } from "@/components/crm/business-targets/business-targets-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseBusinessTargetListFilters } from "@/lib/constants/business-target-filters"
import { listBusinessTargets } from "@/lib/supabase/queries/business-targets"

type BusinessTargetsPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function BusinessTargetsPage({
  searchParams,
}: BusinessTargetsPageProps) {
  const params = await searchParams

  const filters =
    parseBusinessTargetListFilters(params)

  const targets = await listBusinessTargets(filters)

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading business targets…" />
      }
    >
      <BusinessTargetsManager
        targets={targets}
        filters={filters}
      />
    </Suspense>
  )
}