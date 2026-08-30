import { signOut } from "@/lib/supabase/mutations/auth"
import { getSessionUser } from "@/lib/auth/session"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function AdminHomePage() {
  const user = await getSessionUser()

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Admin dashboard</CardTitle>
        <CardDescription>
          You are signed in as {user?.email}. Scheduling and client modules will
          be built here next.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
