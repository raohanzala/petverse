"use client"

import Link from "next/link"
import { useEffect } from "react"
import { PawPrint } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <PawPrint className="size-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          Something went wrong
        </h1>
        <p className="max-w-md text-muted-foreground">
          An unexpected error occurred. You can try again or return to the
          dashboard.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" render={<Link href="/admin" />}>
          Go to dashboard
        </Button>
      </div>
    </main>
  )
}
