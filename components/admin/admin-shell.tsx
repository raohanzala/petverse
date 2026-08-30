"use client"

import { AppSidebar } from "@/components/admin/app-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import type { AdminUserInfo } from "@/components/admin/nav-user"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function AdminShell({
  user,
  children,
}: {
  user: AdminUserInfo
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar user={user} />
      <SidebarInset className="min-h-svh bg-background">
        <AdminHeader user={user} />
        <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
