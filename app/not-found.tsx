import Link from "next/link"
import { PawPrint } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-navy text-white">
        <PawPrint className="size-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-navy">404</h1>
        <p className="max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button render={<Link href="/" />}>Back to home</Button>
        <Button variant="outline" render={<Link href="/admin" />}>
          Go to dashboard
        </Button>
      </div>
    </main>
  )
}
