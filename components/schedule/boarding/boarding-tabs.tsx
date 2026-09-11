import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs"

import { BoardingTabsNav } from "./boarding-tabs-nav"

import { RoomBoardTab } from "./room-board/room-board-tab"
import { ReservationsTab } from "./reservations/reservations-tab"
import { AttendanceTab } from "./attendance/attendance-tab"
import { FacilitiesTab } from "./facilities/facilities-tab"
import { BoardingWaitlistTab } from "./waitlist/boarding-waitlist-tab"
import { BoardingInstructionsTab } from "./instructions/boarding-instructions-tab"

import type {
  FacilityResourceRow,
  PetBoardingInstructionsListRow,
  PetRow,
  ReservationRow,
  RoomTransferListRow,
} from "@/lib/supabase/types"
import { RoomTransfersTab } from "./transfers/room-transfers-tab"

type BoardingTab =
  | "room-board"
  | "reservations"
  | "attendance"
  | "waitlist"
  | "instructions"
  | "transfers"
  | "facilities"

type BoardingTabsProps = {
  params: {
    reservationId?: string
  }
  searchParams: Record<
    string,
    string | string[] | undefined
  >
  tab: BoardingTab
  instructions: PetBoardingInstructionsListRow[]
  pets: PetRow[]
  reservations: ReservationRow[]
  transfers: RoomTransferListRow[]
  resources: FacilityResourceRow[]
}

export function BoardingTabs({
  params,
  searchParams,
  tab,
  instructions,
  pets,
  reservations,
  transfers,
  resources
}: BoardingTabsProps) {
  return (
    <Tabs
      defaultValue={tab}
      className="w-full"
    >
      <BoardingTabsNav activeTab={tab} />

      <TabsContent value="room-board">
        <RoomBoardTab />
      </TabsContent>

      <TabsContent value="reservations">
        <ReservationsTab
          searchParams={searchParams}
        />
      </TabsContent>

      <TabsContent value="attendance">
        <AttendanceTab
          params={params}
          searchParams={searchParams}
        />
      </TabsContent>

      <TabsContent value="waitlist">
        <BoardingWaitlistTab
          searchParams={searchParams}
        />
      </TabsContent>

      <TabsContent value="instructions">
        <BoardingInstructionsTab
          searchParams={searchParams}
          entries={instructions}
          pets={pets}
          reservations={reservations}
        />
      </TabsContent>

      <TabsContent value="transfers">
        <RoomTransfersTab
          searchParams={searchParams}
          transfers={transfers}
          reservations={reservations}
          resources={resources}
        />
      </TabsContent>

      <TabsContent value="facilities">
        <FacilitiesTab
          searchParams={searchParams}
        />
      </TabsContent>
    </Tabs>
  )
}