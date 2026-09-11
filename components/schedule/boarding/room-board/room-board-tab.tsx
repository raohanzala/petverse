import { Suspense } from "react"

import { RoomBoardManager } from "./room-board-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { listActiveFacilityResources } from "@/lib/supabase/queries/facility-resources"
import { listRoomBoardReservations } from "@/lib/supabase/queries/room-board"

export async function RoomBoardTab() {
  const [resources, reservations] = await Promise.all([
    listActiveFacilityResources(),
    listRoomBoardReservations(),
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
      />
    </Suspense>
  )
}