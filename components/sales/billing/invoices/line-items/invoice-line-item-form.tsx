"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  invoiceLineItemSchema,
  type InvoiceLineItemFormValues,
} from "@/lib/validations/invoice-line-item"
import { Form } from "@/components/ui/form"

type InvoiceLineItemFormProps = {
  item?: InvoiceLineItemFormValues | null
  onSubmit: (item: InvoiceLineItemFormValues) => void
  onCancel: () => void
}

export function InvoiceLineItemForm({
  item,
  onSubmit,
  onCancel,
}: InvoiceLineItemFormProps) {
  const form = useForm<InvoiceLineItemFormValues>({
    resolver: zodResolver(invoiceLineItemSchema),
    defaultValues: {
      id: item?.id,
      appointment_id: item?.appointment_id ?? null,
      product_id: item?.product_id ?? null,
      description: item?.description ?? "",
      quantity: item?.quantity ?? 1,
      unit_price: item?.unit_price ?? 0,
      total: item?.total ?? 0,
    },
  })

  const quantity = form.watch("quantity")
  const unitPrice = form.watch("unit_price")

  useEffect(() => {
    const total = Number(quantity || 0) * Number(unitPrice || 0)

    form.setValue("total", Number(total.toFixed(2)), {
      shouldValidate: true,
    })
  }, [quantity, unitPrice, form])

  useEffect(() => {
    form.reset({
      id: item?.id,
      appointment_id: item?.appointment_id ?? null,
      product_id: item?.product_id ?? null,
      description: item?.description ?? "",
      quantity: item?.quantity ?? 1,
      unit_price: item?.unit_price ?? 0,
      total: item?.total ?? 0,
    })
  }, [item, form])

  function handleSubmit(values: InvoiceLineItemFormValues) {
    onSubmit({
      ...values,
      description: values.description.trim(),
      total: Number(
        (values.quantity * values.unit_price).toFixed(2)
      ),
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4"
      >
        <FieldGroup>
          <div className="space-y-2">
            <FieldLabel htmlFor="line-item-description">
              Description
            </FieldLabel>

            <Input
              id="line-item-description"
              placeholder="e.g. Dog grooming"
              {...form.register("description")}
            />

            {form.formState.errors.description ? (
              <FieldError>
                {form.formState.errors.description.message}
              </FieldError>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldLabel htmlFor="line-item-quantity">
                Quantity
              </FieldLabel>

              <Input
                id="line-item-quantity"
                type="number"
                min={1}
                step={1}
                {...form.register("quantity", {
                  valueAsNumber: true,
                })}
              />

              {form.formState.errors.quantity ? (
                <FieldError>
                  {form.formState.errors.quantity.message}
                </FieldError>
              ) : null}
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="line-item-unit-price">
                Unit price
              </FieldLabel>

              <Input
                id="line-item-unit-price"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                {...form.register("unit_price", {
                  valueAsNumber: true,
                })}
              />

              {form.formState.errors.unit_price ? (
                <FieldError>
                  {form.formState.errors.unit_price.message}
                </FieldError>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border bg-muted/40 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total
              </span>

              <span className="font-semibold">
                ${(Number(form.watch("total")) || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </FieldGroup>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button type="submit">
            {item ? "Update item" : "Add item"}
          </Button>
        </div>
      </form>
    </Form>
  )
}