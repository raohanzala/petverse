"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
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
import { createClient } from "@/lib/supabase/client"
import { updatePassword } from "@/lib/supabase/mutations/auth"
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth"

export function ResetPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecoveryReady, setIsRecoveryReady] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    const supabase = createClient()

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsRecoveryReady(true)
      }
      setIsCheckingSession(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setIsRecoveryReady(true)
        setIsCheckingSession(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function onSubmit(values: ResetPasswordInput) {
    setIsSubmitting(true)

    const formData = new FormData()
    formData.set("password", values.password)
    formData.set("confirmPassword", values.confirmPassword)

    const result = await updatePassword({}, formData)

    if (result?.error) {
      toast.error(result.error)
      setIsSubmitting(false)
    }
  }

  if (isCheckingSession) {
    return (
      <AuthCard
        title="Reset password"
        description="Verifying your reset link…"
      >
        <p className="text-sm text-muted-foreground">Please wait a moment.</p>
      </AuthCard>
    )
  }

  if (!isRecoveryReady) {
    return (
      <AuthCard
        title="Reset link expired"
        description="This password reset link is invalid or has expired."
        footer={
          <Link href="/forgot-password" className="font-medium text-primary hover:underline">
            Request a new reset link
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          Open the latest email from PetCare or request a new link.
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Set new password"
      description="Choose a strong password for your staff account."
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.password}>
            <FieldLabel htmlFor="password">New password</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              aria-invalid={!!form.formState.errors.password}
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <FieldError errors={[form.formState.errors.password]} />
            ) : null}
          </Field>

          <Field data-invalid={!!form.formState.errors.confirmPassword}>
            <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              aria-invalid={!!form.formState.errors.confirmPassword}
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword ? (
              <FieldError errors={[form.formState.errors.confirmPassword]} />
            ) : null}
          </Field>
        </FieldGroup>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Updating password…" : "Update password"}
        </Button>
      </form>
    </AuthCard>
  )
}
