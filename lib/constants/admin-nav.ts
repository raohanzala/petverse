import {
  BarChart3,
  Calendar,
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  Package,
  PawPrint,
  Settings,
  Star,
  Stethoscope,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react"

export type AdminNavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export type AdminNavGroup = {
  label?: string
  items: AdminNavItem[]
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Appointments",
    items: [
      { title: "Appointments", href: "/admin/appointments", icon: CalendarCheck },
      { title: "Calendar", href: "/admin/calendar", icon: Calendar },
    ],
  },
  {
    label: "Pets & Clients",
    items: [
      { title: "Pets", href: "/admin/pets", icon: PawPrint },
      { title: "Customers", href: "/admin/customers", icon: Users },
    ],
  },
  {
    label: "Services",
    items: [
      { title: "Services", href: "/admin/services", icon: Wrench },
      { title: "Packages", href: "/admin/packages", icon: Package },
    ],
  },
  {
    label: "Staff",
    items: [
      { title: "Professionals", href: "/admin/professionals", icon: Stethoscope },
      { title: "Schedules", href: "/admin/schedules", icon: ClipboardList },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "Reports", href: "/admin/reports", icon: BarChart3 },
      { title: "Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    label: "Settings",
    items: [{ title: "Settings", href: "/admin/settings", icon: Settings }],
  },
]

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin" || pathname === "/admin/home"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
