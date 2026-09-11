import {
  listDaycareTransactionHistory,
} from "@/lib/supabase/queries/daycare-transactions"

import { DaycareHistoryManager } from "./daycare-history-manager"
import { DaycareTransactionRow, PetRow } from "@/lib/supabase/types"

type HistoryTabProps = {
  searchParams: {
    from?: string
    to?: string
    petId?: string
    status?: string
  },
  pets: PetRow[]
  transactions: DaycareTransactionRow[]
}

export async function HistoryTab({
  pets,
  searchParams,
  transactions
}: HistoryTabProps) {

  // const status =
  //   searchParams.status === "checked_out" ||
  //   searchParams.status === "cancelled"
  //     ? searchParams.status
  //     : undefined

  // const transactions =
  //   await listDaycareTransactionHistory({
  //     from: searchParams.from,
  //     to: searchParams.to,
  //     petId: searchParams.petId,
  //     status,
  //   })

  return (
    <DaycareHistoryManager
      transactions={transactions}
      pets={pets}
    />
  )
}