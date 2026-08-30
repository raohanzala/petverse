"use client"

import { BellIcon, SearchIcon } from "lucide-react"

import { AdminUserAvatar, type AdminUserInfo } from "@/components/admin/nav-user"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AdminHeader({ user }: { user: AdminUserInfo }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 md:px-6">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="hidden h-6 md:block" />

      <div className="relative hidden max-w-md flex-1 md:block">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search anything..."
          className="h-10 bg-muted/40 pl-9 shadow-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="relative flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <BellIcon className="size-5" />
          <Badge className="absolute top-1.5 right-1.5 size-4 justify-center rounded-full p-0 text-[10px]">
            3
          </Badge>
        </button>
        <AdminUserAvatar user={user} />
      </div>
    </header>
  )
}
