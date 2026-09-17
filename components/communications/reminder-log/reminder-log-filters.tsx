"use client"

import { SearchIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState, useTransition } from "react"

import type {
  ReminderLogChannelFilter,
  ReminderLogStatusFilter,
} from "@/lib/constants/reminder-log-filters"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type ReminderLogFiltersProps = {
  initialSearch?: string
  initialStatus: ReminderLogStatusFilter
  initialChannel: ReminderLogChannelFilter
  onLoadingChange?: (isLoading: boolean) => void
  className?: string
}

const STATUS_LABELS: Record<
  ReminderLogStatusFilter,
  string
> = {
  all: "All statuses",
  sent: "Sent",
  failed: "Failed",
}

const CHANNEL_LABELS: Record<
  ReminderLogChannelFilter,
  string
> = {
  all: "All channels",
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
}

export function ReminderLogFilters({
  initialSearch = "",
  initialStatus,
  initialChannel,
  onLoadingChange,
  className,
}: ReminderLogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(initialSearch)

  useEffect(() => {
    onLoadingChange?.(isPending)
  }, [isPending, onLoadingChange])

  const updateParams = useCallback(
    (updates: {
      q?: string | null
      status?: ReminderLogStatusFilter
      channel?: ReminderLogChannelFilter
    }) => {
      const params = new URLSearchParams(
        searchParams.toString()
      )

      if (updates.q !== undefined) {
        const value = updates.q?.trim()

        if (value) {
          params.set("q", value)
        } else {
          params.delete("q")
        }
      }

      if (updates.status !== undefined) {
        if (updates.status === "all") {
          params.delete("status")
        } else {
          params.set("status", updates.status)
        }
      }

      if (updates.channel !== undefined) {
        if (updates.channel === "all") {
          params.delete("channel")
        } else {
          params.set("channel", updates.channel)
        }
      }

      const query = params.toString()

      startTransition(() => {
        router.replace(
          query ? `${pathname}?${query}` : pathname
        )
      })
    },
    [pathname, router, searchParams]
  )

  const urlSearch = searchParams.get("q") ?? ""

  useEffect(() => {
    if (search === urlSearch) return

    const timer = window.setTimeout(() => {
      updateParams({ q: search })
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search, urlSearch, updateParams])

  return (
    <div
      className={cn(
        "flex flex-1 flex-wrap items-center gap-2",
        className
      )}
    >
      <div className="relative w-full max-w-sm">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search reminder logs…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-9 bg-white pl-9 shadow-none"
          aria-label="Search reminder logs"
        />
      </div>

      <Select
        value={initialStatus}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            status: value as ReminderLogStatusFilter,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue>
            {initialStatus === "all"
              ? STATUS_LABELS.all
              : `Status: ${STATUS_LABELS[initialStatus]}`}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            {STATUS_LABELS.all}
          </SelectItem>

          <SelectItem value="sent">
            {STATUS_LABELS.sent}
          </SelectItem>

          <SelectItem value="failed">
            {STATUS_LABELS.failed}
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={initialChannel}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            channel: value as ReminderLogChannelFilter,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[160px]">
          <SelectValue>
            {initialChannel === "all"
              ? CHANNEL_LABELS.all
              : `Channel: ${CHANNEL_LABELS[initialChannel]}`}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            {CHANNEL_LABELS.all}
          </SelectItem>

          <SelectItem value="whatsapp">
            {CHANNEL_LABELS.whatsapp}
          </SelectItem>

          <SelectItem value="sms">
            {CHANNEL_LABELS.sms}
          </SelectItem>

          <SelectItem value="email">
            {CHANNEL_LABELS.email}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}