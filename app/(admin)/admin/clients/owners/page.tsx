import { Suspense } from "react"

import { OwnersManager } from "@/components/clients/owners-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseOwnerListFilters } from "@/lib/constants/owner-filters"
import { listOwners } from "@/lib/supabase/queries/owners"

type OwnersPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function OwnersPage({
  searchParams,
}: OwnersPageProps) {
  const params = await searchParams

  const filters = parseOwnerListFilters(params)
  const owners = await listOwners(filters)

  return (
    <Suspense fallback={<PageLoader label="Loading owners…" />}>
      <OwnersManager
        owners={owners}
        filters={filters}
      />
    </Suspense>
  )
}