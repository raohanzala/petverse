"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useEffect, useMemo, useState } from "react"
import {
    useForm,
    useWatch,
} from "react-hook-form"
import { toast } from "@/components/ui/toast"

import { DatePickerTime } from "@/components/ui/date-picker-with-time"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

import {
    createConsentFormSubmission,
    updateConsentFormSubmission,
} from "@/lib/supabase/mutations/consent-form-submissions"
import type {
    ConsentFormSubmissionAppointmentOption,
    ConsentFormSubmissionOwnerOption,
    ConsentFormSubmissionPetOption,
    ConsentFormSubmissionTemplateOption,
    ConsentFormSubmissionWithRelations,
} from "@/lib/supabase/types"
import {
    createConsentFormSubmissionSchema,
    type CreateConsentFormSubmissionInput,
} from "@/lib/validations/consent-form-submissions"
import { parseDateTime } from "@/lib/utils"

type ConsentFormSubmissionFormDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    submission?: ConsentFormSubmissionWithRelations | null
    templates: ConsentFormSubmissionTemplateOption[]
    owners: ConsentFormSubmissionOwnerOption[]
    pets: ConsentFormSubmissionPetOption[]
    appointments: ConsentFormSubmissionAppointmentOption[]
    onSuccess: () => void
}

const defaultValues: CreateConsentFormSubmissionInput = {
    template_id: "",
    appointment_id: null,
    owner_id: "",
    pet_id: null,
    signed_at: new Date().toISOString(),
    signature_data: null,
}

function combineDateTime(
    date: Date | undefined,
    time: string
) {
    if (!date) return ""

    const datePart = format(
        date,
        "yyyy-MM-dd"
    )

    const finalTime =
        time ||
        format(
            new Date(),
            "HH:mm:ss"
        )

    return `${datePart}T${finalTime}`
}

