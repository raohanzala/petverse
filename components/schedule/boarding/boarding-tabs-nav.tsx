"use client"

import {
  BedDouble,
  ClipboardCheck,
  ClipboardList,
  DoorOpen,
  FileText,
  Grid2X2,
  ListChecks,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import {
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export const BOARDING_TABS = [
  {
    value: "room-board",
    label: "Room Board",
    icon: Grid2X2,
  },
  {
    value: "reservations",
    label: "Reservations",
    icon: ClipboardList,
  },
  {
    value: "attendance",
    label: "Attendance",
    icon: ClipboardCheck,
  },
  {
    value: "waitlist",
    label: "Waitlist",
    icon: ListChecks,
  },
  {
    value: "instructions",
    label: "Instructions",
    icon: FileText,
  },
  {
    value: "transfers",
    label: "Transfers",
    icon: DoorOpen,
  },
  {
    value: "facilities",
    label: "Facilities",
    icon: BedDouble,
  },
] as const

export type BoardingTab =
  (typeof BOARDING_TABS)[number]["value"]

type BoardingTabsNavProps = {
  activeTab: BoardingTab
  reservationId?: string
}

export function BoardingTabsNav({
  activeTab,
  reservationId,
}: BoardingTabsNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  function handleTabChange(value: string) {
    const tab = value as BoardingTab

    const params = new URLSearchParams()

    params.set("tab", tab)

    if (tab === "attendance" && reservationId) {
      params.set("reservationId", reservationId)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <TabsList
      variant="default"
      className="w-full justify-start gap-1 rounded-none bg-white"
    >
      {BOARDING_TABS.map((item) => {
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