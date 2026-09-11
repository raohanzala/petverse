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

import {
  createDeposit,
  updateDeposit,
} from "@/lib/supabase/mutations/deposits"

import type {
  AppointmentRow,
  DepositRow,
  InvoiceRow,
  OwnerRow,
} from "@/lib/supabase/types"

import {
  createDepositSchema,
  type CreateDepositInput,
} from "@/lib/validations/deposit"

import { DatePickerTime } from "@/components/ui/date-picker-with-time"
import { format } from "date-fns"

type DepositFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  deposit?: DepositRow | null
  owners: OwnerRow[]
  appointments: AppointmentRow[]
  invoices: InvoiceRow[]
  onSuccess: () => void
}

const defaultValues: CreateDepositInput = {
  owner_id: "",
  appointment_id: null,
  invoice_id: null,
  amount: 0,
  paid_at: null,
  provider_ref: "",
}

export function DepositFormDialog({
  open,
  onOpenChange,
  deposit,
  owners,
  appointments,
  invoices,
  onSuccess,
}: DepositFormDialogProps) {
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const isEditing = Boolean(deposit)

  const form =
    useForm<CreateDepositInput>({
      resolver: zodResolver(
        createDepositSchema
      ),
      defaultValues,
    })

  useEffect(() => {
    if (!open) return

    if (deposit) {
      form.reset({
        owner_id: deposit.owner_id,
        appointment_id:
          deposit.appointment_id,
        invoice_id: deposit.invoice_id,
        amount: deposit.amount,
        paid_at: deposit.paid_at,
        provider_ref:
          deposit.provider_ref ?? "",
      })

      return
    }

    form.reset(defaultValues)
  }, [open, deposit, form])

  const ownerId =
    form.watch("owner_id")

  const appointmentId =
    form.watch("appointment_id")

  const invoiceId =
    form.watch("invoice_id")

  const paidAt =
    form.watch("paid_at")

  const selectedOwner = useMemo(
    () =>
      owners.find(
        (owner) =>
          owner.id === ownerId
      ),
    [owners, ownerId]
  )

  const selectedAppointment =
    useMemo(
      () =>
        appointments.find(
          (appointment) =>
            appointment.id ===
            appointmentId
        ),
      [appointments, appointmentId]
    )

  const selectedInvoice = useMemo(
    () =>
      invoices.find(
        (invoice) =>
          invoice.id === invoiceId
      ),
    [invoices, invoiceId]
  )

  const ownerAppointments =
    useMemo(
      () =>
        appointments.filter(
          (appointment) =>
            appointment.owner_id ===
            ownerId
        ),
      [appointments, ownerId]
    )

  const ownerInvoices = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          invoice.owner_id ===
          ownerId
      ),
    [invoices, ownerId]
  )

  async function onSubmit(
    values: CreateDepositInput
  ) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateDeposit({
          id: deposit!.id,
          ...values,
        })
      : await createDeposit(values)

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
        ? "Deposit updated"
        : "Deposit created",
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
              ? "Edit deposit"
              : "New deposit"}
          </DialogTitle>

          <DialogDescription>
            Record a customer deposit and
            optionally link it to an
            appointment or invoice.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="deposit-form"
            onSubmit={form.handleSubmit(
              onSubmit
            )}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              {/* Owner */}
              <Field
                data-invalid={
                  !!form.formState.errors.owner_id
                }
              >
                <FieldLabel htmlFor="deposit-owner">
                  Owner
                </FieldLabel>

                <Select
                  value={ownerId}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      "owner_id",
                      value,
                      {
                        shouldValidate: true,
                        shouldDirty: true,
                      }
                    )

                    form.setValue(
                      "appointment_id",
                      null,
                      {
                        shouldValidate: true,
                        shouldDirty: true,
                      }
                    )

                    form.setValue(
                      "invoice_id",
                      null,
                      {
                        shouldValidate: true,
                        shouldDirty: true,
                      }
                    )
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="deposit-owner"
                    className="w-full"
                    aria-invalid={
                      !!form.formState.errors
                        .owner_id
                    }
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
                  Select the owner who made the
                  deposit.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .owner_id,
                  ]}
                />
              </Field>

              {/* Appointment */}
              <Field
                data-invalid={
                  !!form.formState.errors
                    .appointment_id
                }
              >
                <FieldLabel htmlFor="deposit-appointment">
                  Appointment
                </FieldLabel>

                <Select
                  value={appointmentId ?? ""}
                  onValueChange={(value) => {
                    if (!value) return

                    const appointment =
                      appointments.find(
                        (item) =>
                          item.id === value
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

                    if (
                      appointment.owner_id !==
                      ownerId
                    ) {
                      form.setValue(
                        "owner_id",
                        appointment.owner_id,
                        {
                          shouldValidate: true,
                          shouldDirty: true,
                        }
                      )

                      form.setValue(
                        "invoice_id",
                        null,
                        {
                          shouldValidate: true,
                          shouldDirty: true,
                        }
                      )
                    }
                  }}
                  disabled={
                    isSubmitting ||
                    !ownerId
                  }
                >
                  <SelectTrigger
                    id="deposit-appointment"
                    className="w-full"
                  >
                    <SelectValue>
                      {selectedAppointment
                        ? `Appointment ${selectedAppointment.id.slice(0, 8)}`
                        : ownerId
                          ? "Select appointment"
                          : "Select owner first"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {ownerAppointments.length >
                    0 ? (
                      ownerAppointments.map(
                        (appointment) => (
                          <SelectItem
                            key={
                              appointment.id
                            }
                            value={
                              appointment.id
                            }
                          >
                            {`Appointment ${appointment.id.slice(0, 8)}`}
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
                  Optionally link this deposit
                  to an appointment.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .appointment_id,
                  ]}
                />
              </Field>

              {/* Invoice */}
              <Field
                data-invalid={
                  !!form.formState.errors
                    .invoice_id
                }
              >
                <FieldLabel htmlFor="deposit-invoice">
                  Invoice
                </FieldLabel>

                <Select
                  value={invoiceId ?? ""}
                  onValueChange={(value) => {
                    if (!value) return

                    const invoice =
                      invoices.find(
                        (item) =>
                          item.id === value
                      )

                    if (!invoice) return

                    form.setValue(
                      "invoice_id",
                      invoice.id,
                      {
                        shouldValidate: true,
                        shouldDirty: true,
                      }
                    )

                    if (
                      invoice.owner_id !==
                      ownerId
                    ) {
                      form.setValue(
                        "owner_id",
                        invoice.owner_id,
                        {
                          shouldValidate: true,
                          shouldDirty: true,
                        }
                      )

                      form.setValue(
                        "appointment_id",
                        invoice.appointment_id,
                        {
                          shouldValidate: true,
                          shouldDirty: true,
                        }
                      )
                    }
                  }}
                  disabled={
                    isSubmitting ||
                    !ownerId
                  }
                >
                  <SelectTrigger
                    id="deposit-invoice"
                    className="w-full"
                  >
                    <SelectValue>
                      {selectedInvoice
                        ? selectedInvoice.number
                          ? `Invoice #${selectedInvoice.number}`
                          : "Invoice"
                        : ownerId
                          ? "Select invoice"
                          : "Select owner first"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {ownerInvoices.length >
                    0 ? (
                      ownerInvoices.map(
                        (invoice) => (
                          <SelectItem
                            key={invoice.id}
                            value={invoice.id}
                          >
                            {invoice.number
                              ? `Invoice #${invoice.number}`
                              : "Unassigned invoice"}
                          </SelectItem>
                        )
                      )
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No invoices found
                      </div>
                    )}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Optionally apply this deposit
                  to an invoice.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .invoice_id,
                  ]}
                />
              </Field>

              {/* Amount */}
              <Field
                data-invalid={
                  !!form.formState.errors
                    .amount
                }
              >
                <FieldLabel htmlFor="deposit-amount">
                  Amount
                </FieldLabel>

                <Input
                  id="deposit-amount"
                  type="number"
                  min={0.01}
                  step="0.01"
                  placeholder="0.00"
                  aria-invalid={
                    !!form.formState.errors
                      .amount
                  }
                  {...form.register(
                    "amount",
                    {
                      valueAsNumber: true,
                    }
                  )}
                  disabled={isSubmitting}
                />

                <FieldError
                  errors={[
                    form.formState.errors
                      .amount,
                  ]}
                />
              </Field>

              {/* Paid date */}
              <DatePickerTime
                date={
                  paidAt
                    ? new Date(paidAt)
                    : undefined
                }
                onDateChange={(date) => {
                  const currentValue =
                    form.getValues(
                      "paid_at"
                    )

                  if (!date) {
                    form.setValue(
                      "paid_at",
                      null,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )

                    return
                  }

                  const currentTime =
                    currentValue
                      ? new Date(currentValue)
                      : new Date()

                  date.setHours(
                    currentTime.getHours(),
                    currentTime.getMinutes(),
                    currentTime.getSeconds(),
                    0
                  )

                  form.setValue(
                    "paid_at",
                    date.toISOString(),
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    }
                  )
                }}
                time={
                  paidAt
                    ? format(
                        new Date(paidAt),
                        "HH:mm:ss"
                      )
                    : ""
                }
                onTimeChange={(time) => {
                  const currentValue =
                    form.getValues(
                      "paid_at"
                    )

                  const date = currentValue
                    ? new Date(currentValue)
                    : new Date()

                  const [
                    hours,
                    minutes,
                    seconds,
                  ] = time
                    .split(":")
                    .map(Number)

                  date.setHours(
                    hours || 0,
                    minutes || 0,
                    seconds || 0,
                    0
                  )

                  form.setValue(
                    "paid_at",
                    date.toISOString(),
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    }
                  )
                }}
                dateLabel="Paid date"
                timeLabel="Time"
                datePlaceholder="Select date"
              />

              {/* Provider reference */}
              <Field
                data-invalid={
                  !!form.formState.errors
                    .provider_ref
                }
              >
                <FieldLabel htmlFor="deposit-provider-ref">
                  Provider reference
                </FieldLabel>

                <Input
                  id="deposit-provider-ref"
                  placeholder="e.g. TXN-123456"
                  maxLength={255}
                  aria-invalid={
                    !!form.formState.errors
                      .provider_ref
                  }
                  {...form.register(
                    "provider_ref"
                  )}
                  disabled={isSubmitting}
                />

                <FieldDescription>
                  Optional transaction or payment
                  provider reference.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .provider_ref,
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
            form="deposit-form"
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
              "Create deposit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}