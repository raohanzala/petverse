"use client"

import { useMemo, useState } from "react"

import type {
  FacilityResourceRow,
  OwnerRow,
  PetRow,
  ReservationRow,
  ServiceListRow,
} from "@/lib/supabase/types"

import { RoomBoardControls } from "./room-board-controls"
import { RoomBoardGroup } from "./room-board-group"
import { EmptyState } from "@/components/shared"
import { ReservationFormDialog } from "../reservations/reservations-form-dialog"

type RoomBoardManagerProps = {
  resources: FacilityResourceRow[]
  reservations: ReservationRow[]
  services: ServiceListRow[]
  owners: OwnerRow[]
  pets: PetRow[]
}

export type ResourceFilter =
  | "all"
  | "kennel"
  | "suite"
  | "playroom"
  | "other"

export function isReservationOnDate(
  reservation: ReservationRow,
  date: Date
) {
  if (
    reservation.status === "cancelled" ||
    reservation.status === "checked_out"
  ) {
    return false
  }

  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)

  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  const checkIn = new Date(
    reservation.check_in_at
  )

  const checkOut = new Date(
    reservation.check_out_at
  )

  return (
    checkIn <= dayEnd &&
    checkOut > dayStart
  )
}

export function getResourceStatus(
  reservation: ReservationRow | undefined
) {
  if (!reservation) {
    return "available" as const
  }

  if (reservation.status === "checked_in") {
    return "occupied" as const
  }

  return "reserved" as const
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatDateRange(
  checkIn: string,
  checkOut: string
) {
  const start = new Date(checkIn)
  const end = new Date(checkOut)

  return `${start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} – ${end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`
}

export function RoomBoardManager({
  resources,
  reservations,
  owners,
  pets,
  services,
}: RoomBoardManagerProps) {
  const [selectedDate, setSelectedDate] = useState(
    new Date()
  )

  const [reservationDialogOpen, setReservationDialogOpen] =
    useState(false)

  const [selectedResource, setSelectedResource] =
    useState<FacilityResourceRow | null>(null)

  const [filter, setFilter] =
    useState<ResourceFilter>("all")

  function handleCreateReservation(
    resource: FacilityResourceRow
  ) {
    setSelectedResource(resource)
    setReservationDialogOpen(true)
  }

  const filteredResources = useMemo(() => {
    if (filter === "all") {
      return resources
    }

    return resources.filter(
      (resource) => resource.type === filter
    )
  }, [resources, filter])

  const reservationsByResource = useMemo(() => {
    const map = new Map<
      string,
      ReservationRow[]
    >()

    for (const reservation of reservations) {
      if (!reservation.resource_id) continue

      if (
        !isReservationOnDate(
          reservation,
          selectedDate
        )
      ) {
        continue
      }

      const existing =
        map.get(reservation.resource_id) ?? []

      existing.push(reservation)

      map.set(
        reservation.resource_id,
        existing
      )
    }

    return map
  }, [reservations, selectedDate])

  const occupiedCount = filteredResources.filter(
    (resource) => {
      const resourceReservations =
        reservationsByResource.get(resource.id)

      return (
        resourceReservations &&
        resourceReservations.length > 0
      )
    }
  ).length

  const availableCount =
    filteredResources.length - occupiedCount

  const groupedResources = useMemo(() => {
    const groups = new Map<
      FacilityResourceRow["type"],
      FacilityResourceRow[]
    >()

    for (const resource of filteredResources) {
      const existing =
        groups.get(resource.type) ?? []

      existing.push(resource)

      groups.set(resource.type, existing)
    }

    return Array.from(groups.entries())
  }, [filteredResources])

  function changeDate(days: number) {
    setSelectedDate((current) => {
      const next = new Date(current)

      next.setDate(
        next.getDate() + days
      )

      return next
    })
  }

  function goToToday() {
    setSelectedDate(new Date())
  }

  return (
    <div className="space-y-5">
      <RoomBoardControls
        filter={filter}
        onFilterChange={setFilter}
        selectedDate={selectedDate}
        onPreviousDay={() => changeDate(-1)}
        onNextDay={() => changeDate(1)}
        onToday={goToToday}
        occupiedCount={occupiedCount}
        totalCount={filteredResources.length}
      />

      {filteredResources.length === 0 ? (
        <EmptyState title="No facility resources found." />
      ) : (
        <>
          {groupedResources.map(
            ([type, groupResources]) => (
              <RoomBoardGroup
                key={type}
                type={type}
                resources={groupResources}
                onCreateReservation={handleCreateReservation}
                reservationsByResource={
                  reservationsByResource
                }
              />
            )
          )}

          <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              {occupiedCount} occupied
            </div>

            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-blue-500" />
              Reserved
            </div>

            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-muted-foreground/30" />
              {availableCount} available
            </div>
          </div>
        </>
      )}
      <ReservationFormDialog
        open={reservationDialogOpen}
        onOpenChange={(open) => {
          setReservationDialogOpen(open)

          if (!open) {
            setSelectedResource(null)
          }
        }}
        reservation={null}
        services={services}
        resources={resources}
        owners={owners}
        pets={pets}
        initialResourceId={selectedResource?.id ?? null}
        onSuccess={() => {
          setReservationDialogOpen(false)
          setSelectedResource(null)
        }}
      />
    </div>

  )
}