import { createClient } from '@/lib/supabase/client'

export async function signUp(
  email: string,
  password: string
) {
  const supabase = createClient()

  return await supabase.auth.signUp({
    email,
    password,
  })
}