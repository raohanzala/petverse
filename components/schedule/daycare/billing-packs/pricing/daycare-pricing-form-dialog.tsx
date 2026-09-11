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

import {
  createDaycarePricing,
  updateDaycarePricing,
} from "@/lib/supabase/mutations/daycare-pricing"
import type { DaycarePricingRow } from "@/lib/supabase/types"
import {
  createDaycarePricingSchema,
  type CreateDaycarePricingInput,
} from "@/lib/validations/daycare-pricing"

type DaycarePricingFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pricing?: DaycarePricingRow | null
  onSuccess: () => void
}

const defaultValues: CreateDaycarePricingInput = {
  full_day_price: 0,
  half_day_price: 0,
}

export function DaycarePricingFormDialog({
  open,
  onOpenChange,
  pricing,
  onSuccess,
}: DaycarePricingFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = Boolean(pricing)

  const form = useForm<CreateDaycarePricingInput>({
    resolver: zodResolver(createDaycarePricingSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (pricing) {
      form.reset({
        full_day_price: pricing.full_day_price,
        half_day_price: pricing.half_day_price,
      })

      return
    }

    form.reset(defaultValues)
  }, [open, pricing, form])

  async function onSubmit(values: CreateDaycarePricingInput) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateDaycarePricing({
          id: pricing!.id,
          ...values,
        })
      : await createDaycarePricing(values)

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
        ? "Daycare pricing updated"
        : "Daycare pricing created",
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
            {isEditing ? "Edit daycare pricing" : "Set daycare pricing"}
          </DialogTitle>

          <DialogDescription>
            Set the standard prices for full-day and half-day daycare
            sessions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="daycare-pricing"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              {/* Full Day Price */}
              <Field
                data-invalid={
                  !!form.formState.errors.full_day_price
                }
              >
                <FieldLabel htmlFor="daycare-full-day-price">
                  Full day price
                </FieldLabel>

                <Input
                  id="daycare-full-day-price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="2000"
                  aria-invalid={
                    !!form.formState.errors.full_day_price
                  }
                  {...form.register("full_day_price", {
                    valueAsNumber: true,
                  })}
                />

                <FieldDescription>
                  Standard price for a full-day daycare session in PKR.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.full_day_price,
                  ]}
                />
              </Field>

              {/* Half Day Price */}
              <Field
                data-invalid={
                  !!form.formState.errors.half_day_price
                }
              >
                <FieldLabel htmlFor="daycare-half-day-price">
                  Half day price
                </FieldLabel>

                <Input
                  id="daycare-half-day-price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="1200"
                  aria-invalid={
                    !!form.formState.errors.half_day_price
                  }
                  {...form.register("half_day_price", {
                    valueAsNumber: true,
                  })}
                />

                <FieldDescription>
                  Standard price for a half-day daycare session in PKR.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.half_day_price,
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
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            form="daycare-pricing"
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
              "Set pricing"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}