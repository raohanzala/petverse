"use client"

import {
  useEffect,
  useMemo,
  useState,
} from "react"

import { format } from "date-fns"

import {
  Controller,
  useForm,
} from "react-hook-form"

import { zodResolver } from "@hookform/resolvers/zod"

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
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  createDailyUpdate,
  updateDailyUpdate,
} from "@/lib/supabase/mutations/daily-updates"

import type {
  DailyUpdateAppointmentOption,
  DailyUpdateEmployeeOption,
  DailyUpdatePetOption,
  DailyUpdateWithRelations,
} from "@/lib/supabase/types"

import {
  createDailyUpdateSchema,
  type CreateDailyUpdateInput,
} from "@/lib/validations/daily-update"

import { DatePickerTime } from "@/components/ui/date-picker-with-time"

import { PetUpdateImages } from "./pet-update-images"
import { uploadPetUpdateImage } from "@/lib/supabase/storage/pet-update-images"

type DailyUpdateFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  update?: DailyUpdateWithRelations | null
  pets: DailyUpdatePetOption[]
  appointments: DailyUpdateAppointmentOption[]
  employees: DailyUpdateEmployeeOption[]
  onSuccess: () => void
}

const defaultValues: CreateDailyUpdateInput = {
  pet_id: "",
  appointment_id: null,
  author_id: null,
  body: "",
  sent_to_owner_at: null,
}

