import { Suspense } from "react"

import { BoardingPageContent } from "@/components/schedule/boarding/boarding-page-content"
import { PageLoader } from "@/components/shared/page-loader"

type BoardingPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function BoardingPage({
  searchParams,
}: BoardingPageProps) {
  const params = await searchParams

  const tab =
    typeof params.tab === "string"
      ? params.tab
      : "room-board"

  const reservationId =
    typeof params.reservationId === "string"
      ? params.reservationId
      : undefined

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading boarding…" />
      }
    >
      <BoardingPageContent
        tab={
          tab as
            | "room-board"
            | "reservations"
            | "attendance"
            | "waitlist"
            | "instructions"
            | "transfers"
            | "facilities"
        }
        params={{
          reservationId,
        }}
        searchParams={params}
      />
    </Suspense>
  )
}