"use client"

import {
  CalendarDays,
  Clock3,
  Home,
  PawPrint,
  UserRound,
} from "lucide-react"

import type { DaycareScheduleListRow } from "@/lib/supabase/types"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type DaycareSchedulePreviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: DaycareScheduleListRow | null
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const

function formatDays(days?: number[] | null) {
  if (!Array.isArray(days) || days.length === 0) {
    return "No days selected"
  }

  return [...days]
    .sort((a, b) => a - b)
    .map((day) => DAYS_OF_WEEK[day])
    .filter(Boolean)
    .join(", ")
}

function formatDateTime(value?: string | null) {
  if (!value) return "—"

  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function DetailItem({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        <span>{label}</span>
      </div>

      <div className="text-sm font-medium">
        {children}
      </div>
    </div>
  )
}

export function DaycareSchedulePreviewDialog({
  open,
  onOpenChange,
  schedule,
}: DaycareSchedulePreviewDialogProps) {
  if (!schedule) return null

  const pet = schedule.pet
  const owner = schedule.owner
  const resource = schedule.resource

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Daycare Schedule Details</DialogTitle>

          <DialogDescription>
            View the details of this recurring daycare schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Pet header */}
          <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <PawPrint className="size-5 text-primary" />
              </div>

              <div>
                <p className="font-medium">
                  {pet?.name ?? "Unknown pet"}
                </p>

                <p className="text-sm text-muted-foreground">
                  {pet?.species ?? "Unknown species"}
                </p>
              </div>
            </div>

            {schedule.is_active ? (
              <Badge variant="completed">
                Active
              </Badge>
            ) : (
              <Badge variant="secondary">
                Inactive
              </Badge>
            )}
          </div>

          {/* Main details */}
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              icon={UserRound}
              label="Owner"
            >
              {owner?.name ?? "Unknown owner"}
            </DetailItem>

            <DetailItem
              icon={Home}
              label="Resource"
            >
              {resource?.name ?? "Unassigned"}

              {resource?.type && (
                <span className="ml-2 text-xs font-normal capitalize text-muted-foreground">
                  ({resource.type})
                </span>
              )}
            </DetailItem>

            <DetailItem
              icon={CalendarDays}
              label="Days"
            >
              {formatDays(schedule.days_of_week)}
            </DetailItem>

            <DetailItem
              icon={Clock3}
              label="Schedule Time"
            >
              <div className="space-y-0.5">
                <p>
                  {formatDateTime(schedule.starts_at)}
                </p>

                <p className="text-xs font-normal text-muted-foreground">
                  to {formatDateTime(schedule.ends_at)}
                </p>
              </div>
            </DetailItem>
          </div>

          {/* Date range */}
          <div className="rounded-lg border p-4">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />

              <h3 className="text-sm font-medium">
                Schedule Period
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  Starts
                </p>

                <p className="mt-1 text-sm font-medium">
                  {formatDateTime(schedule.starts_at)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Ends
                </p>

                <p className="mt-1 text-sm font-medium">
                  {formatDateTime(schedule.ends_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}