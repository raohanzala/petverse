"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    PAYMENT_LINK_STATUS_FILTERS,
    type PaymentLinkStatusFilter,
} from "@/lib/constants/payment-link-filters"

type PaymentLinksFiltersProps = {
    initialSearch?: string
    initialStatus?: PaymentLinkStatusFilter
    onLoadingChange: (loading: boolean) => void
}

const STATUS_LABELS: Record<
    PaymentLinkStatusFilter,
    string
> = {
    all: "All statuses",
    active: "Active",
    used: "Used",
    expired: "Expired",
}

export function PaymentLinksFilters({
    initialSearch = "",
    initialStatus = "all",
    onLoadingChange
}: PaymentLinksFiltersProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    function updateParams(
        updates: Record<string, string | undefined>
    ) {
        const params =
            new URLSearchParams(searchParams)

        Object.entries(updates).forEach(
            ([key, value]) => {
                if (value) {
                    params.set(key, value)
                } else {
                    params.delete(key)
                }
            }
        )

        onLoadingChange(true)

        router.push(
            `${pathname}?${params.toString()}`
        )
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                    defaultValue={initialSearch}
                    placeholder="Search payment links..."
                    className="h-9 w-[240px] pl-9"
                    onKeyDown={(event) => {
                        if (event.key !== "Enter") {
                            return
                        }

                        updateParams({
                            payment_link_q:
                                event.currentTarget.value.trim() ||
                                undefined,
                        })
                    }}
                />
            </div>

            <Select
                value={initialStatus}
                onValueChange={(value) => {
                    const status =
                        value as PaymentLinkStatusFilter

                    updateParams({
                        payment_link_status:
                            status === "all"
                                ? undefined
                                : status,
                    })
                }}
            >
                <SelectTrigger className="h-9 w-[150px]">
                    <SelectValue>
                        {initialStatus !== "all"
                            ? `Status: ${STATUS_LABELS[initialStatus]}`
                            : "Status"}
                    </SelectValue>
                </SelectTrigger>

                <SelectContent>
                    {PAYMENT_LINK_STATUS_FILTERS.map(
                        (status) => (
                            <SelectItem
                                key={status}
                                value={status}
                            >
                                {STATUS_LABELS[status]}
                            </SelectItem>
                        )
                    )}
                </SelectContent>
            </Select>
        </div>
    )
}