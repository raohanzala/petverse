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
  createPet,
  updatePet,
} from "@/lib/supabase/mutations/pets"
import type { OwnerRow, PetRow } from "@/lib/supabase/types"
import {
  createPetSchema,
  type CreatePetInput,
} from "@/lib/validations/pet"

type PetFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pet?: PetRow | null
  owners: OwnerRow[]
  onSuccess: () => void
}

const defaultValues: CreatePetInput = {
  owner_id: "",
  name: "",
  species: "dog",
  breed: "",
  birth_date: "",
  weight_kg: null,
  color: "",
  notes: "",
  is_active: true,
}

const SPECIES_OPTIONS = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "bird", label: "Bird" },
  { value: "rabbit", label: "Rabbit" },
  { value: "other", label: "Other" },
] as const

export function PetFormDialog({
  open,
  onOpenChange,
  pet,
  owners,
  onSuccess,
}: PetFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(pet)

  const form = useForm<CreatePetInput>({
    resolver: zodResolver(createPetSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return

    if (pet) {
      form.reset({
        owner_id: pet.owner_id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed ?? "",
        birth_date: pet.birth_date ?? "",
        weight_kg: pet.weight_kg,
        color: pet.color ?? "",
        notes: pet.notes ?? "",
        is_active: pet.is_active,
      })
      return
    }

    form.reset(defaultValues)
  }, [open, pet, form])

  async function onSubmit(values: CreatePetInput) {
    setIsSubmitting(true)

    const result = isEditing
      ? await updatePet({ id: pet!.id, ...values })
      : await createPet(values)

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
      description: isEditing ? "Pet updated" : "Pet created",
      priority: "high",
    })
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit pet" : "New pet"}
          </DialogTitle>

          <DialogDescription>
            Add the pet details and link the pet to its owner.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="pet"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="sticky-form-content scroll-y-hidden"
          >
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.owner_id}>
                <FieldLabel htmlFor="pet-owner">
                  Owner
                </FieldLabel>

                <Select
                  value={form.watch("owner_id")}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue("owner_id", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }}
                >
                  <SelectTrigger
                    id="pet-owner"
                    aria-invalid={!!form.formState.errors.owner_id}
                  >
                    <SelectValue placeholder="Select owner">
                      {owners.find(
                        (owner) => owner.id === form.watch("owner_id")
                      )?.name ?? "Select owner"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {owners.map((owner) => (
                      <SelectItem
                        key={owner.id}
                        value={owner.id}
                      >
                        {owner.name} — {owner.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError
                  errors={[form.formState.errors.owner_id]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.name}>
                <FieldLabel htmlFor="pet-name">
                  Name
                </FieldLabel>

                <Input
                  id="pet-name"
                  placeholder="Max"
                  aria-invalid={!!form.formState.errors.name}
                  {...form.register("name")}
                />

                <FieldError
                  errors={[form.formState.errors.name]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.species}>
                <FieldLabel htmlFor="pet-species">
                  Species
                </FieldLabel>

                <Select
                  value={form.watch("species")}
                  onValueChange={(value) => {
                    if (!value) return

                    form.setValue("species", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }}
                >
                  <SelectTrigger
                    id="pet-species"
                    aria-invalid={!!form.formState.errors.species}
                  >
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>

                  <SelectContent>
                    {SPECIES_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError
                  errors={[form.formState.errors.species]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.breed}>
                <FieldLabel htmlFor="pet-breed">
                  Breed
                </FieldLabel>

                <Input
                  id="pet-breed"
                  placeholder="Golden Retriever"
                  aria-invalid={!!form.formState.errors.breed}
                  {...form.register("breed")}
                />

                <FieldError
                  errors={[form.formState.errors.breed]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.birth_date}>
                <FieldLabel htmlFor="pet-birth-date">
                  Birth date
                </FieldLabel>

                <Input
                  id="pet-birth-date"
                  type="date"
                  aria-invalid={!!form.formState.errors.birth_date}
                  {...form.register("birth_date")}
                />

                <FieldError
                  errors={[form.formState.errors.birth_date]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.weight_kg}>
                <FieldLabel htmlFor="pet-weight">
                  Weight
                </FieldLabel>

                <Input
                  id="pet-weight"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="12.5"
                  aria-invalid={!!form.formState.errors.weight_kg}
                  {...form.register("weight_kg", {
                    setValueAs: (value) =>
                      value === "" ? null : Number(value),
                  })}
                />

                <FieldDescription>
                  Weight in kilograms.
                </FieldDescription>

                <FieldError
                  errors={[form.formState.errors.weight_kg]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.color}>
                <FieldLabel htmlFor="pet-color">
                  Color
                </FieldLabel>

                <Input
                  id="pet-color"
                  placeholder="Golden"
                  aria-invalid={!!form.formState.errors.color}
                  {...form.register("color")}
                />

                <FieldError
                  errors={[form.formState.errors.color]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.notes}>
                <FieldLabel htmlFor="pet-notes">
                  Notes
                </FieldLabel>

                <Textarea
                  id="pet-notes"
                  placeholder="Optional notes about the pet."
                  rows={3}
                  aria-invalid={!!form.formState.errors.notes}
                  {...form.register("notes")}
                />

                <FieldError
                  errors={[form.formState.errors.notes]}
                />
              </Field>

              <Field orientation="horizontal">
                <div className="flex flex-1 flex-col gap-1">
                  <FieldLabel htmlFor="pet-active">
                    Active
                  </FieldLabel>

                  <FieldDescription>
                    Inactive pets are hidden from public booking.
                  </FieldDescription>
                </div>

                <Switch
                  id="pet-active"
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
            form="pet"
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
              "Create pet"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}