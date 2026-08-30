import type { VariantProps } from "class-variance-authority"

import { badgeVariants } from "@/components/ui/badge"

export const APPOINTMENT_STATUSES = [
  "requested",
  "confirmed",
  "arrived",
  "in_service",
  "completed",
  "cancelled",
  "no_show",
] as const

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number]

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  arrived: "Arrived",
  in_service: "In service",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
}

export const APPOINTMENT_STATUS_BADGE_VARIANT: Record<
  AppointmentStatus,
  BadgeVariant
> = {
  requested: "pending",
  confirmed: "confirmed",
  arrived: "info",
  in_service: "warning",
  completed: "completed",
  cancelled: "cancelled",
  no_show: "destructive",
}
