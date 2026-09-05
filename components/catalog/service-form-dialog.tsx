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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  createService,
  updateService,
} from "@/lib/supabase/mutations/services"
import type { ServiceRow } from "@/lib/supabase/types"
import {
  createServiceSchema,
  type CreateServiceInput,
} from "@/lib/validations/service"
import { SERVICE_KINDS } from "@/lib/constants/service-filters"

type ServiceFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  service?: ServiceRow | null
  categories: {
    id: string
    name: string
  }[]
  onSuccess: () => void
}

const defaultValues: CreateServiceInput = {
  category_id: null,
  name: "",
  description: "",
  kind: "other",
  duration_minutes: 30,
  price: 0,
  is_active: true,
  is_public: true,
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
  categories,
  onSuccess,
}: ServiceFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = Boolean(service)

  const form = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (service) {
      form.reset({
        category_id: service.category_id,
        name: service.name,
        description: service.description ?? "",
        kind: service.kind,
        duration_minutes: service.duration_minutes,
        price: service.price,
        is_active: service.is_active,
        is_public: service.is_public,
      })

      return
    }

    form.reset(defaultValues)
  }, [open, service, form])

  async function onSubmit(values: CreateServiceInput) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateService({
        id: service!.id,
        ...values,
      })
      : await createService(values)

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
      description: isEditing ? "Service updated" : "Service created",
      priority: "high",
    })
    onOpenChange(false)
    onSuccess()
  }

  const selectedCategory = categories.find(
    (category) => category.id === form.watch("category_id")
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit service" : "New service"}
          </DialogTitle>

          <DialogDescription>
            Add a service that can be offered to customers.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="services"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              {/* Category */}
              <Field
                data-invalid={
                  !!form.formState.errors.category_id
                }
              >
                <FieldLabel htmlFor="service-category">
                  Category
                </FieldLabel>

                <Select
                  value={form.watch("category_id") ?? "none"}
                  onValueChange={(value) => {
                    form.setValue(
                      "category_id",
                      value === "none" ? null : value,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="service-category"
                    aria-invalid={
                      !!form.formState.errors.category_id
                    }
                  >
                    <SelectValue placeholder="Select category">
                      {selectedCategory?.name ?? "No category"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="none">
                      No category
                    </SelectItem>

                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError
                  errors={[
                    form.formState.errors.category_id,
                  ]}
                />
              </Field>

              {/* Name */}
              <Field
                data-invalid={
                  !!form.formState.errors.name
                }
              >
                <FieldLabel htmlFor="service-name">
                  Name
                </FieldLabel>

                <Input
                  id="service-name"
                  placeholder="Full Grooming"
                  aria-invalid={
                    !!form.formState.errors.name
                  }
                  {...form.register("name")}
                />

                <FieldError
                  errors={[form.formState.errors.name]}
                />
              </Field>

              {/* Description */}
              <Field
                data-invalid={
                  !!form.formState.errors.description
                }
              >
                <FieldLabel htmlFor="service-description">
                  Description
                </FieldLabel>

                <Textarea
                  id="service-description"
                  placeholder="Optional short description for staff and customers."
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

              {/* Type */}
              <Field
                data-invalid={
                  !!form.formState.errors.kind
                }
              >
                <FieldLabel htmlFor="service-kind">
                  Type
                </FieldLabel>

                <Select
                  value={form.watch("kind")}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      "kind",
                      value as CreateServiceInput["kind"],
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="service-kind"
                    aria-invalid={
                      !!form.formState.errors.kind
                    }
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>

                  <SelectContent>
                    {SERVICE_KINDS.map((kind) => (
                      <SelectItem
                        key={kind}
                        value={kind}
                      >
                        {kind.charAt(0).toUpperCase() +
                          kind.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError
                  errors={[form.formState.errors.kind]}
                />
              </Field>

              {/* Duration */}
              <Field
                data-invalid={
                  !!form.formState.errors.duration_minutes
                }
              >
                <FieldLabel htmlFor="service-duration">
                  Duration
                </FieldLabel>

                <Input
                  id="service-duration"
                  type="number"
                  min={1}
                  placeholder="30"
                  aria-invalid={
                    !!form.formState.errors.duration_minutes
                  }
                  {...form.register("duration_minutes", {
                    valueAsNumber: true,
                  })}
                />

                <FieldDescription>
                  Duration in minutes.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.duration_minutes,
                  ]}
                />
              </Field>

              {/* Price */}
              <Field
                data-invalid={
                  !!form.formState.errors.price
                }
              >
                <FieldLabel htmlFor="service-price">
                  Price
                </FieldLabel>

                <Input
                  id="service-price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="2500"
                  aria-invalid={
                    !!form.formState.errors.price
                  }
                  {...form.register("price", {
                    valueAsNumber: true,
                  })}
                />

                <FieldDescription>
                  Price in PKR.
                </FieldDescription>

                <FieldError
                  errors={[form.formState.errors.price]}
                />
              </Field>

              {/* Active */}
              <Field orientation="horizontal">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel htmlFor="service-active">
                    Active
                  </FieldLabel>

                  <FieldDescription>
                    Inactive services cannot be offered for
                    new bookings.
                  </FieldDescription>
                </div>

                <Switch
                  id="service-active"
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

              {/* Public */}
              <Field orientation="horizontal">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel htmlFor="service-public">
                    Public
                  </FieldLabel>

                  <FieldDescription>
                    Public services are visible on the
                    customer booking page.
                  </FieldDescription>
                </div>

                <Switch
                  id="service-public"
                  checked={form.watch("is_public")}
                  onCheckedChange={(checked) =>
                    form.setValue(
                      "is_public",
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
            form="services"
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
              "Create service"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}