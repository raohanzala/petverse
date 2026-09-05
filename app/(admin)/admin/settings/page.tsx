import { Suspense } from "react"

import { BusinessSettingsForm } from "@/components/settings/business-settings-form"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoader } from "@/components/shared/page-loader"
import { getBusinessSettings } from "@/lib/supabase/queries/business-settings"

export default async function BusinessSettingsPage() {
  const settings = await getBusinessSettings()

  if (!settings) {
    return (
      <Suspense fallback={<PageLoader label="Loading business settings…" />}>
        <div className="mx-auto w-full max-w-4xl rounded-lg border p-6">
          <h2 className="text-lg font-semibold">
            Business settings not found
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No business settings have been configured yet.
          </p>
        </div>
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<PageLoader label="Loading business settings…" />}>
      <div className="space-y-6">
        <div className="mx-auto w-full max-w-4xl">
          <PageHeader
            title="Business settings"
            description="Manage your business information and public booking page content."
          />
        </div>

        <BusinessSettingsForm settings={settings} />
      </div>
    </Suspense>
  )
}
