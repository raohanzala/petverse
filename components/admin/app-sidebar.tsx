"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PawPrint } from "lucide-react"

import { NavUser, type AdminUserInfo } from "@/components/admin/nav-user"
import {
  ADMIN_NAV_GROUPS,
  isAdminNavActive,
} from "@/lib/constants/admin-nav"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ user }: { user: AdminUserInfo }) {
  const pathname = usePathname()

  return (
    <Sidebar
      collapsible="icon"
      className="border-sidebar-border"
      style={{ "--sidebar-width-icon": "4rem" } as React.CSSProperties}
    >
      <SidebarHeader className="border-b border-sidebar-border px-2 py-5">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 text-sidebar-foreground"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-accent">
            <PawPrint className="size-5 text-gold" />
          </span>
          <span className="text-lg font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            PetCare
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {ADMIN_NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label ?? group.items[0]?.href}>
            {group.label ? (
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = isAdminNavActive(pathname, item.href)

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        render={<Link href={item.href} />}
                        tooltip={item.title}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
