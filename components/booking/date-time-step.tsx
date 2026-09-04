"use client"

import { CalendarDays, Check, Clock3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

type DateTimeStepProps = {
  booking: BookingState
  onUpdate: (updates: Partial<BookingState>) => void
}

const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
] as const

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date)
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function getUpcomingDates(days: number) {
  const dates: Date[] = []
  const today = new Date()

  today.setHours(0, 0, 0, 0)

  for (let index = 0; index < days; index++) {
    const date = new Date(today)
    date.setDate(today.getDate() + index)

    dates.push(date)
  }

  return dates
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number)

  const date = new Date()
  date.setHours(hours, minutes, 0, 0)

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function DateTimeStep({
  booking,
  onUpdate,
}: DateTimeStepProps) {
  const dates = getUpcomingDates(14)

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-lg font-semibold">
          Choose Date & Time
        </h2>

        <p className="text-sm text-muted-foreground">
          Select a convenient date and appointment time.
        </p>
      </div>

      {/* Date */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-primary" />

          <h3 className="text-sm font-semibold">
            Select a date
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
          {dates.map((date) => {
            const value = toDateInputValue(date)
            const isSelected = booking.date === value

            return (
              <Button
                key={value}
                type="button"
                variant="outline"
                onClick={() => {
                  onUpdate({
                    date: value,
                    time: null,
                  })
                }}
                className={cn(
                  "h-auto min-h-16 flex-col gap-0.5 px-2 py-2",
                  isSelected &&
                  "border-primary bg-primary/5 text-primary hover:bg-primary/10"
                )}
              >
                <span className="text-[11px] text-muted-foreground">
                  {new Intl.DateTimeFormat("en-US", {
                    weekday: "short",
                  }).format(date)}
                </span>

                <span className="text-base font-semibold">
                  {date.getDate()}
                </span>

                <span className="text-[11px] text-muted-foreground">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                  }).format(date)}
                </span>

                {isSelected ? (
                  <Check className="absolute size-3.5" />
                ) : null}
              </Button>
            )
          })}
        </div>
      </section>

      {/* Time */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock3 className="size-4 text-primary" />

          <div>
            <h3 className="text-sm font-semibold">
              Select a time
            </h3>

            {!booking.date ? (
              <p className="text-xs text-muted-foreground">
                Select a date first.
              </p>
            ) : null}
          </div>
        </div>

        {!booking.date ? (
          <div className="rounded-xl border border-dashed px-5 py-8 text-center">
            <Clock3 className="mx-auto size-7 text-muted-foreground" />

            <p className="mt-2 text-sm font-medium">
              Choose a date first
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Available appointment times will appear
              here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {TIME_SLOTS.map((time) => {
              const isSelected =
                booking.time === time

              return (
                <Button
                  key={time}
                  type="button"
                  variant="outline"
                  onClick={() =>
                    onUpdate({
                      time,
                    })
                  }
                  className={cn(
                    "justify-center",
                    isSelected &&
                    "border-primary bg-primary/5 text-primary hover:bg-primary/10"
                  )}
                >
                  {isSelected ? (
                    <Check />
                  ) : (
                    <Clock3 />
                  )}

                  {formatTime(time)}
                </Button>
              )
            })}
          </div>
        )}
      </section>

      {/* Availability note */}
      <div className="rounded-lg bg-muted/40 px-4 py-3">
        <p className="text-xs leading-5 text-muted-foreground">
          Appointment times shown here are sample booking
          slots. Connect this step to your staff schedules
          and existing appointments before allowing real
          bookings.
        </p>
      </div>
    </div>
  )
}