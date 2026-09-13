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
  createSupplier,
  updateSupplier,
} from "@/lib/supabase/mutations/suppliers"
import type { SupplierRow } from "@/lib/supabase/types"
import {
  createSupplierSchema,
  type CreateSupplierInput,
} from "@/lib/validations/supplier"

type SupplierFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: SupplierRow | null
  onSuccess: () => void
}

const defaultValues: CreateSupplierInput = {
  name: "",
  contact_name: "",
  email: "",
  phone: "",
  notes: "",
  is_active: true,
}

export function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: SupplierFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(supplier)

  const form = useForm<CreateSupplierInput>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (supplier) {
      form.reset({
        name: supplier.name,
        contact_name: supplier.contact_name ?? "",
        email: supplier.email ?? "",
        phone: supplier.phone ?? "",
        notes: supplier.notes ?? "",
        is_active: supplier.is_active,
      })
      return
    }

    form.reset(defaultValues)
  }, [open, supplier, form])

  async function onSubmit(values: CreateSupplierInput) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateSupplier({
          id: supplier!.id,
          ...values,
        })
      : await createSupplier(values)

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
        ? "Supplier updated"
        : "Supplier created",
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
            {isEditing ? "Edit supplier" : "New supplier"}
          </DialogTitle>
          <DialogDescription>
            Add supplier contact details and manage their active status.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="supplier"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="supplier-name">
                  Name
                </FieldLabel>
                <Input
                  id="supplier-name"
                  placeholder="Pet Supplies Co."
                  aria-invalid={!!form.formState.errors.name}
                  {...form.register("name")}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>

              <Field
                data-invalid={!!form.formState.errors.contact_name}
              >
                <FieldLabel htmlFor="supplier-contact-name">
                  Contact name
                </FieldLabel>
                <Input
                  id="supplier-contact-name"
                  placeholder="John Smith"
                  aria-invalid={
                    !!form.formState.errors.contact_name
                  }
                  {...form.register("contact_name")}
                />
                <FieldError
                  errors={[form.formState.errors.contact_name]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.email}>
                <FieldLabel htmlFor="supplier-email">
                  Email
                </FieldLabel>
                <Input
                  id="supplier-email"
                  type="email"
                  placeholder="supplier@example.com"
                  aria-invalid={!!form.formState.errors.email}
                  {...form.register("email", {
                    setValueAs: (value) =>
                      value === "" ? null : value,
                  })}
                />
                <FieldError errors={[form.formState.errors.email]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.phone}>
                <FieldLabel htmlFor="supplier-phone">
                  Phone
                </FieldLabel>
                <Input
                  id="supplier-phone"
                  type="tel"
                  placeholder="+92 300 1234567"
                  aria-invalid={!!form.formState.errors.phone}
                  {...form.register("phone")}
                />
                <FieldError errors={[form.formState.errors.phone]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.notes}>
                <FieldLabel htmlFor="supplier-notes">
                  Notes
                </FieldLabel>
                <Textarea
                  id="supplier-notes"
                  placeholder="Optional notes about this supplier."
                  rows={3}
                  aria-invalid={!!form.formState.errors.notes}
                  {...form.register("notes")}
                />
                <FieldDescription>
                  Add any internal notes about the supplier.
                </FieldDescription>
                <FieldError errors={[form.formState.errors.notes]} />
              </Field>

              <Field orientation="horizontal">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel htmlFor="supplier-active">
                    Active
                  </FieldLabel>
                  <FieldDescription>
                    Inactive suppliers will not be available when
                    selecting a supplier for products.
                  </FieldDescription>
                </div>

                <Switch
                  id="supplier-active"
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
            form="supplier"
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
              "Create supplier"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}