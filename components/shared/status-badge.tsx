import { Badge } from "@/components/ui/badge"
import {
  APPOINTMENT_STATUS_BADGE_VARIANT,
  APPOINTMENT_STATUS_LABELS,
  type AppointmentStatus,
} from "@/lib/constants/appointment-status"
import { cn } from "@/lib/utils"

type StatusBadgeProps = {
  status: AppointmentStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant={APPOINTMENT_STATUS_BADGE_VARIANT[status]}
      className={cn(className)}
    >
      {APPOINTMENT_STATUS_LABELS[status]}
    </Badge>
  )
}
