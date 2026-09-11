"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
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
    createInvoice,
    updateInvoice,
} from "@/lib/supabase/mutations/invoices"
import type {
    AppointmentRow,
    InvoiceRow,
    InvoiceStatus,
    OwnerRow,
} from "@/lib/supabase/types"
import { InvoiceLineItemFormValues } from "@/lib/validations/invoice-line-item"
import { DatePickerTime } from "@/components/ui/date-picker-with-time"
import { format } from "date-fns"
import { InvoiceLineItems } from "./line-items/invoice-line-items"
import {
    createInvoiceSchema,
    type CreateInvoiceInput
} from "@/lib/validations/invoice"

type InvoiceFormDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    invoice?: InvoiceRow | null
    owners: OwnerRow[]
    appointments: AppointmentRow[]
    onSuccess: () => void
}

const defaultValues: CreateInvoiceInput = {
    owner_id: "",
    appointment_id: null,
    number: null,
    status: "draft",
    subtotal: 0,
    tax: 0,
    total: 0,
    currency: "USD",
    issued_at: null,
    paid_at: null,
    voided_at: null,
    notes: "",
    line_items: [],
}

const INVOICE_STATUS_OPTIONS: {
    value: InvoiceStatus
    label: string
}[] = [
        {
            value: "draft",
            label: "Draft",
        },
        {
            value: "open",
            label: "Open",
        },
        {
            value: "paid",
            label: "Paid",
        },
        {
            value: "void",
            label: "Void",
        },
    ]

