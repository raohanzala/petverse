"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
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
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    createAppointment,
    updateAppointment,
} from "@/lib/supabase/mutations/appointment"
import type {
    AppointmentRow,
    EmployeeRow,
    OwnerRow,
    PetRow,
    ServicePackageRow,
    ServiceRow,
} from "@/lib/supabase/types"
import {
    createAppointmentSchema,
    type CreateAppointmentInput,
} from "@/lib/validations/appointments"
import { format } from "date-fns"
import { DatePickerTime } from "../ui/date-picker-with-time"
import { parseDateTime } from "@/lib/utils"

type AppointmentFormDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    appointment?: AppointmentRow | null
    owners: OwnerRow[]
    pets: PetRow[]
    services: ServiceRow[]
    packages: ServicePackageRow[]
    employees: EmployeeRow[]
    onSuccess: () => void
}

const defaultValues: CreateAppointmentInput = {
    owner_id: "",
    pet_id: "",
    service_id: null,
    package_id: null,
    employee_id: null,
    preferred_employee_id: null,
    status: "confirmed",
    source: "admin",
    starts_at: "",
    ends_at: "",
    duration_minutes: 60,
    price: 0,
    group_id: null,
    step_order: null,
    notes: "",
    cancelled_at: null,
    cancel_reason: "",
}

const STATUS_OPTIONS = [
    { value: "requested", label: "Requested" },
    { value: "confirmed", label: "Confirmed" },
    { value: "arrived", label: "Arrived" },
    { value: "in_service", label: "In service" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "no_show", label: "No show" },
] as const

const SOURCE_OPTIONS = [
    { value: "online", label: "Online" },
    { value: "admin", label: "Admin" },
    { value: "phone", label: "Phone" },
] as const