export function DailyUpdateFormDialog({
  open,
  onOpenChange,
  update,
  pets,
  appointments,
  employees,
  onSuccess,
}: DailyUpdateFormDialogProps) {
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [savedUpdateId, setSavedUpdateId] =
    useState<string | null>(null)

  const [
    pendingPhotoFiles,
    setPendingPhotoFiles,
  ] = useState<File[]>([])

  const currentUpdateId = update?.id

  const isEditing = Boolean(currentUpdateId)

  const form =
    useForm<CreateDailyUpdateInput>({
      resolver: zodResolver(
        createDailyUpdateSchema
      ),
      defaultValues,
    })

  const selectedPetId =
    form.watch("pet_id")

  const selectedAppointmentId =
    form.watch("appointment_id")

  const selectedAuthorId =
    form.watch("author_id")

  const selectedPet = useMemo(
    () =>
      pets.find(
        (pet) =>
          pet.id === selectedPetId
      ),
    [pets, selectedPetId]
  )

  const selectedAppointment =
    useMemo(
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

  const selectedAuthor = useMemo(
    () =>
      employees.find(
        (employee) =>
          employee.id === selectedAuthorId
      ),
    [employees, selectedAuthorId]
  )

  const filteredAppointments =
    useMemo(
      () =>
        selectedPetId
          ? appointments.filter(
            (appointment) =>
              appointment.pet_id ===
              selectedPetId
          )
          : [],
      [appointments, selectedPetId]
    )

  async function uploadPendingPhotos(
    updateId: string,
    petId: string,
    files: File[]
  ) {
    for (const file of files) {
      await uploadPetUpdateImage(
        file,
        updateId,
        petId
      )
    }
  }

  useEffect(() => {
    if (!open) return

    setPendingPhotoFiles([])

    if (update) {

      form.reset({
        pet_id: update.pet_id,
        appointment_id:
          update.appointment_id,
        author_id: update.author_id,
        body: update.body,
        sent_to_owner_at:
          update.sent_to_owner_at,
      })

      return
    }

    form.reset(defaultValues)
  }, [open, update, form])

  function handlePetChange(
    petId: string
  ) {
    if (currentUpdateId) return

    form.setValue("pet_id", petId, {
      shouldDirty: true,
      shouldValidate: true,
    })

    const currentAppointment =
      form.getValues("appointment_id")

    if (
      currentAppointment &&
      !appointments.some(
        (appointment) =>
          appointment.id ===
          currentAppointment &&
          appointment.pet_id === petId
      )
    ) {
      form.setValue(
        "appointment_id",
        null,
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      )
    }
  }

  function parseDateTime(value: string | null) {
    if (!value) {
      return {
        date: undefined,
        time: "",
      }
    }

    const parsed = new Date(value)

    if (Number.isNaN(parsed.getTime())) {
      return {
        date: undefined,
        time: "",
      }
    }

    return {
      date: parsed,
      time: format(parsed, "HH:mm:ss"),
    }
  }

  function combineDateTime(
    date: Date | undefined,
    time: string
  ) {
    if (!date) return ""

    const finalTime =
      time || format(new Date(), "HH:mm:ss")

    const [hours, minutes, seconds = "00"] =
      finalTime.split(":")

    const localDate = new Date(date)

    localDate.setHours(
      Number(hours),
      Number(minutes),
      Number(seconds),
      0
    )

    return localDate.toISOString()
  }

  async function onSubmit(
    values: CreateDailyUpdateInput
  ) {
    setIsSubmitting(true)

    try {
      const result = currentUpdateId
        ? await updateDailyUpdate({
          id: currentUpdateId,
          ...values,
        })
        : await createDailyUpdate(values)

      if (!result.success) {
        toast.add({
          type: "error",
          description: result.error,
          priority: "high",
        })

        return
      }

      const createdUpdateId =
        currentUpdateId ?? result.data.id

      /*
       * A new Daily Update now has an ID,
       * so upload any photos that were selected
       * before the update was created.
       */
      if (
        !currentUpdateId &&
        pendingPhotoFiles.length > 0
      ) {

        await uploadPendingPhotos(
          createdUpdateId,
          values.pet_id,
          pendingPhotoFiles
        )

        setPendingPhotoFiles([])
      }

      toast.add({
        type: "success",
        description: currentUpdateId
          ? "Daily update updated"
          : "Daily update created",
        priority: "high",
      })

      onSuccess()

      if (currentUpdateId) {
        onOpenChange(false)
      } else {
        /*
         * The update and its photos are now saved.
         */
        onOpenChange(false)
      }
    } catch (error) {
      console.error(
        "Failed to save daily update:",
        error
      )

      toast.add({
        type: "error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save daily update",
        priority: "high",
      })
    } finally {
      setIsSubmitting(false)
    }
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
              ? "Edit daily update"
              : "New daily update"}
          </DialogTitle>

          <DialogDescription>
            Create a daily update for a pet and
            optionally link it to an appointment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="daily-update"
            onSubmit={form.handleSubmit(
              onSubmit
            )}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              {/* PET */}

              <Field
                data-invalid={
                  !!form.formState.errors.pet_id
                }
              >
                <FieldLabel htmlFor="daily-update-pet">
                  Pet
                </FieldLabel>

                <Select
                  value={selectedPetId}
                  onValueChange={(value) => {
                    if (!value) return

                    handlePetChange(value)
                  }}
                  disabled={Boolean(
                    currentUpdateId
                  )}
                >
                  <SelectTrigger
                    id="daily-update-pet"
                    aria-invalid={
                      !!form.formState.errors.pet_id
                    }
                  >
                    <SelectValue placeholder="Select a pet">
                      {selectedPet?.name ??
                        "Select a pet"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {pets.map((pet) => (
                      <SelectItem
                        key={pet.id}
                        value={pet.id}
                      >
                        {pet.name}
                        {pet.owner
                          ? ` — ${pet.owner.name}`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {currentUpdateId ? (
                  <FieldDescription>
                    The pet cannot be changed after
                    the daily update has been created.
                  </FieldDescription>
                ) : null}

                <FieldError
                  errors={[
                    form.formState.errors.pet_id,
                  ]}
                />
              </Field>

              {/* APPOINTMENT */}

              <Field
                data-invalid={
                  !!form.formState.errors
                    .appointment_id
                }
              >
                <FieldLabel htmlFor="daily-update-appointment">
                  Appointment
                </FieldLabel>

                <Select
                  value={
                    selectedAppointmentId ??
                    ""
                  }
                  onValueChange={(value) => {
                    form.setValue(
                      "appointment_id",
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
                    id="daily-update-appointment"
                    aria-invalid={
                      !!form.formState.errors
                        .appointment_id
                    }
                  >
                    <SelectValue placeholder="Optional appointment">
                      {selectedAppointment
                        ? `${format(
                          new Date(
                            selectedAppointment.starts_at
                          ),
                          "PP p"
                        )} — ${selectedAppointment.status
                        }`
                        : "Optional appointment"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {filteredAppointments.map(
                      (appointment) => (
                        <SelectItem
                          key={appointment.id}
                          value={appointment.id}
                        >
                          {format(
                            new Date(
                              appointment.starts_at
                            ),
                            "PP p"
                          )}{" "}
                          —{" "}
                          {appointment.status}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Only appointments belonging to the
                  selected pet are shown.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .appointment_id,
                  ]}
                />
              </Field>

              {/* AUTHOR */}

              <Field
                data-invalid={
                  !!form.formState.errors
                    .author_id
                }
              >
                <FieldLabel htmlFor="daily-update-author">
                  Author
                </FieldLabel>

                <Select
                  value={
                    selectedAuthorId ?? ""
                  }
                  onValueChange={(value) => {
                    form.setValue(
                      "author_id",
                      value || null,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="daily-update-author"
                    aria-invalid={
                      !!form.formState.errors
                        .author_id
                    }
                  >
                    <SelectValue placeholder="Optional author">
                      {selectedAuthor?.display_name ??
                        "Optional author"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {employees.map(
                      (employee) => (
                        <SelectItem
                          key={employee.id}
                          value={employee.id}
                        >
                          {
                            employee.display_name
                          }
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Staff member who wrote the update.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .author_id,
                  ]}
                />
              </Field>

              {/* UPDATE */}

              <Field
                data-invalid={
                  !!form.formState.errors.body
                }
              >
                <FieldLabel htmlFor="daily-update-body">
                  Update
                </FieldLabel>

                <Textarea
                  id="daily-update-body"
                  placeholder="Luna enjoyed her afternoon walk and had a good meal."
                  rows={5}
                  aria-invalid={
                    !!form.formState.errors.body
                  }
                  {...form.register("body")}
                />

                <FieldDescription>
                  Write the message that staff can
                  share with the owner.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.body,
                  ]}
                />
              </Field>

              {/* PHOTOS */}

              {selectedPetId ? (
                <PetUpdateImages
                  dailyUpdateId={currentUpdateId}
                  petId={selectedPetId}
                  pendingFiles={pendingPhotoFiles}
                  onPendingFilesChange={setPendingPhotoFiles}
                  disabled={isSubmitting}
                />
              ) : (
                <Field>
                  <FieldLabel>
                    Photos
                  </FieldLabel>

                  <FieldDescription>
                    Select a pet first to add photos.
                  </FieldDescription>
                </Field>
              )}

              {/* SENT TO OWNER */}

              <Controller
                control={form.control}
                name="sent_to_owner_at"
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

                          const currentTime =
                            time ||
                            format(
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
                          field.onChange(
                            combineDateTime(
                              date,
                              selectedTime
                            )
                          )
                        }}
                        dateLabel="Sent date"
                        timeLabel="Time"
                        datePlaceholder="Select date"
                      />

                      <FieldDescription>
                        Leave empty if the update has
                        not been sent yet.
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
            form="daily-update"
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
              "Create update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}