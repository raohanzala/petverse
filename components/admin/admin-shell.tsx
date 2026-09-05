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
    <SidebarProvider defaultOpen className="h-svh overflow-hidden">
      <AppSidebar user={user} />
      <SidebarInset className="min-w-0 overflow-hidden">
        <AdminHeader user={user} />
        <div className="min-h-0 min-w-0 flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
