"use client"

import { SearchIcon } from "lucide-react"
import {
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react"
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type BoardingWaitlistFiltersProps = {
  initialSearch?: string
  onLoadingChange?: (isLoading: boolean) => void
  className?: string
}

export function BoardingWaitlistFilters({
  initialSearch = "",
  onLoadingChange,
  className,
}: BoardingWaitlistFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(initialSearch)

  useEffect(() => {
    onLoadingChange?.(isPending)
  }, [isPending, onLoadingChange])

  const updateParams = useCallback(
    (updates: { q?: string | null }) => {
      const params = new URLSearchParams(
        searchParams.toString()
      )

      if (updates.q !== undefined) {
        const value = updates.q?.trim()

        if (value) {
          params.set("boarding_waitlist_q", value)
        } else {
          params.delete("boarding_waitlist_q")
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

  const urlSearch =
    searchParams.get("boarding_waitlist_q") ?? ""

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
          placeholder="Search pets or owners…"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="h-9 bg-white pl-9 shadow-none"
          aria-label="Search pets or owners"
        />
      </div>
    </div>
  )
}