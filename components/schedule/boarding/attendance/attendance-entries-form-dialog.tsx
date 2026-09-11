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
  createAttendanceEntry,
  updateAttendanceEntry,
} from "@/lib/supabase/mutations/attendance-entries"
import type {
  AttendanceEntryRow,
  AttendanceEntryType,
  ReservationRow,
} from "@/lib/supabase/types"
import {
  createAttendanceEntrySchema,
  type CreateAttendanceEntryInput,
} from "@/lib/validations/attendance-entries"

type AttendanceEntryFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry?: AttendanceEntryRow | null
  reservations: ReservationRow[]
  onSuccess: () => void
}

const defaultValues: CreateAttendanceEntryInput = {
  reservation_id: "",
  type: "check_in",
  recorded_by: null,
  flags: [],
  notes: "",
}

const ATTENDANCE_TYPE_LABELS: Record<
  AttendanceEntryType,
  string
> = {
  check_in: "Check In",
  check_out: "Check Out",
  note: "Note",
  incident: "Incident"
}

export function AttendanceEntryFormDialog({
  open,
  onOpenChange,
  entry,
  reservations,
  onSuccess,
}: AttendanceEntryFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [flagsInput, setFlagsInput] = useState("")

  const isEditing = Boolean(entry)

  const form = useForm<CreateAttendanceEntryInput>({
    resolver: zodResolver(createAttendanceEntrySchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (entry) {
      form.reset({
        reservation_id: entry.reservation_id,
        type: entry.type,
        recorded_by: entry.recorded_by,
        flags: entry.flags,
        notes: entry.notes ?? "",
      })

      setFlagsInput(entry.flags.join(", "))
      return
    }

    form.reset({
      ...defaultValues
    })

    setFlagsInput("")
  }, [open, entry, form])

  async function onSubmit(
    values: CreateAttendanceEntryInput
  ) {
    setIsSubmitting(true)

    const flags = flagsInput
      .split(",")
      .map((flag) => flag.trim())
      .filter(Boolean)

    const payload = {
      ...values,
      flags,
    }

    const result = isEditing
      ? await updateAttendanceEntry({
        id: entry!.id,
        ...payload,
      })
      : await createAttendanceEntry(payload)

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
        ? "Attendance entry updated"
        : "Attendance entry created",
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
            {isEditing
              ? "Edit attendance entry"
              : "New attendance entry"}
          </DialogTitle>

          <DialogDescription>
            Record an attendance event, note, or incident for this
            reservation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="attendance-entry"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              <Field
                data-invalid={
                  !!form.formState.errors.reservation_id
                }
              >
                <FieldLabel htmlFor="attendance-reservation">
                  Reservation
                </FieldLabel>

                <Select
                  value={form.watch("reservation_id")}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      "reservation_id",
                      value,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                  disabled={isEditing}
                >
                  <SelectTrigger
                    id="attendance-reservation"
                    aria-invalid={
                      !!form.formState.errors.reservation_id
                    }
                  >
                    <SelectValue placeholder="Select reservation" />
                  </SelectTrigger>

                  <SelectContent>
                    {reservations.map((reservation) => (
                      <SelectItem
                        key={reservation.id}
                        value={reservation.id}
                      >
                        {reservation.pet?.name ?? "Unknown pet"} —{" "}
                        {reservation.owner?.name ?? "Unknown owner"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Select the reservation this attendance entry belongs to.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.reservation_id,
                  ]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.type}>
                <FieldLabel htmlFor="attendance-type">
                  Type
                </FieldLabel>

                <Select
                  value={form.watch("type")}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      "type",
                      value as AttendanceEntryType,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="attendance-type"
                    aria-invalid={!!form.formState.errors.type}
                  >
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="check_in">
                      {ATTENDANCE_TYPE_LABELS.check_in}
                    </SelectItem>

                    <SelectItem value="check_out">
                      {ATTENDANCE_TYPE_LABELS.check_out}
                    </SelectItem>

                    <SelectItem value="note">
                      {ATTENDANCE_TYPE_LABELS.note}
                    </SelectItem>

                    <SelectItem value="incident">
                      {ATTENDANCE_TYPE_LABELS.incident}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Select what happened during the reservation.
                </FieldDescription>

                <FieldError
                  errors={[form.formState.errors.type]}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="attendance-flags">
                  Flags
                </FieldLabel>

                <Input
                  id="attendance-flags"
                  placeholder="late, medication, special-care"
                  value={flagsInput}
                  onChange={(event) =>
                    setFlagsInput(event.target.value)
                  }
                />

                <FieldDescription>
                  Add multiple flags separated by commas.
                </FieldDescription>
              </Field>

              <Field
                data-invalid={!!form.formState.errors.notes}
              >
                <FieldLabel htmlFor="attendance-notes">
                  Notes
                </FieldLabel>

                <Textarea
                  id="attendance-notes"
                  placeholder="Add any relevant details..."
                  rows={4}
                  aria-invalid={!!form.formState.errors.notes}
                  {...form.register("notes")}
                />

                <FieldDescription>
                  Optional details about this attendance event.
                </FieldDescription>

                <FieldError
                  errors={[form.formState.errors.notes]}
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
            form="attendance-entry"
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
              "Create entry"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}