"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { format, parseISO } from "date-fns"

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
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"

import {
    createBusinessTarget,
    updateBusinessTarget,
} from "@/lib/supabase/mutations/business-targets"
import type { BusinessTargetRow } from "@/lib/supabase/types"
import {
    createBusinessTargetSchema,
    type CreateBusinessTargetInput,
} from "@/lib/validations/business-target"

type BusinessTargetFormDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    target?: BusinessTargetRow | null
    onSuccess: () => void
}

const defaultValues: CreateBusinessTargetInput = {
    metric_key: "",
    target_value: 0,
    period_start: "",
    period_end: "",
    notes: "",
}

export function BusinessTargetFormDialog({
    open,
    onOpenChange,
    target,
    onSuccess,
}: BusinessTargetFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isEditing = Boolean(target)

    const form = useForm<CreateBusinessTargetInput>({
        resolver: zodResolver(createBusinessTargetSchema),
        defaultValues,
    })

    useEffect(() => {
        if (!open) return

        if (target) {
            form.reset({
                metric_key: target.metric_key,
                target_value: Number(target.target_value),
                period_start: target.period_start,
                period_end: target.period_end,
                notes: target.notes ?? "",
            })

            return
        }

        form.reset(defaultValues)
    }, [open, target, form])

    async function onSubmit(values: CreateBusinessTargetInput) {
        setIsSubmitting(true)

        const result = isEditing
            ? await updateBusinessTarget({
                id: target!.id,
                metric_key: values.metric_key,
                target_value: values.target_value,
                period_start: values.period_start,
                period_end: values.period_end,
                notes: values.notes ?? "",
            })
            : await createBusinessTarget({
                ...values,
                notes: values.notes ?? "",
            })

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
                ? "Business target updated"
                : "Business target created",
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
                            ? "Edit business target"
                            : "New business target"}
                    </DialogTitle>

                    <DialogDescription>
                        Define a measurable business target for a specific
                        period.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        id="business-target"
                        onSubmit={form.handleSubmit(onSubmit)}
                        noValidate
                        className="sticky-form-content scroll-y-hidden"
                    >
                        <FieldGroup>
                            {/* Metric */}
                            <Field
                                data-invalid={
                                    !!form.formState.errors.metric_key
                                }
                            >
                                <FieldLabel htmlFor="target-metric-key">
                                    Metric key
                                </FieldLabel>

                                <Input
                                    id="target-metric-key"
                                    placeholder="monthly_revenue"
                                    aria-invalid={
                                        !!form.formState.errors.metric_key
                                    }
                                    {...form.register("metric_key")}
                                />

                                <FieldDescription>
                                    Use a stable key such as monthly_revenue,
                                    appointments, or new_clients.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors.metric_key,
                                    ]}
                                />
                            </Field>

                            {/* Target value */}
                            <Field
                                data-invalid={
                                    !!form.formState.errors.target_value
                                }
                            >
                                <FieldLabel htmlFor="target-value">
                                    Target value
                                </FieldLabel>

                                <Input
                                    id="target-value"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    aria-invalid={
                                        !!form.formState.errors.target_value
                                    }
                                    {...form.register("target_value", {
                                        valueAsNumber: true,
                                    })}
                                />

                                <FieldDescription>
                                    The target amount or count for this
                                    metric.
                                </FieldDescription>

                                <FieldError
                                    errors={[
                                        form.formState.errors.target_value,
                                    ]}
                                />
                            </Field>

                            {/* Dates */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Period start */}
                                <Controller
                                    control={form.control}
                                    name="period_start"
                                    render={({ field, fieldState }) => {
                                        const date = field.value
                                            ? parseISO(field.value)
                                            : undefined

                                        return (
                                            <Field
                                                data-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                <FieldLabel>
                                                    Period start
                                                </FieldLabel>

                                                <DatePicker
                                                    date={date}
                                                    onDateChange={(date) => {
                                                        field.onChange(
                                                            date
                                                                ? format(
                                                                    date,
                                                                    "yyyy-MM-dd"
                                                                )
                                                                : ""
                                                        )
                                                    }}
                                                    placeholder="Select start date"
                                                />

                                                <FieldError
                                                    errors={[
                                                        fieldState.error,
                                                    ]}
                                                />
                                            </Field>
                                        )
                                    }}
                                />

                                {/* Period end */}
                                <Controller
                                    control={form.control}
                                    name="period_end"
                                    render={({ field, fieldState }) => {
                                        const date = field.value
                                            ? parseISO(field.value)
                                            : undefined

                                        return (
                                            <Field
                                                data-invalid={
                                                    fieldState.invalid
                                                }
                                            >
                                                <FieldLabel>
                                                    Period end
                                                </FieldLabel>

                                                <DatePicker
                                                    date={date}
                                                    onDateChange={(date) => {
                                                        field.onChange(
                                                            date
                                                                ? format(
                                                                    date,
                                                                    "yyyy-MM-dd"
                                                                )
                                                                : ""
                                                        )
                                                    }}
                                                    placeholder="Select end date"
                                                />

                                                <FieldError
                                                    errors={[
                                                        fieldState.error,
                                                    ]}
                                                />
                                            </Field>
                                        )
                                    }}
                                />
                            </div>

                            {/* Notes */}
                            <Field
                                data-invalid={
                                    !!form.formState.errors.notes
                                }
                            >
                                <FieldLabel htmlFor="target-notes">
                                    Notes
                                </FieldLabel>

                                <Textarea
                                    id="target-notes"
                                    placeholder="Optional notes about this target."
                                    rows={4}
                                    aria-invalid={
                                        !!form.formState.errors.notes
                                    }
                                    {...form.register("notes")}
                                />

                                <FieldError
                                    errors={[
                                        form.formState.errors.notes,
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
                        form="business-target"
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
                            "Create target"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}