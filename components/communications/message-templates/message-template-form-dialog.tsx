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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  createMessageTemplate,
  updateMessageTemplate,
} from "@/lib/supabase/mutations/message-templates"
import type { MessageTemplateRow } from "@/lib/supabase/types"
import {
  createMessageTemplateSchema,
  type CreateMessageTemplateInput,
} from "@/lib/validations/message-templates"

type MessageTemplateFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: MessageTemplateRow | null
  onSuccess: () => void
}

const defaultValues: CreateMessageTemplateInput = {
  name: "",
  channel: "whatsapp",
  body: "",
  is_active: true,
}

export function MessageTemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSuccess,
}: MessageTemplateFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(template)

  const form = useForm<CreateMessageTemplateInput>({
    resolver: zodResolver(createMessageTemplateSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (template) {
      form.reset({
        name: template.name,
        channel: template.channel,
        body: template.body,
        is_active: template.is_active,
      })
      return
    }

    form.reset(defaultValues)
  }, [open, template, form])

  async function onSubmit(values: CreateMessageTemplateInput) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateMessageTemplate({
          id: template!.id,
          ...values,
        })
      : await createMessageTemplate(values)

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
        ? "Message template updated"
        : "Message template created",
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
              ? "Edit message template"
              : "New message template"}
          </DialogTitle>

          <DialogDescription>
            Create reusable message templates for customer communications.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="message-template"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="message-template-name">
                  Name
                </FieldLabel>

                <Input
                  id="message-template-name"
                  placeholder="Appointment reminder"
                  aria-invalid={!!form.formState.errors.name}
                  {...form.register("name")}
                />

                <FieldDescription>
                  Use a clear internal name for staff to identify the template.
                </FieldDescription>

                <FieldError
                  errors={[form.formState.errors.name]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.channel}>
                <FieldLabel htmlFor="message-template-channel">
                  Channel
                </FieldLabel>

                <Input
                  id="message-template-channel"
                  placeholder="whatsapp"
                  aria-invalid={!!form.formState.errors.channel}
                  {...form.register("channel")}
                />

                <FieldDescription>
                  The communication channel used for this template.
                </FieldDescription>

                <FieldError
                  errors={[form.formState.errors.channel]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.body}>
                <FieldLabel htmlFor="message-template-body">
                  Message
                </FieldLabel>

                <Textarea
                  id="message-template-body"
                  placeholder="Hi {{owner_name}}, this is a reminder for {{pet_name}}'s appointment..."
                  rows={6}
                  aria-invalid={!!form.formState.errors.body}
                  {...form.register("body")}
                />

                <FieldDescription>
                  Write the reusable message content. Template variables can
                  be added here for future provider integration.
                </FieldDescription>

                <FieldError
                  errors={[form.formState.errors.body]}
                />
              </Field>

              <Field orientation="horizontal">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel htmlFor="message-template-active">
                    Active
                  </FieldLabel>

                  <FieldDescription>
                    Inactive templates will not be available for messaging
                    and outbound campaigns.
                  </FieldDescription>
                </div>

                <Switch
                  id="message-template-active"
                  checked={form.watch("is_active")}
                  onCheckedChange={(checked) =>
                    form.setValue("is_active", checked, {
                      shouldDirty: true,
                    })
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
            form="message-template"
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
              "Create template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}