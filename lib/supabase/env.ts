const PLACEHOLDER_PATTERN = /your_supabase/i

export function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (
    !supabaseUrl ||
    !supabaseUrl.startsWith("http") ||
    PLACEHOLDER_PATTERN.test(supabaseUrl)
  ) {
    throw new Error(
      "Invalid NEXT_PUBLIC_SUPABASE_URL. Set your Supabase project URL in .env.local (it overrides .env)."
    )
  }

  if (
    !supabasePublishableKey ||
    PLACEHOLDER_PATTERN.test(supabasePublishableKey)
  ) {
    throw new Error(
      "Invalid NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Set your publishable key in .env.local (it overrides .env)."
    )
  }

  return {
    supabaseUrl,
    supabasePublishableKey,
  }
}
