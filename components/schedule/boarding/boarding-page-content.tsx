import { BoardingTabs } from "@/components/schedule/boarding/boarding-tabs"

import { parseBoardingInstructionsListFilters } from "@/lib/constants/boarding-instructions-filters"
import { parseRoomTransferListFilters } from "@/lib/constants/room-transfer-filters"

import { listBoardingInstructions } from "@/lib/supabase/queries/boarding-instructions"
import { listPets } from "@/lib/supabase/queries/pets"
import { listReservations } from "@/lib/supabase/queries/reservations"
import { listRoomTransfers } from "@/lib/supabase/queries/room-transfers"
import { listFacilityResources } from "@/lib/supabase/queries/facility-resources"

type BoardingTab =
  | "room-board"
  | "reservations"
  | "attendance"
  | "waitlist"
  | "instructions"
  | "transfers"
  | "facilities"

type BoardingPageContentProps = {
  tab: BoardingTab
  searchParams: Record<
    string,
    string | string[] | undefined
  >
}

export async function BoardingPageContent({
  tab,
  searchParams,
}: BoardingPageContentProps) {
  const instructionFilters =
    parseBoardingInstructionsListFilters(
      searchParams
    )

  const roomTransferFilters =
    parseRoomTransferListFilters(
      searchParams
    )

  const [
    instructions,
    pets,
    reservations,
    transfers,
    resources,
  ] = await Promise.all([
    listBoardingInstructions(
      instructionFilters
    ),
    listPets(),
    listReservations(),
    listRoomTransfers(
      roomTransferFilters
    ),
    listFacilityResources(),
  ])

  return (
    <div className="space-y-6">
      <BoardingTabs
        tab={tab}
        searchParams={searchParams}
        instructions={instructions}
        pets={pets}
        reservations={reservations}
        transfers={transfers}
        resources={resources}
      />
    </div>
  )
}