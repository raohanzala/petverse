"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

import {
  CONVERSATION_STAGE_FILTERS,
  type ConversationStageFilter,
} from "@/lib/constants/conversations-filters"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type InboxFiltersProps = {
  initialSearch?: string
  initialStage?: ConversationStageFilter
}

const STAGE_LABELS: Record<
  ConversationStageFilter,
  string
> = {
  all: "All stages",
  inquiry: "Inquiry",
  engaged: "Engaged",
  quoted: "Quoted",
  booked: "Booked",
  visited: "Visited",
  closed_lost: "Closed lost",
  closed_won: "Closed won",
}

export function InboxFilters({
  initialSearch = "",
  initialStage = "all",
}: InboxFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(initialSearch)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const trimmedSearch = search.trim()

    const currentSearch =
      searchParams.get("q") ?? ""

    if (trimmedSearch === currentSearch) {
      return
    }

    const timeout = setTimeout(() => {
      const params = new URLSearchParams(
        searchParams.toString()
      )

      if (trimmedSearch) {
        params.set("q", trimmedSearch)
      } else {
        params.delete("q")
      }

      startTransition(() => {
        router.push(
          `${pathname}?${params.toString()}`
        )
      })
    }, 350)

    return () => clearTimeout(timeout)
  }, [
    search,
    pathname,
    router,
    searchParams,
  ])

  function updateStage(
    value: ConversationStageFilter
  ) {
    const params = new URLSearchParams(
      searchParams.toString()
    )

    if (value === "all") {
      params.delete("stage")
    } else {
      params.set("stage", value)
    }

    startTransition(() => {
      router.push(
        `${pathname}?${params.toString()}`
      )
    })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search conversations..."
          className="pl-9"
          disabled={isPending}
        />
      </div>

      <Select
        value={initialStage}
        onValueChange={(value) => {
          if (!value) return

          updateStage(
            value as ConversationStageFilter
          )
        }}
      >
        <SelectTrigger className="h-9 w-full sm:w-[180px]">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>

        <SelectContent>
          {CONVERSATION_STAGE_FILTERS.map(
            (stage) => (
              <SelectItem
                key={stage}
                value={stage}
              >
                {STAGE_LABELS[stage]}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
    </div>
  )
}