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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  createEmployeeSchedule,
  updateEmployeeSchedule,
} from "@/lib/supabase/mutations/employee-schedules"
import type {
  EmployeeRow,
  EmployeeScheduleRow,
} from "@/lib/supabase/types"
import {
  createEmployeeScheduleSchema,
  type CreateEmployeeScheduleInput,
} from "@/lib/validations/employee-schedule"

type EmployeeScheduleFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule?: EmployeeScheduleRow | null
  employees: EmployeeRow[]
  onSuccess: () => void
}

const defaultValues: CreateEmployeeScheduleInput = {
  employee_id: "",
  day_of_week: 1,
  start_time: "09:00",
  end_time: "17:00",
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
] as const

export function EmployeeScheduleFormDialog({
  open,
  onOpenChange,
  schedule,
  employees,
  onSuccess,
}: EmployeeScheduleFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(schedule)

  const form = useForm<CreateEmployeeScheduleInput>({
    resolver: zodResolver(createEmployeeScheduleSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (schedule) {
      form.reset({
        employee_id: schedule.employee_id,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time.slice(0, 5),
        end_time: schedule.end_time.slice(0, 5),
      })

      return
    }

    form.reset(defaultValues)
  }, [open, schedule, form])

  async function onSubmit(values: CreateEmployeeScheduleInput) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateEmployeeSchedule({
        id: schedule!.id,
        ...values,
      })
      : await createEmployeeSchedule(values)

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
      description: isEditing ? "Schedule updated" : "Schedule created",
      priority: "high",
    })

    onOpenChange(false)
    onSuccess()
  }

  const selectedEmployee = employees.find(
    (employee) =>
      employee.id === form.watch("employee_id")
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit employee schedule"
              : "New employee schedule"}
          </DialogTitle>

          <DialogDescription>
            Set the working day and hours for an employee.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="employee-schedule"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              <Field
                data-invalid={
                  !!form.formState.errors.employee_id
                }
              >
                <FieldLabel htmlFor="schedule-employee">
                  Employee
                </FieldLabel>

                <Select
                  value={form.watch("employee_id")}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      "employee_id",
                      value,
                      { shouldDirty: true, shouldValidate: true }
                    )
                  }}
                >
                  <SelectTrigger
                    id="schedule-employee"
                    aria-invalid={
                      !!form.formState.errors.employee_id
                    }
                  >
                    <SelectValue placeholder="Select employee">
                      {selectedEmployee?.display_name ?? "Select employee"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem
                        key={employee.id}
                        value={employee.id}
                      >
                        {employee.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError
                  errors={[
                    form.formState.errors.employee_id,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.day_of_week
                }
              >
                <FieldLabel htmlFor="schedule-day">
                  Day of week
                </FieldLabel>

                <Select
                  value={String(form.watch("day_of_week"))}
                  onValueChange={(value) => {
                    form.setValue(
                      "day_of_week",
                      Number(value),
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="schedule-day"
                    aria-invalid={
                      !!form.formState.errors.day_of_week
                    }
                  >
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>

                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem
                        key={day.value}
                        value={String(day.value)}
                      >
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError
                  errors={[
                    form.formState.errors.day_of_week,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.start_time
                }
              >
                <FieldLabel htmlFor="schedule-start-time">
                  Start time
                </FieldLabel>

                <Input
                  id="schedule-start-time"
                  type="time"
                  aria-invalid={
                    !!form.formState.errors.start_time
                  }
                  {...form.register("start_time")}
                />

                <FieldError
                  errors={[
                    form.formState.errors.start_time,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.end_time
                }
              >
                <FieldLabel htmlFor="schedule-end-time">
                  End time
                </FieldLabel>

                <Input
                  id="schedule-end-time"
                  type="time"
                  aria-invalid={
                    !!form.formState.errors.end_time
                  }
                  {...form.register("end_time")}
                />

                <FieldError
                  errors={[
                    form.formState.errors.end_time,
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
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            form="employee-schedule"
            type="submit"
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
              "Create schedule"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}