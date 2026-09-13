import { Suspense } from "react"

import { ConsentFormTemplatesManager } from "@/components/compliance/consent-form-templates/consent-form-templates-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseConsentFormTemplateListFilters } from "@/lib/constants/consent-form-template-filters"
import { listConsentFormTemplates } from "@/lib/supabase/queries/consent-form-templates"

type ConsentFormTemplatesPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function ConsentFormTemplatesPage({
  searchParams,
}: ConsentFormTemplatesPageProps) {
  const params = await searchParams

  const filters =
    parseConsentFormTemplateListFilters(
      params
    )

  const templates =
    await listConsentFormTemplates(filters)

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading consent form templates…" />
      }
    >
      <ConsentFormTemplatesManager
        templates={templates}
        filters={filters}
      />
    </Suspense>
  )
}