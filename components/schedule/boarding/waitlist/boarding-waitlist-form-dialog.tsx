"use client"

import { useEffect, useMemo, useState } from "react"
import { useTransition } from "react"
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
  createBoardingWaitlist,
  updateBoardingWaitlist,
} from "@/lib/supabase/mutations/boarding-waitlist"

import type {
  BoardingWaitlistListRow,
  OwnerRow,
  PetRow,
} from "@/lib/supabase/types"
import { Form } from "@/components/ui/form"
import { CreateBoardingWaitlistInput, createBoardingWaitlistSchema } from "@/lib/validations/boarding-waitlist"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

type BoardingWaitlistFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry?: BoardingWaitlistListRow | null
  pets: PetRow[]
  owners: OwnerRow[]
  onSuccess: () => void
}

const defaultValues: CreateBoardingWaitlistInput = {
  pet_id: "",
  owner_id: "",
  desired_from: "",
  desired_to: ""
}

function getDefaultStart() {
  const date = new Date()

  return {
    date,
    time: date.toTimeString().slice(0, 5),
  }
}

function getDefaultEnd() {
  const date = new Date()
  date.setDate(date.getDate() + 1)

  return {
    date,
    time: date.toTimeString().slice(0, 5),
  }
}

function parseWaitlistDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return {
      date: undefined,
      time: "",
    }
  }

  return {
    date,
    time: date.toTimeString().slice(0, 5),
  }
}

function combineDateAndTime(
  date: Date,
  time: string
) {
  const [hours, minutes] = time
    .split(":")
    .map(Number)

  const result = new Date(date)

  result.setHours(
    hours || 0,
    minutes || 0,
    0,
    0
  )

  return result
}

