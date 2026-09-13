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
  createVaccineType,
  updateVaccineType,
} from "@/lib/supabase/mutations/vaccine-types"
import type { VaccineTypeRow } from "@/lib/supabase/types"
import {
  createVaccineTypeSchema,
  type CreateVaccineTypeInput,
} from "@/lib/validations/vaccine-types"

type VaccineTypeFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  vaccineType?: VaccineTypeRow | null
  onSuccess: () => void
}

const defaultValues: CreateVaccineTypeInput = {
  name: "",
  species: "",
  interval_months: null,
  is_active: true,
}

export function VaccineTypeFormDialog({
  open,
  onOpenChange,
  vaccineType,
  onSuccess,
}: VaccineTypeFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(vaccineType)

  const form = useForm<CreateVaccineTypeInput>({
    resolver: zodResolver(createVaccineTypeSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (vaccineType) {
      form.reset({
        name: vaccineType.name,
        species: vaccineType.species ?? "",
        interval_months: vaccineType.interval_months,
        is_active: vaccineType.is_active,
      })
      return
    }

    form.reset(defaultValues)
  }, [open, vaccineType, form])

  async function onSubmit(
    values: CreateVaccineTypeInput
  ) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateVaccineType({
          id: vaccineType!.id,
          ...values,
        })
      : await createVaccineType(values)

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
        ? "Vaccine type updated"
        : "Vaccine type created",
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
              ? "Edit vaccine type"
              : "New vaccine type"}
          </DialogTitle>

          <DialogDescription>
            Define vaccines that can be recorded for pets,
            including their species and renewal interval.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="vaccine-type"
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
                <FieldLabel htmlFor="vaccine-type-name">
                  Name
                </FieldLabel>

                <Input
                  id="vaccine-type-name"
                  placeholder="Rabies"
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
                  !!form.formState.errors.species
                }
              >
                <FieldLabel htmlFor="vaccine-type-species">
                  Species
                </FieldLabel>

                <Input
                  id="vaccine-type-species"
                  placeholder="Dog"
                  aria-invalid={
                    !!form.formState.errors.species
                  }
                  {...form.register("species")}
                />

                <FieldDescription>
                  Leave empty if this vaccine applies to
                  all species.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.species,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.interval_months
                }
              >
                <FieldLabel htmlFor="vaccine-type-interval">
                  Interval
                </FieldLabel>

                <Input
                  id="vaccine-type-interval"
                  type="number"
                  min={1}
                  placeholder="12"
                  aria-invalid={
                    !!form.formState.errors.interval_months
                  }
                  {...form.register(
                    "interval_months",
                    {
                      setValueAs: (value) =>
                        value === ""
                          ? null
                          : Number(value),
                    }
                  )}
                />

                <FieldDescription>
                  Number of months until the vaccine is due
                  again. Leave empty if there is no standard
                  interval.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors
                      .interval_months,
                  ]}
                />
              </Field>

              <Field orientation="horizontal">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel htmlFor="vaccine-type-active">
                    Active
                  </FieldLabel>

                  <FieldDescription>
                    Inactive vaccine types are hidden from
                    active vaccine selections.
                  </FieldDescription>
                </div>

                <Switch
                  id="vaccine-type-active"
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
            type="submit"
            disabled={isSubmitting}
            form="vaccine-type"
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
              "Create vaccine type"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}