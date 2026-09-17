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

type DepositsFiltersProps = {
  initialSearch?: string
  onLoadingChange?: (isLoading: boolean) => void
  className?: string
}

export function DepositsFilters({
  initialSearch = "",
  onLoadingChange,
  className,
}: DepositsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isPending, startTransition] =
    useTransition()

  const [search, setSearch] =
    useState(initialSearch)

  useEffect(() => {
    onLoadingChange?.(isPending)
  }, [isPending, onLoadingChange])

  const updateParams = useCallback(
    (value: string) => {
      const params = new URLSearchParams(
        searchParams.toString()
      )

      const trimmed = value.trim()

      if (trimmed) {
        params.set("deposit_q", trimmed)
      } else {
        params.delete("deposit_q")
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
    [
      pathname,
      router,
      searchParams,
    ]
  )

  const urlSearch =
    searchParams.get("deposit_q") ?? ""

  useEffect(() => {
    if (search === urlSearch) return

    const timer = window.setTimeout(() => {
      updateParams(search)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [
    search,
    urlSearch,
    updateParams,
  ])

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
          placeholder="Search deposits…"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="h-9 bg-white pl-9 shadow-none"
          aria-label="Search deposits"
        />
      </div>
    </div>
  )
}