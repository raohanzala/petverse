import { Badge } from "@/components/ui/badge"
import type { DaycareTransactionRow } from "@/lib/supabase/types"

type DaycareSessionStatusBadgeProps = {
  status: DaycareTransactionRow["status"]
}

const STATUS_LABELS: Record<
  DaycareTransactionRow["status"],
  string
> = {
  scheduled: "Scheduled",
  checked_in: "Checked In",
  checked_out: "Checked Out",
  cancelled: "Cancelled",
}

export function DaycareSessionStatusBadge({
  status,
}: DaycareSessionStatusBadgeProps) {
  return (
    <Badge variant="outline">
      {STATUS_LABELS[status]}
    </Badge>
  )
}