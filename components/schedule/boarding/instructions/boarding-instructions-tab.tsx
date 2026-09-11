import { BoardingInstructionsManager } from "./boarding-instructions-manager"

import { parseBoardingInstructionsListFilters } from "@/lib/constants/boarding-instructions-filters"
import type {
  PetBoardingInstructionsListRow,
  PetRow,
  ReservationRow,
} from "@/lib/supabase/types"

type BoardingInstructionsTabProps = {
  searchParams: Record<
    string,
    string | string[] | undefined
  >
  entries: PetBoardingInstructionsListRow[]
  pets: PetRow[]
  reservations: ReservationRow[]
}

export async function BoardingInstructionsTab({
  searchParams,
  entries,
  pets,
  reservations,
}: BoardingInstructionsTabProps) {
  const filters =
    parseBoardingInstructionsListFilters(
      searchParams
    )

  return (
    <BoardingInstructionsManager
      entries={entries}
      filters={filters}
      pets={pets}
      reservations={reservations}
    />
  )
}