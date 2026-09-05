import {
  BarChart3,
  Calendar,
  CalendarCheck,
  ClipboardList,
  FolderTree,
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
      // { title: "Calendar", href: "/admin/calendar", icon: Calendar },
    ],
  },
  {
    label: "Pets & Clients",
    items: [
      { title: "Pets", href: "/admin/clients/pets", icon: PawPrint },
      { title: "Owners", href: "/admin/clients/owners", icon: Users },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        title: "Categories",
        href: "/admin/catalog/categories",
        icon: FolderTree,
      },
      { title: "Services", href: "/admin/catalog/services", icon: Wrench },
      { title: "Packages", href: "/admin/catalog/packages", icon: Package },
      { title: "Packages Steps", href: "/admin/catalog/package-steps", icon: Package },
    ],
  },
  {
    label: "Staff",
    items: [
      { title: "Employees", href: "/admin/staff/employees", icon: Stethoscope },
      { title: "Schedules", href: "/admin/staff/schedule", icon: ClipboardList },
    ],
  },
  // {
  //   label: "Management",
  //   items: [
  //     { title: "Reports", href: "/admin/reports", icon: BarChart3 },
  //     { title: "Reviews", href: "/admin/reviews", icon: Star },
  //   ],
  // },
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
