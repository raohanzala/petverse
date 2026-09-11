"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "@/components/ui/toast"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    createDaycareWallet,
    updateDaycareWallet,
} from "@/lib/supabase/mutations/daycare-wallets"
import type {
    DaycarePackageRow,
    DaycareWalletRow,
} from "@/lib/supabase/types"
import {
    createDaycareWalletSchema,
    type CreateDaycareWalletInput,
} from "@/lib/validations/daycare-wallet"

type OwnerOption = {
    id: string
    name: string
}

type PetOption = {
    id: string
    owner_id: string
    name: string
}

type DaycareWalletFormDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    wallet?: DaycareWalletRow | null
    owners: OwnerOption[]
    pets: PetOption[]
    packages: DaycarePackageRow[]
    onSuccess: () => void
}

const defaultValues: CreateDaycareWalletInput = {
    owner_id: "",
    pet_id: null,
    package_id: "",
    visits_remaining: 0,
    expires_at: null,
}

function getDateFromIso(value: string | null | undefined) {
    if (!value) return undefined

    const date = new Date(value)

    return Number.isNaN(date.getTime()) ? undefined : date
}

function getExpirationDate(validDays: number | null) {
    if (!validDays) return null

    const date = new Date()

    date.setDate(date.getDate() + validDays)

    return date
}

