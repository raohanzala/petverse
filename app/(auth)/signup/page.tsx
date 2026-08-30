import { SignupForm } from "@/components/auth/signup-form"
import { redirectIfAuthenticated } from "@/lib/auth/session"

export default async function SignupPage() {
  await redirectIfAuthenticated()

  return <SignupForm />
}
