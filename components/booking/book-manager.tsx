"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import type {
    ServiceCategoryRow,
    ServiceRow,
} from "@/lib/supabase/types"
import { BookingProgress } from "./booking-progress"
import { ServiceStep } from "./service-step"
import { DateTimeStep } from "./date-time-step"
import { CustomerStep } from "./customer-step"
import { ConfirmationStep } from "./confirmation-step"
import { SelectedDetails } from "./selected-details"
import { toast } from "sonner"
import { createPublicAppointment } from '@/lib/supabase/mutations/public-appointment'
import { useRouter } from "next/navigation"

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

const STEPS = [
    {
        number: 1 as BookingStep,
        label: "Service",
    },
    {
        number: 2 as BookingStep,
        label: "Date & Time",
    },
    {
        number: 3 as BookingStep,
        label: "Customer",
    },
    {
        number: 4 as BookingStep,
        label: "Confirm",
    },
] as const

export function BookManager({
    services,
    categories,
}: BookManagerProps) {
    const router = useRouter()
    const [currentStep, setCurrentStep] =
        useState<BookingStep>(1)

    const [booking, setBooking] =
        useState<BookingState>(INITIAL_BOOKING)
    const [isSubmitting, setIsSubmitting] = useState(false)

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

    const isComplete = Boolean(
        booking.serviceId &&
        booking.date &&
        booking.time &&
        booking.customer &&
        booking.pet
    )

    const selectedService = useMemo(
        () =>
            services.find(
                (service) =>
                    service.id === booking.serviceId
            ) ?? null,
        [services, booking.serviceId]
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
        /*
         * Changing the service invalidates anything that
         * depends on the previous service.
         *
         * Date/time availability may change when the service
         * changes, so clear those values.
         */
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
        /*
         * Don't allow jumping into future steps until the
         * required previous information has been selected.
         */
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
            toast.error("Please select a service")
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

            const result = await createPublicAppointment({
                customer: booking.customer,
                pet: booking.pet,
                service_id: booking.serviceId,
                preferred_employee_id: booking.professionalId,
                starts_at: startsAt.toISOString(),
                ends_at: endsAt.toISOString(),
                duration_minutes: service.duration_minutes,
                price: service.price,
            })

            if (!result.success) {
                toast.error(result.error)
                return
            }

            toast.success("Appointment requested successfully")

            // You can replace this later with a dedicated
            // booking-success screen.
            setCurrentStep(4)
        } catch {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-background">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <span className="text-sm font-semibold">
                                P
                            </span>
                        </div>

                        <span className="font-semibold">
                            Pet Company
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/')}
                    >
                        <ArrowLeft />
                        Back to Home
                    </Button>
                </div>
            </header>

            {/* Page */}
            <main className="mx-auto max-w-7xl px-6 py-8">
                {/* Title */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Book Your Appointment
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Follow the steps below to schedule your
                        pet&apos;s visit
                    </p>
                </div>

                {/* Progress */}
                <BookingProgress
                    currentStep={currentStep}
                    steps={STEPS}
                    onStepClick={goToStep}
                />

                {/* Content */}
                <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_280px]">
                    <div className="min-w-0 rounded-xl border bg-background p-5">
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
                                onSelectService={selectService}
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
                                selectedService={selectedService}
                                selectedCategory={
                                    categories.find(
                                        (category) =>
                                            category.id === selectedService?.category_id
                                    ) ?? null
                                }
                                onEditStep={goToStep}
                                onConfirm={handleConfirmBooking}
                                isSubmitting={isSubmitting}
                            />
                        ) : null}
                    </div>

                    {/* Selected details */}
                    <SelectedDetails
                        booking={booking}
                        selectedService={selectedService}
                        onEditStep={goToStep}
                    />
                </div>

                {/* Navigation */}
                <div className="mt-5 flex items-center justify-between">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={goBack}
                        disabled={currentStep === 1}
                    >
                        <ArrowLeft />
                        Back
                    </Button>

                    {currentStep < 4 ? (
                        <Button
                            type="button"
                            onClick={goNext}
                            disabled={!canContinue}
                        >
                            Continue
                            <ArrowRight />
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleConfirmBooking}
                            disabled={!isComplete || isSubmitting}
                        >
                            {isSubmitting
                                ? "Confirming..."
                                : "Confirm Appointment"}
                        </Button>
                    )}
                </div>
            </main>
        </div>
    )
}