export function InvoiceFormDialog({
    open,
    onOpenChange,
    invoice,
    owners,
    appointments,
    onSuccess,
}: InvoiceFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [lineItems, setLineItems] = useState<
        InvoiceLineItemFormValues[]
    >([])
    const isEditing = Boolean(invoice)

    const form = useForm<
        CreateInvoiceInput,
        unknown,
        CreateInvoiceInput
    >({
        resolver: zodResolver(createInvoiceSchema),
        defaultValues,
    })

    useEffect(() => {
        if (!open) return

        if (invoice) {
            form.reset({
                owner_id: invoice.owner_id,
                appointment_id: invoice.appointment_id,
                number: invoice.number,
                status: invoice.status,
                subtotal: invoice.subtotal,
                tax: invoice.tax,
                total: invoice.total,
                currency: invoice.currency,
                issued_at: invoice.issued_at,
                paid_at: invoice.paid_at,
                voided_at: invoice.voided_at,
                notes: invoice.notes ?? "",
                line_items: [],
            })

            setLineItems([])

            return
        }

        form.reset(defaultValues)
        setLineItems([])
    }, [open, invoice, form])

    const tax = form.watch("tax")
    const ownerId = form.watch("owner_id")
    const appointmentId = form.watch("appointment_id")

    const subtotal = useMemo(
        () =>
            lineItems.reduce(
                (sum, item) =>
                    sum + item.quantity * item.unit_price,
                0
            ),
        [lineItems]
    )

    const calculatedTotal =
        Math.max(0, Number(subtotal) || 0) +
        Math.max(0, Number(tax) || 0)

    async function onSubmit(
        values: CreateInvoiceInput
    ) {
        setIsSubmitting(true)

        const normalizedLineItems = lineItems.map(
            (item) => ({
                id: item.id,
                appointment_id:
                    item.appointment_id ?? null,
                product_id:
                    item.product_id ?? null,
                description:
                    item.description.trim(),
                quantity: item.quantity,
                unit_price: Number(
                    item.unit_price
                ),
                total: Number(
                    (
                        item.quantity *
                        item.unit_price
                    ).toFixed(2)
                ),
            })
        )

        const payload =
            createInvoiceSchema.parse({
                ...values,
                subtotal,
                total: calculatedTotal,
                line_items:
                    normalizedLineItems,
            })

        const result = isEditing
            ? await updateInvoice({
                id: invoice!.id,
                ...payload,
            })
            : await createInvoice(payload)

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
                ? "Invoice updated"
                : "Invoice created",
            priority: "high",
        })

        onOpenChange(false)
        onSuccess()
    }

    const selectedOwner = owners.find(
        (owner) => owner.id === ownerId
    )

    const selectedAppointment = appointments.find(
        (appointment) => appointment.id === appointmentId
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit invoice" : "New invoice"}
                    </DialogTitle>

                    <DialogDescription>
                        Create and manage an invoice for an owner and appointment.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        id="invoice-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        noValidate
                        className="sticky-form-content scroll-y-hidden"
                    >
                        <FieldGroup>
                            {/* Owner */}
                            <Field data-invalid={!!form.formState.errors.owner_id}>
                                <FieldLabel htmlFor="invoice-owner">
                                    Owner
                                </FieldLabel>

                                <Select
                                    value={ownerId}
                                    onValueChange={(value) => {
                                        if (!value) return

                                        form.setValue("owner_id", value, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        })

                                        form.setValue("appointment_id", null, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        })
                                    }}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger
                                        id="invoice-owner"
                                        aria-invalid={
                                            !!form.formState.errors.owner_id
                                        }
                                        className="w-full"
                                    >
                                        <SelectValue>
                                            {selectedOwner
                                                ? selectedOwner.name
                                                : "Select owner"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {owners.length > 0 ? (
                                            owners.map((owner) => (
                                                <SelectItem
                                                    key={owner.id}
                                                    value={owner.id}
                                                >
                                                    {owner.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                                No owners found
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>

                                <FieldDescription>
                                    Select the owner associated with this invoice.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors.owner_id,
                                    ]}
                                />
                            </Field>

                            {/* Appointment */}
                            <Field
                                data-invalid={
                                    !!form.formState.errors.appointment_id
                                }
                            >
                                <FieldLabel htmlFor="invoice-appointment">
                                    Appointment
                                </FieldLabel>

                                <Select
                                    value={appointmentId ?? ""}
                                    onValueChange={(value) => {
                                        if (!value) return

                                        const appointment = appointments.find(
                                            (item) => item.id === value
                                        )

                                        if (!appointment) return

                                        form.setValue(
                                            "appointment_id",
                                            appointment.id,
                                            {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                            }
                                        )

                                        if (appointment.owner_id !== ownerId) {
                                            form.setValue(
                                                "owner_id",
                                                appointment.owner_id,
                                                {
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                }
                                            )
                                        }
                                    }}
                                    disabled={
                                        isSubmitting || !ownerId
                                    }
                                >
                                    <SelectTrigger
                                        id="invoice-appointment"
                                        aria-invalid={
                                            !!form.formState.errors.appointment_id
                                        }
                                        className="w-full"
                                    >
                                        <SelectValue>
                                            {selectedAppointment
                                                ? `Appointment ${selectedAppointment.id.slice(
                                                    0,
                                                    8
                                                )}`
                                                : ownerId
                                                    ? "Select appointment"
                                                    : "Select owner first"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {appointments.filter(
                                            (appointment) =>
                                                appointment.owner_id === ownerId
                                        ).length > 0 ? (
                                            appointments
                                                .filter(
                                                    (appointment) =>
                                                        appointment.owner_id === ownerId
                                                )
                                                .map((appointment) => (
                                                    <SelectItem
                                                        key={appointment.id}
                                                        value={appointment.id}
                                                    >
                                                        {`Appointment ${appointment.id.slice(
                                                            0,
                                                            8
                                                        )}`}
                                                    </SelectItem>
                                                ))
                                        ) : (
                                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                                No appointments found
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>

                                <FieldDescription>
                                    Optionally link this invoice to an appointment.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors.appointment_id,
                                    ]}
                                />
                            </Field>

                            {/* Invoice number */}
                            {isEditing ? (
                                <Field>
                                    <FieldLabel htmlFor="invoice-number">
                                        Invoice number
                                    </FieldLabel>

                                    <Input
                                        id="invoice-number"
                                        value={
                                            invoice?.number
                                                ? `#${invoice.number}`
                                                : "Unassigned"
                                        }
                                        disabled
                                    />

                                    <FieldDescription>
                                        Invoice numbers are allocated automatically.
                                    </FieldDescription>
                                </Field>
                            ) : null}

                            {/* Status */}
                            <Field
                                data-invalid={
                                    !!form.formState.errors.status
                                }
                            >
                                <FieldLabel htmlFor="invoice-status">
                                    Status
                                </FieldLabel>

                                <Select
                                    value={form.watch("status")}
                                    onValueChange={(value) => {
                                        if (!value) return

                                        form.setValue(
                                            "status",
                                            value as InvoiceStatus,
                                            {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                            }
                                        )
                                    }}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger
                                        id="invoice-status"
                                        aria-invalid={
                                            !!form.formState.errors.status
                                        }
                                        className="w-full"
                                    >
                                        <SelectValue>
                                            {
                                                INVOICE_STATUS_OPTIONS.find(
                                                    (option) =>
                                                        option.value ===
                                                        form.watch("status")
                                                )?.label
                                            }
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {INVOICE_STATUS_OPTIONS.map(
                                            (option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>

                                <FieldError
                                    errors={[
                                        form.formState.errors.status,
                                    ]}
                                />
                            </Field>

                            <InvoiceLineItems
                                value={lineItems}
                                onChange={setLineItems}
                            />

                            {/* Tax */}
                            <Field
                                data-invalid={
                                    !!form.formState.errors.tax
                                }
                            >
                                <FieldLabel htmlFor="invoice-tax">
                                    Tax
                                </FieldLabel>

                                <Input
                                    id="invoice-tax"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    aria-invalid={
                                        !!form.formState.errors.tax
                                    }
                                    {...form.register("tax", {
                                        valueAsNumber: true,
                                    })}
                                    disabled={isSubmitting}
                                />

                                <FieldError
                                    errors={[
                                        form.formState.errors.tax,
                                    ]}
                                />
                            </Field>

                            {/* Total */}
                            <Field
                                data-invalid={
                                    !!form.formState.errors.total
                                }
                            >
                                <FieldLabel htmlFor="invoice-total">
                                    Total
                                </FieldLabel>

                                <Input
                                    id="invoice-total"
                                    type="text"
                                    value={`${calculatedTotal.toFixed(2)}`}
                                    readOnly
                                    disabled={isSubmitting}
                                />

                                <FieldDescription>
                                    Automatically calculated from invoice items and tax.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors.total,
                                    ]}
                                />
                            </Field>

                            {/* Currency */}
                            <Field
                                data-invalid={
                                    !!form.formState.errors.currency
                                }
                            >
                                <FieldLabel htmlFor="invoice-currency">
                                    Currency
                                </FieldLabel>

                                <Input
                                    id="invoice-currency"
                                    placeholder="USD"
                                    maxLength={10}
                                    aria-invalid={
                                        !!form.formState.errors.currency
                                    }
                                    {...form.register("currency")}
                                    disabled={isSubmitting}
                                />

                                <FieldDescription>
                                    Currency code such as USD, EUR, or PKR.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors.currency,
                                    ]}
                                />
                            </Field>

                            {/* Issued date */}
                            <DatePickerTime
                                date={
                                    form.watch("issued_at")
                                        ? new Date(form.watch("issued_at")!)
                                        : undefined
                                }
                                onDateChange={(date) => {
                                    const currentValue = form.getValues("issued_at")

                                    if (!date) {
                                        form.setValue("issued_at", null, {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        })
                                        return
                                    }

                                    const currentTime = currentValue
                                        ? new Date(currentValue)
                                        : new Date()

                                    date.setHours(
                                        currentTime.getHours(),
                                        currentTime.getMinutes(),
                                        currentTime.getSeconds(),
                                        0
                                    )

                                    form.setValue("issued_at", date.toISOString(), {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                    })
                                }}
                                time={
                                    form.watch("issued_at")
                                        ? format(new Date(form.watch("issued_at")!), "HH:mm:ss")
                                        : ""
                                }
                                onTimeChange={(time) => {
                                    const currentValue = form.getValues("issued_at")

                                    const date = currentValue
                                        ? new Date(currentValue)
                                        : new Date()

                                    const [hours, minutes, seconds] = time
                                        .split(":")
                                        .map(Number)

                                    date.setHours(
                                        hours || 0,
                                        minutes || 0,
                                        seconds || 0,
                                        0
                                    )

                                    form.setValue("issued_at", date.toISOString(), {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                    })
                                }}
                                dateLabel="Issued date"
                                timeLabel="Time"
                                datePlaceholder="Select date"
                            />

                            {/* Notes */}
                            <Field
                                data-invalid={
                                    !!form.formState.errors.notes
                                }
                            >
                                <FieldLabel htmlFor="invoice-notes">
                                    Notes
                                </FieldLabel>

                                <Textarea
                                    id="invoice-notes"
                                    placeholder="Optional notes for staff."
                                    rows={3}
                                    aria-invalid={
                                        !!form.formState.errors.notes
                                    }
                                    {...form.register("notes")}
                                    disabled={isSubmitting}
                                />

                                <FieldError
                                    errors={[
                                        form.formState.errors.notes,
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
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        form="invoice-form"
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
                            "Create invoice"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}