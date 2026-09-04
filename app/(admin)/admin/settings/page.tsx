import { Suspense } from "react"

import { BusinessSettingsForm } from "@/components/settings/business-settings-form"
import { PageLoader } from "@/components/shared/page-loader"
import { getBusinessSettings } from "@/lib/supabase/queries/business-settings"

export default async function BusinessSettingsPage() {
  const settings = await getBusinessSettings()

  if (!settings) {
    return (
      <Suspense fallback={<PageLoader label="Loading business settings…" />}>
        <div className="rounded-lg border p-6">
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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Business settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your business information and public booking page content.
          </p>
        </div>

        <BusinessSettingsForm settings={settings} />
      </div>
    </Suspense>
  )
}