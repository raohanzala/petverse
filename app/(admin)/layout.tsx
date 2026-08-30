import type { User } from "@supabase/supabase-js"

import { AdminShell } from "@/components/admin/admin-shell"
import type { AdminUserInfo } from "@/components/admin/nav-user"
import { requireStaff } from "@/lib/auth/session"

function toAdminUserInfo(user: User): AdminUserInfo {
  const metadata = user.user_metadata as {
    full_name?: string
    avatar_url?: string
  }

  return {
    email: user.email,
    fullName: metadata.full_name ?? null,
    avatarUrl: metadata.avatar_url ?? null,
    role: "Administrator",
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireStaff()

  return <AdminShell user={toAdminUserInfo(user)}>{children}</AdminShell>
}