export function DaycareWalletFormDialog({
    open,
    onOpenChange,
    wallet,
    owners,
    pets,
    packages,
    onSuccess,
}: DaycareWalletFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isEditing = Boolean(wallet)

    const form = useForm<CreateDaycareWalletInput>({
        resolver: zodResolver(createDaycareWalletSchema),
        defaultValues,
    })

    const selectedOwnerId = form.watch("owner_id")
    const selectedPackageId = form.watch("package_id")
    const expiresAt = form.watch("expires_at")

    const selectedPackage = useMemo(
        () =>
            packages.find(
                (daycarePackage) =>
                    daycarePackage.id === selectedPackageId
            ),
        [packages, selectedPackageId]
    )

    const ownerPets = useMemo(
        () =>
            pets.filter(
                (pet) => pet.owner_id === selectedOwnerId
            ),
        [pets, selectedOwnerId]
    )

    useEffect(() => {
        if (!open) return

        if (wallet) {
            form.reset({
                owner_id: wallet.owner_id,
                pet_id: wallet.pet_id,
                package_id: wallet.package_id,
                visits_remaining: wallet.visits_remaining,
                expires_at: wallet.expires_at,
            })

            return
        }

        form.reset(defaultValues)
    }, [open, wallet, form])

    useEffect(() => {
        if (!selectedOwnerId) {
            form.setValue("pet_id", null, {
                shouldDirty: true,
            })
            return
        }

        const currentPetId = form.getValues("pet_id")

        const petBelongsToOwner = ownerPets.some(
            (pet) => pet.id === currentPetId
        )

        if (currentPetId && !petBelongsToOwner) {
            form.setValue("pet_id", null, {
                shouldDirty: true,
                shouldValidate: true,
            })
        }
    }, [selectedOwnerId, ownerPets, form])

    function handlePackageChange(packageId: string | null) {
        if (!packageId) {
            form.setValue("package_id", "", {
                shouldDirty: true,
                shouldValidate: true,
            })

            return
        }

        form.setValue("package_id", packageId, {
            shouldDirty: true,
            shouldValidate: true,
        })

        const daycarePackage = packages.find(
            (item) => item.id === packageId
        )

        if (!daycarePackage) return

        form.setValue(
            "visits_remaining",
            daycarePackage.visit_count,
            {
                shouldDirty: true,
                shouldValidate: true,
            }
        )

        const expirationDate = getExpirationDate(
            daycarePackage.valid_days
        )

        form.setValue(
            "expires_at",
            expirationDate
                ? expirationDate.toISOString()
                : null,
            {
                shouldDirty: true,
                shouldValidate: true,
            }
        )
    }

    async function onSubmit(values: CreateDaycareWalletInput) {
        setIsSubmitting(true)

        const result = isEditing
            ? await updateDaycareWallet({
                id: wallet!.id,
                ...values,
            })
            : await createDaycareWallet(values)

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
                ? "Daycare wallet updated"
                : "Daycare wallet created",
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
                        {isEditing
                            ? "Edit daycare wallet"
                            : "Assign daycare package"}
                    </DialogTitle>

                    <DialogDescription>
                        {isEditing
                            ? "Update the daycare package balance and validity for this customer."
                            : "Assign a daycare package to an owner and optionally select a specific pet."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        id="daycare-wallet"
                        onSubmit={form.handleSubmit(onSubmit)}
                        noValidate
                        className="sticky-form-content scroll-y-hidden"
                    >
                        <FieldGroup>
                            <Field
                                data-invalid={
                                    !!form.formState.errors.owner_id
                                }
                            >
                                <FieldLabel htmlFor="daycare-wallet-owner">
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
                                        id="daycare-wallet-owner"
                                        aria-invalid={
                                            !!form.formState.errors.owner_id
                                        }
                                    >
                                        <SelectValue>
                                            {selectedOwnerId
                                                ? owners.find(
                                                    (owner) =>
                                                        owner.id === selectedOwnerId
                                                )?.name
                                                : "Select owner"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {owners.length === 0 ? (
                                            <SelectItem value="__empty" disabled>
                                                No owners available
                                            </SelectItem>
                                        ) : (
                                            owners.map((owner) => (
                                                <SelectItem
                                                    key={owner.id}
                                                    value={owner.id}
                                                >
                                                    {owner.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>

                                <FieldDescription>
                                    Select the owner who purchased or received
                                    this daycare package.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors.owner_id,
                                    ]}
                                />
                            </Field>

                            <Field
                                data-invalid={
                                    !!form.formState.errors.pet_id
                                }
                            >
                                <FieldLabel htmlFor="daycare-wallet-pet">
                                    Pet
                                </FieldLabel>

                                <Select
                                    value={form.watch("pet_id") ?? ""}
                                    onValueChange={(value) => {
                                        form.setValue(
                                            "pet_id",
                                            value || null,
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        )
                                    }}
                                    disabled={!selectedOwnerId}
                                >
                                    <SelectTrigger
                                        id="daycare-wallet-pet"
                                        aria-invalid={
                                            !!form.formState.errors.pet_id
                                        }
                                    >
                                        <SelectValue>
                                            {form.watch("pet_id")
                                                ? ownerPets.find(
                                                    (pet) =>
                                                        pet.id ===
                                                        form.watch("pet_id")
                                                )?.name
                                                : "Select pet"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="">
                                            All pets
                                        </SelectItem>

                                        {ownerPets.map((pet) => (
                                            <SelectItem
                                                key={pet.id}
                                                value={pet.id}
                                            >
                                                {pet.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <FieldDescription>
                                    Optionally assign this wallet to a specific
                                    pet. Leave empty to make it available for all
                                    pets of the owner.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors.pet_id,
                                    ]}
                                />
                            </Field>

                            <Field
                                data-invalid={
                                    !!form.formState.errors.package_id
                                }
                            >
                                <FieldLabel htmlFor="daycare-wallet-package">
                                    Package
                                </FieldLabel>

                                <Select
                                    value={selectedPackageId}
                                    onValueChange={handlePackageChange}
                                >
                                    <SelectTrigger
                                        id="daycare-wallet-package"
                                        aria-invalid={
                                            !!form.formState.errors.package_id
                                        }
                                    >
                                        <SelectValue>
                                            {selectedPackage
                                                ? `${selectedPackage.name} — ${selectedPackage.visit_count} ${selectedPackage.visit_count ===
                                                    1
                                                    ? "visit"
                                                    : "visits"
                                                }`
                                                : "Select package"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {packages.length === 0 ? (
                                            <SelectItem value="__empty" disabled>
                                                No packages available
                                            </SelectItem>
                                        ) : (
                                            packages.map((daycarePackage) => (
                                                <SelectItem
                                                    key={daycarePackage.id}
                                                    value={daycarePackage.id}
                                                    disabled={
                                                        !daycarePackage.is_active
                                                    }
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            {daycarePackage.name}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            {daycarePackage.visit_count}{" "}
                                                            {daycarePackage.visit_count === 1
                                                                ? "visit"
                                                                : "visits"}{" "}
                                                            · PKR{" "}
                                                            {daycarePackage.price.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>

                                <FieldDescription>
                                    Select the daycare package to assign.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors.package_id,
                                    ]}
                                />
                            </Field>

                            <Field
                                data-invalid={
                                    !!form.formState.errors.visits_remaining
                                }
                            >
                                <FieldLabel htmlFor="daycare-wallet-visits">
                                    Visits remaining
                                </FieldLabel>

                                <Input
                                    id="daycare-wallet-visits"
                                    type="number"
                                    min={0}
                                    step={1}
                                    aria-invalid={
                                        !!form.formState.errors.visits_remaining
                                    }
                                    {...form.register(
                                        "visits_remaining",
                                        {
                                            valueAsNumber: true,
                                        }
                                    )}
                                />

                                <FieldDescription>
                                    Automatically filled from the selected package.
                                    You can adjust it when editing a wallet.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors
                                            .visits_remaining,
                                    ]}
                                />
                            </Field>

                            <Field
                                data-invalid={
                                    !!form.formState.errors.expires_at
                                }
                            >
                                <FieldLabel htmlFor="daycare-wallet-expires">
                                    Expires at
                                </FieldLabel>

                                <DatePicker
                                    date={getDateFromIso(expiresAt)}
                                    onDateChange={(date) => {
                                        form.setValue(
                                            "expires_at",
                                            date
                                                ? date.toISOString()
                                                : null,
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        )
                                    }}
                                    placeholder="Select expiration date"
                                />

                                <FieldDescription>
                                    Automatically calculated from the package
                                    validity. Leave empty for packages with no
                                    expiry.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors.expires_at,
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
                        form="daycare-wallet"
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
                            "Assign package"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}