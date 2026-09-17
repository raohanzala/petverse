"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import {
    useEffect,
    useState,
} from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "@/components/ui/toast"

import { DatePickerTime } from "@/components/ui/date-picker-with-time"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"

import {
    createOwnerRetentionSettings,
    updateOwnerRetentionSettings,
} from "@/lib/supabase/mutations/owner-retention-settings"
import type {
    OwnerRetentionSettingsOwnerOption,
    OwnerRetentionSettingsWithOwner,
} from "@/lib/supabase/types"
import {
    createOwnerRetentionSettingsSchema,
    type CreateOwnerRetentionSettingsInput,
} from "@/lib/validations/owner-retention-settings"
import { parseDateTime } from "@/lib/utils"

type OwnerRetentionSettingsFormDialogProps = {
    open: boolean
    onOpenChange: (
        open: boolean
    ) => void
    settings?: OwnerRetentionSettingsWithOwner | null
    owners: OwnerRetentionSettingsOwnerOption[]
    onSuccess: () => void
}

const defaultValues: CreateOwnerRetentionSettingsInput =
{
    owner_id: "",
    lapsed_after_days: 90,
    reengagement_queued_at: null,
    opt_out: false,
}

function combineDateTime(
    date: Date | undefined,
    time: string
) {
    if (!date) return null

    const datePart = format(
        date,
        "yyyy-MM-dd"
    )

    const finalTime =
        time ||
        format(
            new Date(),
            "HH:mm"
        )

    return new Date(
        `${datePart}T${finalTime}`
    ).toISOString()
}

export function OwnerRetentionSettingsFormDialog({
    open,
    onOpenChange,
    settings,
    owners,
    onSuccess,
}: OwnerRetentionSettingsFormDialogProps) {
    const [isSubmitting, setIsSubmitting] =
        useState(false)

    const isEditing =
        Boolean(settings)

    const form =
        useForm<CreateOwnerRetentionSettingsInput>(
            {
                resolver: zodResolver(
                    createOwnerRetentionSettingsSchema
                ),
                defaultValues,
            }
        )

    useEffect(() => {
        if (!open) return

        if (settings) {
            form.reset({
                owner_id:
                    settings.owner_id,

                lapsed_after_days:
                    settings.lapsed_after_days,

                reengagement_queued_at:
                    settings.reengagement_queued_at,

                opt_out:
                    settings.opt_out,
            })

            return
        }

        form.reset(defaultValues)
    }, [
        open,
        settings,
        form,
    ])

    const selectedOwnerId =
        form.watch("owner_id")

    const selectedOwner =
        owners.find(
            (owner) =>
                owner.id ===
                selectedOwnerId
        )

    async function onSubmit(
        values: CreateOwnerRetentionSettingsInput
    ) {
        setIsSubmitting(true)

        const result = isEditing
            ? await updateOwnerRetentionSettings(
                {
                    id: settings!.id,
                    ...values,
                }
            )
            : await createOwnerRetentionSettings(
                values
            )

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
                ? "Retention settings updated"
                : "Retention settings created",
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
                            ? "Edit retention settings"
                            : "New retention settings"}
                    </DialogTitle>

                    <DialogDescription>
                        Configure when an owner becomes
                        lapsed and whether re-engagement
                        is allowed.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        id="owner-retention-settings"
                        onSubmit={form.handleSubmit(
                            onSubmit
                        )}
                        noValidate
                        className="sticky-form-content scroll-y-hidden"
                    >
                        <FieldGroup>
                            <Field
                                data-invalid={
                                    !!form.formState.errors
                                        .owner_id
                                }
                            >
                                <FieldLabel>
                                    Owner
                                </FieldLabel>

                                <Select
                                    value={
                                        form.watch(
                                            "owner_id"
                                        )
                                    }
                                    onValueChange={(value) => {
                                        if (!value) return

                                        form.setValue(
                                            "owner_id",
                                            value,
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
                                        )
                                    }}
                                >
                                    <SelectTrigger
                                        aria-invalid={
                                            !!form.formState
                                                .errors
                                                .owner_id
                                        }
                                    >
                                        <SelectValue placeholder="Select owner">
                                            {selectedOwner
                                                ? `${selectedOwner.name} — ${selectedOwner.phone}`
                                                : "Select owner"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {owners.map(
                                            (owner) => (
                                                <SelectItem
                                                    key={owner.id}
                                                    value={owner.id}
                                                >
                                                    {owner.name} —{" "}
                                                    {owner.phone}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>

                                <FieldError
                                    errors={[
                                        form.formState.errors
                                            .owner_id,
                                    ]}
                                />
                            </Field>

                            <Field
                                data-invalid={
                                    !!form.formState.errors
                                        .lapsed_after_days
                                }
                            >
                                <FieldLabel htmlFor="lapsed-after-days">
                                    Lapsed after
                                </FieldLabel>

                                <Input
                                    id="lapsed-after-days"
                                    type="number"
                                    min={1}
                                    step={1}
                                    aria-invalid={
                                        !!form.formState.errors
                                            .lapsed_after_days
                                    }
                                    {...form.register(
                                        "lapsed_after_days",
                                        {
                                            valueAsNumber: true,
                                        }
                                    )}
                                />

                                <FieldDescription>
                                    Number of days without activity
                                    before the owner is considered
                                    lapsed.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors
                                            .lapsed_after_days,
                                    ]}
                                />
                            </Field>

                            <Controller
                                control={form.control}
                                name="reengagement_queued_at"
                                render={({ field, fieldState }) => {
                                    const { date, time } = parseDateTime(field.value)

                                    return (
                                        <Field data-invalid={fieldState.invalid}>
                                            <DatePickerTime
                                                date={date}
                                                onDateChange={(selectedDate) => {
                                                    if (!selectedDate) {
                                                        field.onChange(null)
                                                        return
                                                    }

                                                    const currentTime = field.value
                                                        ? parseDateTime(field.value).time
                                                        : format(new Date(), "HH:mm")

                                                    field.onChange(
                                                        combineDateTime(
                                                            selectedDate,
                                                            currentTime
                                                        )
                                                    )
                                                }}
                                                time={time}
                                                onTimeChange={(selectedTime) => {
                                                    const currentDate =
                                                        parseDateTime(field.value).date

                                                    field.onChange(
                                                        combineDateTime(
                                                            currentDate,
                                                            selectedTime
                                                        )
                                                    )
                                                }}
                                                dateLabel="Queued date"
                                                timeLabel="Queued time"
                                                datePlaceholder="Select date"
                                            />

                                            <FieldDescription>
                                                Optional. Leave empty if the owner has not
                                                been queued for re-engagement.
                                            </FieldDescription>

                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        </Field>
                                    )
                                }}
                            />

                            <Field orientation="horizontal">
                                <div className="flex flex-1 flex-col gap-1">
                                    <FieldLabel htmlFor="retention-opt-out">
                                        Opt out
                                    </FieldLabel>

                                    <FieldDescription>
                                        Prevent this owner from being
                                        included in retention and
                                        re-engagement campaigns.
                                    </FieldDescription>
                                </div>

                                <Switch
                                    id="retention-opt-out"
                                    checked={
                                        form.watch(
                                            "opt_out"
                                        )
                                    }
                                    onCheckedChange={(
                                        checked
                                    ) =>
                                        form.setValue(
                                            "opt_out",
                                            checked,
                                            {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            }
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
                        onClick={() =>
                            onOpenChange(false)
                        }
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        form="owner-retention-settings"
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
                            "Create settings"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}