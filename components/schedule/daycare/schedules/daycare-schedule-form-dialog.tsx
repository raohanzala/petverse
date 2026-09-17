"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  createDaycareScheduleSchema,
  type CreateDaycareScheduleInput,
} from "@/lib/validations/daycare-schedule"
import {
  createDaycareSchedule,
  updateDaycareSchedule,
} from "@/lib/supabase/mutations/daycare-schedules"
import type { DaycareScheduleRow, FacilityResourceRow, OwnerRow, PetRow } from "@/lib/supabase/types"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Form } from "@/components/ui/form"
import { format } from "date-fns"
import { DatePickerTime } from "@/components/ui/date-picker-with-time"
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

export function DaycareScheduleFormDialog({
  schedule,
  pets,
  open: controlledOpen,
  onOpenChange,
  owners,
  resources
}: DaycareScheduleFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const isEditing = Boolean(schedule)
  const open = controlledOpen ?? internalOpen

  function handleOpenChange(value: boolean) {
    if (onOpenChange) {
      onOpenChange(value)
    } else {
      setInternalOpen(value)
    }
  }

  const form = useForm<CreateDaycareScheduleInput>({
    resolver: zodResolver(createDaycareScheduleSchema),
    defaultValues: {
      pet_id: schedule?.pet_id ?? "",
      owner_id: schedule?.owner_id ?? "",
      resource_id: schedule?.resource_id ?? null,
      days_of_week: schedule?.days_of_week ?? [],
      starts_at: schedule?.starts_at?.slice(0, 19) ?? "",
      ends_at: schedule?.ends_at?.slice(0, 19) ?? "",
      is_active: schedule?.is_active ?? true,
    },
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

  async function onSubmit(values: CreateDaycareScheduleInput) {
    setLoading(true)

    const result = schedule
      ? await updateDaycareSchedule({
        id: schedule.id,
        ...values,
      })
      : await createDaycareSchedule(values)

    setLoading(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(
      schedule
        ? "Daycare schedule updated"
        : "Daycare schedule created"
    )

    handleOpenChange(false)
    form.reset()
  }

  function combineDateTime(
    date: Date | undefined,
    time: string
  ) {
    if (!date) return ""

    const datePart = format(date, "yyyy-MM-dd")

    const finalTime =
      time || format(new Date(), "HH:mm:ss")

    return `${datePart}T${finalTime}`
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit Daycare Schedule"
              : "Add Daycare Schedule"}
          </DialogTitle>

          <DialogDescription>
            Configure the days, resource, and date range for this daycare schedule.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FieldGroup>
              <Field>
                <FieldLabel>Pet</FieldLabel>

                <Select
                  value={form.watch("pet_id")}
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
                  <SelectTrigger>
                    <SelectValue>
                      {pets.find(
                        (pet) => pet.id === form.watch("pet_id")
                      )?.name ?? "Select a pet"}
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

                {form.formState.errors.pet_id && (
                  <FieldError>
                    {form.formState.errors.pet_id.message}
                  </FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel>Owner</FieldLabel>

                <Select
                  value={form.watch("owner_id")}
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue>
                      {owners.find(
                        (owner) =>
                          owner.id === form.watch("owner_id")
                      )?.name ?? "Select a pet first"}
                    </SelectValue>
                  </SelectTrigger>
                </Select>

                {form.formState.errors.owner_id && (
                  <FieldError>
                    {form.formState.errors.owner_id.message}
                  </FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel>Resource</FieldLabel>

                <Select
                  value={form.watch("resource_id") ?? ""}
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
                  <SelectTrigger>
                    <SelectValue>
                      {resources.find(
                        (resource) =>
                          resource.id === form.watch("resource_id")
                      )?.name ?? "Select a resource"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {resources
                      .filter((resource) => resource.is_active)
                      .map((resource) => (
                        <SelectItem
                          key={resource.id}
                          value={resource.id}
                        >
                          {resource.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {form.formState.errors.resource_id && (
                  <FieldError>
                    {form.formState.errors.resource_id.message}
                  </FieldError>
                )}
              </Field>

              <Controller
                control={form.control}
                name="days_of_week"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Days</FieldLabel>

                    <div className="grid grid-cols-7 gap-2">
                      {DAYS.map((day) => {
                        const selected =
                          field.value?.includes(day.value)

                        return (
                          <Button
                            key={day.value}
                            type="button"
                            variant={selected ? "default" : "outline"}
                            className="h-9 px-2"
                            onClick={() => {
                              const current =
                                field.value ?? []

                              const next = selected
                                ? current.filter(
                                  (value) =>
                                    value !== day.value
                                )
                                : [...current, day.value]

                              field.onChange(
                                next.sort((a, b) => a - b)
                              )
                            }}
                          >
                            {day.label}
                          </Button>
                        )
                      })}
                    </div>

                    <FieldDescription>
                      Select the days when this daycare schedule
                      should run.
                    </FieldDescription>

                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="starts_at"
                render={({ field, fieldState }) => {
                  const { date, time } = parseDateTime(field.value)

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <DatePickerTime
                        date={date}
                        onDateChange={(selectedDate) => {
                          if (!selectedDate) {
                            field.onChange("")
                            return
                          }

                          const currentTime = field.value
                            ? parseDateTime(field.value).time
                            : format(new Date(), "HH:mm:ss")

                          field.onChange(
                            combineDateTime(
                              selectedDate,
                              currentTime
                            )
                          )
                        }}
                        time={time}
                        onTimeChange={(selectedTime) => {
                          const currentDate =
                            parseDateTime(field.value).date

                          field.onChange(
                            combineDateTime(
                              currentDate,
                              selectedTime
                            )
                          )
                        }}
                        dateLabel="Start date"
                        timeLabel="Start time"
                        datePlaceholder="Select start date"
                      />

                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )
                }}
              />

              <Controller
                control={form.control}
                name="ends_at"
                render={({ field, fieldState }) => {
                  const { date, time } = parseDateTime(field.value)

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <DatePickerTime
                        date={date}
                        onDateChange={(selectedDate) => {
                          if (!selectedDate) {
                            field.onChange("")
                            return
                          }

                          const currentTime = field.value
                            ? parseDateTime(field.value).time
                            : format(new Date(), "HH:mm:ss")

                          field.onChange(
                            combineDateTime(
                              selectedDate,
                              currentTime
                            )
                          )
                        }}
                        time={time}
                        onTimeChange={(selectedTime) => {
                          const currentDate =
                            parseDateTime(field.value).date

                          field.onChange(
                            combineDateTime(
                              currentDate,
                              selectedTime
                            )
                          )
                        }}
                        dateLabel="End date"
                        timeLabel="End time"
                        datePlaceholder="Select end date"
                      />

                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )
                }}
              />

              <Field orientation="horizontal">
                <div className="flex-1">
                  <FieldLabel>Active</FieldLabel>

                  <FieldDescription>
                    Allow this daycare schedule to generate visits.
                  </FieldDescription>
                </div>

                <Switch
                  checked={form.watch("is_active")}
                  onCheckedChange={(checked) =>
                    form.setValue("is_active", checked)
                  }
                />
              </Field>
            </FieldGroup>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
              >
                {loading && (
                  <Loader2 className="size-4 animate-spin" />
                )}

                {isEditing
                  ? "Save Changes"
                  : "Create Schedule"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}