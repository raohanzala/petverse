"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { BellIcon, SearchIcon } from "lucide-react"

import { AdminUserAvatar, type AdminUserInfo } from "@/components/admin/nav-user"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ADMIN_NAV_GROUPS } from "@/lib/constants/admin-nav"

export function AdminHeader({ user }: { user: AdminUserInfo }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  function navigateTo(href: string) {
    setOpen(false)
    router.push(href)
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 md:px-6">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative hidden h-10 max-w-md flex-1 items-center gap-2 rounded-md border border-transparent bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted/60 md:flex"
      >
        <SearchIcon className="size-4 shrink-0" />
        <span className="flex-1 text-left">Search pages...</span>
        <kbd className="pointer-events-none inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
        aria-label="Search pages"
      >
        <SearchIcon className="size-5" />
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search pages"
        description="Jump to an admin page from the sidebar navigation."
      >
        <Command>
          <CommandInput placeholder="Search pages..." />
          <CommandList>
            <CommandEmpty>No pages found.</CommandEmpty>
            {ADMIN_NAV_GROUPS.map((group, index) => (
              <React.Fragment key={group.label ?? group.items[0]?.href}>
                {index > 0 ? <CommandSeparator /> : null}
                <CommandGroup heading={group.label ?? "Overview"}>
                  {group.items.map((item) => (
                    <CommandItem
                      key={item.href}
                      value={`${item.title} ${group.label ?? ""} ${item.href}`}
                      onSelect={() => navigateTo(item.href)}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </React.Fragment>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>

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
