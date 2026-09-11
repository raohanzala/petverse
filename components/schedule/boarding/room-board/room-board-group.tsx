import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import type {
  FacilityResourceRow,
  ReservationRow,
} from "@/lib/supabase/types"

import { RoomCard} from "./room-card"

type RoomBoardGroupProps = {
  type: FacilityResourceRow["type"]
  resources: FacilityResourceRow[]
  reservationsByResource: Map<
    string,
    ReservationRow[]
  >
}

const GROUP_LABELS: Record<
  FacilityResourceRow["type"],
  string
> = {
  kennel: "Kennels",
  suite: "Suites",
  playroom: "Playrooms",
  other: "Other Rooms",
}

export function RoomBoardGroup({
  type,
  resources,
  reservationsByResource,
}: RoomBoardGroupProps) {
  const occupiedCount = resources.filter(
    (resource) =>
      reservationsByResource.has(resource.id)
  ).length

  const availableCount =
    resources.length - occupiedCount

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">
              {GROUP_LABELS[type]}
            </CardTitle>

            <span className="text-xs text-muted-foreground">
              {resources.length} resources
            </span>

            <span className="text-xs text-muted-foreground">
              •
            </span>

            <span className="text-xs text-muted-foreground">
              {occupiedCount} occupied
            </span>

            <span className="text-xs text-muted-foreground">
              •
            </span>

            <span className="text-xs text-muted-foreground">
              {availableCount} available
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {resources.map((resource) => {
            const resourceReservations =
              reservationsByResource.get(
                resource.id
              ) ?? []

            const reservation =
              resourceReservations[0]

            return (
              <RoomCard
                key={resource.id}
                resource={resource}
                reservation={reservation}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}