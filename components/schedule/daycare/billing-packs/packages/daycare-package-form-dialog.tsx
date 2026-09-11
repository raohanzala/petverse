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
  createDaycarePackage,
  updateDaycarePackage,
} from "@/lib/supabase/mutations/daycare-packages"
import type { DaycarePackageRow } from "@/lib/supabase/types"
import {
  createDaycarePackageSchema,
  type CreateDaycarePackageInput,
} from "@/lib/validations/daycare-package"

type DaycarePackageFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  package?: DaycarePackageRow | null
  onSuccess: () => void
}

const defaultValues: CreateDaycarePackageInput = {
  name: "",
  visit_count: 1,
  price: 0,
  valid_days: null,
  is_active: true,
}

export function DaycarePackageFormDialog({
  open,
  onOpenChange,
  package: daycarePackage,
  onSuccess,
}: DaycarePackageFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = Boolean(daycarePackage)

  const form = useForm<CreateDaycarePackageInput>({
    resolver: zodResolver(createDaycarePackageSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (daycarePackage) {
      form.reset({
        name: daycarePackage.name,
        visit_count: daycarePackage.visit_count,
        price: daycarePackage.price,
        valid_days: daycarePackage.valid_days,
        is_active: daycarePackage.is_active,
      })
      return
    }

    form.reset(defaultValues)
  }, [open, daycarePackage, form])

  async function onSubmit(values: CreateDaycarePackageInput) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateDaycarePackage({
          id: daycarePackage!.id,
          ...values,
        })
      : await createDaycarePackage(values)

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
        ? "Daycare package updated"
        : "Daycare package created",
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
            {isEditing ? "Edit daycare package" : "New daycare package"}
          </DialogTitle>

          <DialogDescription>
            Create a visit package that customers can purchase for daycare
            sessions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="daycare-package"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="daycare-package-name">
                  Name
                </FieldLabel>

                <Input
                  id="daycare-package-name"
                  placeholder="10 Visit Package"
                  aria-invalid={!!form.formState.errors.name}
                  {...form.register("name")}
                />

                <FieldDescription>
                  Give the package a clear name that staff and customers can
                  easily understand.
                </FieldDescription>

                <FieldError errors={[form.formState.errors.name]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.visit_count}>
                <FieldLabel htmlFor="daycare-package-visits">
                  Visit count
                </FieldLabel>

                <Input
                  id="daycare-package-visits"
                  type="number"
                  min={1}
                  step={1}
                  aria-invalid={!!form.formState.errors.visit_count}
                  {...form.register("visit_count", {
                    valueAsNumber: true,
                  })}
                />

                <FieldDescription>
                  Number of daycare visits included in this package.
                </FieldDescription>

                <FieldError
                  errors={[form.formState.errors.visit_count]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.price}>
                <FieldLabel htmlFor="daycare-package-price">
                  Price
                </FieldLabel>

                <Input
                  id="daycare-package-price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="8000"
                  aria-invalid={!!form.formState.errors.price}
                  {...form.register("price", {
                    valueAsNumber: true,
                  })}
                />

                <FieldDescription>
                  Total price customers pay for this package in PKR.
                </FieldDescription>

                <FieldError errors={[form.formState.errors.price]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.valid_days}>
                <FieldLabel htmlFor="daycare-package-valid-days">
                  Validity
                </FieldLabel>

                <Input
                  id="daycare-package-valid-days"
                  type="number"
                  min={1}
                  step={1}
                  placeholder="30"
                  aria-invalid={!!form.formState.errors.valid_days}
                  {...form.register("valid_days", {
                    setValueAs: (value) =>
                      value === "" ? null : Number(value),
                  })}
                />

                <FieldDescription>
                  Number of days the package remains valid after assignment.
                  Leave empty for no expiry.
                </FieldDescription>

                <FieldError
                  errors={[form.formState.errors.valid_days]}
                />
              </Field>

              <Field orientation="horizontal">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel htmlFor="daycare-package-active">
                    Active
                  </FieldLabel>

                  <FieldDescription>
                    Inactive packages cannot be assigned to new customers.
                  </FieldDescription>
                </div>

                <Switch
                  id="daycare-package-active"
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
            form="daycare-package"
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