export function BoardingWaitlistFormDialog({
  open,
  onOpenChange,
  entry,
  pets,
  owners,
  onSuccess,
}: BoardingWaitlistFormDialogProps) {
  const isEditing = Boolean(entry)

  const [petId, setPetId] = useState("")
  const [ownerId, setOwnerId] = useState("")

  const [startDate, setStartDate] = useState<
    Date | undefined
  >()

  const [startTime, setStartTime] = useState("")

  const [endDate, setEndDate] = useState<
    Date | undefined
  >()

  const [endTime, setEndTime] = useState("")

  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")

  const [isPending, startTransition] =
    useTransition()

  const form = useForm<CreateBoardingWaitlistInput>({
      resolver: zodResolver(createBoardingWaitlistSchema),
      defaultValues,
    })

  useEffect(() => {
    if (!open) return

    setError("")

    if (entry) {
      setPetId(entry.pet_id)
      setOwnerId(entry.owner_id)

      const start = parseWaitlistDateTime(
        entry.desired_from
      )

      const end = parseWaitlistDateTime(
        entry.desired_to
      )

      setStartDate(start.date)
      setStartTime(start.time)

      setEndDate(end.date)
      setEndTime(end.time)

      setNotes(entry.notes ?? "")

      return
    }

    setPetId("")
    setOwnerId("")

    const defaultStart = getDefaultStart()
    const defaultEnd = getDefaultEnd()

    setStartDate(defaultStart.date)
    setStartTime(defaultStart.time)

    setEndDate(defaultEnd.date)
    setEndTime(defaultEnd.time)

    setNotes("")
  }, [open, entry])

  useEffect(() => {
    if (!petId) return

    const selectedPet = pets.find(
      (pet) => pet.id === petId
    )

    if (!selectedPet) return

    setOwnerId(selectedPet.owner_id)
  }, [petId, pets])

  const selectedPet = useMemo(
    () =>
      pets.find(
        (pet) => pet.id === petId
      ),
    [pets, petId]
  )

  const selectedOwner = useMemo(
    () =>
      owners.find(
        (owner) => owner.id === ownerId
      ),
    [owners, ownerId]
  )

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError("")

    if (!petId) {
      setError("Please select a pet.")
      return
    }

    if (!ownerId) {
      setError("Please select an owner.")
      return
    }

    if (!startDate) {
      setError(
        "Start date is required."
      )
      return
    }

    if (!startTime) {
      setError(
        "Start time is required."
      )
      return
    }

    if (!endDate) {
      setError(
        "End date is required."
      )
      return
    }

    if (!endTime) {
      setError(
        "End time is required."
      )
      return
    }

    const desiredFrom = combineDateAndTime(
      startDate,
      startTime
    )

    const desiredTo = combineDateAndTime(
      endDate,
      endTime
    )

    if (
      Number.isNaN(
        desiredFrom.getTime()
      ) ||
      Number.isNaN(
        desiredTo.getTime()
      )
    ) {
      setError(
        "Please enter valid dates and times."
      )
      return
    }

    if (
      desiredTo.getTime() <=
      desiredFrom.getTime()
    ) {
      setError(
        "End date and time must be after the start date and time."
      )
      return
    }

    startTransition(async () => {
      try {
        if (isEditing && entry) {
          await updateBoardingWaitlist({
            id: entry.id,
            pet_id: petId,
            owner_id: ownerId,
            desired_from: desiredFrom.toISOString(),
            desired_to: desiredTo.toISOString(),
            notes: notes.trim() || undefined,
          })

          toast.add({
            type: "success",
            description: "Waitlist entry updated",
            priority: "high",
          })
        } else {
          await createBoardingWaitlist({
            pet_id: petId,
            owner_id: ownerId,
            desired_from: desiredFrom.toISOString(),
            desired_to: desiredTo.toISOString(),
            notes: notes.trim() || undefined,
          })

          toast.add({
            type: "success",
            description: "Pet added to waitlist",
            priority: "high",
          })
        }

        onOpenChange(false)
        onSuccess()
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Something went wrong"

        setError(message)
      }
    })
    if (
      Number.isNaN(desiredFrom.getTime()) ||
      Number.isNaN(desiredTo.getTime())
    ) {
      setError("Please enter valid dates and times.")
      return
    }

    if (desiredTo.getTime() <= desiredFrom.getTime()) {
      setError(
        "End date and time must be after the start date and time."
      )
      return
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
              ? "Edit waitlist entry"
              : "Add to boarding waitlist"}
          </DialogTitle>

          <DialogDescription>
            Add a pet to the boarding waitlist when
            the requested boarding availability is
            not currently available.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="boarding-waitlist"
            onSubmit={handleSubmit}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              <Field>
                <FieldLabel>
                  Pet
                </FieldLabel>

                <Select
                  value={petId}
                  onValueChange={(value) => {
                    if (value) {
                      setPetId(value)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pet">
                      {selectedPet?.name}
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
              </Field>

              <Field>
                <FieldLabel>
                  Owner
                </FieldLabel>

                <Select
                  value={ownerId}
                  onValueChange={(value) => {
                    if (value) {
                      setOwnerId(value)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner">
                      {selectedOwner?.name}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {owners.map((owner) => (
                      <SelectItem
                        key={owner.id}
                        value={owner.id}
                      >
                        {owner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  The owner is automatically selected
                  when the pet is selected.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>
                  Requested start
                </FieldLabel>

                <DatePickerTime
                  date={startDate}
                  onDateChange={setStartDate}
                  time={startTime}
                  onTimeChange={setStartTime}
                  dateLabel="Date"
                  timeLabel="Time"
                  datePlaceholder="Select date"
                />
              </Field>

              <Field>
                <FieldLabel>
                  Requested end
                </FieldLabel>

                <DatePickerTime
                  date={endDate}
                  onDateChange={setEndDate}
                  time={endTime}
                  onTimeChange={setEndTime}
                  dateLabel="Date"
                  timeLabel="Time"
                  datePlaceholder="Select date"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="waitlist-notes">
                  Notes
                </FieldLabel>

                <Textarea
                  id="waitlist-notes"
                  placeholder="Optional notes for staff."
                  rows={3}
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                />
              </Field>

              {error && (
                <FieldError>
                  {error}
                </FieldError>
              )}
            </FieldGroup>

          </form>
        </Form>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onOpenChange(false)
            }
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button
            form="boarding-waitlist"
            type="submit"
            disabled={isPending}
          >
            {isPending && (
              <Spinner
                size="sm"
                className="text-primary-foreground"
              />
            )}

            {isEditing
              ? "Save changes"
              : "Add to waitlist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}