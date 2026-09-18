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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createCampaignContact,
  updateCampaignContact,
} from "@/lib/supabase/mutations/campaign-contacts"
import type {
  CampaignContactRow,
  CampaignContactStatus,
} from "@/lib/supabase/types"
import {
  createCampaignContactSchema,
  type CreateCampaignContactInput,
} from "@/lib/validations/campaign-contacts"
import { format } from "date-fns"
import { DatePickerTime } from "@/components/ui/date-picker-with-time"
import { parseDateTime } from "@/lib/utils"

type CampaignContactFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: CampaignContactRow | null
  campaigns: {
    id: string
    name: string
  }[]
  owners: {
    id: string
    name: string
  }[]
  onSuccess: () => void
}

const defaultValues: CreateCampaignContactInput = {
  campaign_id: "",
  owner_id: "",
  status: "pending",
  sent_at: null,
}

const STATUS_OPTIONS: {
  value: CampaignContactStatus
  label: string
}[] = [
    {
      value: "pending",
      label: "Pending",
    },
    {
      value: "sent",
      label: "Sent",
    },
    {
      value: "delivered",
      label: "Delivered",
    },
    {
      value: "failed",
      label: "Failed",
    },
    {
      value: "unsubscribed",
      label: "Unsubscribed",
    },
  ]

export function CampaignContactFormDialog({
  open,
  onOpenChange,
  contact,
  campaigns,
  owners,
  onSuccess,
}: CampaignContactFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(contact)

  const form = useForm<CreateCampaignContactInput>({
    resolver: zodResolver(createCampaignContactSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (contact) {
      form.reset({
        campaign_id: contact.campaign_id,
        owner_id: contact.owner_id,
        status: contact.status,
        sent_at: contact.sent_at,
      })
      return
    }

    form.reset(defaultValues)
  }, [open, contact, form])

  async function onSubmit(
    values: CreateCampaignContactInput
  ) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateCampaignContact({
        id: contact!.id,
        ...values,
      })
      : await createCampaignContact(values)

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
        ? "Campaign contact updated"
        : "Campaign contact created",
      priority: "high",
    })

    onOpenChange(false)
    onSuccess()
  }

  const selectedCampaignId = form.watch("campaign_id")

  const selectedCampaign = campaigns.find(
    (campaign) => campaign.id === selectedCampaignId
  )

  const selectedOwnerId = form.watch("owner_id")

  const selectedOwner = owners.find(
    (owner) => owner.id === selectedOwnerId
  )

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
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit campaign contact"
              : "New campaign contact"}
          </DialogTitle>

          <DialogDescription>
            Add an owner to an outbound campaign and track their delivery
            status.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="campaign-contact"
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
                <FieldLabel htmlFor="campaign-contact-campaign">
                  Campaign
                </FieldLabel>

                <Select
                  value={form.watch("campaign_id")}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      "campaign_id",
                      value,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="campaign-contact-campaign"
                    aria-invalid={
                      !!form.formState.errors.campaign_id
                    }
                  >
                    <SelectValue placeholder="Select campaign">
                      {selectedCampaign?.name ?? "Select campaign"}
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
                  Select the outbound campaign this owner belongs to.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.campaign_id,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.owner_id
                }
              >
                <FieldLabel htmlFor="campaign-contact-owner">
                  Owner
                </FieldLabel>

                <Select
                  value={form.watch("owner_id")}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      "owner_id",
                      value,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="campaign-contact-owner"
                    aria-invalid={
                      !!form.formState.errors.owner_id
                    }
                  >
                    <SelectValue placeholder="Select owner">
                      {selectedOwner?.name ?? "Select owner"}
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
                  Select the owner who should receive the campaign.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.owner_id,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.status
                }
              >
                <FieldLabel htmlFor="campaign-contact-status">
                  Status
                </FieldLabel>

                <Select
                  value={form.watch("status")}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      "status",
                      value as CampaignContactStatus,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="campaign-contact-status"
                    aria-invalid={
                      !!form.formState.errors.status
                    }
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Track the current delivery status of this campaign contact.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.status,
                  ]}
                />
              </Field>

              <Controller
                control={form.control}
                name="sent_at"
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
                        dateLabel="Sent date"
                        timeLabel="Time"
                        datePlaceholder="Select date"
                      />

                      <FieldDescription>
                        Optional. Record when the campaign message was sent.
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
            form="campaign-contact"
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
              "Create contact"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}