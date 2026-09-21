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
import { Spinner } from "@/components/ui/spinner"
import { DatePickerTime } from "@/components/ui/date-picker-with-time"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import {
  createDaycareSchedule,
  updateDaycareSchedule,
} from "@/lib/supabase/mutations/daycare-schedules"
import type {
  DaycareScheduleRow,
  FacilityResourceRow,
  OwnerRow,
  PetRow,
} from "@/lib/supabase/types"
import {
  createDaycareScheduleSchema,
  type CreateDaycareScheduleInput,
} from "@/lib/validations/daycare-schedule"
import { parseDateTime } from "@/lib/utils"

type DaycareScheduleFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: DaycareScheduleRow | null
  pets: PetRow[]
  owners: OwnerRow[]
  resources: FacilityResourceRow[]
  onSuccess: () => void
}

const DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
] as const

const defaultValues: CreateDaycareScheduleInput = {
  pet_id: "",
  owner_id: "",
  resource_id: null,
  days_of_week: [],
  starts_at: "",
  ends_at: "",
  is_active: true,
}

export function DaycareScheduleFormDialog({
  open,
  onOpenChange,
  schedule,
  pets,
  owners,
  resources,
}: DaycareScheduleFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = Boolean(schedule)

  const form = useForm<CreateDaycareScheduleInput>({
    resolver: zodResolver(createDaycareScheduleSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    form.reset({
      pet_id: schedule?.pet_id ?? "",
      owner_id: schedule?.owner_id ?? "",
      resource_id: schedule?.resource_id ?? null,
      days_of_week: schedule?.days_of_week ?? [],
      starts_at: schedule?.starts_at?.slice(0, 19) ?? "",
      ends_at: schedule?.ends_at?.slice(0, 19) ?? "",
      is_active: schedule?.is_active ?? true,
    })
  }, [open, schedule, form])

  const petId = form.watch("pet_id")
  const ownerId = form.watch("owner_id")
  const resourceId = form.watch("resource_id")
  const daysOfWeek = form.watch("days_of_week")
  const startsAt = form.watch("starts_at")
  const endsAt = form.watch("ends_at")
  const isActive = form.watch("is_active")

  const selectedPet = pets.find(
    (pet) => pet.id === petId
  )

  const selectedOwner = owners.find(
    (owner) => owner.id === ownerId
  )

  const selectedResource = resources.find(
    (resource) => resource.id === resourceId
  )

  function combineDateTime(
    date: Date | undefined,
    time: string
  ) {
    if (!date) return ""

    const datePart = date.toISOString().slice(0, 10)
    const finalTime =
      time || new Date().toTimeString().slice(0, 8)

    return `${datePart}T${finalTime}`
  }

  async function onSubmit(values: CreateDaycareScheduleInput) {
    setIsSubmitting(true)

    const result = schedule
      ? await updateDaycareSchedule({
          id: schedule.id,
          ...values,
        })
      : await createDaycareSchedule(values)

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
      description: schedule
        ? "Daycare schedule updated"
        : "Daycare schedule created",
      priority: "high",
    })

    onOpenChange(false)
    form.reset()
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
              ? "Edit daycare schedule"
              : "New daycare schedule"}
          </DialogTitle>

          <DialogDescription>
            Configure the days, resource, and time range for this
            daycare schedule.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="daycare-schedule"
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
                <FieldLabel htmlFor="daycare-schedule-pet">
                  Pet
                </FieldLabel>

                <Select
                  value={petId}
                  onValueChange={(value) => {
                    if (!value) return

                    const pet = pets.find(
                      (item) => item.id === value
                    )

                    form.setValue(
                      "pet_id",
                      value,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )

                    form.setValue(
                      "owner_id",
                      pet?.owner_id ?? "",
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="daycare-schedule-pet"
                    aria-invalid={
                      !!form.formState.errors.pet_id
                    }
                  >
                    <SelectValue placeholder="Select pet">
                      {selectedPet
                        ? `${selectedPet.name} · ${selectedPet.species}`
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {pets.map((pet) => (
                      <SelectItem
                        key={pet.id}
                        value={pet.id}
                      >
                        {pet.name} · {pet.species}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Select the pet for this daycare schedule.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.pet_id,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.owner_id
                }
              >
                <FieldLabel htmlFor="daycare-schedule-owner">
                  Owner
                </FieldLabel>

                <Select
                  value={ownerId}
                  disabled
                >
                  <SelectTrigger
                    id="daycare-schedule-owner"
                    aria-invalid={
                      !!form.formState.errors.owner_id
                    }
                  >
                    <SelectValue placeholder="Select a pet first">
                      {selectedOwner?.name}
                    </SelectValue>
                  </SelectTrigger>
                </Select>

                <FieldDescription>
                  The owner is automatically selected from the pet.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.owner_id,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.resource_id
                }
              >
                <FieldLabel htmlFor="daycare-schedule-resource">
                  Resource
                </FieldLabel>

                <Select
                  value={resourceId ?? ""}
                  onValueChange={(value) => {
                    form.setValue(
                      "resource_id",
                      value || null,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="daycare-schedule-resource"
                    aria-invalid={
                      !!form.formState.errors.resource_id
                    }
                  >
                    <SelectValue placeholder="Select a resource">
                      {selectedResource
                        ? `${selectedResource.name} · ${selectedResource.type}`
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {resources
                      .filter(
                        (resource) => resource.is_active
                      )
                      .map((resource) => (
                        <SelectItem
                          key={resource.id}
                          value={resource.id}
                        >
                          {resource.name} · {resource.type}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Select the facility resource used by this schedule.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.resource_id,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.days_of_week
                }
              >
                <FieldLabel>Days</FieldLabel>

                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map((day) => {
                    const selected =
                      daysOfWeek?.includes(day.value)

                    return (
                      <Button
                        key={day.value}
                        type="button"
                        variant={
                          selected
                            ? "default"
                            : "outline"
                        }
                        className="h-9 px-2"
                        onClick={() => {
                          const current =
                            daysOfWeek ?? []

                          const next = selected
                            ? current.filter(
                                (value) =>
                                  value !== day.value
                              )
                            : [
                                ...current,
                                day.value,
                              ]

                          form.setValue(
                            "days_of_week",
                            next.sort(
                              (a, b) => a - b
                            ),
                            {
                              shouldDirty: true,
                              shouldValidate: true,
                            }
                          )
                        }}
                      >
                        {day.label}
                      </Button>
                    )
                  })}
                </div>

                <FieldDescription>
                  Select the days when this daycare schedule should run.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.days_of_week,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.starts_at
                }
              >
                <FieldLabel>Start date and time</FieldLabel>

                <DatePickerTime
                  date={
                    parseDateTime(startsAt).date
                  }
                  onDateChange={(date) => {
                    if (!date) {
                      form.setValue(
                        "starts_at",
                        "",
                        {
                          shouldDirty: true,
                          shouldValidate: true,
                        }
                      )
                      return
                    }

                    const currentTime =
                      parseDateTime(startsAt).time ||
                      new Date()
                        .toTimeString()
                        .slice(0, 8)

                    form.setValue(
                      "starts_at",
                      combineDateTime(
                        date,
                        currentTime
                      ),
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                  time={
                    parseDateTime(startsAt).time
                  }
                  onTimeChange={(time) => {
                    const currentDate =
                      parseDateTime(startsAt).date

                    form.setValue(
                      "starts_at",
                      combineDateTime(
                        currentDate,
                        time
                      ),
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                  dateLabel="Start date"
                  timeLabel="Start time"
                  datePlaceholder="Select start date"
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
                <FieldLabel>End date and time</FieldLabel>

                <DatePickerTime
                  date={
                    parseDateTime(endsAt).date
                  }
                  onDateChange={(date) => {
                    if (!date) {
                      form.setValue(
                        "ends_at",
                        "",
                        {
                          shouldDirty: true,
                          shouldValidate: true,
                        }
                      )
                      return
                    }

                    const currentTime =
                      parseDateTime(endsAt).time ||
                      new Date()
                        .toTimeString()
                        .slice(0, 8)

                    form.setValue(
                      "ends_at",
                      combineDateTime(
                        date,
                        currentTime
                      ),
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                  time={
                    parseDateTime(endsAt).time
                  }
                  onTimeChange={(time) => {
                    const currentDate =
                      parseDateTime(endsAt).date

                    form.setValue(
                      "ends_at",
                      combineDateTime(
                        currentDate,
                        time
                      ),
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                  dateLabel="End date"
                  timeLabel="End time"
                  datePlaceholder="Select end date"
                />

                <FieldError
                  errors={[
                    form.formState.errors.ends_at,
                  ]}
                />
              </Field>

              <Field
                orientation="horizontal"
              >
                <div className="flex-1">
                  <FieldLabel>Active</FieldLabel>

                  <FieldDescription>
                    Allow this daycare schedule to generate visits.
                  </FieldDescription>
                </div>

                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) =>
                    form.setValue(
                      "is_active",
                      checked,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }
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
            form="daycare-schedule"
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
              "Create schedule"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}