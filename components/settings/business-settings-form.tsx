"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { updateBusinessSettings } from "@/lib/supabase/mutations/business-settings"
import type { BusinessSettingsRow } from "@/lib/supabase/types"
import {
  createBusinessSettingsSchema,
  type CreateBusinessSettingsInput,
} from "@/lib/validations/business-settings"

type BusinessSettingsFormProps = {
  settings: BusinessSettingsRow
}

function getSettingsValues(
  settings: BusinessSettingsRow
): CreateBusinessSettingsInput {
  return {
    business_name: settings.business_name,
    logo_url: settings.logo_url ?? "",
    timezone: settings.timezone,
    currency: settings.currency,
    phone: settings.phone ?? "",
    email: settings.email ?? "",
    address: settings.address ?? "",
    hero_title: settings.hero_title ?? "",
    hero_subtitle: settings.hero_subtitle ?? "",
  }
}

export function BusinessSettingsForm({
  settings,
}: BusinessSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateBusinessSettingsInput>({
    resolver: zodResolver(createBusinessSettingsSchema),
    defaultValues: getSettingsValues(settings),
  })

  useEffect(() => {
    form.reset(getSettingsValues(settings))
  }, [settings, form])

  async function onSubmit(values: CreateBusinessSettingsInput) {
    setIsSubmitting(true)

    const result = await updateBusinessSettings({
      id: settings.id,
      ...values,
    })

    setIsSubmitting(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    form.reset(values)
    toast.success("Business settings updated")
  }

  function onCancel() {
    form.reset(getSettingsValues(settings))
  }

  const isDirty = form.formState.isDirty
  const canSubmit = isDirty && !isSubmitting

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-6"
      >
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Business information</CardTitle>
              <CardDescription>
                Manage your business details used throughout the system.
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field data-invalid={!!form.formState.errors.business_name}>
                  <FieldLabel htmlFor="business-name">Business name</FieldLabel>
                  <Input
                    id="business-name"
                    placeholder="Pet Company 1"
                    aria-invalid={!!form.formState.errors.business_name}
                    {...form.register("business_name")}
                  />
                  <FieldError errors={[form.formState.errors.business_name]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.logo_url}>
                  <FieldLabel htmlFor="business-logo-url">Logo URL</FieldLabel>
                  <Input
                    id="business-logo-url"
                    placeholder="https://example.com/logo.png"
                    aria-invalid={!!form.formState.errors.logo_url}
                    {...form.register("logo_url")}
                  />
                  <FieldDescription>
                    Optional URL for your business logo.
                  </FieldDescription>
                  <FieldError errors={[form.formState.errors.logo_url]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.timezone}>
                  <FieldLabel htmlFor="business-timezone">Timezone</FieldLabel>
                  <Input
                    id="business-timezone"
                    placeholder="Asia/Karachi"
                    aria-invalid={!!form.formState.errors.timezone}
                    {...form.register("timezone")}
                  />
                  <FieldDescription>
                    Timezone used for appointments and business operations.
                  </FieldDescription>
                  <FieldError errors={[form.formState.errors.timezone]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.currency}>
                  <FieldLabel htmlFor="business-currency">Currency</FieldLabel>
                  <Input
                    id="business-currency"
                    placeholder="PKR"
                    aria-invalid={!!form.formState.errors.currency}
                    {...form.register("currency")}
                  />
                  <FieldDescription>
                    Currency used for service and package prices.
                  </FieldDescription>
                  <FieldError errors={[form.formState.errors.currency]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.phone}>
                  <FieldLabel htmlFor="business-phone">Phone</FieldLabel>
                  <Input
                    id="business-phone"
                    placeholder="+92 300 1234567"
                    aria-invalid={!!form.formState.errors.phone}
                    {...form.register("phone")}
                  />
                  <FieldError errors={[form.formState.errors.phone]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.email}>
                  <FieldLabel htmlFor="business-email">Email</FieldLabel>
                  <Input
                    id="business-email"
                    type="email"
                    placeholder="hello@example.com"
                    aria-invalid={!!form.formState.errors.email}
                    {...form.register("email")}
                  />
                  <FieldError errors={[form.formState.errors.email]} />
                </Field>

                <Field
                  className="md:col-span-2"
                  data-invalid={!!form.formState.errors.address}
                >
                  <FieldLabel htmlFor="business-address">Address</FieldLabel>
                  <Textarea
                    id="business-address"
                    placeholder="123 Main Street, Karachi"
                    rows={3}
                    aria-invalid={!!form.formState.errors.address}
                    {...form.register("address")}
                  />
                  <FieldError errors={[form.formState.errors.address]} />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4 border-b">
              <div className="space-y-1.5">
                <CardTitle>Public booking page</CardTitle>
                <CardDescription>
                  Customize the content visitors see on your public booking
                  page.
                </CardDescription>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                render={<Link href="/book" target="_blank" rel="noreferrer" />}
              >
                View page
                <ExternalLink className="size-4" />
              </Button>
            </CardHeader>

            <CardContent className="pb-5">
              <div className="space-y-4">
                <Field data-invalid={!!form.formState.errors.hero_title}>
                  <FieldLabel htmlFor="business-hero-title">
                    Hero title
                  </FieldLabel>
                  <Input
                    id="business-hero-title"
                    placeholder="Better care for your best friend"
                    aria-invalid={!!form.formState.errors.hero_title}
                    {...form.register("hero_title")}
                  />
                  <FieldDescription>
                    Main heading displayed on the public booking page.
                  </FieldDescription>
                  <FieldError errors={[form.formState.errors.hero_title]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.hero_subtitle}>
                  <FieldLabel htmlFor="business-hero-subtitle">
                    Hero subtitle
                  </FieldLabel>
                  <Textarea
                    id="business-hero-subtitle"
                    placeholder="Book trusted pet care services with ease."
                    rows={3}
                    aria-invalid={!!form.formState.errors.hero_subtitle}
                    {...form.register("hero_subtitle")}
                  />
                  <FieldDescription>
                    Supporting text displayed below the hero title.
                  </FieldDescription>
                  <FieldError errors={[form.formState.errors.hero_subtitle]} />
                </Field>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="sticky bottom-0 z-10 -mx-4 border-t bg-background/95 px-4 py-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:-mx-6 md:px-6">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={!canSubmit}
              onClick={onCancel}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="text-primary-foreground" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
