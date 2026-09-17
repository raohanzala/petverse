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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import {
  createReservation,
  updateReservation,
} from "@/lib/supabase/mutations/reservations"
import type { FacilityResourceRow, OwnerRow, PetRow, ReservationRow, ServiceListRow } from "@/lib/supabase/types"
import {
  createReservationSchema,
  type CreateReservationInput,
} from "@/lib/validations/reservation"
import { format } from "date-fns"
import { DatePickerTime } from "@/components/ui/date-picker-with-time"

type ReservationFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation?: ReservationRow | null
  initialResourceId?: string | null
  services: ServiceListRow[]
  resources: FacilityResourceRow[]
  owners: OwnerRow[]
  pets: PetRow[]
  onSuccess: () => void
}

const defaultValues: CreateReservationInput = {
  pet_id: "",
  owner_id: "",
  resource_id: null,
  service_id: null,
  status: "pending",
  check_in_at: "",
  check_out_at: "",
  notes: "",
}

export function ReservationFormDialog({
  open,
  onOpenChange,
  reservation,
  initialResourceId,
  services,
  resources,
  owners,
  pets,
  onSuccess,
}: ReservationFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(reservation)

  const form = useForm<CreateReservationInput>({
    resolver: zodResolver(createReservationSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (reservation) {
      form.reset({
        pet_id: reservation.pet_id,
        owner_id: reservation.owner_id,
        resource_id: reservation.resource_id,
        service_id: reservation.service_id,
        status: reservation.status,
        check_in_at: reservation.check_in_at.slice(0, 16),
        check_out_at: reservation.check_out_at.slice(0, 16),
        notes: reservation.notes ?? "",
      })
      return
    }

    form.reset({
      ...defaultValues,
      resource_id: initialResourceId ?? null,
    })
  }, [open, reservation, form])

  async function onSubmit(values: CreateReservationInput) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateReservation({
        id: reservation!.id,
        ...values,
      })
      : await createReservation(values)

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
        ? "Reservation updated"
        : "Reservation created",
      priority: "high",
    })

    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit reservation" : "New reservation"}
          </DialogTitle>

          <DialogDescription>
            Create a reservation for a pet and assign its stay details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="reservation"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.pet_id}>
                <FieldLabel htmlFor="reservation-pet">
                  Pet
                </FieldLabel>

                <Select
                  value={form.watch("pet_id") ?? ""}
                  onValueChange={(value) => {
                    if (!value) return

                    const selectedPet = pets.find(
                      (pet) => pet.id === value
                    )

                    form.setValue("pet_id", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })

                    if (selectedPet?.owner_id) {
                      form.setValue(
                        "owner_id",
                        selectedPet.owner_id,
                        {
                          shouldDirty: true,
                          shouldValidate: true,
                        }
                      )
                    }
                  }}
                >
                  <SelectTrigger
                    id="reservation-pet"
                    aria-invalid={!!form.formState.errors.pet_id}
                  >
                    <SelectValue>
                      {pets.find((pet) => pet.id === form.watch("pet_id"))?.name ??
                        "Select a pet"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {pets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Select the pet for this reservation.
                </FieldDescription>

                <FieldError errors={[form.formState.errors.pet_id]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.owner_id}>
                <FieldLabel htmlFor="reservation-owner">
                  Owner
                </FieldLabel>

                <Select
                  value={form.watch("owner_id") ?? ""}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue("owner_id", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })

                    const ownerPets = pets.filter(
                      (pet) => pet.owner_id === value
                    )

                    if (ownerPets.length === 1) {
                      form.setValue(
                        "pet_id",
                        ownerPets[0].id,
                        {
                          shouldDirty: true,
                          shouldValidate: true,
                        }
                      )
                    } else {
                      form.setValue("pet_id", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  }}
                >
                  <SelectTrigger
                    id="reservation-owner"
                    aria-invalid={!!form.formState.errors.owner_id}
                  >
                    <SelectValue>
                      {owners.find((owner) => owner.id === form.watch("owner_id"))?.name ??
                        "Select an owner"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {owners.map((owner) => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Select the owner associated with the reservation.
                </FieldDescription>

                <FieldError errors={[form.formState.errors.owner_id]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.resource_id}>
                <FieldLabel htmlFor="reservation-resource">
                  Facility resource
                </FieldLabel>

                <Select
                  value={form.watch("resource_id") ?? ""}
                  onValueChange={(value) => {
                    form.setValue("resource_id", value || null, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }}
                >
                  <SelectTrigger
                    id="reservation-resource"
                    aria-invalid={!!form.formState.errors.resource_id}
                  >
                    <SelectValue>
                      {resources.find(
                        (resource) => resource.id === form.watch("resource_id")
                      )?.name ?? "Select a resource"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {resources.map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Optional kennel, suite, playroom, or other resource.
                </FieldDescription>

                <FieldError errors={[form.formState.errors.resource_id]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.service_id}>
                <FieldLabel htmlFor="reservation-service">
                  Service
                </FieldLabel>

                <Select
                  value={form.watch("service_id") ?? ""}
                  onValueChange={(value) => {
                    form.setValue("service_id", value || null, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }}
                >
                  <SelectTrigger
                    id="reservation-service"
                    aria-invalid={!!form.formState.errors.service_id}
                  >
                    <SelectValue>
                      {services.find((service) => service.id === form.watch("service_id"))?.name ??
                        "Select a service"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Optional service associated with this reservation.
                </FieldDescription>

                <FieldError errors={[form.formState.errors.service_id]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.status}>
                <FieldLabel htmlFor="reservation-status">
                  Status
                </FieldLabel>

                <Select
                  value={form.watch("status")}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      "status",
                      value as CreateReservationInput["status"],
                      { shouldDirty: true }
                    )
                  }}
                >
                  <SelectTrigger
                    id="reservation-status"
                    aria-invalid={!!form.formState.errors.status}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="checked_in">
                      Checked In
                    </SelectItem>
                    <SelectItem value="checked_out">
                      Checked Out
                    </SelectItem>
                    <SelectItem value="cancelled">
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Current status of the reservation.
                </FieldDescription>

                <FieldError errors={[form.formState.errors.status]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.check_in_at}>
                <DatePickerTime
                  date={
                    form.watch("check_in_at")
                      ? new Date(form.watch("check_in_at"))
                      : undefined
                  }
                  onDateChange={(date) => {
                    const currentValue = form.getValues("check_in_at")

                    if (!date) {
                      form.setValue(
                        "check_in_at",
                        "",
                        {
                          shouldDirty: true,
                          shouldValidate: true,
                        }
                      )

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

                    form.setValue(
                      "check_in_at",
                      date.toISOString(),
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                  time={
                    form.watch("check_in_at")
                      ? format(
                        new Date(form.watch("check_in_at")),
                        "HH:mm:ss"
                      )
                      : ""
                  }
                  onTimeChange={(time) => {
                    const currentValue =
                      form.getValues("check_in_at")

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
                      "check_in_at",
                      date.toISOString(),
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                  dateLabel="Check-in date"
                  timeLabel="Check-in time"
                  datePlaceholder="Select date"
                />

                <FieldError
                  errors={[
                    form.formState.errors.check_in_at,
                  ]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.check_out_at}>
                <DatePickerTime
                  date={
                    form.watch("check_out_at")
                      ? new Date(form.watch("check_out_at"))
                      : undefined
                  }
                  onDateChange={(date) => {
                    const currentValue = form.getValues("check_out_at")

                    if (!date) {
                      form.setValue(
                        "check_out_at",
                        "",
                        {
                          shouldDirty: true,
                          shouldValidate: true,
                        }
                      )

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

                    form.setValue(
                      "check_out_at",
                      date.toISOString(),
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                  time={
                    form.watch("check_out_at")
                      ? format(
                        new Date(form.watch("check_out_at")),
                        "HH:mm:ss"
                      )
                      : ""
                  }
                  onTimeChange={(time) => {
                    const currentValue =
                      form.getValues("check_out_at")

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
                      "check_out_at",
                      date.toISOString(),
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                  dateLabel="Check-out date"
                  timeLabel="Check-out time"
                  datePlaceholder="Select date"
                />

                <FieldError
                  errors={[
                    form.formState.errors.check_out_at,
                  ]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.notes}>
                <FieldLabel htmlFor="reservation-notes">
                  Notes
                </FieldLabel>

                <Textarea
                  id="reservation-notes"
                  placeholder="Add reservation notes..."
                  aria-invalid={!!form.formState.errors.notes}
                  {...form.register("notes")}
                />

                <FieldDescription>
                  Optional notes about the reservation.
                </FieldDescription>

                <FieldError errors={[form.formState.errors.notes]} />
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
            form="reservation"
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
              "Create reservation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}