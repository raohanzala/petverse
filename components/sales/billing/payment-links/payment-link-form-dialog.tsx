"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { DatePickerTime } from "@/components/ui/date-picker-with-time"

import {
  createPaymentToken,
  updatePaymentToken,
} from "@/lib/supabase/mutations/payment-tokens"

import type {
  InvoiceRow,
  PaymentTokenRow,
} from "@/lib/supabase/types"
import { Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { CreatePaymentTokenInput, createPaymentTokenSchema } from "@/lib/validations/payment-token"
import { zodResolver } from "@hookform/resolvers/zod"

type PaymentLinkFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoices: InvoiceRow[]
  paymentLink?: PaymentTokenRow | null
  onSuccess?: () => void
}

const defaultValues: CreatePaymentTokenInput = {
  invoice_id: "",
  expires_at: "",
  used_at: ""
}

function getDefaultExpiration() {
  const date = new Date()
  date.setDate(date.getDate() + 7)

  return {
    date,
    time: date.toTimeString().slice(0, 5),
  }
}

function formatCurrency(
  amount: number,
  currency: string
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

function parsePaymentDateTime(
  value: string
) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return {
      date: undefined,
      time: "",
    }
  }

  return {
    date,
    time: date.toTimeString().slice(0, 5),
  }
}

function combineDateAndTime(
  date: Date,
  time: string
) {
  const [hours, minutes] = time
    .split(":")
    .map(Number)

  const result = new Date(date)

  result.setHours(
    hours || 0,
    minutes || 0,
    0,
    0
  )

  return result
}

export function PaymentLinkFormDialog({
  open,
  onOpenChange,
  invoices,
  paymentLink,
  onSuccess,
}: PaymentLinkFormDialogProps) {
  const isEditing = Boolean(paymentLink)

  const [invoiceId, setInvoiceId] = useState("")
  const [expiresDate, setExpiresDate] = useState<
    Date | undefined
  >()
  const [expiresTime, setExpiresTime] = useState("")
  const [error, setError] = useState("")

  const [isPending, startTransition] =
    useTransition()

  const form = useForm<CreatePaymentTokenInput>({
        resolver: zodResolver(createPaymentTokenSchema),
        defaultValues,
    })
  useEffect(() => {
    if (!open) return

    if (paymentLink) {
      setInvoiceId(paymentLink.invoice_id)

      const parsed = parsePaymentDateTime(
        paymentLink.expires_at
      )

      setExpiresDate(parsed.date)
      setExpiresTime(parsed.time)
    } else {
      setInvoiceId("")

      const defaultExpiration =
        getDefaultExpiration()

      setExpiresDate(defaultExpiration.date)
      setExpiresTime(defaultExpiration.time)
    }
  }, [open, paymentLink])

  const selectedInvoice = useMemo(
    () =>
      invoices.find(
        (invoice) =>
          invoice.id === invoiceId
      ),
    [invoices, invoiceId]
  )

  const openInvoices = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          invoice.status === "open"
      ),
    [invoices]
  )

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError("")

    if (!expiresDate) {
      setError("Expiration date is required.")
      return
    }

    if (!expiresTime) {
      setError("Expiration time is required.")
      return
    }

    if (!isEditing && !invoiceId) {
      setError("Please select an invoice.")
      return
    }

    const expirationDate =
      combineDateAndTime(
        expiresDate,
        expiresTime
      )

    if (
      Number.isNaN(
        expirationDate.getTime()
      )
    ) {
      setError(
        "Please enter a valid expiration date and time."
      )
      return
    }

    if (
      expirationDate.getTime() <=
      Date.now()
    ) {
      setError(
        "Expiration date and time must be in the future."
      )
      return
    }

    startTransition(async () => {
      try {
        if (isEditing && paymentLink) {
          await updatePaymentToken({
            id: paymentLink.id,
            expires_at:
              expirationDate.toISOString(),
          })

          toast.success(
            "Payment link updated"
          )
        } else {
          await createPaymentToken({
            invoice_id: invoiceId,
            expires_at:
              expirationDate.toISOString(),
          })

          toast.success(
            "Payment link created"
          )
        }

        onOpenChange(false)
        onSuccess?.()
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Something went wrong"

        setError(message)
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit Payment Link"
              : "Create Payment Link"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update when this payment link expires."
              : "Create a secure payment link for an open invoice."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {!isEditing && (
                <Field>
                  <FieldLabel>
                    Invoice
                  </FieldLabel>

                  <Select
                    value={invoiceId}
                    onValueChange={(value) => {
                      if (value) {
                        setInvoiceId(value)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an open invoice">
                        {selectedInvoice
                          ? selectedInvoice.number
                            ? `INV-${String(
                              selectedInvoice.number
                            ).padStart(4, "0")}`
                            : "Invoice"
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                      {openInvoices.length === 0 ? (
                        <SelectItem
                          value="none"
                          disabled
                        >
                          No open invoices
                        </SelectItem>
                      ) : (
                        openInvoices.map(
                          (invoice) => (
                            <SelectItem
                              key={invoice.id}
                              value={invoice.id}
                            >
                              {invoice.number
                                ? `INV-${String(
                                  invoice.number
                                ).padStart(
                                  4,
                                  "0"
                                )}`
                                : "Invoice"}{" "}
                              —{" "}
                              {formatCurrency(
                                invoice.total,
                                invoice.currency
                              )}
                            </SelectItem>
                          )
                        )
                      )}
                    </SelectContent>
                  </Select>

                  <FieldDescription>
                    Only open invoices can have
                    payment links.
                  </FieldDescription>
                </Field>
              )}

              {selectedInvoice && (
                <div className="rounded-lg border bg-muted/40 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Invoice
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {selectedInvoice.number
                          ? `INV-${String(
                            selectedInvoice.number
                          ).padStart(
                            4,
                            "0"
                          )}`
                          : "Invoice"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Amount
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(
                          selectedInvoice.total,
                          selectedInvoice.currency
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Field>
                <FieldLabel>
                  Expiration
                </FieldLabel>

                <DatePickerTime
                  date={expiresDate}
                  onDateChange={setExpiresDate}
                  time={expiresTime}
                  onTimeChange={setExpiresTime}
                  dateLabel="Date"
                  timeLabel="Time"
                  datePlaceholder="Select date"
                />

                <FieldDescription>
                  The customer won&apos;t be able to
                  use the link after this time.
                </FieldDescription>
              </Field>

              {error && (
                <FieldError>
                  {error}
                </FieldError>
              )}
            </FieldGroup>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  onOpenChange(false)
                }
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isPending}
              >
                {isPending && <Spinner />}

                {isEditing
                  ? "Save changes"
                  : "Create Link"}
              </Button>
            </DialogFooter>
          </form>
        </Form>

      </DialogContent>
    </Dialog>
  )
}