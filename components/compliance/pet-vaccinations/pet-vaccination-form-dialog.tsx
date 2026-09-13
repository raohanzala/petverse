"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
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
import { DatePickerTime } from "@/components/ui/date-picker-with-time"

import {
  createPetVaccination,
  updatePetVaccination,
} from "@/lib/supabase/mutations/pet-vaccinations"

import type {
  EmployeeRow,
  PetRow,
  PetVaccinationRow,
  VaccineTypeRow,
} from "@/lib/supabase/types"

import {
  createPetVaccinationSchema,
  type CreatePetVaccinationInput,
} from "@/lib/validations/pet-vaccinations"

type PetVaccinationFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  vaccination?: PetVaccinationRow | null
  pets: PetRow[]
  vaccineTypes: VaccineTypeRow[]
  employees: EmployeeRow[]
  onSuccess: () => void
}

const defaultValues: CreatePetVaccinationInput = {
  pet_id: "",
  vaccine_type_id: "",
  administered_at: "",
  expires_at: null,
  notes: "",
  recorded_by: null,
}

export function PetVaccinationFormDialog({
  open,
  onOpenChange,
  vaccination,
  pets,
  vaccineTypes,
  employees,
  onSuccess,
}: PetVaccinationFormDialogProps) {
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const isEditing = Boolean(vaccination)

  const form =
    useForm<CreatePetVaccinationInput>({
      resolver: zodResolver(
        createPetVaccinationSchema
      ),
      defaultValues,
    })

  useEffect(() => {
    if (!open) return

    if (vaccination) {
      form.reset({
        pet_id: vaccination.pet_id,
        vaccine_type_id:
          vaccination.vaccine_type_id,
        administered_at:
          vaccination.administered_at.slice(0, 19),
        expires_at:
          vaccination.expires_at
            ? vaccination.expires_at.slice(0, 19)
            : null,
        notes: vaccination.notes ?? "",
        recorded_by:
          vaccination.recorded_by,
      })

      return
    }

    form.reset(defaultValues)
  }, [open, vaccination, form])

  const selectedPetId =
    form.watch("pet_id")

  const selectedVaccineTypeId =
    form.watch("vaccine_type_id")

  const selectedRecordedBy =
    form.watch("recorded_by")

  const selectedPet = pets.find(
    (pet) => pet.id === selectedPetId
  )

  const selectedVaccineType =
    vaccineTypes.find(
      (vaccine) =>
        vaccine.id === selectedVaccineTypeId
    )

  const selectedEmployee =
    employees.find(
      (employee) =>
        employee.id === selectedRecordedBy
    )

  async function onSubmit(
    values: CreatePetVaccinationInput
  ) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updatePetVaccination({
          id: vaccination!.id,
          ...values,
        })
      : await createPetVaccination(values)

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
        ? "Vaccination updated"
        : "Vaccination recorded",
      priority: "high",
    })

    onOpenChange(false)
    onSuccess()
  }

  function parseDateTime(value: string) {
    if (!value) {
      return {
        date: undefined,
        time: "",
      }
    }

    const [datePart, timePart] =
      value.split("T")

    return {
      date: datePart
        ? new Date(`${datePart}T00:00:00`)
        : undefined,
      time: timePart ?? "",
    }
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
      time || format(new Date(), "HH:mm:ss")

    return `${datePart}T${finalTime}`
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit vaccination"
              : "Record vaccination"}
          </DialogTitle>

          <DialogDescription>
            Record a pet's vaccination, including the
            vaccine, dates, and additional notes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="pet-vaccination"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-5 h-100 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <FieldGroup>
              {/* Pet */}
              <Field
                data-invalid={
                  !!form.formState.errors.pet_id
                }
              >
                <FieldLabel htmlFor="vaccination-pet">
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
                    id="vaccination-pet"
                    aria-invalid={
                      !!form.formState.errors.pet_id
                    }
                  >
                    <SelectValue placeholder="Select pet">
                      {selectedPet?.name ??
                        "Select pet"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {pets
                      .filter(
                        (pet) => pet.is_active
                      )
                      .map((pet) => (
                        <SelectItem
                          key={pet.id}
                          value={pet.id}
                        >
                          {pet.name} —{" "}
                          {pet.species}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Select the pet associated with this
                  vaccination.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.pet_id,
                  ]}
                />
              </Field>

              {/* Vaccine type */}
              <Field
                data-invalid={
                  !!form.formState.errors
                    .vaccine_type_id
                }
              >
                <FieldLabel htmlFor="vaccination-type">
                  Vaccine type
                </FieldLabel>

                <Select
                  value={form.watch(
                    "vaccine_type_id"
                  )}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      "vaccine_type_id",
                      value,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="vaccination-type"
                    aria-invalid={
                      !!form.formState.errors
                        .vaccine_type_id
                    }
                  >
                    <SelectValue placeholder="Select vaccine type">
                      {selectedVaccineType?.name ??
                        "Select vaccine type"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {vaccineTypes
                      .filter(
                        (vaccine) =>
                          vaccine.is_active
                      )
                      .map((vaccine) => (
                        <SelectItem
                          key={vaccine.id}
                          value={vaccine.id}
                        >
                          {vaccine.name}
                          {vaccine.species
                            ? ` — ${vaccine.species}`
                            : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Select the vaccine administered to
                  this pet.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .vaccine_type_id,
                  ]}
                />
              </Field>

              {/* Administered at */}
              <Controller
                control={form.control}
                name="administered_at"
                render={({
                  field,
                  fieldState,
                }) => {
                  const {
                    date,
                    time,
                  } = parseDateTime(
                    field.value
                  )

                  return (
                    <Field
                      data-invalid={
                        fieldState.invalid
                      }
                    >
                      <DatePickerTime
                        date={date}
                        onDateChange={(
                          selectedDate
                        ) => {
                          if (!selectedDate) {
                            field.onChange("")
                            return
                          }

                          const currentValue =
                            field.value

                          const currentTime =
                            currentValue
                              ? parseDateTime(
                                  currentValue
                                ).time
                              : format(
                                  new Date(),
                                  "HH:mm:ss"
                                )

                          field.onChange(
                            combineDateTime(
                              selectedDate,
                              currentTime
                            )
                          )
                        }}
                        time={time}
                        onTimeChange={(
                          selectedTime
                        ) => {
                          const currentDate =
                            parseDateTime(
                              field.value
                            ).date

                          field.onChange(
                            combineDateTime(
                              currentDate,
                              selectedTime
                            )
                          )
                        }}
                        dateLabel="Administered date"
                        timeLabel="Time"
                        datePlaceholder="Select date"
                      />

                      <FieldDescription>
                        Date and time when the vaccine
                        was administered.
                      </FieldDescription>

                      <FieldError
                        errors={[
                          fieldState.error,
                        ]}
                      />
                    </Field>
                  )
                }}
              />

              {/* Expires at */}
              <Controller
                control={form.control}
                name="expires_at"
                render={({
                  field,
                  fieldState,
                }) => {
                  const {
                    date,
                    time,
                  } = parseDateTime(
                    field.value ?? ""
                  )

                  return (
                    <Field
                      data-invalid={
                        fieldState.invalid
                      }
                    >
                      <DatePickerTime
                        date={date}
                        onDateChange={(
                          selectedDate
                        ) => {
                          if (!selectedDate) {
                            field.onChange(null)
                            return
                          }

                          const currentValue =
                            field.value

                          const currentTime =
                            currentValue
                              ? parseDateTime(
                                  currentValue
                                ).time
                              : "00:00:00"

                          field.onChange(
                            combineDateTime(
                              selectedDate,
                              currentTime
                            )
                          )
                        }}
                        time={time}
                        onTimeChange={(
                          selectedTime
                        ) => {
                          const currentDate =
                            parseDateTime(
                              field.value ?? ""
                            ).date

                          if (!currentDate) {
                            return
                          }

                          field.onChange(
                            combineDateTime(
                              currentDate,
                              selectedTime
                            )
                          )
                        }}
                        dateLabel="Expiration date"
                        timeLabel="Time"
                        datePlaceholder="Optional"
                      />

                      <FieldDescription>
                        Optional expiration or renewal
                        date.
                      </FieldDescription>

                      <FieldError
                        errors={[
                          fieldState.error,
                        ]}
                      />
                    </Field>
                  )
                }}
              />

              {/* Recorded by */}
              <Field
                data-invalid={
                  !!form.formState.errors
                    .recorded_by
                }
              >
                <FieldLabel htmlFor="vaccination-recorded-by">
                  Recorded by
                </FieldLabel>

                <Select
                  value={
                    form.watch(
                      "recorded_by"
                    ) ?? ""
                  }
                  onValueChange={(value) => {
                    form.setValue(
                      "recorded_by",
                      value || null,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="vaccination-recorded-by"
                    aria-invalid={
                      !!form.formState.errors
                        .recorded_by
                    }
                  >
                    <SelectValue placeholder="Select employee">
                      {selectedEmployee?.display_name ??
                        "Select employee"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {employees
                      .filter(
                        (employee) =>
                          employee.is_active
                      )
                      .map((employee) => (
                        <SelectItem
                          key={employee.id}
                          value={employee.id}
                        >
                          {employee.display_name}
                          {employee.job_title
                            ? ` — ${employee.job_title}`
                            : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Optional employee who recorded this
                  vaccination.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .recorded_by,
                  ]}
                />
              </Field>

              {/* Notes */}
              <Field
                data-invalid={
                  !!form.formState.errors.notes
                }
              >
                <FieldLabel htmlFor="vaccination-notes">
                  Notes
                </FieldLabel>

                <Textarea
                  id="vaccination-notes"
                  placeholder="Optional notes about this vaccination."
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
            </FieldGroup>
          </form>

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
              form="pet-vaccination"
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
                "Record vaccination"
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}