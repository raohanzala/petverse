import { requireStaff } from "@/lib/auth/session"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireStaff()

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto flex min-h-full max-w-6xl flex-col px-6 py-10">
        {children}
      </div>
    </div>
  )
}
