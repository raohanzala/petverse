"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "@/components/ui/toast"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DatePickerTime } from "@/components/ui/date-picker-with-time"

import { createRoomTransfer } from "@/lib/supabase/mutations/room-transfers"
import type {
    FacilityResourceRow,
    ReservationRow,
} from "@/lib/supabase/types"
import {
    createRoomTransferSchema,
    type CreateRoomTransferInput,
} from "@/lib/validations/room-transfers"

type RoomTransferFormDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    reservations: ReservationRow[]
    resources: FacilityResourceRow[]
    onSuccess: () => void
}

const defaultValues: CreateRoomTransferInput = {
    reservation_id: "",
    from_resource_id: null,
    to_resource_id: "",
    transferred_at: new Date().toISOString(),
    notes: "",
}

export function RoomTransferFormDialog({
    open,
    onOpenChange,
    reservations,
    resources,
    onSuccess,
}: RoomTransferFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<CreateRoomTransferInput>({
        resolver: zodResolver(createRoomTransferSchema),
        defaultValues,
    })

    useEffect(() => {
        if (!open) return

        form.reset({
            ...defaultValues,
            transferred_at: new Date().toISOString(),
        })
    }, [open, form])

    const reservationId = form.watch("reservation_id")
    const fromResourceId = form.watch("from_resource_id")
    const transferredAt = form.watch("transferred_at")
    const toResourceId = form.watch("to_resource_id")

    const selectedToResource = resources.find(
        (resource) => resource.id === toResourceId
    )

    const selectedReservation = reservations.find(
        (reservation) => reservation.id === reservationId
    )

    useEffect(() => {
        if (!reservationId) {
            form.setValue("from_resource_id", null, {
                shouldValidate: true,
            })
            return
        }

        form.setValue(
            "from_resource_id",
            selectedReservation?.resource_id ?? null,
            {
                shouldValidate: true,
            }
        )
    }, [reservationId, selectedReservation, form])

    function getPetLabel(reservation: ReservationRow) {
        return `${reservation.pet.name} · ${reservation.pet.species}`
    }

    async function onSubmit(values: CreateRoomTransferInput) {
        setIsSubmitting(true)

        const result = await createRoomTransfer(values)

        setIsSubmitting(false)

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
            description: "Room transfer created",
            priority: "high",
        })

        onOpenChange(false)
        onSuccess()
    }

    const availableResources = resources.filter(
        (resource) => resource.id !== fromResourceId
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New room transfer</DialogTitle>
                    <DialogDescription>
                        Move a boarding reservation to a different room or facility
                        resource.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        id="room-transfer"
                        onSubmit={form.handleSubmit(onSubmit)}
                        noValidate
                        className="sticky-form-content scroll-y-hidden"
                    >
                        <FieldGroup>
                            <Field
                                data-invalid={
                                    !!form.formState.errors.reservation_id
                                }
                            >
                                <FieldLabel htmlFor="room-transfer-reservation">
                                    Reservation
                                </FieldLabel>

                                <Select
                                    value={reservationId}
                                    onValueChange={(value) => {
                                        if (!value) return

                                        form.setValue(
                                            "reservation_id",
                                            value,
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        )
                                    }}
                                >
                                    <SelectTrigger
                                        id="room-transfer-reservation"
                                        aria-invalid={
                                            !!form.formState.errors.reservation_id
                                        }
                                    >
                                        <SelectValue placeholder="Select reservation">
                                            {selectedReservation
                                                ? getPetLabel(selectedReservation)
                                                : undefined}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {reservations.map((reservation) => (
                                            <SelectItem
                                                key={reservation.id}
                                                value={reservation.id}
                                            >
                                                {getPetLabel(reservation)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <FieldDescription>
                                    Select the boarding reservation whose room is
                                    changing.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors.reservation_id,
                                    ]}
                                />
                            </Field>

                            <Field
                                data-invalid={
                                    !!form.formState.errors.from_resource_id
                                }
                            >
                                <FieldLabel htmlFor="room-transfer-from">
                                    From room
                                </FieldLabel>

                                <Select
                                    value={fromResourceId ?? "unassigned"}
                                    onValueChange={(value) => {
                                        form.setValue(
                                            "from_resource_id",
                                            value === "unassigned" ? null : value,
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        )
                                    }}
                                >
                                    <SelectTrigger
                                        id="room-transfer-from"
                                        aria-invalid={
                                            !!form.formState.errors.from_resource_id
                                        }
                                    >
                                        <SelectValue placeholder="Select current room">
                                            {fromResourceId
                                                ? fromResourceId === "unassigned"
                                                    ? "Unassigned"
                                                    : resources.find(
                                                        (resource) =>
                                                            resource.id === fromResourceId
                                                    )?.name
                                                : undefined}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="unassigned">
                                            Unassigned
                                        </SelectItem>

                                        {resources.map((resource) => (
                                            <SelectItem
                                                key={resource.id}
                                                value={resource.id}
                                            >
                                                {resource.name} · {resource.type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <FieldDescription>
                                    The reservation's current room.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors.from_resource_id,
                                    ]}
                                />
                            </Field>

                            <Field
                                data-invalid={
                                    !!form.formState.errors.to_resource_id
                                }
                            >
                                <FieldLabel htmlFor="room-transfer-to">
                                    To room
                                </FieldLabel>

                                <Select
                                    value={form.watch("to_resource_id")}
                                    onValueChange={(value) => {
                                        if (!value) return

                                        form.setValue(
                                            "to_resource_id",
                                            value,
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        )
                                    }}
                                >
                                    <SelectTrigger
                                        id="room-transfer-to"
                                        aria-invalid={
                                            !!form.formState.errors.to_resource_id
                                        }
                                    >
                                        <SelectValue placeholder="Select destination room">
                                            {selectedToResource
                                                ? `${selectedToResource.name} · ${selectedToResource.type}`
                                                : undefined}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {availableResources.map((resource) => (
                                            <SelectItem
                                                key={resource.id}
                                                value={resource.id}
                                            >
                                                {resource.name} · {resource.type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <FieldDescription>
                                    The room the reservation will be moved into.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors.to_resource_id,
                                    ]}
                                />
                            </Field>

                            <Field
                                data-invalid={
                                    !!form.formState.errors.transferred_at
                                }
                            >
                                <FieldLabel>Transferred at</FieldLabel>

                                <DatePickerTime
                                    date={
                                        transferredAt
                                            ? new Date(transferredAt)
                                            : undefined
                                    }
                                    onDateChange={(date) => {
                                        if (!date) return

                                        const currentTime = transferredAt
                                            ? new Date(transferredAt)
                                            : new Date()

                                        date.setHours(
                                            currentTime.getHours(),
                                            currentTime.getMinutes(),
                                            currentTime.getSeconds(),
                                            0
                                        )

                                        form.setValue(
                                            "transferred_at",
                                            date.toISOString(),
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        )
                                    }}
                                    time={
                                        transferredAt
                                            ? new Date(transferredAt)
                                                .toTimeString()
                                                .slice(0, 8)
                                            : ""
                                    }
                                    onTimeChange={(time) => {
                                        if (!transferredAt) return

                                        const date = new Date(transferredAt)
                                        const [hours, minutes, seconds] =
                                            time.split(":").map(Number)

                                        date.setHours(
                                            hours,
                                            minutes,
                                            seconds || 0,
                                            0
                                        )

                                        form.setValue(
                                            "transferred_at",
                                            date.toISOString(),
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        )
                                    }}
                                    dateLabel="Date"
                                    timeLabel="Time"
                                    datePlaceholder="Select date"
                                />

                                <FieldError
                                    errors={[
                                        form.formState.errors.transferred_at,
                                    ]}
                                />
                            </Field>

                            <Field
                                data-invalid={
                                    !!form.formState.errors.notes
                                }
                            >
                                <FieldLabel htmlFor="room-transfer-notes">
                                    Notes
                                </FieldLabel>

                                <Textarea
                                    id="room-transfer-notes"
                                    placeholder="Optional reason or transfer notes."
                                    rows={3}
                                    aria-invalid={
                                        !!form.formState.errors.notes
                                    }
                                    {...form.register("notes")}
                                />

                                <FieldError
                                    errors={[form.formState.errors.notes]}
                                />
                            </Field>
                        </FieldGroup>
                    </form>
                </Form>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        form="room-transfer"
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner
                                    size="sm"
                                    className="text-primary-foreground"
                                />
                                Saving…
                            </>
                        ) : (
                            "Create transfer"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}