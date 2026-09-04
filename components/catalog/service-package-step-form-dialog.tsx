"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

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
  createServicePackageStep,
  updateServicePackageStep,
} from "@/lib/supabase/mutations/service-package-steps"
import type {
  ServicePackageStepListRow,
} from "@/lib/supabase/types"
import {
  createServicePackageStepSchema,
  type CreateServicePackageStepInput,
} from "@/lib/validations/service-package-step"

type ServicePackageStepFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  step?: ServicePackageStepListRow | null
  packages: {
    id: number
    name: string
  }[]
  services: {
    id: string
    name: string
  }[]
  onSuccess: () => void
}

const defaultValues: CreateServicePackageStepInput = {
  package_id: 0,
  service_id: "",
  step_order: 1,
  parallel_group: null,
  override_duration_minutes: null,
  override_price: null,
}

export function ServicePackageStepFormDialog({
  open,
  onOpenChange,
  step,
  packages,
  services,
  onSuccess,
}: ServicePackageStepFormDialogProps) {
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const isEditing = Boolean(step)

  const form = useForm<CreateServicePackageStepInput>({
    resolver: zodResolver(
      createServicePackageStepSchema
    ),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (step) {
      form.reset({
        package_id: step.package_id,
        service_id: step.service_id,
        step_order: step.step_order,
        parallel_group: step.parallel_group,
        override_duration_minutes:
          step.override_duration_minutes,
        override_price: step.override_price,
      })

      return
    }

    form.reset(defaultValues)
  }, [open, step, form])

  async function onSubmit(
    values: CreateServicePackageStepInput
  ) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateServicePackageStep({
        id: step!.id,
        ...values,
      })
      : await createServicePackageStep(values)

    setIsSubmitting(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(
      isEditing
        ? "Package step updated"
        : "Package step created"
    )

    onOpenChange(false)
    onSuccess()
  }

  const selectedService = services.find(
    (service) => service.id === form.watch("service_id")
  )

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit package step"
              : "New package step"}
          </DialogTitle>

          <DialogDescription>
            Add a service to a package and define its
            execution order and optional overrides.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-5 h-100 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <FieldGroup>
              <Field
                data-invalid={
                  !!form.formState.errors.package_id
                }
              >
                <FieldLabel htmlFor="package-step-package">
                  Package
                </FieldLabel>

                <Select
                  value={
                    form.watch("package_id")
                      ? String(
                        form.watch("package_id")
                      )
                      : ""
                  }
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      "package_id",
                      Number(value),
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="package-step-package"
                    aria-invalid={
                      !!form.formState.errors.package_id
                    }
                  >
                    <SelectValue placeholder="Select package" />
                  </SelectTrigger>

                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem
                        key={pkg.id}
                        value={String(pkg.id)}
                      >
                        {pkg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError
                  errors={[
                    form.formState.errors.package_id,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.service_id
                }
              >
                <FieldLabel htmlFor="package-step-service">
                  Service
                </FieldLabel>

                <Select
                  value={form.watch("service_id")}
                  onValueChange={(value) => {
                    if (!value) return

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
                    id="package-step-service"
                    aria-invalid={
                      !!form.formState.errors.service_id
                    }
                  >
                    <SelectValue placeholder="Select service">
                      {selectedService?.name ?? "Select service"}
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
                    form.formState.errors.service_id,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.step_order
                }
              >
                <FieldLabel htmlFor="package-step-order">
                  Step order
                </FieldLabel>

                <Input
                  id="package-step-order"
                  type="number"
                  min={1}
                  aria-invalid={
                    !!form.formState.errors.step_order
                  }
                  {...form.register("step_order", {
                    valueAsNumber: true,
                  })}
                />

                <FieldDescription>
                  Determines the order in which this
                  service appears in the package.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.step_order,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.parallel_group
                }
              >
                <FieldLabel htmlFor="package-step-parallel-group">
                  Parallel group
                </FieldLabel>

                <Input
                  id="package-step-parallel-group"
                  type="number"
                  min={1}
                  placeholder="Optional"
                  aria-invalid={
                    !!form.formState.errors.parallel_group
                  }
                  {...form.register(
                    "parallel_group",
                    {
                      setValueAs: (value) =>
                        value === ""
                          ? null
                          : Number(value),
                    }
                  )}
                />

                <FieldDescription>
                  Use the same group number for services
                  that can run in parallel.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .parallel_group,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors
                    .override_duration_minutes
                }
              >
                <FieldLabel htmlFor="package-step-duration">
                  Duration override
                </FieldLabel>

                <Input
                  id="package-step-duration"
                  type="number"
                  min={1}
                  placeholder="Optional"
                  aria-invalid={
                    !!form.formState.errors
                      .override_duration_minutes
                  }
                  {...form.register(
                    "override_duration_minutes",
                    {
                      setValueAs: (value) =>
                        value === ""
                          ? null
                          : Number(value),
                    }
                  )}
                />

                <FieldDescription>
                  Leave empty to use the service's default
                  duration.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .override_duration_minutes,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors
                    .override_price
                }
              >
                <FieldLabel htmlFor="package-step-price">
                  Price override
                </FieldLabel>

                <Input
                  id="package-step-price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Optional"
                  aria-invalid={
                    !!form.formState.errors
                      .override_price
                  }
                  {...form.register(
                    "override_price",
                    {
                      setValueAs: (value) =>
                        value === ""
                          ? null
                          : Number(value),
                    }
                  )}
                />

                <FieldDescription>
                  Leave empty to use the service's default
                  price.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .override_price,
                  ]}
                />
              </Field>
            </FieldGroup>

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
                  "Create package step"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}