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
  createServiceCategory,
  updateServiceCategory,
} from "@/lib/supabase/mutations/service-categories"
import type { ServiceCategoryRow } from "@/lib/supabase/types"
import {
  createServiceCategorySchema,
  type CreateServiceCategoryInput,
} from "@/lib/validations/service-category"
import { slugify } from "@/lib/utils"

type ServiceCategoryFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: ServiceCategoryRow | null
  onSuccess: () => void
}

const defaultValues: CreateServiceCategoryInput = {
  name: "",
  slug: "",
  description: "",
  sort_order: 0,
  is_active: true,
}

export function ServiceCategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: ServiceCategoryFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)
  const isEditing = Boolean(category)

  const form = useForm<CreateServiceCategoryInput>({
    resolver: zodResolver(createServiceCategorySchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    setSlugTouched(false)

    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
        sort_order: category.sort_order,
        is_active: category.is_active,
      })
      return
    }

    form.reset(defaultValues)
  }, [open, category, form])

  const nameValue = form.watch("name")

  useEffect(() => {
    if (isEditing || slugTouched || !nameValue) return
    form.setValue("slug", slugify(nameValue), { shouldValidate: true })
  }, [nameValue, isEditing, slugTouched, form])

  async function onSubmit(values: CreateServiceCategoryInput) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateServiceCategory({ id: category!.id, ...values })
      : await createServiceCategory(values)

    setIsSubmitting(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(isEditing ? "Category updated" : "Category created")
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit category" : "New category"}
          </DialogTitle>
          <DialogDescription>
            Group services under categories like Grooming or Veterinary.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="category-name">Name</FieldLabel>
                <Input
                  id="category-name"
                  placeholder="Grooming"
                  aria-invalid={!!form.formState.errors.name}
                  {...form.register("name")}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.slug}>
                <FieldLabel htmlFor="category-slug">Slug</FieldLabel>
                <Input
                  id="category-slug"
                  placeholder="grooming"
                  aria-invalid={!!form.formState.errors.slug}
                  {...form.register("slug", {
                    onChange: () => setSlugTouched(true),
                  })}
                />
                <FieldDescription>
                  Used in URLs. Lowercase letters, numbers, and hyphens only.
                </FieldDescription>
                <FieldError errors={[form.formState.errors.slug]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.description}>
                <FieldLabel htmlFor="category-description">
                  Description
                </FieldLabel>
                <Textarea
                  id="category-description"
                  placeholder="Optional short description for staff and booking."
                  rows={3}
                  aria-invalid={!!form.formState.errors.description}
                  {...form.register("description")}
                />
                <FieldError errors={[form.formState.errors.description]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.sort_order}>
                <FieldLabel htmlFor="category-sort-order">Sort order</FieldLabel>
                <Input
                  id="category-sort-order"
                  type="number"
                  min={0}
                  aria-invalid={!!form.formState.errors.sort_order}
                  {...form.register("sort_order", { valueAsNumber: true })}
                />
                <FieldDescription>
                  Lower numbers appear first in lists.
                </FieldDescription>
                <FieldError errors={[form.formState.errors.sort_order]} />
              </Field>

              <Field orientation="horizontal">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel htmlFor="category-active">Active</FieldLabel>
                  <FieldDescription>
                    Inactive categories are hidden from public booking.
                  </FieldDescription>
                </div>
                <Switch
                  id="category-active"
                  checked={form.watch("is_active")}
                  onCheckedChange={(checked) =>
                    form.setValue("is_active", checked, { shouldDirty: true })
                  }
                />
              </Field>
            </FieldGroup>

            <DialogFooter >
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="text-primary-foreground" />
                    Saving…
                  </>
                ) : isEditing ? (
                  "Save changes"
                ) : (
                  "Create category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
