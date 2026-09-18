"use client"

import { useState } from "react"

import { DaycarePackagesManager } from "./packages/daycare-packages-manager"
import { DaycarePricingManager } from "./pricing/daycare-pricing-manager"
import { DaycareWalletsManager } from "./wallets/daycare-wallets-manager"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import type {
  DaycarePackageRow,
  DaycarePricingRow,
  DaycareWalletRow,
  OwnerRow,
  PetRow,
} from "@/lib/supabase/types"
import { DaycarePackageListFilters, DaycareWalletListFilters } from "@/lib/constants/daycare-billing-filters"

type BillingPacksManagerProps = {
  pricing: DaycarePricingRow | null
  packages: DaycarePackageRow[]
  wallets: DaycareWalletRow[]
  packageFilters: DaycarePackageListFilters
  walletFilters: DaycareWalletListFilters
  pets: PetRow[]
  owners: OwnerRow[]

}

type BillingPackTab = "pricing" | "packages" | "wallets"

const FILTERS: {
  value: BillingPackTab
  label: string
}[] = [
    {
      value: "pricing",
      label: "Pricing"
    },
    {
      value: "packages",
      label: "Packages"
    },
    {
      value: "wallets",
      label: "Wallets"
    }
  ]

export function BillingPacksManager({
  pricing,
  packages,
  wallets,
  packageFilters,
  walletFilters,
  pets,
  owners
}: BillingPacksManagerProps) {
  const [activeTab, setActiveTab] =
    useState<BillingPackTab>("pricing")

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as BillingPackTab)
        }
      >
        <TabsList variant="compact" className="w-fit">
          {FILTERS.map((item) => {

            return (
              <TabsTrigger
                key={item.value}
                value={item.value}
              >
                {item.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="pricing">
          <DaycarePricingManager pricing={pricing} />
        </TabsContent>

        <TabsContent value="packages">
          <DaycarePackagesManager filters={packageFilters} packages={packages} />
        </TabsContent>

        <TabsContent value="wallets">
          <DaycareWalletsManager pets={pets} packages={packages} owners={owners} filters={walletFilters} wallets={wallets} />
        </TabsContent>
      </Tabs>
    </div>
  )
}