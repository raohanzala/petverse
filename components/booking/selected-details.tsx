"use client"

import {
  CalendarDays,
  Clock3,
  PawPrint,
  Scissors,
  UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import type { ServiceRow } from "@/lib/supabase/types"

type BookingState = {
  serviceId: string | null
  professionalId: string | null
  date: string | null
  time: string | null
  customer: {
    name: string
    email: string
    phone: string
  }

  pet: {
    name: string
    type: string
  }
}

type SelectedDetailsProps = {
  booking: BookingState
  selectedService: ServiceRow | null
  onEditStep?: (step: 1 | 2 | 3) => void
}

function formatDate(date: string | null) {
  if (!date) return null

  const parsedDate = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return parsedDate.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatTime(time: string | null) {
  if (!time) return null

  const [hours, minutes] = time.split(":").map(Number)

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return time
  }

  const date = new Date()
  date.setHours(hours, minutes, 0, 0)

  return date.toLocaleTimeString("en-PK", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (!remainingMinutes) {
    return `${hours} hr`
  }

  return `${hours} hr ${remainingMinutes} min`
}

export function SelectedDetails({
  booking,
  selectedService,
  onEditStep,
}: SelectedDetailsProps) {
  //   const selectedService = services.find(
  //     (service) => service.id === booking.serviceId
  //   )

  const hasAppointmentDetails = Boolean(
    booking.date && booking.time
  )

  const hasCustomerDetails = Boolean(
    booking.customer || booking.pet
  )

  const hasAnyDetails = Boolean(
    selectedService ||
    hasAppointmentDetails ||
    hasCustomerDetails
  )

  if (!hasAnyDetails) {
    return (
      <div className="rounded-xl border border-dashed p-5">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
            <PawPrint className="size-5 text-muted-foreground" />
          </div>

          <p className="text-sm font-medium">
            No selections yet
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Your appointment details will appear
            here as you go through the booking steps.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-muted/30 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">
            Selected Details
          </h3>

          <p className="text-xs text-muted-foreground">
            Your appointment summary
          </p>
        </div>

        <PawPrint className="size-4 text-primary" />
      </div>

      <div className="divide-y">
        {/* Service */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Scissors className="size-4 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Service
                </p>

                <p
                  className={cn(
                    "mt-0.5 truncate text-sm font-medium",
                    !selectedService &&
                    "text-muted-foreground"
                  )}
                >
                  {selectedService?.name ??
                    "Not selected"}
                </p>

                {selectedService && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge
                      variant="secondary"
                      className="text-[10px]"
                    >
                      {formatDuration(
                        selectedService.duration_minutes
                      )}
                    </Badge>

                    <Badge
                      variant="outline"
                      className="text-[10px]"
                    >
                      {formatPrice(
                        selectedService.price
                      )}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {selectedService &&
              onEditStep && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => onEditStep(1)}
                >
                  Edit
                </Button>
              )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <CalendarDays className="size-4 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Date & Time
                </p>

                {hasAppointmentDetails ? (
                  <div className="mt-1 space-y-1">
                    <p className="text-sm font-medium">
                      {formatDate(booking.date)}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock3 className="size-3.5" />
                      {formatTime(booking.time)}
                    </div>
                  </div>
                ) : (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Not selected
                  </p>
                )}
              </div>
            </div>

            {hasAppointmentDetails &&
              onEditStep && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => onEditStep(2)}
                >
                  Edit
                </Button>
              )}
          </div>
        </div>

        {/* Customer & Pet */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <UserRound className="size-4 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Customer & Pet
                </p>

                {hasCustomerDetails ? (
                  <div className="mt-1 space-y-1">
                    <p className="text-sm font-medium">
                      Customer details provided
                    </p>

                    {booking.pet && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <PawPrint className="size-3.5" />
                        Pet details provided
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Not provided
                  </p>
                )}
              </div>
            </div>

            {hasCustomerDetails &&
              onEditStep && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => onEditStep(3)}
                >
                  Edit
                </Button>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}