"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "@/components/ui/toast"

import { DatePicker } from "@/components/ui/date-picker"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createConversation,
  updateConversation,
} from "@/lib/supabase/mutations/conversations"
import type {
    ConversationEmployeeOption,
  ConversationRow,
  ConversationStage,
} from "@/lib/supabase/types"
import {
  createConversationSchema,
  type CreateConversationInput,
} from "@/lib/validations/conversations"

type ConversationOwnerOption = {
  id: string
  name: string
}

type ConversationFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversation?: ConversationRow | null
  owners: ConversationOwnerOption[]
  employees: ConversationEmployeeOption[]
  onSuccess: () => void
}

const STAGE_OPTIONS: {
  value: ConversationStage
  label: string
}[] = [
  {
    value: "inquiry",
    label: "Inquiry",
  },
  {
    value: "engaged",
    label: "Engaged",
  },
  {
    value: "quoted",
    label: "Quoted",
  },
  {
    value: "booked",
    label: "Booked",
  },
  {
    value: "visited",
    label: "Visited",
  },
  {
    value: "closed_lost",
    label: "Closed lost",
  },
  {
    value: "closed_won",
    label: "Closed won",
  },
]

const defaultValues: CreateConversationInput = {
  owner_id: null,
  channel: "whatsapp",
  external_id: null,
  stage: "inquiry",
  closed_lost_reason: null,
  quoted_amount: null,
  lost_revenue: null,
  assigned_employee_id: null,
  first_staff_response_at: null,
  ai_handled: false,
}

export function ConversationFormDialog({
  open,
  onOpenChange,
  conversation,
  owners,
  employees,
  onSuccess,
}: ConversationFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(conversation)

  const form = useForm<CreateConversationInput>({
    resolver: zodResolver(createConversationSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (conversation) {
      form.reset({
        owner_id: conversation.owner_id,
        channel: conversation.channel,
        external_id: conversation.external_id,
        stage: conversation.stage,
        closed_lost_reason:
          conversation.closed_lost_reason,
        quoted_amount: conversation.quoted_amount,
        lost_revenue: conversation.lost_revenue,
        assigned_employee_id:
          conversation.assigned_employee_id,
        first_staff_response_at:
          conversation.first_staff_response_at,
        ai_handled: conversation.ai_handled,
      })

      return
    }

    form.reset(defaultValues)
  }, [open, conversation, form])

  async function onSubmit(values: CreateConversationInput) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateConversation({
          id: conversation!.id,
          ...values,
        })
      : await createConversation(values)

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
        ? "Conversation updated"
        : "Conversation created",
      priority: "high",
    })

    onOpenChange(false)
    onSuccess()
  }

  const firstStaffResponse = form.watch(
    "first_staff_response_at"
  )

  const firstStaffResponseDate = firstStaffResponse
    ? new Date(firstStaffResponse)
    : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit conversation"
              : "New conversation"}
          </DialogTitle>

          <DialogDescription>
            Manage the WhatsApp conversation stage,
            assignment, quote, and outcome.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="conversation"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              <Field
                data-invalid={
                  !!form.formState.errors.channel
                }
              >
                <FieldLabel htmlFor="conversation-channel">
                  Channel
                </FieldLabel>

                <Input
                  id="conversation-channel"
                  placeholder="whatsapp"
                  aria-invalid={
                    !!form.formState.errors.channel
                  }
                  {...form.register("channel")}
                />

                <FieldDescription>
                  The communication channel for this
                  conversation.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.channel,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.stage
                }
              >
                <FieldLabel>
                  Stage
                </FieldLabel>

                <Select
                  value={form.watch("stage")}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      "stage",
                      value as ConversationStage,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={
                      !!form.formState.errors.stage
                    }
                  >
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>

                  <SelectContent>
                    {STAGE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError
                  errors={[
                    form.formState.errors.stage,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.owner_id
                }
              >
                <FieldLabel>
                  Owner
                </FieldLabel>

                <Select
                  value={form.watch("owner_id") ?? ""}
                  onValueChange={(value) => {
                    form.setValue(
                      "owner_id",
                      value || null,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={
                      !!form.formState.errors.owner_id
                    }
                  >
                    <SelectValue placeholder="Select owner" />
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
                  Match the conversation to an existing
                  owner.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.owner_id,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors
                    .assigned_employee_id
                }
              >
                <FieldLabel>
                  Assigned staff
                </FieldLabel>

                <Select
                  value={
                    form.watch(
                      "assigned_employee_id"
                    ) ?? ""
                  }
                  onValueChange={(value) => {
                    form.setValue(
                      "assigned_employee_id",
                      value || null,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={
                      !!form.formState.errors
                        .assigned_employee_id
                    }
                  >
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>

                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem
                        key={employee.id}
                        value={employee.id}
                      >
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Staff member responsible for this
                  conversation.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .assigned_employee_id,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.quoted_amount
                }
              >
                <FieldLabel htmlFor="conversation-quoted-amount">
                  Quoted amount
                </FieldLabel>

                <Input
                  id="conversation-quoted-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  aria-invalid={
                    !!form.formState.errors.quoted_amount
                  }
                  {...form.register("quoted_amount", {
                    setValueAs: (value) =>
                      value === ""
                        ? null
                        : Number(value),
                  })}
                />

                <FieldDescription>
                  Optional amount quoted to the customer.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .quoted_amount,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.lost_revenue
                }
              >
                <FieldLabel htmlFor="conversation-lost-revenue">
                  Lost revenue
                </FieldLabel>

                <Input
                  id="conversation-lost-revenue"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  aria-invalid={
                    !!form.formState.errors.lost_revenue
                  }
                  {...form.register("lost_revenue", {
                    setValueAs: (value) =>
                      value === ""
                        ? null
                        : Number(value),
                  })}
                />

                <FieldDescription>
                  Revenue lost when the conversation is
                  marked as closed lost.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .lost_revenue,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors
                    .closed_lost_reason
                }
              >
                <FieldLabel htmlFor="conversation-closed-lost-reason">
                  Closed lost reason
                </FieldLabel>

                <Textarea
                  id="conversation-closed-lost-reason"
                  placeholder="Why was the conversation lost?"
                  rows={3}
                  aria-invalid={
                    !!form.formState.errors
                      .closed_lost_reason
                  }
                  {...form.register(
                    "closed_lost_reason"
                  )}
                />

                <FieldError
                  errors={[
                    form.formState.errors
                      .closed_lost_reason,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors
                    .first_staff_response_at
                }
              >
                <FieldLabel>
                  First staff response
                </FieldLabel>

                <DatePicker
                  date={firstStaffResponseDate}
                  onDateChange={(date) => {
                    form.setValue(
                      "first_staff_response_at",
                      date
                        ? date.toISOString()
                        : null,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                  placeholder="Pick response date"
                />

                <FieldDescription>
                  Date when staff first responded to the
                  conversation.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .first_staff_response_at,
                  ]}
                />
              </Field>

              <Field orientation="horizontal">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel htmlFor="conversation-ai-handled">
                    AI handled
                  </FieldLabel>

                  <FieldDescription>
                    Mark whether AI handled the
                    conversation without staff intervention.
                  </FieldDescription>
                </div>

                <Switch
                  id="conversation-ai-handled"
                  checked={form.watch("ai_handled")}
                  onCheckedChange={(checked) =>
                    form.setValue(
                      "ai_handled",
                      checked,
                      { shouldDirty: true }
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
            form="conversation"
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
              "Create conversation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}