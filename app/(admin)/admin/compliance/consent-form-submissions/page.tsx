import { Suspense } from "react"

import { ConsentFormSubmissionsManager } from "@/components/compliance/consent-form-submissions/consent-form-submissions-manager"
import { PageLoader } from "@/components/shared/page-loader"
import {
  parseConsentFormSubmissionListFilters,
} from "@/lib/constants/consent-form-submission-filters"
import {
  listConsentFormSubmissionAppointments,
  listConsentFormSubmissionOwners,
  listConsentFormSubmissionPets,
  listConsentFormSubmissionTemplates,
  listConsentFormSubmissions,
} from "@/lib/supabase/queries/consent-form-submissions"

type ConsentFormSubmissionsPageProps = {
  searchParams: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >
}

export default async function ConsentFormSubmissionsPage({
  searchParams,
}: ConsentFormSubmissionsPageProps) {
  const params =
    await searchParams

  const filters =
    parseConsentFormSubmissionListFilters(
      params
    )

  const [
    submissions,
    templates,
    owners,
    pets,
    appointments,
  ] = await Promise.all([
    listConsentFormSubmissions(
      filters
    ),
    listConsentFormSubmissionTemplates(),
    listConsentFormSubmissionOwners(),
    listConsentFormSubmissionPets(),
    listConsentFormSubmissionAppointments(),
  ])

  return (
    <Suspense
      fallback={
        <PageLoader label="Loading consent form submissions…" />
      }
    >
      <ConsentFormSubmissionsManager
        submissions={submissions}
        filters={filters}
        templates={templates}
        owners={owners}
        pets={pets}
        appointments={appointments}
      />
    </Suspense>
  )
}