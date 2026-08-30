import { Suspense } from "react"

import { LoginForm } from "@/components/auth/login-form"
import { Skeleton } from "@/components/ui/skeleton"
import { redirectIfAuthenticated } from "@/lib/auth/session"

type LoginPageProps = PageProps<"/login">

const LOGIN_MESSAGES: Record<string, string> = {
  password_updated: "Your password was updated. Sign in with your new password.",
  verification_failed: "Email verification failed. Try signing in or sign up again.",
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectIfAuthenticated()

  const params = await searchParams
  const messageKey =
    typeof params.message === "string" ? params.message : undefined
  const initialMessage = messageKey
    ? LOGIN_MESSAGES[messageKey]
    : undefined
  const redirectTo =
    typeof params.redirectTo === "string" ? params.redirectTo : undefined

  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="mx-auto h-8 w-32" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      }
    >
      <LoginForm redirectTo={redirectTo} initialMessage={initialMessage} />
    </Suspense>
  )
}
