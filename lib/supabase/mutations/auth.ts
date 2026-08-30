"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import {
  AUTH_ROUTES,
  DEFAULT_LOGIN_REDIRECT,
} from "@/lib/constants/auth"
import { createClient } from "@/lib/supabase/server"
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validations/auth"

export type AuthActionState = {
  error?: string
  success?: string
}

async function getSiteOrigin() {
  const headersList = await headers()
  return (
    headersList.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  )
}

function getFieldError(
  issues: { message: string }[],
  fallback = "Invalid input"
) {
  return issues[0]?.message ?? fallback
}

export async function signInWithPassword(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: getFieldError(parsed.error.issues) }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: error.message }
  }

  const redirectTo =
    formData.get("redirectTo")?.toString() || DEFAULT_LOGIN_REDIRECT

  redirect(redirectTo.startsWith("/admin") ? redirectTo : DEFAULT_LOGIN_REDIRECT)
}

export async function signUpWithPassword(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!parsed.success) {
    return { error: getFieldError(parsed.error.issues) }
  }

  const origin = await getSiteOrigin()
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}${AUTH_ROUTES.confirm}`,
      data: {
        full_name: parsed.data.fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user && !data.session) {
    return {
      success:
        "Account created. Check your email to confirm your address before signing in.",
    }
  }

  redirect(DEFAULT_LOGIN_REDIRECT)
}

export async function sendPasswordResetEmail(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  })

  if (!parsed.success) {
    return { error: getFieldError(parsed.error.issues) }
  }

  const origin = await getSiteOrigin()
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}${AUTH_ROUTES.resetPassword}`,
  })

  if (error) {
    return { error: error.message }
  }

  return {
    success:
      "If an account exists for that email, we sent a password reset link.",
  }
}

export async function updatePassword(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!parsed.success) {
    return { error: getFieldError(parsed.error.issues) }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect(`${AUTH_ROUTES.login}?message=password_updated`)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(AUTH_ROUTES.login)
}
