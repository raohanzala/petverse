"use client"

import Link from "next/link"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { Spinner } from "@/components/ui/spinner"

export default function AdminError({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <Spinner size="lg" className="text-destructive" />
      <PageHeader
        title="Admin error"
        description="We couldn't load this admin view. Please try again."
        className="items-center text-center [&>div]:items-center"
      />
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" render={<Link href="/admin" />}>
          Dashboard
        </Button>
      </div>
    </div>
  )
}
