"use client"

import { AppSidebar } from "@/components/admin/app-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminThemeProvider } from "@/components/admin/admin-theme-provider"
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
    <AdminThemeProvider>
      <SidebarProvider defaultOpen className="h-full min-h-0 w-full overflow-hidden">
        <AppSidebar user={user} />
        <SidebarInset className="min-w-0 overflow-hidden">
          <AdminHeader user={user} />
          <div className="min-h-0 min-w-0 flex-1 overflow-auto bg-background p-4 md:p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AdminThemeProvider>
  )
}
