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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  createFacilityResource,
  updateFacilityResource,
} from "@/lib/supabase/mutations/facility-resources"
import type { FacilityResourceRow } from "@/lib/supabase/types"
import {
  createFacilityResourceSchema,
  type CreateFacilityResourceInput,
} from "@/lib/validations/facility-resources"

type FacilityResourceFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  resource?: FacilityResourceRow | null
  onSuccess: () => void
}

const defaultValues: CreateFacilityResourceInput = {
  name: "",
  type: "kennel",
  column_label: "",
  row_number: null,
  capacity: 1,
  is_active: true,
}

export function FacilityResourceFormDialog({
  open,
  onOpenChange,
  resource,
  onSuccess,
}: FacilityResourceFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(resource)

  const form = useForm<CreateFacilityResourceInput>({
    resolver: zodResolver(createFacilityResourceSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (resource) {
      form.reset({
        name: resource.name,
        type: resource.type,
        column_label: resource.column_label ?? "",
        row_number: resource.row_number,
        capacity: resource.capacity,
        is_active: resource.is_active,
      })
      return
    }

    form.reset(defaultValues)
  }, [open, resource, form])

  async function onSubmit(values: CreateFacilityResourceInput) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateFacilityResource({
          id: resource!.id,
          ...values,
        })
      : await createFacilityResource(values)

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
        ? "Facility resource updated"
        : "Facility resource created",
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
            {isEditing ? "Edit facility resource" : "New facility resource"}
          </DialogTitle>

          <DialogDescription>
            Add a kennel, suite, playroom, or other facility resource for your
            facility.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="facility-resource"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="resource-name">Name</FieldLabel>

                <Input
                  id="resource-name"
                  placeholder="Kennel A-01"
                  aria-invalid={!!form.formState.errors.name}
                  {...form.register("name")}
                />

                <FieldError errors={[form.formState.errors.name]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.type}>
                <FieldLabel htmlFor="resource-type">Type</FieldLabel>

                <Select
                  value={form.watch("type")}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue(
                      "type",
                      value as CreateFacilityResourceInput["type"],
                      { shouldDirty: true }
                    )
                  }}
                >
                  <SelectTrigger
                    id="resource-type"
                    aria-invalid={!!form.formState.errors.type}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="kennel">Kennel</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                    <SelectItem value="playroom">Playroom</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Choose the type of facility resource.
                </FieldDescription>

                <FieldError errors={[form.formState.errors.type]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.column_label}>
                <FieldLabel htmlFor="resource-column">
                  Column label
                </FieldLabel>

                <Input
                  id="resource-column"
                  placeholder="A"
                  aria-invalid={!!form.formState.errors.column_label}
                  {...form.register("column_label")}
                />

                <FieldDescription>
                  Optional physical column label, such as A or B.
                </FieldDescription>

                <FieldError
                  errors={[form.formState.errors.column_label]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.row_number}>
                <FieldLabel htmlFor="resource-row">
                  Row number
                </FieldLabel>

                <Input
                  id="resource-row"
                  type="number"
                  min={1}
                  placeholder="1"
                  aria-invalid={!!form.formState.errors.row_number}
                  {...form.register("row_number", {
                    setValueAs: (value) =>
                      value === "" ? null : Number(value),
                  })}
                />

                <FieldDescription>
                  Optional physical row number.
                </FieldDescription>

                <FieldError errors={[form.formState.errors.row_number]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.capacity}>
                <FieldLabel htmlFor="resource-capacity">
                  Capacity
                </FieldLabel>

                <Input
                  id="resource-capacity"
                  type="number"
                  min={1}
                  aria-invalid={!!form.formState.errors.capacity}
                  {...form.register("capacity", {
                    valueAsNumber: true,
                  })}
                />

                <FieldDescription>
                  Maximum number of pets this resource can hold.
                </FieldDescription>

                <FieldError errors={[form.formState.errors.capacity]} />
              </Field>

              <Field orientation="horizontal">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel htmlFor="resource-active">
                    Active
                  </FieldLabel>

                  <FieldDescription>
                    Inactive resources are unavailable for facility use.
                  </FieldDescription>
                </div>

                <Switch
                  id="resource-active"
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
            form="facility-resource"
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
              "Create resource"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}