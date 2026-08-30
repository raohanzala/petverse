import {
  CalendarDays,
  DollarSign,
  PawPrint,
  Star,
  Users,
} from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSessionUser } from "@/lib/auth/session"

export default async function AdminDashboardPage() {
  const user = await getSessionUser()
  const displayName =
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name ??
    user?.email?.split("@")[0] ??
    "Admin"

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${displayName}! 👋`}
        description="Here's what's happening at your clinic today."
        actions={
          <Button variant="outline" className="hidden sm:inline-flex">
            <CalendarDays />
            Aug 24 – Aug 30, 2026
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Appointments"
          value={248}
          icon={CalendarDays}
          trend={{ value: "↑ 12.5%", positive: true }}
        />
        <StatCard
          title="Total Customers"
          value={156}
          icon={Users}
          trend={{ value: "↑ 8.2%", positive: true }}
        />
        <StatCard
          title="Total Pets"
          value={203}
          icon={PawPrint}
          trend={{ value: "↑ 5.4%", positive: true }}
        />
        <StatCard
          title="Total Revenue"
          value="$12,450"
          icon={DollarSign}
          trend={{ value: "↑ 15.3%", positive: true }}
        />
        <StatCard
          title="Average Rating"
          value="4.8"
          icon={Star}
          trend={{ value: "↑ 0.2", positive: true }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Appointments overview</CardTitle>
            <CardDescription>
              Confirmed vs completed appointments this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
              Chart placeholder — wire up with your analytics provider
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent appointments</CardTitle>
            <CardDescription>Latest bookings across services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { pet: "Luna", service: "Grooming", status: "Confirmed" },
              { pet: "Max", service: "Vaccination", status: "Pending" },
              { pet: "Bella", service: "Check-up", status: "Confirmed" },
            ].map((item) => (
              <div
                key={item.pet}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div>
                  <p className="font-medium text-foreground">{item.pet}</p>
                  <p className="text-muted-foreground">{item.service}</p>
                </div>
                <span className="rounded-full bg-info/15 px-2.5 py-0.5 text-xs font-medium text-info-foreground">
                  {item.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
