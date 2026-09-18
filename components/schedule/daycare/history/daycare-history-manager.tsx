"use client"

import { DataTable } from "@/components/shared"
import type {
    DaycareTransactionRow,
    PetRow,
} from "@/lib/supabase/types"
import { useMemo } from "react"
import { DaycareHistoryFilters } from "./daycare-history-filters"
import { getDaycareHistoryColumns } from "./daycare-history-columns"

type DaycareHistoryManagerProps = {
    transactions: DaycareTransactionRow[]
    pets: PetRow[]
}

export function DaycareHistoryManager({
    transactions,
    pets,
}: DaycareHistoryManagerProps) {
    const columns = useMemo(
        () =>
            getDaycareHistoryColumns({
                pets,
            }),
        [pets]
    )

    return (
        <div>

            <DaycareHistoryFilters
                pets={pets}
            />

            <DataTable
                columns={columns}
                data={transactions}
                pageSize={10}
                enableColumnVisibility
                emptyMessage="No daycare history found."
            />
        </div>
    )
}