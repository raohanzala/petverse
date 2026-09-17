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
  createProduct,
  updateProduct,
} from "@/lib/supabase/mutations/products"

import type {
  ProductRow,
  SupplierRow,
} from "@/lib/supabase/types"

import {
  createProductSchema,
  type CreateProductInput,
} from "@/lib/validations/product"

type ProductFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: ProductRow | null
  suppliers: SupplierRow[]
  onSuccess: () => void
}

const defaultValues: CreateProductInput = {
  supplier_id: null,
  sku: "",
  name: "",
  brand: "",
  category: "",
  retail_price: 0,
  cost_price: 0,
  stock_qty: 0,
  is_active: true,
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  suppliers,
  onSuccess,
}: ProductFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = Boolean(product)

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (product) {
      form.reset({
        supplier_id: null,
        sku: "",
        name: "",
        brand: "",
        category: "",
        retail_price: 0,
        cost_price: 0,
        stock_qty: 0,
        is_active: true,
      })

      return
    }

    form.reset(defaultValues)
  }, [open, product, form])

  async function onSubmit(values: CreateProductInput) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateProduct({
        id: product!.id,
        ...values,
      })
      : await createProduct(values)

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
        ? "Product updated"
        : "Product created",
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
            {isEditing ? "Edit product" : "New product"}
          </DialogTitle>

          <DialogDescription>
            Manage product details, supplier, pricing, and stock.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="product"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="product-name">
                  Name
                </FieldLabel>

                <Input
                  id="product-name"
                  placeholder="Dog Shampoo"
                  aria-invalid={!!form.formState.errors.name}
                  {...form.register("name")}
                />

                <FieldError
                  errors={[form.formState.errors.name]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.sku}>
                <FieldLabel htmlFor="product-sku">
                  SKU
                </FieldLabel>

                <Input
                  id="product-sku"
                  placeholder="PET-001"
                  aria-invalid={!!form.formState.errors.sku}
                  {...form.register("sku")}
                />

                <FieldDescription>
                  Optional unique stock keeping unit.
                </FieldDescription>

                <FieldError
                  errors={[form.formState.errors.sku]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.supplier_id
                }
              >
                <FieldLabel htmlFor="product-supplier">
                  Supplier
                </FieldLabel>

                <Select
                  value={
                    form.watch("supplier_id") ?? "none"
                  }
                  onValueChange={(value) => {
                    form.setValue(
                      "supplier_id",
                      value === "none" ? null : value,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="product-supplier"
                    className="w-full"
                  >
                    <SelectValue>
                      {form.watch("supplier_id")
                        ? suppliers.find(
                          (supplier) =>
                            supplier.id ===
                            form.watch("supplier_id")
                        )?.name ?? "Select supplier"
                        : "No supplier"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="none">
                      No supplier
                    </SelectItem>

                    {suppliers.map((supplier) => (
                      <SelectItem
                        key={supplier.id}
                        value={supplier.id}
                      >
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldDescription>
                  Optional. You can assign a supplier later.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.supplier_id,
                  ]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.brand}>
                <FieldLabel htmlFor="product-brand">
                  Brand
                </FieldLabel>

                <Input
                  id="product-brand"
                  placeholder="PetCare"
                  aria-invalid={!!form.formState.errors.brand}
                  {...form.register("brand")}
                />

                <FieldError
                  errors={[form.formState.errors.brand]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.category}>
                <FieldLabel htmlFor="product-category">
                  Category
                </FieldLabel>

                <Input
                  id="product-category"
                  placeholder="Grooming"
                  aria-invalid={!!form.formState.errors.category}
                  {...form.register("category")}
                />

                <FieldError
                  errors={[form.formState.errors.category]}
                />
              </Field>

              <Field
                data-invalid={!!form.formState.errors.retail_price}
              >
                <FieldLabel htmlFor="product-retail-price">
                  Retail price
                </FieldLabel>

                <Input
                  id="product-retail-price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  aria-invalid={!!form.formState.errors.retail_price}
                  {...form.register("retail_price", {
                    valueAsNumber: true,
                  })}
                />

                <FieldDescription>
                  Price charged to the customer.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.retail_price,
                  ]}
                />
              </Field>

              <Field
                data-invalid={!!form.formState.errors.cost_price}
              >
                <FieldLabel htmlFor="product-cost-price">
                  Cost price
                </FieldLabel>

                <Input
                  id="product-cost-price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  aria-invalid={!!form.formState.errors.cost_price}
                  {...form.register("cost_price", {
                    valueAsNumber: true,
                  })}
                />

                <FieldDescription>
                  Amount paid to the supplier.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.cost_price,
                  ]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.stock_qty
                }
              >
                <FieldLabel htmlFor="product-stock">
                  Stock quantity
                </FieldLabel>

                <Input
                  id="product-stock"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  aria-invalid={
                    !!form.formState.errors.stock_qty
                  }
                  {...form.register("stock_qty", {
                    valueAsNumber: true,
                  })}
                />

                <FieldDescription>
                  Current quantity available in stock.
                </FieldDescription>

                <FieldError
                  errors={[
                    form.formState.errors.stock_qty,
                  ]}
                />
              </Field>

              <Field orientation="horizontal">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel htmlFor="product-active">
                    Active
                  </FieldLabel>

                  <FieldDescription>
                    Inactive products are hidden from active
                    product selections.
                  </FieldDescription>
                </div>

                <Switch
                  id="product-active"
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
            form="product"
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
              "Create product"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}