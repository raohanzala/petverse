"use client"

import { zodResolver } from "@hookform/resolvers/zod"
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
import { Spinner } from "@/components/ui/spinner"
import {
  createCampaignBlackoutPeriod,
  updateCampaignBlackoutPeriod,
} from "@/lib/supabase/mutations/campaign-blackout-periods"
import type { CampaignBlackoutPeriodRow } from "@/lib/supabase/types"
import {
  createCampaignBlackoutPeriodSchema,
  type CreateCampaignBlackoutPeriodInput,
} from "@/lib/validations/campaign-blackout-periods"
import { DatePickerTime } from "@/components/ui/date-picker-with-time"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type CampaignBlackoutPeriodFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  period?: CampaignBlackoutPeriodRow | null
  campaigns: {
    id: string
    name: string
  }[]
  onSuccess: () => void
}

const defaultValues: CreateCampaignBlackoutPeriodInput = {
  campaign_id: "",
  starts_at: "",
  ends_at: "",
}

function parseDateTime(value: string) {
  if (!value) {
    return {
      date: undefined,
      time: "",
    }
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return {
      date: undefined,
      time: "",
    }
  }

  return {
    date,
    time: format(date, "HH:mm:ss"),
  }
}

function combineDateTime(
  date: Date | undefined,
  time: string
) {
  if (!date) return ""

  const datePart = format(date, "yyyy-MM-dd")

  const finalTime =
    time || format(new Date(), "HH:mm:ss")

  const localDateTime = `${datePart}T${finalTime}`

  return new Date(localDateTime).toISOString()
}

export function CampaignBlackoutPeriodFormDialog({
  open,
  onOpenChange,
  period,
  campaigns,
  onSuccess,
}: CampaignBlackoutPeriodFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(period)

  const form = useForm<CreateCampaignBlackoutPeriodInput>({
    resolver: zodResolver(
      createCampaignBlackoutPeriodSchema
    ),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (period) {
      form.reset({
        campaign_id: period.campaign_id,
        starts_at: period.starts_at,
        ends_at: period.ends_at,
      })
      return
    }

    form.reset(defaultValues)
  }, [open, period, form])

  async function onSubmit(
    values: CreateCampaignBlackoutPeriodInput
  ) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateCampaignBlackoutPeriod({
        id: period!.id,
        ...values,
      })
      : await createCampaignBlackoutPeriod(values)

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
        ? "Blackout period updated"
        : "Blackout period created",
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
              ? "Edit blackout period"
              : "New blackout period"}
          </DialogTitle>

          <DialogDescription>
            Prevent campaign messages from being sent during a
            specific time period.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="campaign-blackout-period"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              <Field
                data-invalid={
                  !!form.formState.errors.campaign_id
                }
              >
                <FieldLabel htmlFor="blackout-campaign">
                  Campaign
                </FieldLabel>

                <Select
                  value={form.watch("campaign_id")}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue("campaign_id", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }}
                >
                  <SelectTrigger
                    id="blackout-campaign"
                    aria-invalid={
                      !!form.formState.errors.campaign_id
                    }
                    className="w-full"
                  >
                    <SelectValue placeholder="Select campaign">
                      {campaigns.find(
                        (campaign) =>
                          campaign.id === form.watch("campaign_id")
                      )?.name ?? "Select campaign"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {campaigns.map((campaign) => (
                      <SelectItem
                        key={campaign.id}
                        value={campaign.id}
                      >
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Select the outbound campaign this blackout period
                  applies to.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.campaign_id,
                  ]}
                />
              </Field>

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
                        timeLabel="Time"
                        datePlaceholder="Select date"
                      />

                      <FieldDescription>
                        Messages will be blocked starting from this time.
                      </FieldDescription>

                      <FieldError
                        errors={[fieldState.error]}
                      />
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
                        timeLabel="Time"
                        datePlaceholder="Select date"
                      />

                      <FieldDescription>
                        Messages can resume after this time.
                      </FieldDescription>

                      <FieldError
                        errors={[fieldState.error]}
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
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            form="campaign-blackout-period"
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
              "Create blackout period"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}