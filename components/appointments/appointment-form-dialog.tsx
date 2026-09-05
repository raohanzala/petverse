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
    const selectedServiceId = form.watch("service_id")
    const selectedPackageId = form.watch("package_id")
    const selectedStatus = form.watch("status")

    const ownerPets = pets.filter(
        (pet) => pet.owner_id === selectedOwnerId
    )

    function handleOwnerChange(ownerId: string) {
        form.setValue("owner_id", ownerId, {
            shouldDirty: true,
            shouldValidate: true,
        })

        form.setValue("pet_id", "", {
            shouldDirty: true,
            shouldValidate: true,
        })
    }

    function handleServiceChange(serviceId: string) {
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
    }

    function handlePackageChange(packageId: string) {
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

                            <Field
                                data-invalid={
                                    !!form.formState.errors.pet_id
                                }
                            >
                                <FieldLabel htmlFor="appointment-pet">
                                    Pet
                                </FieldLabel>

                                <Select
                                    value={form.watch("pet_id")}
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
                                        aria-invalid={
                                            !!form.formState.errors.pet_id
                                        }
                                    >
                                        <SelectValue
                                            placeholder={
                                                selectedOwnerId
                                                    ? "Select pet"
                                                    : "Select owner first"
                                            }
                                        />
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

                                <FieldError
                                    errors={[
                                        form.formState.errors.pet_id,
                                    ]}
                                />
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
                                    value={selectedServiceId ?? ""}
                                    onValueChange={(value) => {
                                        if (!value) return
                                        handleServiceChange(value)
                                    }}
                                >
                                    <SelectTrigger id="appointment-package">
                                        <SelectValue placeholder="Select package" />
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
                                    value={form.watch("employee_id") ?? ""}
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
                                        <SelectValue placeholder="Assign staff" />
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
                                    value={
                                        form.watch(
                                            "preferred_employee_id"
                                        ) ?? ""
                                    }
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
                                        <SelectValue placeholder="No preference" />
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

                            <Field
                                data-invalid={
                                    !!form.formState.errors.starts_at
                                }
                            >
                                <FieldLabel htmlFor="appointment-starts-at">
                                    Start
                                </FieldLabel>

                                <Input
                                    id="appointment-starts-at"
                                    type="datetime-local"
                                    aria-invalid={
                                        !!form.formState.errors.starts_at
                                    }
                                    {...form.register("starts_at")}
                                />

                                <FieldError
                                    errors={[
                                        form.formState.errors.starts_at,
                                    ]}
                                />
                            </Field>

                            <Field
                                data-invalid={
                                    !!form.formState.errors.ends_at
                                }
                            >
                                <FieldLabel htmlFor="appointment-ends-at">
                                    End
                                </FieldLabel>

                                <Input
                                    id="appointment-ends-at"
                                    type="datetime-local"
                                    aria-invalid={
                                        !!form.formState.errors.ends_at
                                    }
                                    {...form.register("ends_at")}
                                />

                                <FieldError
                                    errors={[
                                        form.formState.errors.ends_at,
                                    ]}
                                />
                            </Field>

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
                                    min={1}
                                    placeholder="60"
                                    aria-invalid={
                                        !!form.formState.errors.duration_minutes
                                    }
                                    {...form.register("duration_minutes", {
                                        valueAsNumber: true,
                                    })}
                                />

                                <FieldDescription>
                                    Duration in minutes.
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
                                    min={0}
                                    step="0.01"
                                    placeholder="2500"
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
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}