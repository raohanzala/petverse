import { Suspense } from "react"

import { BoardingWaitlistManager } from "./boarding-waitlist-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseBoardingWaitlistListFilters } from "@/lib/constants/boarding-waitlist-filters"
import { listBoardingWaitlist } from "@/lib/supabase/queries/boarding-waitlist"
import { listOwners } from "@/lib/supabase/queries/owners"
import { listPets } from "@/lib/supabase/queries/pets"

type BoardingWaitlistTabProps = {
  params?: {
    reservationId?: string
  }
  searchParams: Record<
    string,
    string | string[] | undefined
  >
}

export async function BoardingWaitlistTab({
  searchParams,
}: BoardingWaitlistTabProps) {
  const filters =
    parseBoardingWaitlistListFilters(searchParams)

  const [entries, pets, owners] = await Promise.all([
    listBoardingWaitlist(filters),
    listPets(),
    listOwners(),
  ])

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading boarding waitlist…" />
      }
    >
      <BoardingWaitlistManager
        entries={entries}
        filters={filters}
        pets={pets}
        owners={owners}
      />
    </Suspense>
  )
}