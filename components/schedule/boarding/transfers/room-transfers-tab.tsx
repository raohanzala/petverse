import { RoomTransfersManager } from "./room-transfers-manager"

import { parseRoomTransferListFilters } from "@/lib/constants/room-transfer-filters"
import { listRoomTransfers } from "@/lib/supabase/queries/room-transfers"
import type {
  FacilityResourceRow,
  ReservationRow,
} from "@/lib/supabase/types"

type RoomTransfersTabProps = {
  searchParams: Record<
    string,
    string | string[] | undefined
  >
  transfers: Awaited<
    ReturnType<typeof listRoomTransfers>
  >
  reservations: ReservationRow[]
  resources: FacilityResourceRow[]
}

export async function RoomTransfersTab({
  searchParams,
  transfers,
  reservations,
  resources,
}: RoomTransfersTabProps) {
  const filters =
    parseRoomTransferListFilters(searchParams)

  return (
    <RoomTransfersManager
      transfers={transfers}
      filters={filters}
      reservations={reservations}
      resources={resources}
    />
  )
}