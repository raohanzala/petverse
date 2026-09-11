import { Suspense } from "react"

import { DaycarePageContent } from "@/components/schedule/daycare/daycare-page-content"
import { PageLoader } from "@/components/shared/page-loader"
import {
  parseDaycarePackageFilters,
  parseDaycareWalletFilters,
} from "@/lib/constants/daycare-billing-filters"
import { listDaycarePackages } from "@/lib/supabase/queries/daycare-packages"
import { listDaycareWallets } from "@/lib/supabase/queries/daycare-wallets"
import { listActivePets } from "@/lib/supabase/queries/pets"
import { listOwners } from "@/lib/supabase/queries/owners"
import { getDaycarePricing } from "@/lib/supabase/queries/daycare-pricing"
import { listDaycareTransactionHistory } from "@/lib/supabase/queries/daycare-transactions"
import { listDaycareSchedules } from "@/lib/supabase/queries/daycare-schedules"

type DaycarePageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >
}

export default async function DaycarePage({
  searchParams,
}: DaycarePageProps) {
  const params = await searchParams

  const tab =
    typeof params.tab === "string"
      ? params.tab
      : "today"

  const packageFilters =
    parseDaycarePackageFilters(params)

  const walletFilters =
    parseDaycareWalletFilters(params)

  const [packages, wallets, pets, owners, pricing, transactions, schedules] = await Promise.all([
    listDaycarePackages(),
    listDaycareWallets(),
    listActivePets(),
    listOwners(),
    getDaycarePricing(),
    listDaycareTransactionHistory(),
    listDaycareSchedules()
  ])

  return (
    <Suspense
      fallback={<PageLoader label="Loading daycare…" />}
    >
      <DaycarePageContent
        tab={
          tab as
            | "today"
            | "schedules"
            | "history"
            | "billing-packs"
        }
        pets={pets}
        owners={owners}
        schedules={schedules}
        transactions={transactions}
        pricing={pricing}
        searchParams={params}
        packages={packages}
        wallets={wallets}
        packageFilters={packageFilters}
        walletFilters={walletFilters}
      />
    </Suspense>
  )
}