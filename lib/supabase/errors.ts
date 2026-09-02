export type MutationResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export function mutationError(message: string): MutationResult<never> {
  return { success: false, error: message }
}

export function mutationSuccess<T>(data: T): MutationResult<T> {
  return { success: true, data }
}

export function getSupabaseErrorMessage(
  error: { message: string; code?: string } | null,
  fallback = "Something went wrong"
) {
  if (!error) return fallback

  if (error.code === "23505") {
    return "A record with this slug already exists."
  }

  return error.message || fallback
}
