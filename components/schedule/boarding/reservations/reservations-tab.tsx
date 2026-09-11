import { Suspense } from "react"

import { ReservationsManager } from "@/components/schedule/boarding/reservations/reservations-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseReservationListFilters } from "@/lib/constants/reservation-filters"
import { listReservations } from "@/lib/supabase/queries/reservations"
import { listActiveServices } from "@/lib/supabase/queries/services"
import { listOwners } from "@/lib/supabase/queries/owners"
import { listActivePets } from "@/lib/supabase/queries/pets"
import { listActiveFacilityResources } from "@/lib/supabase/queries/facility-resources"

type ReservationsTabProps = {
  searchParams: Record<
    string,
    string | string[] | undefined
  >
}

export async function ReservationsTab({
  searchParams,
}: ReservationsTabProps) {
  const filters =
    parseReservationListFilters(searchParams)

  const [
    reservations,
    services,
    owners,
    pets,
    resources,
  ] = await Promise.all([
    listReservations(filters),
    listActiveServices(),
    listOwners(),
    listActivePets(),
    listActiveFacilityResources(),
  ])

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading reservations…" />
      }
    >
      <ReservationsManager
        pets={pets}
        owners={owners}
        resources={resources}
        services={services}
        reservations={reservations}
        filters={filters}
      />
    </Suspense>
  )
}