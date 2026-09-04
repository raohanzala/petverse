"use client"

import { useState } from "react"
import {
  Mail,
  PawPrint,
  Phone,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
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

type CustomerStepProps = {
  booking: BookingState
  onUpdate: (updates: Partial<BookingState>) => void
}

type CustomerForm = {
  name: string
  email: string
  phone: string
  petName: string
  petType: string
}

const DEFAULT_FORM: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  petName: "",
  petType: "",
}

export function CustomerStep({
  booking,
  onUpdate,
}: CustomerStepProps) {
  const [form, setForm] =
    useState<CustomerForm>(DEFAULT_FORM)

  function updateForm(
    updates: Partial<CustomerForm>
  ) {
    setForm((current) => ({
      ...current,
      ...updates,
    }))
  }

  function handleCustomerChange(
    field: keyof CustomerForm,
    value: string
  ) {
    updateForm({
      [field]: value,
    })

    if (
      field === "name" ||
      field === "email" ||
      field === "phone"
    ) {
      onUpdate({
        customer: {
          ...booking.customer,
          [field]: value,
        },
      })
    }

    if (
      field === "petName" ||
      field === "petType"
    ) {
      onUpdate({
        pet: {
          ...booking.pet,
          [field === "petName" ? "name" : "type"]: value,
        },
      })
    }
  }

  const hasCustomerDetails =
    Boolean(
      form.name.trim() &&
      form.phone.trim()
    )

  const hasPetDetails =
    Boolean(
      form.petName.trim() &&
      form.petType.trim()
    )

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-lg font-semibold">
          Customer & Pet Details
        </h2>

        <p className="text-sm text-muted-foreground">
          Tell us who the appointment is for.
        </p>
      </div>

      {/* Customer */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <UserRound className="size-4 text-primary" />

          <div>
            <h3 className="text-sm font-semibold">
              Customer information
            </h3>

            <p className="text-xs text-muted-foreground">
              Your contact details for the appointment.
            </p>
          </div>
        </div>

        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="customer-name">
                Full name
              </FieldLabel>

              <div className="relative">
                <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="customer-name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(event) =>
                    handleCustomerChange(
                      "name",
                      event.target.value
                    )
                  }
                  className="pl-9"
                />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="customer-phone">
                Phone number
              </FieldLabel>

              <div className="relative">
                <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="customer-phone"
                  type="tel"
                  placeholder="03XX XXXXXXX"
                  value={form.phone}
                  onChange={(event) =>
                    handleCustomerChange(
                      "phone",
                      event.target.value
                    )
                  }
                  className="pl-9"
                />
              </div>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="customer-email">
              Email address
            </FieldLabel>

            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="customer-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) =>
                  handleCustomerChange(
                    "email",
                    event.target.value
                  )
                }
                className="pl-9"
              />
            </div>

            <FieldDescription>
              We&apos;ll use this for appointment
              confirmation.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </section>

      <Separator />

      {/* Pet */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <PawPrint className="size-4 text-primary" />

          <div>
            <h3 className="text-sm font-semibold">
              Pet information
            </h3>

            <p className="text-xs text-muted-foreground">
              Tell us about the pet attending the
              appointment.
            </p>
          </div>
        </div>

        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="pet-name">
                Pet name
              </FieldLabel>

              <div className="relative">
                <PawPrint className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="pet-name"
                  placeholder="e.g. Max"
                  value={form.petName}
                  onChange={(event) =>
                    handleCustomerChange(
                      "petName",
                      event.target.value
                    )
                  }
                  className="pl-9"
                />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="pet-type">
                Pet type
              </FieldLabel>

              <Input
                id="pet-type"
                placeholder="e.g. Dog"
                value={form.petType}
                onChange={(event) =>
                  handleCustomerChange(
                    "petType",
                    event.target.value
                  )
                }
              />
            </Field>
          </div>
        </FieldGroup>
      </section>

      {/* Validation summary */}
      <div
        className={cn(
          "rounded-lg border px-4 py-3",
          hasCustomerDetails && hasPetDetails
            ? "border-primary/30 bg-primary/5"
            : "bg-muted/30"
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
              hasCustomerDetails && hasPetDetails
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <PawPrint className="size-3.5" />
          </div>

          <div>
            <p className="text-sm font-medium">
              {hasCustomerDetails &&
                hasPetDetails
                ? "Details complete"
                : "Complete your details"}
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {hasCustomerDetails &&
                hasPetDetails
                ? "You're ready to review your appointment."
                : "Please provide your name, phone number, pet name, and pet type."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}