import { Suspense } from "react"

import { MessageTemplatesManager } from "@/components/communications/message-templates/message-templates-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseMessageTemplateListFilters } from "@/lib/constants/message-template-filters"
import { listMessageTemplates } from "@/lib/supabase/queries/message-templates"

type MessageTemplatesPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function MessageTemplatesPage({
  searchParams,
}: MessageTemplatesPageProps) {
  const params = await searchParams

  const filters =
    parseMessageTemplateListFilters(params)

  const templates =
    await listMessageTemplates(filters)

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading message templates…" />
      }
    >
      <MessageTemplatesManager
        templates={templates}
        filters={filters}
      />
    </Suspense>
  )
}