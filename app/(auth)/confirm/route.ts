import { createClient } from "@/lib/supabase/server"
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/constants/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type")

  if (tokenHash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "email" | "signup" | "recovery" | "email_change",
    })

    if (!error) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url))
    }
  }

  return NextResponse.redirect(
    new URL("/login?message=verification_failed", request.url)
  )
}
