"use client"

import { SearchIcon } from "lucide-react"
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import {
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react"

import type { ConversationStageFilter } from "@/lib/constants/conversations-filters"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const STAGE_LABELS: Record<
  ConversationStageFilter,
  string
> = {
  all: "All stages",
  inquiry: "Inquiry only",
  engaged: "Engaged only",
  quoted: "Quoted only",
  booked: "Booked only",
  visited: "Visited only",
  closed_lost: "Closed lost only",
  closed_won: "Closed won only",
}

type ConversationsFiltersProps = {
  initialSearch?: string
  initialStage: ConversationStageFilter
  onLoadingChange?: (isLoading: boolean) => void
  className?: string
}

export function ConversationsFilters({
  initialSearch = "",
  initialStage,
  onLoadingChange,
  className,
}: ConversationsFiltersProps) {
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
      stage?: ConversationStageFilter
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

      if (updates.stage !== undefined) {
        if (updates.stage === "all") {
          params.delete("stage")
        } else {
          params.set("stage", updates.stage)
        }
      }

      const query = params.toString()

      startTransition(() => {
        router.replace(
          query
            ? `${pathname}?${query}`
            : pathname
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
          placeholder="Search conversations…"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="h-9 bg-white pl-9 shadow-none"
          aria-label="Search conversations"
        />
      </div>

      <Select
        value={initialStage}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            stage: value as ConversationStageFilter,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue>
            {initialStage === "all"
              ? STAGE_LABELS.all
              : `Stage: ${STAGE_LABELS[initialStage]}`}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            {STAGE_LABELS.all}
          </SelectItem>

          <SelectItem value="inquiry">
            {STAGE_LABELS.inquiry}
          </SelectItem>

          <SelectItem value="engaged">
            {STAGE_LABELS.engaged}
          </SelectItem>

          <SelectItem value="quoted">
            {STAGE_LABELS.quoted}
          </SelectItem>

          <SelectItem value="booked">
            {STAGE_LABELS.booked}
          </SelectItem>

          <SelectItem value="visited">
            {STAGE_LABELS.visited}
          </SelectItem>

          <SelectItem value="closed_lost">
            {STAGE_LABELS.closed_lost}
          </SelectItem>

          <SelectItem value="closed_won">
            {STAGE_LABELS.closed_won}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}