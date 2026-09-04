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

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type ServicePackageStepsFiltersProps = {
  initialSearch?: string
  initialPackageId?: number
  initialServiceId?: string
  packages?: {
    id: number
    name: string
  }[]
  services?: {
    id: string
    name: string
  }[]
  onLoadingChange?: (isLoading: boolean) => void
  className?: string
}

export function ServicePackageStepsFilters({
  initialSearch = "",
  initialPackageId,
  initialServiceId,
  packages = [],
  services = [],
  onLoadingChange,
  className,
}: ServicePackageStepsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(initialSearch)

  useEffect(() => {
    setSearch(initialSearch)
  }, [initialSearch])

  useEffect(() => {
    onLoadingChange?.(isPending)
  }, [isPending, onLoadingChange])

  const selectedPackageLabel =
    initialPackageId === undefined
      ? "All packages"
      : `Package: ${packages.find(
        (pkg) => pkg.id === initialPackageId
      )?.name ?? "All packages"}`

  const selectedServiceLabel =
    initialServiceId === undefined
      ? "All services"
      : `Service: ${services.find(
        (service) => service.id === initialServiceId
      )?.name ?? "All services"}`

  const updateParams = useCallback(
    (
      updates: {
        q?: string | null
        packageId?: number | null
        serviceId?: string | null
      }
    ) => {
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

      if (updates.packageId !== undefined) {
        if (updates.packageId === null) {
          params.delete("packageId")
        } else {
          params.set(
            "packageId",
            String(updates.packageId)
          )
        }
      }

      if (updates.serviceId !== undefined) {
        if (updates.serviceId === null) {
          params.delete("serviceId")
        } else {
          params.set("serviceId", updates.serviceId)
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
          placeholder="Search packages or services…"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="h-9 bg-white pl-9 shadow-none"
          aria-label="Search packages or services"
        />
      </div>

      <Select
        value={
          initialPackageId !== undefined
            ? String(initialPackageId)
            : "all"
        }
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            packageId:
              value === "all" ? null : Number(value),
          })
        }}
      >
        <SelectTrigger className="h-9 w-[190px]">
          <SelectValue>
            {selectedPackageLabel}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All packages
          </SelectItem>

          {packages.map((pkg) => (
            <SelectItem
              key={pkg.id}
              value={String(pkg.id)}
            >
              {pkg.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={initialServiceId ?? "all"}
        onValueChange={(value) => {
          if (!value) return

          updateParams({
            serviceId:
              value === "all" ? null : value,
          })
        }}
      >
        <SelectTrigger className="h-9 w-[190px]">
          <SelectValue>
            {selectedServiceLabel}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All services
          </SelectItem>

          {services.map((service) => (
            <SelectItem
              key={service.id}
              value={service.id}
            >
              {service.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}