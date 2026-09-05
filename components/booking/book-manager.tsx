"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import type {
  ServiceCategoryRow,
  ServiceRow,
} from "@/lib/supabase/types"

import { Stepper, type StepperStep } from "@/components/shared/stepper"
import { ServiceStep } from "./service-step"
import { DateTimeStep } from "./date-time-step"
import { CustomerStep } from "./customer-step"
import { ConfirmationStep } from "./confirmation-step"
import { SelectedDetails } from "./selected-details"

import { toast } from "@/components/ui/toast"
import { createPublicAppointment } from "@/lib/supabase/mutations/public-appointment"

type BookingStep = 1 | 2 | 3 | 4

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

type BookManagerProps = {
  services: ServiceRow[]
  categories: ServiceCategoryRow[]
  onConfirm?: () => void
}

const INITIAL_BOOKING: BookingState = {
  serviceId: null,
  professionalId: null,
  date: null,
  time: null,

  customer: {
    name: "",
    email: "",
    phone: "",
  },

  pet: {
    name: "",
    type: "",
  },
}

const STEPS: StepperStep[] = [
  {
    id: "service",
    label: "Service",
  },
  {
    id: "date-time",
    label: "Date & Time",
  },
  {
    id: "customer",
    label: "Customer",
  },
  {
    id: "confirm",
    label: "Confirm",
  },
]

