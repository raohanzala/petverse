import { Suspense } from "react"

import { RoomBoardManager } from "./room-board-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { listActiveFacilityResources } from "@/lib/supabase/queries/facility-resources"
import { listRoomBoardReservations } from "@/lib/supabase/queries/room-board"
import { listPets } from "@/lib/supabase/queries/pets"
import { listOwners } from "@/lib/supabase/queries/owners"
import { listServices } from "@/lib/supabase/queries/services"

export async function RoomBoardTab() {
  const [resources, reservations, pets, owners, services] = await Promise.all([
    listActiveFacilityResources(),
    listRoomBoardReservations(),
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