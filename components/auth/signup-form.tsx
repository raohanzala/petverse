"use client"

import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { signUpWithPassword } from "@/lib/supabase/mutations/auth"
import { signupSchema, type SignupInput } from "@/lib/validations/auth"
import { Card, CardContent } from "../ui/card"

export function SignupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: SignupInput) {
    setIsSubmitting(true)
    setSuccessMessage(null)

    const formData = new FormData()
    formData.set("fullName", values.fullName)
    formData.set("email", values.email)
    formData.set("password", values.password)
    formData.set("confirmPassword", values.confirmPassword)

    const result = await signUpWithPassword({}, formData)

    if (result?.error) {
      toast.error(result.error)
      setIsSubmitting(false)
      return
    }

    if (result?.success) {
      setSuccessMessage(result.success)
      form.reset()
    }

    setIsSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {successMessage ? (
            <p className="rounded-md border border-success/20 bg-success/10 px-3 py-2 text-sm text-success-foreground">
              {successMessage}
            </p>
          ) : null}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
              className="p-6 md:p-8"
            >
              <div className="flex flex-col items-center gap-2 text-center pb-10">
                <h1 className="text-2xl font-bold">
                  Create staff account
                </h1>

                <p className="text-balance text-muted-foreground">
                  Register to access the PetCare admin dashboard.
                </p>
              </div>

              <FieldGroup>
                {successMessage ? (
                  <p className="rounded-md border border-success/20 bg-success/10 px-3 py-2 text-sm text-success-foreground">
                    {successMessage}
                  </p>
                ) : null}

                <Field data-invalid={!!form.formState.errors.fullName}>
                  <FieldLabel htmlFor="fullName" className="pb-2">Full name</FieldLabel>
                  <Input
                    id="fullName"
                    autoComplete="name"
                    placeholder="Dr. Sarah Connor"
                    aria-invalid={!!form.formState.errors.fullName}
                    {...form.register("fullName")}
                  />
                  <FieldError errors={[form.formState.errors.fullName]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.email}>
                  <FieldLabel htmlFor="email" className="pb-2">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@clinic.com"
                    aria-invalid={!!form.formState.errors.email}
                    {...form.register("email")}
                  />
                  <FieldError errors={[form.formState.errors.email]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.password}>
                  <FieldLabel htmlFor="password" className="pb-2">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    aria-invalid={!!form.formState.errors.password}
                    {...form.register("password")}
                  />
                  <FieldError errors={[form.formState.errors.password]} />
                </Field>

                <Field data-invalid={!!form.formState.errors.confirmPassword}>
                  <FieldLabel htmlFor="confirmPassword" className="pb-2">Confirm password</FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    aria-invalid={!!form.formState.errors.confirmPassword}
                    {...form.register("confirmPassword")}
                  />
                  <FieldError errors={[form.formState.errors.confirmPassword]} />
                </Field>
              </FieldGroup>

              <Field>
                <Button
                  type="submit"
                  className="w-full mt-5"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Creating account…"
                    : "Create account"}
                </Button>
              </Field>

              <FieldDescription className="text-center pt-5">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="underline underline-offset-2 hover:text-primary"
                  >
                    Sign in
                  </Link>
                </FieldDescription>
            </form>
          </Form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/form-image.png"
              alt="Pet care"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
