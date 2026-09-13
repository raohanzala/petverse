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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

import { createServiceConsentForm } from "@/lib/supabase/mutations/service-consent-forms"
import type {
  ServiceConsentFormServiceOption,
  ServiceConsentFormTemplateOption,
} from "@/lib/supabase/types"
import {
  createServiceConsentFormSchema,
  type CreateServiceConsentFormInput,
} from "@/lib/validations/service-consent-forms"

type ServiceConsentFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  services: ServiceConsentFormServiceOption[]
  templates: ServiceConsentFormTemplateOption[]
  selectedServiceId: string
  assignedTemplateIds: string[]
  onSuccess: () => void
}

const defaultValues: CreateServiceConsentFormInput = {
  service_id: "",
  template_id: "",
}

export function ServiceConsentFormDialog({
  open,
  onOpenChange,
  services,
  templates,
  selectedServiceId,
  assignedTemplateIds,
  onSuccess,
}: ServiceConsentFormDialogProps) {
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const form =
    useForm<CreateServiceConsentFormInput>({
      resolver: zodResolver(
        createServiceConsentFormSchema
      ),
      defaultValues,
    })

  useEffect(() => {
    if (!open) return

    form.reset({
      service_id: selectedServiceId,
      template_id: "",
    })
  }, [
    open,
    selectedServiceId,
    form,
  ])

  const selectedService =
    form.watch("service_id")

  const availableTemplates =
    templates.filter(
      (template) =>
        !assignedTemplateIds.includes(
          template.id
        )
    )

  async function onSubmit(
    values: CreateServiceConsentFormInput
  ) {
    setIsSubmitting(true)

    const result =
      await createServiceConsentForm(values)

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
      description:
        "Consent form template assigned",
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
            Assign consent form
          </DialogTitle>

          <DialogDescription>
            Assign an active consent form template
            to a service.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="service-consent-form"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              <Field
                data-invalid={
                  !!form.formState.errors
                    .service_id
                }
              >
                <FieldLabel>
                  Service
                </FieldLabel>

                <Select
                  value={selectedService}
                  onValueChange={(value) => {
                    if(!value) return
                    form.setValue(
                      "service_id",
                      value,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    aria-invalid={
                      !!form.formState.errors
                        .service_id
                    }
                  >
                    <SelectValue>
                      {services.find(
                        (service) =>
                          service.id ===
                          selectedService
                      )?.name ??
                        "Select service"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem
                        key={service.id}
                        value={service.id}
                      >
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError
                  errors={[
                    form.formState.errors
                      .service_id,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors
                    .template_id
                }
              >
                <FieldLabel>
                  Consent form template
                </FieldLabel>

                <Select
                  value={form.watch(
                    "template_id"
                  )}
                  onValueChange={(value) => {
                    if(!value) return
                    form.setValue(
                      "template_id",
                      value,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    aria-invalid={
                      !!form.formState.errors
                        .template_id
                    }
                  >
                    <SelectValue>
                      {templates.find(
                        (template) =>
                          template.id ===
                          form.watch(
                            "template_id"
                          )
                      )
                        ? `${templates.find(
                            (template) =>
                              template.id ===
                              form.watch(
                                "template_id"
                              )
                          )?.name} · v${templates.find(
                            (template) =>
                              template.id ===
                              form.watch(
                                "template_id"
                              )
                          )?.version}`
                        : "Select template"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {availableTemplates.length >
                    0 ? (
                      availableTemplates.map(
                        (template) => (
                          <SelectItem
                            key={template.id}
                            value={template.id}
                          >
                            {template.name} · v
                            {template.version}
                          </SelectItem>
                        )
                      )
                    ) : (
                      <SelectItem
                        value="no-templates"
                        disabled
                      >
                        No available templates
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <FieldError
                  errors={[
                    form.formState.errors
                      .template_id,
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
            onClick={() =>
              onOpenChange(false)
            }
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              availableTemplates.length === 0
            }
            form="service-consent-form"
          >
            {isSubmitting ? (
              <>
                <Spinner
                  size="sm"
                  className="text-primary-foreground"
                />
                Assigning…
              </>
            ) : (
              "Assign template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}