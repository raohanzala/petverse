"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  createDaycareScheduleSchema,
  type CreateDaycareScheduleInput,
} from "@/lib/validations/daycare-schedule"
import {
  createDaycareSchedule,
  updateDaycareSchedule,
} from "@/lib/supabase/mutations/daycare-schedules"
import type { DaycareScheduleRow, PetRow } from "@/lib/supabase/types"

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

type DaycareScheduleFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: DaycareScheduleRow | null
  pets: PetRow[]
  onSuccess: () => void
}

const DAYS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
]

export function DaycareScheduleFormDialog({
  schedule,
  pets,
  open: controlledOpen,
  onOpenChange,
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
      day_of_week: schedule?.day_of_week ?? 1,
      start_time: schedule?.start_time?.slice(0, 5) ?? "09:00",
      end_time: schedule?.end_time?.slice(0, 5) ?? "17:00",
      is_active: schedule?.is_active ?? true,
    },
  })

  useEffect(() => {
    if (!open) return

    form.reset({
      pet_id: schedule?.pet_id ?? "",
      day_of_week: schedule?.day_of_week ?? 1,
      start_time: schedule?.start_time?.slice(0, 5) ?? "09:00",
      end_time: schedule?.end_time?.slice(0, 5) ?? "17:00",
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
            Configure a recurring daycare schedule for a pet.
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
                    form.setValue("pet_id", value, {
                      shouldValidate: true,
                    })
                  }
                  }
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
                <FieldLabel>Day</FieldLabel>

                <Select
                  value={String(form.watch("day_of_week"))}
                  onValueChange={(value) =>
                    form.setValue(
                      "day_of_week",
                      Number(value),
                      {
                        shouldValidate: true,
                      }
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue>
                      {DAYS.find(
                        (day) => day.value === String(form.watch("day_of_week"))
                      )?.label ?? "Select a day"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem
                        key={day.value}
                        value={day.value}
                      >
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {form.formState.errors.day_of_week && (
                  <FieldError>
                    {form.formState.errors.day_of_week.message}
                  </FieldError>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="start_time">
                    Start Time
                  </FieldLabel>

                  <Input
                    id="start_time"
                    type="time"
                    {...form.register("start_time")}
                  />

                  {form.formState.errors.start_time && (
                    <FieldError>
                      {form.formState.errors.start_time.message}
                    </FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="end_time">
                    End Time
                  </FieldLabel>

                  <Input
                    id="end_time"
                    type="time"
                    {...form.register("end_time")}
                  />

                  {form.formState.errors.end_time && (
                    <FieldError>
                      {form.formState.errors.end_time.message}
                    </FieldError>
                  )}
                </Field>
              </div>

              <Field orientation="horizontal">
                <div className="flex-1">
                  <FieldLabel>Active</FieldLabel>

                  <FieldDescription>
                    Enable this recurring schedule.
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