export function BookManager({
  services,
  categories,
}: BookManagerProps) {
  const router = useRouter()

  const [currentStep, setCurrentStep] =
    useState<BookingStep>(1)

  const [booking, setBooking] =
    useState<BookingState>(INITIAL_BOOKING)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const groupedServices = useMemo(() => {
    const grouped = categories.map((category) => ({
      category,
      services: services.filter(
        (service) =>
          service.category_id === category.id
      ),
    }))

    const categorizedServiceIds = new Set(
      grouped.flatMap((group) =>
        group.services.map((service) => service.id)
      )
    )

    const uncategorizedServices = services.filter(
      (service) =>
        service.category_id === null ||
        !categorizedServiceIds.has(service.id)
    )

    return {
      grouped,
      uncategorizedServices,
    }
  }, [services, categories])

  const selectedService = useMemo(
    () =>
      services.find(
        (service) =>
          service.id === booking.serviceId
      ) ?? null,
    [services, booking.serviceId]
  )

  const isComplete = Boolean(
    booking.serviceId &&
      booking.date &&
      booking.time &&
      booking.customer.name.trim() &&
      booking.customer.phone.trim() &&
      booking.pet.name.trim() &&
      booking.pet.type.trim()
  )

  const canContinue = useMemo(() => {
    switch (currentStep) {
      case 1:
        return Boolean(booking.serviceId)

      case 2:
        return Boolean(
          booking.date && booking.time
        )

      case 3:
        return Boolean(
          booking.customer.name.trim() &&
            booking.customer.phone.trim() &&
            booking.pet.name.trim() &&
            booking.pet.type.trim()
        )

      case 4:
        return true

      default:
        return false
    }
  }, [currentStep, booking])

  function updateBooking(
    updates: Partial<BookingState>
  ) {
    setBooking((current) => ({
      ...current,
      ...updates,
    }))
  }

  function selectService(service: ServiceRow) {
    setBooking((current) => ({
      ...current,
      serviceId: service.id,
      professionalId: null,
      date: null,
      time: null,
    }))
  }

  function goNext() {
    if (!canContinue) return

    setCurrentStep((current) => {
      if (current >= 4) return 4

      return (current + 1) as BookingStep
    })
  }

  function goBack() {
    setCurrentStep((current) => {
      if (current <= 1) return 1

      return (current - 1) as BookingStep
    })
  }

  function goToStep(step: BookingStep) {
    if (step > currentStep) return

    setCurrentStep(step)
  }

  async function handleConfirmBooking() {
    if (
      !booking.serviceId ||
      !booking.date ||
      !booking.time ||
      !booking.customer.name.trim() ||
      !booking.customer.phone.trim() ||
      !booking.pet.name.trim() ||
      !booking.pet.type.trim()
    ) {
      return
    }

    const service = selectedService

    if (!service) {
      toast.add({
        type: "error",
        description: "Please select a service",
        priority: "high",
      })

      return
    }

    setIsSubmitting(true)

    try {
      const startsAt = new Date(
        `${booking.date}T${booking.time}`
      )

      const endsAt = new Date(
        startsAt.getTime() +
          service.duration_minutes * 60 * 1000
      )

      const result =
        await createPublicAppointment({
          customer: booking.customer,
          pet: booking.pet,
          service_id: booking.serviceId,
          preferred_employee_id:
            booking.professionalId,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          duration_minutes:
            service.duration_minutes,
          price: service.price,
        })

      if (!result.success) {
        toast.add({
          type: "error",
          description: result.error,
          priority: "high",
        })

        return
      }

      toast.add({
        type: "success",
        description:
          "Appointment requested successfully",
        priority: "high",
      })

      setCurrentStep(4)
    } catch {
      toast.add({
        type: "error",
        description:
          "Something went wrong. Please try again.",
        priority: "high",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">

      {/* -------------------------------------------------
          HEADER
      ------------------------------------------------- */}
      <header className="shrink-0 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <span className="font-heading text-sm font-semibold">
                P
              </span>
            </div>

            <div>
              <p className="font-heading text-sm font-semibold text-foreground">
                Pet Company
              </p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Pet care & wellness
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft />
            Back to Home
          </Button>
        </div>
      </header>

      {/* -------------------------------------------------
          MAIN
      ------------------------------------------------- */}
      <main className="min-h-0 flex-1 overflow-hidden">
        <div className="mx-auto flex h-full max-w-[1440px] flex-col px-6 lg:px-10">

          {/* -------------------------------------------------
              PAGE INTRO
          ------------------------------------------------- */}
          <div className="shrink-0 pb-5 pt-6 lg:pt-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                  Appointment booking
                </p>

                <h1 className="font-heading text-2xl font-semibold tracking-tight text-navy lg:text-3xl">
                  Book Your Appointment
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  Schedule a visit for your pet in just a few steps.
                </p>
              </div>

              <div className="hidden w-[520px] lg:block">
                <Stepper
                  steps={STEPS}
                  currentStep={currentStep}
                  className="w-full"
                />
              </div>
            </div>

            {/* Mobile stepper */}
            <div className="mt-5 lg:hidden">
              <Stepper
                steps={STEPS}
                currentStep={currentStep}
              />
            </div>
          </div>

          {/* -------------------------------------------------
              CONTENT AREA
          ------------------------------------------------- */}
          <div className="min-h-0 flex-1 pb-4">

            <div className="grid h-full min-h-0 gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">

              {/* LEFT CONTENT */}
              <section className="min-h-0 overflow-hidden rounded-xl border border-border bg-card">

                <div className="flex h-full min-h-0 flex-col">

                  {/* Step content */}
                  <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none">

                    {currentStep === 1 ? (
                      <ServiceStep
                        groupedServices={
                          groupedServices.grouped
                        }
                        uncategorizedServices={
                          groupedServices.uncategorizedServices
                        }
                        selectedServiceId={
                          booking.serviceId
                        }
                        onSelectService={
                          selectService
                        }
                      />
                    ) : null}

                    {currentStep === 2 ? (
                      <DateTimeStep
                        booking={booking}
                        onUpdate={updateBooking}
                      />
                    ) : null}

                    {currentStep === 3 ? (
                      <CustomerStep
                        booking={booking}
                        onUpdate={updateBooking}
                      />
                    ) : null}

                    {currentStep === 4 ? (
                      <ConfirmationStep
                        booking={booking}
                        selectedService={
                          selectedService
                        }
                        selectedCategory={
                          categories.find(
                            (category) =>
                              category.id ===
                              selectedService?.category_id
                          ) ?? null
                        }
                        onEditStep={goToStep}
                        onConfirm={
                          handleConfirmBooking
                        }
                        isSubmitting={
                          isSubmitting
                        }
                      />
                    ) : null}

                  </div>

                  {/* -------------------------------------------------
                      BOTTOM ACTION BAR
                  ------------------------------------------------- */}
                  <div className="shrink-0 border-t border-border bg-card px-5 py-4">
                    <div className="flex items-center justify-between">

                      <Button
                        variant="outline"
                        type="button"
                        onClick={goBack}
                        disabled={
                          currentStep === 1
                        }
                      >
                        <ArrowLeft />
                        Back
                      </Button>

                      {currentStep < 4 ? (
                        <Button
                          type="button"
                          onClick={goNext}
                          disabled={!canContinue}
                          className="min-w-32"
                        >
                          Continue
                          <ArrowRight />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={
                            handleConfirmBooking
                          }
                          disabled={
                            !isComplete ||
                            isSubmitting
                          }
                          className="min-w-40"
                        >
                          {isSubmitting
                            ? "Confirming..."
                            : "Confirm Appointment"}
                        </Button>
                      )}

                    </div>
                  </div>

                </div>
              </section>

              {/* RIGHT SUMMARY */}
              <aside className="hidden min-h-0 lg:block">
                <SelectedDetails
                  booking={booking}
                  selectedService={
                    selectedService
                  }
                  onEditStep={goToStep}
                />
              </aside>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}