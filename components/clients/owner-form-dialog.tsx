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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createOwner,
  updateOwner,
} from "@/lib/supabase/mutations/owners"
import type { OwnerRow } from "@/lib/supabase/types"
import {
  createOwnerSchema,
  type CreateOwnerInput,
} from "@/lib/validations/owner"

type OwnerFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  owner?: OwnerRow | null
  onSuccess: () => void
}

const defaultValues: CreateOwnerInput = {
  name: "",
  phone: "",
  email: "",
  preferred_contact: "phone",
}

const PREFERRED_CONTACT_OPTIONS = [
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
] as const

export function OwnerFormDialog({
  open,
  onOpenChange,
  owner,
  onSuccess,
}: OwnerFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(owner)

  const form = useForm<CreateOwnerInput>({
    resolver: zodResolver(createOwnerSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (owner) {
      form.reset({
        name: owner.name,
        phone: owner.phone,
        email: owner.email ?? "",
        preferred_contact: owner.preferred_contact ?? "phone",
      })

      return
    }

    form.reset(defaultValues)
  }, [open, owner, form])

  async function onSubmit(values: CreateOwnerInput) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updateOwner({
        id: owner!.id,
        ...values,
      })
      : await createOwner(values)

    setIsSubmitting(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(
      isEditing
        ? "Owner updated"
        : "Owner created"
    )

    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit owner" : "New owner"}
          </DialogTitle>

          <DialogDescription>
            Add the contact information for a pet owner.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="owner"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              <Field
                data-invalid={!!form.formState.errors.name}
              >
                <FieldLabel htmlFor="owner-name">
                  Name
                </FieldLabel>

                <Input
                  id="owner-name"
                  placeholder="John Smith"
                  aria-invalid={
                    !!form.formState.errors.name
                  }
                  {...form.register("name")}
                />

                <FieldError
                  errors={[form.formState.errors.name]}
                />
              </Field>

              <Field
                data-invalid={!!form.formState.errors.phone}
              >
                <FieldLabel htmlFor="owner-phone">
                  Phone
                </FieldLabel>

                <Input
                  id="owner-phone"
                  type="tel"
                  placeholder="+92 300 1234567"
                  aria-invalid={
                    !!form.formState.errors.phone
                  }
                  {...form.register("phone")}
                />

                <FieldError
                  errors={[form.formState.errors.phone]}
                />
              </Field>

              <Field
                data-invalid={!!form.formState.errors.email}
              >
                <FieldLabel htmlFor="owner-email">
                  Email
                </FieldLabel>

                <Input
                  id="owner-email"
                  type="email"
                  placeholder="john@example.com"
                  aria-invalid={
                    !!form.formState.errors.email
                  }
                  {...form.register("email")}
                />

                <FieldError
                  errors={[form.formState.errors.email]}
                />
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.preferred_contact
                }
              >
                <FieldLabel htmlFor="owner-preferred-contact">
                  Preferred contact
                </FieldLabel>

                <Select
                  value={form.watch("preferred_contact") ?? ""}
                  onValueChange={(value) => {
                    form.setValue(
                      "preferred_contact",
                      value,
                      {
                        shouldDirty: true,
                        shouldValidate: true,
                      }
                    )
                  }}
                >
                  <SelectTrigger
                    id="owner-preferred-contact"
                    aria-invalid={
                      !!form.formState.errors.preferred_contact
                    }
                  >
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>

                  <SelectContent>
                    {PREFERRED_CONTACT_OPTIONS.map(
                      (option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <FieldError
                  errors={[
                    form.formState.errors.preferred_contact,
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
            form="owner"
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
              "Create owner"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}