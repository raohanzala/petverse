import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'email',
    })

    if (!error) {
      return NextResponse.redirect(
        new URL('/dashboard', request.url)
      )
    }
  }

  return NextResponse.redirect(
    new URL('/login?error=verification_failed', request.url)
  )
}