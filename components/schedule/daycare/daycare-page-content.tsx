import { DaycareTabs } from "./daycare-tabs"
import type {
  DaycarePackageListFilters,
  DaycareWalletListFilters,
} from "@/lib/constants/daycare-billing-filters"
import type {
  DaycarePackageRow,
  DaycarePricingRow,
  DaycareScheduleListRow,
  DaycareScheduleRow,
  DaycareTransactionRow,
  DaycareWalletRow,
  FacilityResourceRow,
  OwnerRow,
  PetRow,
} from "@/lib/supabase/types"
import { Tabs } from "@/components/ui/tabs"

type DaycareTab =
  | "today"
  | "schedules"
  | "history"
  | "billing-packs"

type DaycarePageContentProps = {
  tab: DaycareTab
  searchParams: Record<
    string,
    string | string[] | undefined
  >
  pricing: DaycarePricingRow | null
  packages: DaycarePackageRow[]
  wallets: DaycareWalletRow[]
  packageFilters: DaycarePackageListFilters
  walletFilters: DaycareWalletListFilters
  schedules: DaycareScheduleListRow[]
  transactions: DaycareTransactionRow[]
  pets: PetRow[]
  owners: OwnerRow[]
  resources: FacilityResourceRow[]
}

export async function DaycarePageContent({
  tab,
  searchParams,
  pricing,
  packages,
  wallets,
  packageFilters,
  walletFilters,
  schedules,
  transactions,
  pets,
  owners,
  resources
}: DaycarePageContentProps) {
  return (
    <Tabs className="space-y-6">

      <DaycareTabs
      resources={resources}
        schedules={schedules}
        transactions={transactions}
        pets={pets}
        owners={owners}
        tab={tab}
        searchParams={searchParams}
        pricing={pricing}
        packages={packages}
        wallets={wallets}
        packageFilters={packageFilters}
        walletFilters={walletFilters}
      />
    </Tabs>
  )
}