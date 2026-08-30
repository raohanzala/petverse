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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { sendPasswordResetEmail } from "@/lib/supabase/mutations/auth"
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth"

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: ForgotPasswordInput) {
    setIsSubmitting(true)
    setSuccessMessage(null)

    const formData = new FormData()
    formData.set("email", values.email)

    const result = await sendPasswordResetEmail({}, formData)

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
    <AuthCard
      title="Reset password"
      description="Enter your email and we will send you a reset link."
      footer={
        <>
          Remember your password?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {successMessage ? (
        <p className="rounded-md border border-success/20 bg-success/10 px-3 py-2 text-sm text-success-foreground">
          {successMessage}
        </p>
      ) : null}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@clinic.com"
              aria-invalid={!!form.formState.errors.email}
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <FieldError errors={[form.formState.errors.email]} />
            ) : null}
          </Field>
        </FieldGroup>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending link…" : "Send reset link"}
        </Button>
      </form>
    </AuthCard>
  )
}
