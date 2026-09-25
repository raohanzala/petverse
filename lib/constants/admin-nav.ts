import {
  BellRing,
  Boxes,
  BriefcaseBusiness,
  CalendarCheck,
  CalendarDays,
  CalendarX2,
  ContactRound,
  Dog,
  FileCheck2,
  FilePenLine,
  FileText,
  FolderTree,
  Hotel,
  Inbox,
  LayoutDashboard,
  ListChecks,
  MessagesSquare,
  Newspaper,
  Package,
  PawPrint,
  ReceiptText,
  Send,
  Settings,
  ShieldCheck,
  Syringe,
  Target,
  Truck,
  UserRound,
  UserRoundCog,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import { APP_FEATURES, AppFeature } from "../features/feature-registry"

export type AdminNavItem = {
  title: string
  href: string
  icon: LucideIcon
  feature?: AppFeature
}

export type AdminNavGroup = {
  label?: string
  items: AdminNavItem[]
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    label: "Schedule",
    items: [
      {
        title: "Appointments",
        href: "/admin/appointments",
        icon: CalendarCheck,
      },
      {
        title: "Boarding",
        href: "/admin/schedule/boarding",
        icon: Hotel,
        feature: APP_FEATURES.BOARDING,
      },
      {
        title: "Daycare",
        href: "/admin/schedule/daycare",
        icon: Dog,
        feature: APP_FEATURES.DAYCARE,
      },
    ],
  },

  {
    label: "Pets & Clients",
    items: [
      {
        title: "Pets",
        href: "/admin/clients/pets",
        icon: PawPrint,
        feature: APP_FEATURES.PETS,
      },
      {
        title: "Owners",
        href: "/admin/clients/owners",
        icon: UserRound,
      },
    ],
  },

  {
    label: "Communications",
    items: [
      {
        title: "Conversations",
        href: "/admin/communications/conversations",
        icon: MessagesSquare,
      },
      {
        title: "Inbox",
        href: "/admin/communications/inbox",
        icon: Inbox,
      },
      {
        title: "Message Templates",
        href: "/admin/communications/message-templates",
        icon: FileText,
      },
      {
        title: "Reminder Logs",
        href: "/admin/communications/reminder-logs",
        icon: BellRing,
      },
      {
        title: "Campaign Contacts",
        href: "/admin/communications/campaign-contacts",
        icon: ContactRound,
      },
      {
        title: "Outbound Campaigns",
        href: "/admin/communications/outbound-campaigns",
        icon: Send,
      },
      {
        title: "Campaign Blackout Periods",
        href: "/admin/communications/campaign-blackout-periods",
        icon: CalendarX2,
      },
      {
        title: "Daily Updates",
        href: "/admin/communications/daily-updates",
        icon: Newspaper,
        feature: APP_FEATURES.PET_UPDATES,
      },
    ],
  },

  {
    label: "CRM",
    items: [
      {
        title: "Business Targets",
        href: "/admin/crm/business-targets",
        icon: Target,
      },
      {
        title: "Owner Retention Settings",
        href: "/admin/crm/owner-retention-settings",
        icon: UserRoundCog,
      },
    ],
  },

  {
    label: "Sales",
    items: [
      {
        title: "Billing",
        href: "/admin/sales/billing",
        icon: ReceiptText,
      },
    ],
  },

  {
    label: "Inventory",
    items: [
      {
        title: "Suppliers",
        href: "/admin/inventory/suppliers",
        icon: Truck,
      },
      {
        title: "Products",
        href: "/admin/inventory/products",
        icon: Boxes,
      },
    ],
  },

  {
    label: "Compliance",
    items: [
      {
        title: "Vaccine Types",
        href: "/admin/compliance/vaccine-types",
        icon: Syringe,
      },
      {
        title: "Pet Vaccinations",
        href: "/admin/compliance/pet-vaccinations",
        icon: ShieldCheck,
        feature: APP_FEATURES.VACCINATIONS,
      },
      {
        title: "Consent Form Templates",
        href: "/admin/compliance/consent-form-templates",
        icon: FilePenLine,
      },
      {
        title: "Consent Form Submissions",
        href: "/admin/compliance/consent-form-submissions",
        icon: FileCheck2,
      },
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
      {
        title: "Services",
        href: "/admin/catalog/services",
        icon: BriefcaseBusiness,
      },
      {
        title: "Packages",
        href: "/admin/catalog/packages",
        icon: Package,
      },
      {
        title: "Package Steps",
        href: "/admin/catalog/package-steps",
        icon: ListChecks,
      },
    ],
  },

  {
    label: "Staff",
    items: [
      {
        title: "Employees",
        href: "/admin/staff/employees",
        icon: UsersRound,
      },
      {
        title: "Schedules",
        href: "/admin/staff/schedule",
        icon: CalendarDays,
      },
    ],
  },

  {
    label: "Settings",
    items: [
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
]

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin" || pathname === "/admin/home"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}