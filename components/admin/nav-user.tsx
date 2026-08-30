"use client"

import Link from "next/link"
import { ChevronUpIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { signOut } from "@/lib/supabase/mutations/auth"
import { cn } from "@/lib/utils"

export type AdminUserInfo = {
  email?: string | null
  fullName?: string | null
  avatarUrl?: string | null
  role?: string
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function NavUser({
  user,
  className,
}: {
  user: AdminUserInfo
  className?: string
}) {
  const displayName =
    user.fullName?.trim() ||
    user.email?.split("@")[0] ||
    "Admin User"
  const initials = getInitials(displayName)
  const role = user.role ?? "Administrator"

  return (
    <SidebarMenu className={className}>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar size="sm" className="rounded-lg">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={displayName} />
              ) : null}
              <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium text-sidebar-foreground">
                {displayName}
              </span>
              <span className="truncate text-xs text-sidebar-foreground/60">
                {role}
              </span>
            </div>
            <ChevronUpIcon className="ml-auto text-sidebar-foreground/60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56 rounded-lg"
            side="top"
            align="end"
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar size="sm" className="rounded-lg">
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={displayName} />
                    ) : null}
                    <AvatarFallback className="rounded-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/admin/settings" />}>
                <UserIcon />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/admin/settings" />}>
                <SettingsIcon />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <form action={signOut}>
              <DropdownMenuGroup>
                <DropdownMenuItem render={<button type="submit" className="w-full" />}>
                  <LogOutIcon />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AdminUserAvatar({
  user,
  className,
}: {
  user: AdminUserInfo
  className?: string
}) {
  const displayName =
    user.fullName?.trim() ||
    user.email?.split("@")[0] ||
    "Admin"
  const initials = getInitials(displayName)

  return (
    <Avatar className={cn("size-9", className)}>
      {user.avatarUrl ? (
        <AvatarImage src={user.avatarUrl} alt={displayName} />
      ) : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}