export function ConsentFormSubmissionFormDialog({
    open,
    onOpenChange,
    submission,
    templates,
    owners,
    pets,
    appointments,
    onSuccess,
}: ConsentFormSubmissionFormDialogProps) {
    const [isSubmitting, setIsSubmitting] =
        useState(false)

    const [signatureText, setSignatureText] = useState("")

    const isEditing =
        Boolean(submission)

    const form =
        useForm<CreateConsentFormSubmissionInput>(
            {
                resolver: zodResolver(
                    createConsentFormSubmissionSchema
                ),
                defaultValues,
            }
        )

    const selectedTemplateId = useWatch({
        control: form.control,
        name: "template_id",
    })

    const selectedOwnerId = useWatch({
        control: form.control,
        name: "owner_id",
    })

    const selectedPetId = useWatch({
        control: form.control,
        name: "pet_id",
    })

    const selectedAppointmentId = useWatch({
        control: form.control,
        name: "appointment_id",
    })

    const signedAtValue = useWatch({
        control: form.control,
        name: "signed_at",
    })

    const selectedTemplate = useMemo(
        () =>
            templates.find(
                (template) =>
                    template.id === selectedTemplateId
            ),
        [templates, selectedTemplateId]
    )

    const selectedOwner = useMemo(
        () =>
            owners.find(
                (owner) =>
                    owner.id === selectedOwnerId
            ),
        [owners, selectedOwnerId]
    )

    const selectedPet = useMemo(
        () =>
            pets.find(
                (pet) =>
                    pet.id === selectedPetId
            ),
        [pets, selectedPetId]
    )

    const selectedAppointment = useMemo(
        () =>
            appointments.find(
                (appointment) =>
                    appointment.id ===
                    selectedAppointmentId
            ),
        [
            appointments,
            selectedAppointmentId,
        ]
    )

    useEffect(() => {
        if (!open) return

        if (submission) {
            form.reset({
                template_id:
                    submission.template_id,

                appointment_id:
                    submission.appointment_id,

                owner_id:
                    submission.owner_id,

                pet_id:
                    submission.pet_id,

                signed_at:
                    submission.signed_at,

                signature_data:
                    submission.signature_data,
            })

            setSignatureText(
                submission.signature_data
                    ? JSON.stringify(
                        submission.signature_data,
                        null,
                        2
                    )
                    : ""
            )

            return
        }

        form.reset({
            ...defaultValues,
            signed_at:
                new Date().toISOString(),
        })
    }, [
        open,
        submission,
        form,
    ])

    const filteredPets = useMemo(
        () =>
            selectedOwnerId
                ? pets.filter(
                    (pet) =>
                        pet.owner_id ===
                        selectedOwnerId
                )
                : pets,
        [
            pets,
            selectedOwnerId,
        ]
    )

    const filteredAppointments = useMemo(
        () =>
            appointments.filter(
                (appointment) =>
                    (!selectedOwnerId ||
                        appointment.owner_id === selectedOwnerId) &&
                    (!selectedPetId ||
                        appointment.pet_id === selectedPetId)
            ),
        [
            appointments,
            selectedOwnerId,
            selectedPetId,
        ]
    )

    useEffect(() => {
        if (!selectedOwnerId || !selectedPetId) {
            form.setValue("appointment_id", null, {
                shouldDirty: true,
                shouldValidate: true,
            })
            return
        }

        const currentAppointment = appointments.find(
            (appointment) =>
                appointment.id === selectedAppointmentId
        )

        // Keep the current appointment if it belongs
        // to the selected owner and pet.
        if (
            currentAppointment?.owner_id === selectedOwnerId &&
            currentAppointment?.pet_id === selectedPetId
        ) {
            return
        }

        // Automatically select the first appointment
        // belonging to the selected owner and pet.
        const firstAppointment = filteredAppointments[0]

        form.setValue(
            "appointment_id",
            firstAppointment?.id ?? null,
            {
                shouldDirty: true,
                shouldValidate: true,
            }
        )
    }, [
        selectedOwnerId,
        selectedPetId,
        selectedAppointmentId,
        appointments,
        filteredAppointments,
        form,
    ])

    const signedAt = parseDateTime(
        form.watch("signed_at")
    )

    async function onSubmit(
        values: CreateConsentFormSubmissionInput
    ) {
        setIsSubmitting(true)

        const result = isEditing
            ? await updateConsentFormSubmission({
                id: submission!.id,
                ...values,
            })
            : await createConsentFormSubmission(
                values
            )

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
            description: isEditing
                ? "Consent form submission updated"
                : "Consent form submission created",
            priority: "high",
        })

        onOpenChange(false)
        onSuccess()
    }

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? "Edit consent form submission"
                            : "New consent form submission"}
                    </DialogTitle>

                    <DialogDescription>
                        Record a signed consent form for an
                        owner, pet, and optional appointment.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        id="consent-form-submission"
                        onSubmit={form.handleSubmit(
                            onSubmit
                        )}
                        noValidate
                        className="sticky-form-content scroll-y-hidden"
                    >
                        <FieldGroup>
                            <Field
                                data-invalid={
                                    !!form.formState.errors
                                        .template_id
                                }
                            >
                                <FieldLabel>
                                    Consent template
                                </FieldLabel>

                                <Select
                                    value={form.watch(
                                        "template_id"
                                    )}
                                    onValueChange={(value) => {
                                        if (!value) return
                                        form.setValue(
                                            "template_id",
                                            value,
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        )
                                    }
                                    }
                                >
                                    <SelectTrigger
                                        aria-invalid={
                                            !!form.formState.errors
                                                .template_id
                                        }
                                    >
                                        <SelectValue placeholder="Select template">
                                            {selectedTemplate
                                                ? `${selectedTemplate.name} — v${selectedTemplate.version}`
                                                : "Select template"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {templates.map(
                                            (template) => (
                                                <SelectItem
                                                    key={template.id}
                                                    value={template.id}
                                                >
                                                    {template.name}{" "}
                                                    — v
                                                    {template.version}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>

                                <FieldError
                                    errors={[
                                        form.formState.errors
                                            .template_id,
                                    ]}
                                />
                            </Field>

                            <Field
                                data-invalid={
                                    !!form.formState.errors
                                        .owner_id
                                }
                            >
                                <FieldLabel>
                                    Owner
                                </FieldLabel>

                                <Select
                                    value={form.watch(
                                        "owner_id"
                                    )}
                                    onValueChange={(value) => {
                                        if (!value) return

                                        const ownerPets = pets.filter(
                                            (pet) => pet.owner_id === value
                                        )

                                        const automaticPetId =
                                            ownerPets.length === 1
                                                ? ownerPets[0].id
                                                : null

                                        form.setValue(
                                            "owner_id",
                                            value,
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        )

                                        form.setValue(
                                            "pet_id",
                                            automaticPetId,
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        )

                                        form.setValue(
                                            "appointment_id",
                                            null,
                                            {
                                                shouldDirty: true,
                                            }
                                        )
                                    }}
                                >
                                    <SelectTrigger
                                        aria-invalid={
                                            !!form.formState.errors
                                                .owner_id
                                        }
                                    >
                                        <SelectValue placeholder="Select owner">
                                            {selectedOwner
                                                ? `${selectedOwner.name} — ${selectedOwner.phone}`
                                                : "Select owner"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {owners.map(
                                            (owner) => (
                                                <SelectItem
                                                    key={owner.id}
                                                    value={owner.id}
                                                >
                                                    {owner.name} —{" "}
                                                    {owner.phone}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>

                                <FieldError
                                    errors={[
                                        form.formState.errors
                                            .owner_id,
                                    ]}
                                />
                            </Field>

                            <Field>
                                <FieldLabel>
                                    Pet
                                </FieldLabel>

                                <Select
                                    value={
                                        form.watch(
                                            "pet_id"
                                        ) ?? ""
                                    }
                                    onValueChange={(value) => {
                                        if (!value) return

                                        const selectedPet = pets.find(
                                            (pet) => pet.id === value
                                        )

                                        if (!selectedPet) return

                                        form.setValue("pet_id", selectedPet.id, {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        })

                                        form.setValue("owner_id", selectedPet.owner_id, {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        })
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select pet">
                                            {selectedPet
                                                ? `${selectedPet.name} — ${selectedPet.species}`
                                                : "Select pet"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {filteredPets.map(
                                            (pet) => (
                                                <SelectItem
                                                    key={pet.id}
                                                    value={pet.id}
                                                >
                                                    {pet.name} —{" "}
                                                    {pet.species}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field>
                                <FieldLabel>
                                    Appointment
                                </FieldLabel>

                                <Select
                                    value={
                                        form.watch(
                                            "appointment_id"
                                        ) ?? ""
                                    }
                                    onValueChange={(value) =>
                                        form.setValue(
                                            "appointment_id",
                                            value || null,
                                            {
                                                shouldDirty: true,
                                            }
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue>
                                            {selectedAppointment
                                                ? `Appointment — ${format(
                                                    new Date(selectedAppointment.starts_at),
                                                    "dd MMM yyyy"
                                                )}`
                                                : selectedPet?.name
                                                    ? "Select appointment"
                                                    : "Select owner first"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {filteredAppointments.length >
                                            0 ? (
                                            filteredAppointments.map(
                                                (appointment) => (
                                                    <SelectItem
                                                        key={
                                                            appointment.id
                                                        }
                                                        value={
                                                            appointment.id
                                                        }
                                                    >
                                                        {`Appointment — ${format(
                                                            new Date(appointment.starts_at),
                                                            "dd MMM yyyy"
                                                        )}`}
                                                    </SelectItem>
                                                )
                                            )
                                        ) : (
                                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                                No appointments found
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>

                                <FieldDescription>
                                    Optional. Appointments are filtered
                                    by the selected owner and pet.
                                </FieldDescription>
                            </Field>

                            <Field>
                                <DatePickerTime
                                    date={signedAt.date}
                                    time={signedAt.time}
                                    onDateChange={(selectedDate) => {
                                        if (!selectedDate) {
                                            form.setValue("signed_at", "", {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            })
                                            return
                                        }

                                        const currentValue = signedAtValue

                                        const currentTime = currentValue
                                            ? parseDateTime(currentValue).time
                                            : format(new Date(), "HH:mm:ss")

                                        form.setValue(
                                            "signed_at",
                                            combineDateTime(
                                                selectedDate,
                                                currentTime
                                            ),
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        )
                                    }}
                                    onTimeChange={(selectedTime) => {
                                        const currentDate =
                                            parseDateTime(signedAtValue).date

                                        form.setValue(
                                            "signed_at",
                                            combineDateTime(
                                                currentDate,
                                                selectedTime
                                            ),
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        )
                                    }}
                                    dateLabel="Signed date"
                                    timeLabel="Signed time"
                                />

                                <FieldError
                                    errors={[
                                        form.formState.errors.signed_at,
                                    ]}
                                />
                            </Field>

                            <Field>
                                <FieldLabel>
                                    Signature data
                                </FieldLabel>

                                <Textarea
                                    placeholder='{"signature": "..."}'
                                    rows={5}
                                    value={signatureText}
                                    onChange={(event) => {
                                        const value = event.target.value

                                        // Always update the textarea so the user can type freely.
                                        setSignatureText(value)

                                        const trimmedValue = value.trim()

                                        // Empty textarea = null
                                        if (!trimmedValue) {
                                            form.setValue(
                                                "signature_data",
                                                null,
                                                {
                                                    shouldDirty: true,
                                                    shouldValidate: true,
                                                }
                                            )
                                            return
                                        }

                                        try {
                                            const parsed = JSON.parse(trimmedValue)

                                            if (
                                                parsed &&
                                                typeof parsed === "object" &&
                                                !Array.isArray(parsed)
                                            ) {
                                                form.setValue(
                                                    "signature_data",
                                                    parsed,
                                                    {
                                                        shouldDirty: true,
                                                        shouldValidate: true,
                                                    }
                                                )
                                            }
                                        } catch {
                                            // Keep textarea text as-is.
                                            // Do not update signature_data until valid JSON.
                                        }
                                    }}
                                    aria-invalid={
                                        !!form.formState.errors.signature_data
                                    }
                                />

                                <FieldDescription>
                                    Optional JSON data produced by the
                                    signature provider.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors.signature_data,
                                    ]}
                                />
                            </Field>
                        </FieldGroup>
                    </form>
                </Form>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            onOpenChange(false)
                        }
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        form="consent-form-submission"
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
                            "Create submission"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}