import { Suspense } from "react"

import { RoomBoardManager } from "./room-board-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { listActiveFacilityResources } from "@/lib/supabase/queries/facility-resources"
import { listPets } from "@/lib/supabase/queries/pets"
import { listOwners } from "@/lib/supabase/queries/owners"
import { listServices } from "@/lib/supabase/queries/services"
import { listActiveReservations } from "@/lib/supabase/queries/reservations"

export async function RoomBoardTab() {
  const [resources, reservations, pets, owners, services] = await Promise.all([
    listActiveFacilityResources(),
    listActiveReservations(),
    listPets(),
    listOwners(),
    listServices()
  ])

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading room board…" />
      }
    >
      <RoomBoardManager
        resources={resources}
        reservations={reservations}
        pets={pets}
        owners={owners}
        services={services}
      />
    </Suspense>
  )
}