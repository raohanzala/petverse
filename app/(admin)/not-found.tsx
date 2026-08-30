import Link from "next/link"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <PageHeader
        title="Page not found"
        description="This admin page doesn't exist yet or the URL may be incorrect."
        className="items-center text-center [&>div]:items-center"
      />
      <Button render={<Link href="/admin" />}>Back to dashboard</Button>
    </div>
  )
}
