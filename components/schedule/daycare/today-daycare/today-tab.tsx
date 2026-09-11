import { TodayDaycareManager } from "./today-daycare-manager"
import { parseDaycareTodayFilters } from "@/lib/constants/daycare-today-filters"
import { DaycareTransactionRow } from "@/lib/supabase/types"

type TodayTabProps = {
  searchParams: Record<
    string,
    string | string[] | undefined
  >
  transactions: DaycareTransactionRow[]
}

export async function TodayTab({
  searchParams,
  transactions
}: TodayTabProps) {
  const filters =
    parseDaycareTodayFilters(searchParams)

  return (
    <TodayDaycareManager
      transactions={transactions}
      filters={filters}
    />
  )
}