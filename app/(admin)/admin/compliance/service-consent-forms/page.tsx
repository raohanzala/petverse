import { Suspense } from "react"

import { ServiceConsentFormsManager } from "@/components/compliance/service-consent-form/service-consent-forms-manager"
import { PageLoader } from "@/components/shared/page-loader"
import { parseServiceConsentFormListFilters } from "@/lib/constants/service-consent-form-filters"
import {
  listServiceConsentFormServices,
  listServiceConsentFormTemplates,
  listServiceConsentForms,
} from "@/lib/supabase/queries/service-consent-forms"

type ServiceConsentFormsPageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function ServiceConsentFormsPage({
  searchParams,
}: ServiceConsentFormsPageProps) {
  const params = await searchParams

  const filters =
    parseServiceConsentFormListFilters(
      params
    )

  const selectedServiceId =
    typeof params.service === "string"
      ? params.service
      : ""

  const [
    services,
    templates,
    assignments,
  ] = await Promise.all([
    listServiceConsentFormServices(),
    listServiceConsentFormTemplates(),
    selectedServiceId
      ? listServiceConsentForms(
          selectedServiceId
        )
      : Promise.resolve([]),
  ])

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading service consent forms…" />
      }
    >
      <ServiceConsentFormsManager
        assignments={assignments}
        services={services}
        templates={templates}
        filters={filters}
        selectedServiceId={
          selectedServiceId
        }
      />
    </Suspense>
  )
}