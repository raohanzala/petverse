import { BillingPacksManager } from "./billing-packs-manager"
import type {
    DaycarePackageListFilters,
    DaycareWalletListFilters,
} from "@/lib/constants/daycare-billing-filters"
import type {
    DaycarePackageRow,
    DaycarePricingRow,
    DaycareWalletRow,
    OwnerRow,
    PetRow,
} from "@/lib/supabase/types"

type BillingPacksTabProps = {
    pricing: DaycarePricingRow | null
    packages: DaycarePackageRow[]
    wallets: DaycareWalletRow[]
    packageFilters: DaycarePackageListFilters
    walletFilters: DaycareWalletListFilters
    pets: PetRow[]
    owners: OwnerRow[]
}

export function BillingPacksTab({
    pricing,
    packages,
    wallets,
    packageFilters,
    walletFilters,
    pets,
    owners
}: BillingPacksTabProps) {
    return (
        <BillingPacksManager
            pets={pets}
            owners={owners}
            pricing={pricing}
            packages={packages}
            wallets={wallets}
            packageFilters={packageFilters}
            walletFilters={walletFilters}
        />
    )
}