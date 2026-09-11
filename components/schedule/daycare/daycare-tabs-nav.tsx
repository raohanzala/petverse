"use client"

import {
  CalendarDays,
  ClipboardList,
  History,
  Package,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import {
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export const DAYCARE_TABS = [
  {
    value: "today",
    label: "Today",
    icon: CalendarDays,
  },
  {
    value: "schedules",
    label: "Schedules",
    icon: ClipboardList,
  },
  {
    value: "history",
    label: "History",
    icon: History,
  },
  {
    value: "billing-packs",
    label: "Billing Packs",
    icon: Package,
  },
] as const

export type DaycareTab =
  (typeof DAYCARE_TABS)[number]["value"]

type DaycareTabsNavProps = {
  activeTab: DaycareTab
}

export function DaycareTabsNav({
  activeTab,
}: DaycareTabsNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  function handleTabChange(value: string) {
    const tab = value as DaycareTab

    const params = new URLSearchParams()
    params.set("tab", tab)

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <TabsList
      variant="line"
      className="w-full justify-start gap-1 rounded-none bg-white"
    >
      {DAYCARE_TABS.map((item) => {
        const Icon = item.icon

        return (
          <TabsTrigger
            key={item.value}
            value={item.value}
            onClick={() => handleTabChange(item.value)}
            className="flex-none gap-2 px-4 py-2"
          >
            <Icon className="size-4" />
            {item.label}
          </TabsTrigger>
        )
      })}
    </TabsList>
  )
}