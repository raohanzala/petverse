"use client"

import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs"

import { DaycareTabsNav } from "./daycare-tabs-nav"

import { TodayTab } from "../daycare/today-daycare/today-tab"
import { SchedulesTab } from "./schedules/schedules-tab"
import { HistoryTab } from "./history/history-tab"
import { BillingPacksTab } from "./billing-packs/billing-packs-tab"

import type {
  DaycarePackageListFilters,
  DaycareWalletListFilters,
} from "@/lib/constants/daycare-billing-filters"

import type {
  DaycarePackageRow,
  DaycarePricingRow,
  DaycareScheduleRow,
  DaycareTransactionRow,
  DaycareWalletRow,
  OwnerRow,
  PetRow,
} from "@/lib/supabase/types"

type DaycareTab =
  | "today"
  | "schedules"
  | "history"
  | "billing-packs"

type DaycareTabsProps = {
  pets: PetRow[]
  owners: OwnerRow[]
  schedules: DaycareScheduleRow[]
  transactions: DaycareTransactionRow[]
  pricing: DaycarePricingRow | null
  packages: DaycarePackageRow[]
  wallets: DaycareWalletRow[]
  packageFilters: DaycarePackageListFilters
  walletFilters: DaycareWalletListFilters
  searchParams: Record<
    string,
    string | string[] | undefined
  >
  tab: DaycareTab
}

export function DaycareTabs({
  pets,
  owners,
  schedules,
  transactions,
  pricing,
  packages,
  wallets,
  packageFilters,
  walletFilters,
  searchParams,
  tab,
}: DaycareTabsProps) {
  return (
    <Tabs
      defaultValue={tab}
      className="w-full"
    >
      <DaycareTabsNav activeTab={tab} />

      <TabsContent value="today">
        <TodayTab
          transactions={transactions}
          searchParams={searchParams}
        />
      </TabsContent>

      <TabsContent value="schedules">
        <SchedulesTab pets={pets} schedules={schedules} />
      </TabsContent>

      <TabsContent value="history">
        <HistoryTab
          transactions={transactions}
          pets={pets}
          searchParams={searchParams}
        />
      </TabsContent>

      <TabsContent value="billing-packs">
        <BillingPacksTab
          pets={pets}
          owners={owners}
          pricing={pricing}
          packages={packages}
          wallets={wallets}
          packageFilters={packageFilters}
          walletFilters={walletFilters}
        />
      </TabsContent>
    </Tabs>
  )
}