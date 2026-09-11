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
  createBoardingInstructions,
  updateBoardingInstructions,
} from "@/lib/supabase/mutations/boarding-instructions"
import type {
  PetBoardingInstructionsListRow,
  PetRow,
  ReservationRow,
} from "@/lib/supabase/types"
import {
  createBoardingInstructionsSchema,
  type CreateBoardingInstructionsInput,
} from "@/lib/validations/boarding-instructions"

type BoardingInstructionsFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  instructions?: PetBoardingInstructionsListRow | null
  pets: PetRow[]
  reservations: ReservationRow[]
  onSuccess: () => void
}

const defaultValues: CreateBoardingInstructionsInput = {
  pet_id: "",
  reservation_id: null,
  feeding_notes: "",
  medication_notes: "",
  behavior_notes: "",
}

export function BoardingInstructionsFormDialog({
  open,
  onOpenChange,
  instructions,
  pets,
  reservations,
  onSuccess,
}: BoardingInstructionsFormDialogProps) {
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const isEditing = Boolean(instructions)

  const form =
    useForm<CreateBoardingInstructionsInput>({
      resolver: zodResolver(
        createBoardingInstructionsSchema
      ),
      defaultValues,
    })

  useEffect(() => {
    if (!open) return

    if (instructions) {
      form.reset({
        pet_id: instructions.pet_id,
        reservation_id:
          instructions.reservation_id,
        feeding_notes:
          instructions.feeding_notes ?? "",
        medication_notes:
          instructions.medication_notes ?? "",
        behavior_notes:
          instructions.behavior_notes ?? "",
      })

      return
    }

    form.reset(defaultValues)
  }, [open, instructions, form])

  const selectedPetId = form.watch("pet_id")

  const availableReservations =
    reservations.filter(
      (reservation) =>
        reservation.pet_id === selectedPetId
    )

  useEffect(() => {
    if (!selectedPetId) return

    const currentReservationId =
      form.getValues("reservation_id")

    const reservationBelongsToPet =
      availableReservations.some(
        (reservation) =>
          reservation.id ===
          currentReservationId
      )

    if (
      currentReservationId &&
      !reservationBelongsToPet
    ) {
      form.setValue(
        "reservation_id",
        null,
        { shouldDirty: true }
      )
    }
  }, [
    selectedPetId,
    availableReservations,
    form,
  ])

  async function onSubmit(
    values: CreateBoardingInstructionsInput
  ) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateBoardingInstructions({
          id: instructions!.id,
          ...values,
        })
      : await createBoardingInstructions(values)

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
        ? "Boarding instructions updated"
        : "Boarding instructions created",
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
              ? "Edit boarding instructions"
              : "New boarding instructions"}
          </DialogTitle>

          <DialogDescription>
            Record feeding, medication, and behavior
            instructions for a boarding pet.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="boarding-instructions"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              <Field
                data-invalid={
                  !!form.formState.errors.pet_id
                }
              >
                <FieldLabel htmlFor="instructions-pet">
                  Pet
                </FieldLabel>

                <Select
                  value={form.watch("pet_id")}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      "pet_id",
                      value,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="instructions-pet"
                    aria-invalid={
                      !!form.formState.errors.pet_id
                    }
                  >
                    <SelectValue>
                      {pets.find(
                        (pet) =>
                          pet.id ===
                          form.watch("pet_id")
                      )?.name ??
                        "Select pet"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {pets.map((pet) => (
                      <SelectItem
                        key={pet.id}
                        value={pet.id}
                      >
                        {pet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Select the pet these instructions
                  belong to.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.pet_id,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors
                    .reservation_id
                }
              >
                <FieldLabel htmlFor="instructions-reservation">
                  Reservation
                </FieldLabel>

                <Select
                  value={
                    form.watch("reservation_id") ??
                    ""
                  }
                  onValueChange={(value) => {
                    form.setValue(
                      "reservation_id",
                      value || null,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                  disabled={!selectedPetId}
                >
                  <SelectTrigger
                    id="instructions-reservation"
                    aria-invalid={
                      !!form.formState.errors
                        .reservation_id
                    }
                  >
                    <SelectValue>
                      {form.watch(
                        "reservation_id"
                      )
                        ? reservations.find(
                            (reservation) =>
                              reservation.id ===
                              form.watch(
                                "reservation_id"
                              )
                          )?.id ??
                          "Select reservation"
                        : "No reservation"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="none">
                      No reservation
                    </SelectItem>

                    {availableReservations.map(
                      (reservation) => (
                        <SelectItem
                          key={reservation.id}
                          value={reservation.id}
                        >
                          {reservation.id.slice(
                            0,
                            8
                          )}{" "}
                          ·{" "}
                          {reservation.status}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Optionally link these instructions
                  to a boarding reservation.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .reservation_id,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors
                    .feeding_notes
                }
              >
                <FieldLabel htmlFor="instructions-feeding">
                  Feeding notes
                </FieldLabel>

                <Textarea
                  id="instructions-feeding"
                  placeholder="Feeding schedule, portions, food preferences..."
                  rows={3}
                  aria-invalid={
                    !!form.formState.errors
                      .feeding_notes
                  }
                  {...form.register(
                    "feeding_notes"
                  )}
                />

                <FieldError
                  errors={[
                    form.formState.errors
                      .feeding_notes,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors
                    .medication_notes
                }
              >
                <FieldLabel htmlFor="instructions-medication">
                  Medication notes
                </FieldLabel>

                <Textarea
                  id="instructions-medication"
                  placeholder="Medication name, dosage, schedule, and special instructions..."
                  rows={3}
                  aria-invalid={
                    !!form.formState.errors
                      .medication_notes
                  }
                  {...form.register(
                    "medication_notes"
                  )}
                />

                <FieldError
                  errors={[
                    form.formState.errors
                      .medication_notes,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors
                    .behavior_notes
                }
              >
                <FieldLabel htmlFor="instructions-behavior">
                  Behavior notes
                </FieldLabel>

                <Textarea
                  id="instructions-behavior"
                  placeholder="Temperament, triggers, social behavior, handling instructions..."
                  rows={3}
                  aria-invalid={
                    !!form.formState.errors
                      .behavior_notes
                  }
                  {...form.register(
                    "behavior_notes"
                  )}
                />

                <FieldError
                  errors={[
                    form.formState.errors
                      .behavior_notes,
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
            form="boarding-instructions"
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
              "Create instructions"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}