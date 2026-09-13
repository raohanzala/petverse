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
  createConsentFormTemplate,
  updateConsentFormTemplate,
} from "@/lib/supabase/mutations/consent-form-templates"
import type { ConsentFormTemplateRow } from "@/lib/supabase/types"
import {
  createConsentFormTemplateSchema,
  type CreateConsentFormTemplateInput,
} from "@/lib/validations/consent-form-templates"

type ConsentFormTemplateFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: ConsentFormTemplateRow | null
  onSuccess: () => void
}

const defaultValues: CreateConsentFormTemplateInput = {
  name: "",
  body_html: "",
  version: 1,
  is_active: true,
}

export function ConsentFormTemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSuccess,
}: ConsentFormTemplateFormDialogProps) {
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const isEditing = Boolean(template)

  const form =
    useForm<CreateConsentFormTemplateInput>({
      resolver: zodResolver(
        createConsentFormTemplateSchema
      ),
      defaultValues,
    })

  useEffect(() => {
    if (!open) return

    if (template) {
      form.reset({
        name: template.name,
        body_html: template.body_html,
        version: template.version,
        is_active: template.is_active,
      })

      return
    }

    form.reset(defaultValues)
  }, [open, template, form])

  async function onSubmit(
    values: CreateConsentFormTemplateInput
  ) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateConsentFormTemplate({
          id: template!.id,
          ...values,
        })
      : await createConsentFormTemplate(values)

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
        ? "Consent form template updated"
        : "Consent form template created",
      priority: "high",
    })

    onOpenChange(false)
    onSuccess()
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
              ? "Edit consent form template"
              : "New consent form template"}
          </DialogTitle>

          <DialogDescription>
            Create a reusable consent form template
            for services and appointments.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="consent-form-template"
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
                <FieldLabel htmlFor="template-name">
                  Name
                </FieldLabel>

                <Input
                  id="template-name"
                  placeholder="General treatment consent"
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
                  !!form.formState.errors.body_html
                }
              >
                <FieldLabel htmlFor="template-body">
                  Body HTML
                </FieldLabel>

                <Textarea
                  id="template-body"
                  placeholder="<h2>Consent Form</h2><p>...</p>"
                  rows={10}
                  aria-invalid={
                    !!form.formState.errors.body_html
                  }
                  {...form.register("body_html")}
                />

                <FieldDescription>
                  Enter the HTML content that will be
                  used when this consent form is
                  presented to the client.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .body_html,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.version
                }
              >
                <FieldLabel htmlFor="template-version">
                  Version
                </FieldLabel>

                <Input
                  id="template-version"
                  type="number"
                  min={1}
                  aria-invalid={
                    !!form.formState.errors.version
                  }
                  {...form.register("version", {
                    valueAsNumber: true,
                  })}
                />

                <FieldDescription>
                  Use a new version number when the
                  consent form content changes.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.version,
                  ]}
                />
              </Field>

              <Field orientation="horizontal">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel htmlFor="template-active">
                    Active
                  </FieldLabel>

                  <FieldDescription>
                    Inactive templates are hidden from
                    template selection.
                  </FieldDescription>
                </div>

                <Switch
                  id="template-active"
                  checked={form.watch(
                    "is_active"
                  )}
                  onCheckedChange={(checked) =>
                    form.setValue(
                      "is_active",
                      checked,
                      {
                        shouldDirty: true,
                      }
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
            onClick={() =>
              onOpenChange(false)
            }
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            form="consent-form-template"
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