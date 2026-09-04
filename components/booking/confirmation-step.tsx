"use client"

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  PawPrint,
  Scissors,
  UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import type {
  ServiceCategoryRow,
  ServiceRow,
} from "@/lib/supabase/types"

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

type ConfirmationStepProps = {
  booking: BookingState
  selectedService: ServiceRow | null
  selectedCategory: ServiceCategoryRow | null
  onEditStep: (step: 1 | 2 | 3) => void
  onConfirm?: () => void
  isSubmitting?: boolean
}

function formatDate(date: string | null) {
  if (!date) return "Not selected"

  const parsedDate = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return parsedDate.toLocaleDateString("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatTime(time: string | null) {
  if (!time) return "Not selected"

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

export function ConfirmationStep({
  booking,
  selectedService,
  selectedCategory,
  onEditStep,
  onConfirm,
  isSubmitting = false,
}: ConfirmationStepProps) {
  //   const selectedService = services.find(
  //     (service) => service.id === booking.serviceId
  //   )

  //   const selectedCategory = categories.find(
  //     (category) =>
  //       category.id === selectedService?.category_id
  //   )

  const isComplete = Boolean(
    booking.serviceId &&
    booking.date &&
    booking.time &&
    booking.customer &&
    booking.pet
  )

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-lg font-semibold">
          Confirm your appointment
        </h2>

        <p className="text-sm text-muted-foreground">
          Review your appointment details before
          confirming.
        </p>
      </div>

      {/* Status */}
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg border px-4 py-3",
          isComplete
            ? "border-primary/30 bg-primary/5"
            : "border-destructive/30 bg-destructive/5"
        )}
      >
        {isComplete ? (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
        ) : (
          <PawPrint className="mt-0.5 size-5 shrink-0 text-destructive" />
        )}

        <div>
          <p className="text-sm font-medium">
            {isComplete
              ? "Everything looks good"
              : "Some information is missing"}
          </p>

          <p className="mt-0.5 text-xs text-muted-foreground">
            {isComplete
              ? "Please review the details below and confirm your appointment."
              : "Go back to the previous steps and complete the required information."}
          </p>
        </div>
      </div>

      {/* Appointment */}
      <section className="overflow-hidden rounded-xl border">
        <div className="flex items-center justify-between gap-4 bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <Scissors className="size-4 text-primary" />

            <h3 className="text-sm font-semibold">
              Appointment
            </h3>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEditStep(1)}
          >
            Edit
          </Button>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <p className="text-base font-semibold">
              {selectedService?.name ??
                "Service not selected"}
            </p>

            {selectedService?.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedService.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {selectedCategory && (
                <Badge variant="secondary">
                  {selectedCategory.name}
                </Badge>
              )}

              {selectedService && (
                <Badge variant="outline">
                  {formatDuration(
                    selectedService.duration_minutes
                  )}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 size-4 text-muted-foreground" />

              <div>
                <p className="text-xs text-muted-foreground">
                  Date
                </p>

                <p className="mt-0.5 text-sm font-medium">
                  {formatDate(booking.date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 size-4 text-muted-foreground" />

              <div>
                <p className="text-xs text-muted-foreground">
                  Time
                </p>

                <p className="mt-0.5 text-sm font-medium">
                  {formatTime(booking.time)}
                </p>
              </div>
            </div>
          </div>

          {selectedService && (
            <>
              <Separator />

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  Service price
                </span>

                <span className="text-sm font-semibold">
                  {formatPrice(
                    selectedService.price
                  )}
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Customer & Pet */}
      <section className="overflow-hidden rounded-xl border">
        <div className="flex items-center justify-between gap-4 bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <UserRound className="size-4 text-primary" />

            <h3 className="text-sm font-semibold">
              Customer & Pet
            </h3>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEditStep(3)}
          >
            Edit
          </Button>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">
              Customer
            </p>

            <p className="mt-1 text-sm font-medium">
              {booking.customer
                ? "Customer details provided"
                : "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Pet
            </p>

            <p className="mt-1 text-sm font-medium">
              {booking.pet
                ? "Pet details provided"
                : "Not provided"}
            </p>
          </div>
        </div>
      </section>

      {/* Confirmation */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          By confirming, you&apos;ll submit this
          appointment request.
        </p>

        <Button
          type="button"
          onClick={onConfirm}
          disabled={!isComplete || isSubmitting}
        >
          {isSubmitting
            ? "Confirming..."
            : "Confirm Appointment"}
        </Button>
      </div>
    </div>
  )
}