export function AppointmentFormDialog({
    open,
    onOpenChange,
    appointment,
    owners,
    pets,
    services,
    packages,
    employees,
    onSuccess,
}: AppointmentFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isEditing = Boolean(appointment)

    const form = useForm<CreateAppointmentInput>({
        resolver: zodResolver(createAppointmentSchema),
        defaultValues,
    })

    useEffect(() => {
        if (!open) return

        if (appointment) {
            form.reset({
                owner_id: appointment.owner_id,
                pet_id: appointment.pet_id,
                service_id: appointment.service_id,
                package_id: appointment.package_id,
                employee_id: appointment.employee_id,
                preferred_employee_id:
                    appointment.preferred_employee_id,
                status: appointment.status,
                source: appointment.source,
                starts_at: appointment.starts_at.slice(0, 16),
                ends_at: appointment.ends_at.slice(0, 16),
                duration_minutes: appointment.duration_minutes,
                price: appointment.price,
                group_id: appointment.group_id,
                step_order: appointment.step_order,
                notes: appointment.notes ?? "",
                cancelled_at: appointment.cancelled_at,
                cancel_reason: appointment.cancel_reason ?? "",
            })

            return
        }

        form.reset(defaultValues)
    }, [open, appointment, form])

    const selectedOwnerId = form.watch("owner_id")
    const selectedPetId = form.watch("pet_id")
    const selectedServiceId = form.watch("service_id")
    const selectedPackageId = form.watch("package_id")
    const selectedEmployeeId = form.watch("employee_id")
    const selectedPreferredEmployeeId = form.watch(
        "preferred_employee_id"
    )
    const selectedStatus = form.watch("status")

    const selectedPet = pets.find(
        (pet) => pet.id === selectedPetId
    )

    const selectedPackage = packages.find(
        (pkg) => pkg.id === Number(selectedPackageId)
    )

    const selectedEmployee = employees.find(
        (employee) => employee.id === selectedEmployeeId
    )

    const selectedPreferredEmployee = employees.find(
        (employee) => employee.id === selectedPreferredEmployeeId
    )

    const ownerPets = pets.filter(
        (pet) => pet.owner_id === selectedOwnerId
    )

    function handleOwnerChange(ownerId: string) {
        form.setValue("owner_id", ownerId, {
            shouldDirty: true,
            shouldValidate: true,
        })

        const ownerPets = pets.filter(
            (pet) => pet.owner_id === ownerId
        )

        form.setValue(
            "pet_id",
            ownerPets.length === 1 ? ownerPets[0].id : "",
            {
                shouldDirty: true,
                shouldValidate: true,
            }
        )
    }

    function handleServiceChange(serviceId: string) {
        const selectedService = services.find(
            (service) => service.id === serviceId
        )

        form.setValue("service_id", serviceId || null, {
            shouldDirty: true,
            shouldValidate: true,
        })

        if (serviceId) {
            form.setValue("package_id", null, {
                shouldDirty: true,
                shouldValidate: true,
            })
        }

        if (selectedService) {
            form.setValue(
                "duration_minutes",
                selectedService.duration_minutes,
                {
                    shouldDirty: true,
                    shouldValidate: true,
                }
            )

            form.setValue(
                "price",
                selectedService.price,
                {
                    shouldDirty: true,
                    shouldValidate: true,
                }
            )
        }
    }

    function handlePackageChange(packageId: string) {
        const selectedPackage = packages.find(
            (pkg) => String(pkg.id) === String(packageId)
        )

        form.setValue("package_id", packageId || null, {
            shouldDirty: true,
            shouldValidate: true,
        })

        if (packageId) {
            form.setValue("service_id", null, {
                shouldDirty: true,
                shouldValidate: true,
            })
        }

        if (selectedPackage) {
            form.setValue(
                "duration_minutes",
                selectedPackage.duration_minutes,
                {
                    shouldDirty: true,
                    shouldValidate: true,
                }
            )

            form.setValue(
                "price",
                selectedPackage.price,
                {
                    shouldDirty: true,
                    shouldValidate: true,
                }
            )
        }
    }

    async function onSubmit(values: CreateAppointmentInput) {
        setIsSubmitting(true)

        const result = isEditing
            ? await updateAppointment({
                id: appointment!.id,
                ...values,
            })
            : await createAppointment(values)

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
            description: isEditing ? "Appointment updated" : "Appointment created",
            priority: "high",
        })

        onOpenChange(false)
        onSuccess()
    }

    const selectedService = services.find(
        (service) => service.id === form.watch("service_id")
    )

    function combineDateTime(
        date: Date | undefined,
        time: string
    ) {
        if (!date) return ""

        const datePart = format(date, "yyyy-MM-dd")

        // If no time has been selected yet,
        // use the current time.
        const finalTime =
            time || format(new Date(), "HH:mm:ss")

        return `${datePart}T${finalTime}`
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? "Edit appointment"
                            : "New appointment"}
                    </DialogTitle>

                    <DialogDescription>
                        Create an appointment and assign it to a pet,
                        service, and staff member.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        id="appointment"
                        onSubmit={form.handleSubmit(onSubmit)}
                        noValidate
                        className="space-y-5 h-100 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        <FieldGroup>
                            <Field
                                data-invalid={
                                    !!form.formState.errors.owner_id
                                }
                            >
                                <FieldLabel htmlFor="appointment-owner">
                                    Owner
                                </FieldLabel>

                                <Select
                                    value={form.watch("owner_id")}
                                    onValueChange={(value) => {
                                        if (!value) return
                                        handleOwnerChange(value)
                                    }}
                                >
                                    <SelectTrigger
                                        id="appointment-owner"
                                        aria-invalid={
                                            !!form.formState.errors.owner_id
                                        }
                                    >
                                        <SelectValue placeholder="Select owner">
                                            {owners.find(
                                                (owner) => owner.id === form.watch("owner_id")
                                            )?.name ?? "Select owner"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {owners.map((owner) => (
                                            <SelectItem
                                                key={owner.id}
                                                value={owner.id}
                                            >
                                                {owner.name} — {owner.phone}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <FieldError
                                    errors={[
                                        form.formState.errors.owner_id,
                                    ]}
                                />
                            </Field>

                            <Field data-invalid={!!form.formState.errors.pet_id} >
                                <FieldLabel htmlFor="appointment-pet"> Pet </FieldLabel>
                                <Select
                                    value={selectedPetId}
                                    onValueChange={(value) => {
                                        if (!value) return

                                        form.setValue("pet_id", value, {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        })
                                    }}
                                    disabled={!selectedOwnerId}
                                >
                                    <SelectTrigger
                                        id="appointment-pet"
                                        aria-invalid={!!form.formState.errors.pet_id}
                                    >
                                        <SelectValue
                                            placeholder={
                                                selectedOwnerId
                                                    ? "Select pet"
                                                    : "Select owner first"
                                            }
                                        >
                                            {selectedPet?.name ??
                                                (selectedOwnerId
                                                    ? "Select pet"
                                                    : "Select owner first")}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {ownerPets.map((pet) => (
                                            <SelectItem
                                                key={pet.id}
                                                value={pet.id}
                                            >
                                                {pet.name} — {pet.species}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError errors={[form.formState.errors.pet_id,]} />
                            </Field>

                            <Field
                                data-invalid={
                                    !!form.formState.errors.service_id
                                }
                            >
                                <FieldLabel htmlFor="appointment-service">
                                    Service
                                </FieldLabel>

                                <Select
                                    value={selectedServiceId ?? ""}
                                    onValueChange={(value) => {
                                        if (!value) return
                                        handleServiceChange(value)
                                    }}
                                >
                                    <SelectTrigger
                                        id="appointment-service"
                                        aria-invalid={
                                            !!form.formState.errors.service_id
                                        }
                                    >
                                        <SelectValue placeholder="Select service">
                                            {selectedService?.name ?? "Select service"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {services.map((service) => (
                                            <SelectItem
                                                key={service.id}
                                                value={service.id}
                                            >
                                                {service.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <FieldDescription>
                                    Choose a service or a package.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors.service_id,
                                    ]}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="appointment-package">
                                    Package
                                </FieldLabel>

                                <Select
                                    value={selectedPackageId ?? ""}
                                    onValueChange={(value) => {
                                        if (!value) return
                                        handlePackageChange(value)
                                    }}
                                >
                                    <SelectTrigger id="appointment-package">
                                        <SelectValue placeholder="Select package">
                                            {selectedPackage?.name ?? "Select package"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {packages.map((pkg) => (
                                            <SelectItem
                                                key={pkg.id}
                                                value={pkg.id}
                                            >
                                                {pkg.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="appointment-staff">
                                    Staff
                                </FieldLabel>

                                <Select
                                    value={selectedEmployeeId ?? ""}
                                    onValueChange={(value) => {
                                        form.setValue(
                                            "employee_id",
                                            value || null,
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        )
                                    }}
                                >
                                    <SelectTrigger id="appointment-staff">
                                        <SelectValue placeholder="Assign staff">
                                            {selectedEmployee?.display_name ??
                                                "Assign staff"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {employees
                                            .filter((employee) => employee.is_active)
                                            .map((employee) => (
                                                <SelectItem
                                                    key={employee.id}
                                                    value={employee.id}
                                                >
                                                    {employee.display_name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="appointment-preferred-staff">
                                    Preferred staff
                                </FieldLabel>

                                <Select
                                    value={selectedPreferredEmployeeId ?? ""}
                                    onValueChange={(value) => {
                                        form.setValue(
                                            "preferred_employee_id",
                                            value || null,
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        )
                                    }}
                                >
                                    <SelectTrigger id="appointment-preferred-staff">
                                        <SelectValue placeholder="No preference">
                                            {selectedPreferredEmployee?.display_name ??
                                                "No preference"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {employees
                                            .filter((employee) => employee.is_active)
                                            .map((employee) => (
                                                <SelectItem
                                                    key={employee.id}
                                                    value={employee.id}
                                                >
                                                    {employee.display_name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Controller
                                control={form.control}
                                name="starts_at"
                                render={({ field, fieldState }) => {
                                    const { date, time } = parseDateTime(field.value)

                                    return (
                                        <Field data-invalid={fieldState.invalid}>
                                            <DatePickerTime
                                                date={date}
                                                onDateChange={(selectedDate) => {
                                                    if (!selectedDate) {
                                                        field.onChange("")
                                                        return
                                                    }

                                                    const currentValue = field.value

                                                    const currentTime = currentValue
                                                        ? parseDateTime(currentValue).time
                                                        : format(new Date(), "HH:mm:ss")

                                                    field.onChange(
                                                        combineDateTime(
                                                            selectedDate,
                                                            currentTime
                                                        )
                                                    )
                                                }}
                                                time={time}
                                                onTimeChange={(selectedTime) => {
                                                    const currentDate =
                                                        parseDateTime(field.value).date

                                                    field.onChange(
                                                        combineDateTime(
                                                            currentDate,
                                                            selectedTime
                                                        )
                                                    )
                                                }}
                                                dateLabel="Start date"
                                                timeLabel="Time"
                                                datePlaceholder="Select Start date"
                                            />

                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        </Field>
                                    )
                                }}
                            />

                            <Controller
                                control={form.control}
                                name="ends_at"
                                render={({ field, fieldState }) => {
                                    const { date, time } = parseDateTime(field.value)

                                    return (
                                        <Field data-invalid={fieldState.invalid}>
                                            <DatePickerTime
                                                date={date}
                                                onDateChange={(selectedDate) => {
                                                    if (!selectedDate) {
                                                        field.onChange("")
                                                        return
                                                    }

                                                    const currentValue = field.value

                                                    const currentTime = currentValue
                                                        ? parseDateTime(currentValue).time
                                                        : format(new Date(), "HH:mm:ss")

                                                    field.onChange(
                                                        combineDateTime(
                                                            selectedDate,
                                                            currentTime
                                                        )
                                                    )
                                                }}
                                                time={time}
                                                onTimeChange={(selectedTime) => {
                                                    const currentDate =
                                                        parseDateTime(field.value).date

                                                    field.onChange(
                                                        combineDateTime(
                                                            currentDate,
                                                            selectedTime
                                                        )
                                                    )
                                                }}
                                                dateLabel="End date"
                                                timeLabel="Time"
                                                datePlaceholder="Select End date"
                                            />

                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        </Field>
                                    )
                                }}
                            />

                            <Field
                                data-invalid={
                                    !!form.formState.errors.duration_minutes
                                }
                            >
                                <FieldLabel htmlFor="appointment-duration">
                                    Duration
                                </FieldLabel>

                                <Input
                                    id="appointment-duration"
                                    type="number"
                                    readOnly
                                    aria-invalid={
                                        !!form.formState.errors.duration_minutes
                                    }
                                    {...form.register("duration_minutes", {
                                        valueAsNumber: true,
                                    })}
                                />

                                <FieldDescription>
                                    Automatically set from the selected service or package.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors
                                            .duration_minutes,
                                    ]}
                                />
                            </Field>

                            <Field
                                data-invalid={
                                    !!form.formState.errors.price
                                }
                            >
                                <FieldLabel htmlFor="appointment-price">
                                    Price
                                </FieldLabel>

                                <Input
                                    id="appointment-price"
                                    type="number"
                                    readOnly
                                    aria-invalid={
                                        !!form.formState.errors.price
                                    }
                                    {...form.register("price", {
                                        valueAsNumber: true,
                                    })}
                                />

                                <FieldDescription>
                                    Appointment price in PKR.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors.price,
                                    ]}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="appointment-status">
                                    Status
                                </FieldLabel>

                                <Select
                                    value={form.watch("status")}
                                    onValueChange={(value) => {
                                        if (!value) return

                                        form.setValue(
                                            "status",
                                            value as CreateAppointmentInput["status"],
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        )
                                    }}
                                >
                                    <SelectTrigger id="appointment-status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {STATUS_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="appointment-source">
                                    Source
                                </FieldLabel>

                                <Select
                                    value={form.watch("source")}
                                    onValueChange={(value) => {
                                        if (!value) return

                                        form.setValue(
                                            "source",
                                            value as CreateAppointmentInput["source"],
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        )
                                    }}
                                >
                                    <SelectTrigger id="appointment-source">
                                        <SelectValue placeholder="Select source" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {SOURCE_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field
                                data-invalid={
                                    !!form.formState.errors.notes
                                }
                            >
                                <FieldLabel htmlFor="appointment-notes">
                                    Notes
                                </FieldLabel>

                                <Textarea
                                    id="appointment-notes"
                                    placeholder="Optional notes about the appointment."
                                    rows={3}
                                    aria-invalid={
                                        !!form.formState.errors.notes
                                    }
                                    {...form.register("notes")}
                                />

                                <FieldError
                                    errors={[
                                        form.formState.errors.notes,
                                    ]}
                                />
                            </Field>

                            {selectedStatus === "cancelled" ? (
                                <Field
                                    data-invalid={
                                        !!form.formState.errors.cancel_reason
                                    }
                                >
                                    <FieldLabel htmlFor="appointment-cancel-reason">
                                        Cancel reason
                                    </FieldLabel>

                                    <Textarea
                                        id="appointment-cancel-reason"
                                        placeholder="Why was the appointment cancelled?"
                                        rows={3}
                                        aria-invalid={
                                            !!form.formState.errors.cancel_reason
                                        }
                                        {...form.register("cancel_reason")}
                                    />

                                    <FieldError
                                        errors={[
                                            form.formState.errors
                                                .cancel_reason,
                                        ]}
                                    />
                                </Field>
                            ) : null}
                        </FieldGroup>

                    </form>
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
                            form="appointment"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner
                                        size="sm"
                                        className="text-primary-foreground"
                                    />
                                    Saving…
                                </>
                            ) : isEditing ? (
                                "Save changes"
                            ) : (
                                "Create appointment"
                            )}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    )
}