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
  createServicePackage,
  updateServicePackage,
} from "@/lib/supabase/mutations/service-packages"
import type { ServicePackageRow } from "@/lib/supabase/types"
import {
  createServicePackageSchema,
  type CreateServicePackageInput,
} from "@/lib/validations/service-package"

type ServicePackageFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  servicePackage?: ServicePackageRow | null
  onSuccess: () => void
}

const defaultValues: CreateServicePackageInput = {
  name: "",
  description: "",
  price: 0,
  duration_minutes: 30,
  step_mode: "sequential",
  is_active: true,
}

export function ServicePackageFormDialog({
  open,
  onOpenChange,
  servicePackage,
  onSuccess,
}: ServicePackageFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(servicePackage)

  const form = useForm<CreateServicePackageInput>({
    resolver: zodResolver(createServicePackageSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (servicePackage) {
      form.reset({
        name: servicePackage.name,
        description: servicePackage.description ?? "",
        price: servicePackage.price,
        duration_minutes: servicePackage.duration_minutes,
        step_mode: servicePackage.step_mode,
        is_active: servicePackage.is_active,
      })
      return
    }

    form.reset(defaultValues)
  }, [open, servicePackage, form])

  async function onSubmit(values: CreateServicePackageInput) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateServicePackage({
        id: servicePackage!.id,
        ...values,
      })
      : await createServicePackage(values)

    setIsSubmitting(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(
      isEditing
        ? "Package updated"
        : "Package created"
    )

    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit package" : "New package"}
          </DialogTitle>

          <DialogDescription>
            Create a service package that combines multiple service steps.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="service-package"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="package-name">
                  Name
                </FieldLabel>

                <Input
                  id="package-name"
                  placeholder="Full Grooming Package"
                  aria-invalid={!!form.formState.errors.name}
                  {...form.register("name")}
                />

                <FieldError
                  errors={[form.formState.errors.name]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.description
                }
              >
                <FieldLabel htmlFor="package-description">
                  Description
                </FieldLabel>

                <Textarea
                  id="package-description"
                  placeholder="Optional short description for staff and booking."
                  rows={3}
                  aria-invalid={
                    !!form.formState.errors.description
                  }
                  {...form.register("description")}
                />

                <FieldError
                  errors={[
                    form.formState.errors.description,
                  ]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.price}>
                <FieldLabel htmlFor="package-price">
                  Price
                </FieldLabel>

                <Input
                  id="package-price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="5000"
                  aria-invalid={!!form.formState.errors.price}
                  {...form.register("price", {
                    valueAsNumber: true,
                  })}
                />

                <FieldDescription>
                  Total price of the package.
                </FieldDescription>

                <FieldError
                  errors={[form.formState.errors.price]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.duration_minutes
                }
              >
                <FieldLabel htmlFor="package-duration">
                  Duration
                </FieldLabel>

                <Input
                  id="package-duration"
                  type="number"
                  min={1}
                  placeholder="120"
                  aria-invalid={
                    !!form.formState.errors.duration_minutes
                  }
                  {...form.register("duration_minutes", {
                    valueAsNumber: true,
                  })}
                />

                <FieldDescription>
                  Total package duration in minutes.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.duration_minutes,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.step_mode
                }
              >
                <FieldLabel htmlFor="package-step-mode">
                  Step mode
                </FieldLabel>

                <Select
                  value={form.watch("step_mode")}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      "step_mode",
                      value as CreateServicePackageInput["step_mode"],
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="package-step-mode"
                    className="w-full"
                    aria-invalid={
                      !!form.formState.errors.step_mode
                    }
                  >
                    <SelectValue placeholder="Select step mode" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="sequential">
                      Sequential
                    </SelectItem>

                    <SelectItem value="parallel">
                      Parallel
                    </SelectItem>
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Sequential runs steps one after another.
                  Parallel allows steps to run at the same time.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.step_mode,
                  ]}
                />
              </Field>

              <Field orientation="horizontal">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel htmlFor="package-active">
                    Active
                  </FieldLabel>

                  <FieldDescription>
                    Inactive packages are hidden from public
                    booking.
                  </FieldDescription>
                </div>

                <Switch
                  id="package-active"
                  checked={form.watch("is_active")}
                  onCheckedChange={(checked) =>
                    form.setValue(
                      "is_active",
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
            form="service-package"
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
              "Create package"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}