import { redirect } from "next/navigation"

import {
  AUTH_ROUTES,
  DEFAULT_LOGIN_REDIRECT,
} from "@/lib/constants/auth"
import { createClient } from "@/lib/supabase/server"

export async function getSessionUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function requireStaff() {
  const user = await getSessionUser()

  if (!user) {
    redirect(AUTH_ROUTES.login)
  }

  return user
}

export async function redirectIfAuthenticated(
  redirectTo: string = DEFAULT_LOGIN_REDIRECT
) {
  const user = await getSessionUser()

  if (user) {
    redirect(redirectTo)
  }
}
