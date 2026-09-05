"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "@/components/ui/toast"

import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/constants/auth"
import { signInWithPassword } from "@/lib/supabase/mutations/auth"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { Card, CardContent } from "../ui/card"
import { FcGoogle } from "react-icons/fc"

type LoginFormProps = {
  redirectTo?: string
  initialMessage?: string
}

export function LoginForm({ redirectTo, initialMessage }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resolvedRedirect =
    redirectTo ?? searchParams.get("redirectTo") ?? DEFAULT_LOGIN_REDIRECT

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginInput) {
    setIsSubmitting(true)

    const formData = new FormData()
    formData.set("email", values.email)
    formData.set("password", values.password)
    formData.set("redirectTo", resolvedRedirect)

    const result = await signInWithPassword({}, formData)

    if (result?.error) {
       toast.add({
            type: "error",
            description: result.error,
            priority: "high",
          })
      setIsSubmitting(false)
      return
    }

    router.refresh()
    setIsSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
              className="p-6 md:p-8"
            >

              <div className="flex flex-col items-center gap-2 text-center pb-10">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Sign in to manage appointments and clinic operations.
                </p>
              </div>

              <FieldGroup>

                {initialMessage ? (
                  <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                    {initialMessage}
                  </p>
                ) : null}

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
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password" className="pb-2">Password</FieldLabel>

                    <Link
                      href="/forgot-password"
                      className="ml-auto text-sm underline-offset-2 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    aria-invalid={!!form.formState.errors.password}
                    {...form.register("password")}
                  />

                  <FieldError errors={[form.formState.errors.password]} />
                </Field>

                <Field>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in…" : "Sign in"}
                  </Button>
                </Field>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with
                </FieldSeparator>

                <Field className="flex justify-center">
                  <Button type="button" variant="outline" size="icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="size-5"
                      aria-hidden="true"
                    >
                      <path
                        fill="#4285F4"
                        d="M21.35 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.23a4.47 4.47 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.92-4.18 2.92-7.21Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.75 9.75 0 0 0 12 21.5Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M6.54 13.59A5.86 5.86 0 0 1 6.24 12c0-.55.1-1.08.3-1.59V7.89H3.3A9.5 9.5 0 0 0 2.25 12c0 1.53.37 2.98 1.05 4.11l3.24-2.52Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.47 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.7 5.39l3.24 2.52C7.31 8.1 9.46 6.38 12 6.38Z"
                      />
                    </svg>
                  </Button>
                </Field>

                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="underline underline-offset-2 hover:text-primary"
                  >
                    Sign up
                  </Link>
                </FieldDescription>
              </FieldGroup>
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
