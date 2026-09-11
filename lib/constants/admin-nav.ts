import {
  BellRing,
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  DollarSign,
  FileText,
  FolderTree,
  Inbox,
  LayoutDashboard,
  MessageSquareText,
  Package,
  PawPrint,
  Send,
  Settings,
  ShoppingCart,
  Stethoscope,
  Tags,
  Users,
  UsersRound,
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
    ],
  },
  {
    label: "Schedule",
    items: [
      { title: "Boarding", href: "/admin/schedule/boarding", icon: CalendarCheck },
      { title: "Daycare", href: "/admin/schedule/daycare", icon: CalendarCheck }
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
      { title: "Packages Steps", href: "/admin/catalog/package-steps", icon: Tags },
    ],
  },
  {
    label: "Staff",
    items: [
      { title: "Employees", href: "/admin/staff/employees", icon: Users },
      { title: "Schedules", href: "/admin/staff/schedule", icon: ClipboardList },
    ],
  },
  {
    label: "Sales",
    items: [
      { title: "Billing", href: "/admin/sales/billing", icon: DollarSign }
    ],
  },
  {
    label: "Communications",
    items: [
      { title: "Conversations", href: "/admin/communications/conversations", icon: MessageSquareText },
      { title: "Inbox", href: "/admin/communications/inbox", icon: Inbox },
      { title: "Message Templates", href: "/admin/communications/message-templates", icon: FileText },
      { title: "Reminder Logs", href: "/admin/communications/reminder-logs", icon: BellRing },
      { title: "Campaign Contacts", href: "/admin/communications/campaign-contacts", icon: UsersRound },
      { title: "Outbound Campaigns", href: "/admin/communications/outbound-campaigns", icon: Send },
      { title: "Campaign Blackout Periods", href: "/admin/communications/campaign-blackout-periods", icon: CalendarClock }
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
