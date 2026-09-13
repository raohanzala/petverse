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
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createOutboundCampaign,
  updateOutboundCampaign,
} from "@/lib/supabase/mutations/outbound-campaigns"
import type { OutboundCampaignRow } from "@/lib/supabase/types"
import {
  createOutboundCampaignSchema,
  type CreateOutboundCampaignInput,
} from "@/lib/validations/outbound-campaigns"
import { format } from "date-fns"
import { DatePickerTime } from "@/components/ui/date-picker-with-time"

type OutboundCampaignFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign?: OutboundCampaignRow | null
  onSuccess: () => void
}

const defaultValues: CreateOutboundCampaignInput = {
  name: "",
  channel: "whatsapp",
  status: "draft",
  scheduled_at: null,
}

export function OutboundCampaignFormDialog({
  open,
  onOpenChange,
  campaign,
  onSuccess,
}: OutboundCampaignFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(campaign)

  const form = useForm<CreateOutboundCampaignInput>({
    resolver: zodResolver(createOutboundCampaignSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (campaign) {
      form.reset({
        name: campaign.name,
        channel: campaign.channel,
        status: campaign.status,
        scheduled_at: campaign.scheduled_at,
      })
      return
    }

    form.reset(defaultValues)
  }, [open, campaign, form])

  async function onSubmit(
    values: CreateOutboundCampaignInput
  ) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateOutboundCampaign({
        id: campaign!.id,
        ...values,
      })
      : await createOutboundCampaign(values)

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
        ? "Campaign updated"
        : "Campaign created",
      priority: "high",
    })

    onOpenChange(false)
    onSuccess()
  }

  function parseDateTime(value: string | null) {
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
    if (!date) return null

    const datePart = format(date, "yyyy-MM-dd")

    const finalTime =
      time || format(new Date(), "HH:mm:ss")

    const localDateTime = `${datePart}T${finalTime}`

    return new Date(localDateTime).toISOString()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit campaign"
              : "New campaign"}
          </DialogTitle>

          <DialogDescription>
            Create an outbound campaign for customer communications.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="outbound-campaign"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              <Field
                data-invalid={
                  !!form.formState.errors.name
                }
              >
                <FieldLabel htmlFor="campaign-name">
                  Name
                </FieldLabel>

                <Input
                  id="campaign-name"
                  placeholder="September vaccination reminder"
                  aria-invalid={
                    !!form.formState.errors.name
                  }
                  {...form.register("name")}
                />

                <FieldError
                  errors={[
                    form.formState.errors.name,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.channel
                }
              >
                <FieldLabel htmlFor="campaign-channel">
                  Channel
                </FieldLabel>

                <Select
                  value={form.watch("channel")}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      "channel",
                      value,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="campaign-channel"
                    aria-invalid={
                      !!form.formState.errors.channel
                    }
                  >
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="whatsapp">
                      WhatsApp
                    </SelectItem>

                    <SelectItem value="sms">
                      SMS
                    </SelectItem>

                    <SelectItem value="email">
                      Email
                    </SelectItem>
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Choose the communication channel for this campaign.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.channel,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.status
                }
              >
                <FieldLabel htmlFor="campaign-status">
                  Status
                </FieldLabel>

                <Select
                  value={form.watch("status")}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      "status",
                      value as CreateOutboundCampaignInput["status"],
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="campaign-status"
                    aria-invalid={
                      !!form.formState.errors.status
                    }
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="draft">
                      Draft
                    </SelectItem>

                    <SelectItem value="scheduled">
                      Scheduled
                    </SelectItem>

                    <SelectItem value="running">
                      Running
                    </SelectItem>

                    <SelectItem value="completed">
                      Completed
                    </SelectItem>

                    <SelectItem value="cancelled">
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Set the current lifecycle status of the campaign.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.status,
                  ]}
                />
              </Field>

              <Controller
                control={form.control}
                name="scheduled_at"
                render={({ field, fieldState }) => {
                  const { date, time } = parseDateTime(field.value || null)

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <DatePickerTime
                        date={date}
                        onDateChange={(selectedDate) => {
                          if (!selectedDate) {
                            field.onChange(null)
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
                            parseDateTime(field.value || null).date

                          field.onChange(
                            combineDateTime(
                              currentDate,
                              selectedTime
                            )
                          )
                        }}
                        dateLabel="Scheduled date"
                        timeLabel="Time"
                        datePlaceholder="Select date"
                      />

                      <FieldDescription>
                        Optional. Set this when the campaign should be
                        scheduled for a specific date and time.
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
            form="outbound-campaign"
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
              "Create campaign"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}