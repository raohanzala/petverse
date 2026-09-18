"use client"

import {
  FileText,
  Link2,
  Wallet,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import {
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export const BILLING_TABS = [
  {
    value: "invoices",
    label: "Invoices",
    icon: FileText,
  },
  {
    value: "deposits",
    label: "Deposits",
    icon: Wallet,
  },
  {
    value: "payment-links",
    label: "Payment Links",
    icon: Link2,
  },
] as const

export type BillingTab =
  (typeof BILLING_TABS)[number]["value"]

export function BillingTabsNav() {
  const router = useRouter()
  const pathname = usePathname()

  function handleTabChange(value: string) {
    const tab = value as BillingTab

    const params = new URLSearchParams()
    params.set("tab", tab)

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <TabsList
      variant="default"
      className="w-full justify-start gap-1 bg-white py-2 rounded-md"
    >
      {BILLING_TABS.map((item) => {
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