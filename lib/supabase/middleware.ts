import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import {
  AUTH_ROUTES,
  DEFAULT_LOGIN_REDIRECT,
  PROTECTED_ROUTE_PREFIX,
} from "@/lib/constants/auth"
import { getSupabaseEnv } from "@/lib/supabase/env"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv()

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isAuthPage =
    pathname === AUTH_ROUTES.login ||
    pathname === AUTH_ROUTES.signup ||
    pathname === AUTH_ROUTES.forgotPassword

  const isProtectedRoute = pathname.startsWith(PROTECTED_ROUTE_PREFIX)

  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = AUTH_ROUTES.login
    redirectUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isAuthPage) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = DEFAULT_LOGIN_REDIRECT
    redirectUrl.search = ""
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
