"use client"

import {
  CalendarDays,
  PawPrint,
  Plus,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardAction,
  CardTitle,
} from "@/components/ui/card"

import type {
  FacilityResourceRow,
  ReservationRow,
} from "@/lib/supabase/types"

import {
  formatDateRange,
  getResourceStatus,
} from "./room-board-manager"
import { Button } from "@/components/ui/button"

type RoomCardProps = {
  resource: FacilityResourceRow
  reservation?: ReservationRow
  onCreateReservation: (
    resource: FacilityResourceRow
  ) => void
}

const TYPE_LABELS: Record<
  FacilityResourceRow["type"],
  string
> = {
  kennel: "Kennel",
  suite: "Suite",
  playroom: "Playroom",
  other: "Other",
}

export function RoomCard({
  resource,
  reservation,
  onCreateReservation,
}: RoomCardProps) {
  const status = getResourceStatus(reservation)

  const pet = reservation?.pet
  const owner = reservation?.owner
  const service = reservation?.service

  return (
    <Card
      size="sm"
      className={[
        "group relative min-h-[190px] bg-background transition-colors",
        status === "occupied" &&
          "border-l-4 border-l-emerald-500",
        status === "reserved" &&
          "border-l-4 border-l-blue-500",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <span className="truncate">
              {resource.name}
            </span>

            <Badge
              variant={
                status === "occupied"
                  ? "completed"
                  : status === "reserved"
                    ? "default"
                    : "secondary"
              }
            >
              {status === "occupied"
                ? "Occupied"
                : status === "reserved"
                  ? "Reserved"
                  : "Available"}
            </Badge>
          </div>
        </CardTitle>

        <CardAction>
          <span className="text-xs text-muted-foreground">
            {TYPE_LABELS[resource.type]}
          </span>
        </CardAction>
      </CardHeader>

      <CardContent className="pb-4">
        {reservation ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <PawPrint className="size-4 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {pet?.name ?? "Unknown pet"}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {owner?.name
                    ? `Owner: ${owner.name}`
                    : "Unknown owner"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" />

              {formatDateRange(
                reservation.check_in_at,
                reservation.check_out_at
              )}
            </div>

            {service?.name && (
              <Badge
                variant="secondary"
                className="text-xs"
              >
                {service.name}
              </Badge>
            )}
          </div>
        ) : (
          <Button
            type="button"
            onClick={() => onCreateReservation(resource)}
            className="flex min-h-[72px] w-full cursor-pointer items-center justify-center rounded-md border border-dashed bg-muted/20 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="text-center">
              <Plus className="mx-auto mb-1 size-4 text-muted-foreground" />

              <p className="text-xs text-muted-foreground">
                Available
              </p>
            </div>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}