"use client"

import { format } from "date-fns"
import {
  CalendarIcon,
  CalendarDays,
  Dog,
  MoreHorizontal,
  PawPrint,
  Plus,
  Users,
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { LibrarySection } from "@/components/library/library-section"
import {
  DataTable,
  DataTableColumnHeader,
  EmptyState,
  PageHeader,
  StatCard,
  StatusBadge,
  Stepper,
  type AdminColumnDef,
} from "@/components/shared"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { AppointmentStatus } from "@/lib/constants/appointment-status"
import { APPOINTMENT_STATUSES } from "@/lib/constants/appointment-status"
import { cn } from "@/lib/utils"

type AppointmentRow = {
  id: string
  pet: string
  owner: string
  service: string
  status: AppointmentStatus
  date: string
}

const DEMO_APPOINTMENTS: AppointmentRow[] = [
  {
    id: "apt-001",
    pet: "Luna",
    owner: "Ayesha Khan",
    service: "Grooming",
    status: "confirmed",
    date: "2026-08-30",
  },
  {
    id: "apt-002",
    pet: "Max",
    owner: "Usman Raza",
    service: "Vaccination",
    status: "requested",
    date: "2026-08-30",
  },
  {
    id: "apt-003",
    pet: "Bella",
    owner: "Sara Ahmed",
    service: "Check-up",
    status: "in_service",
    date: "2026-08-29",
  },
  {
    id: "apt-004",
    pet: "Charlie",
    owner: "Ali Hassan",
    service: "Dental",
    status: "completed",
    date: "2026-08-28",
  },
  {
    id: "apt-005",
    pet: "Milo",
    owner: "Fatima Noor",
    service: "Emergency",
    status: "cancelled",
    date: "2026-08-27",
  },
]

const NAV_SECTIONS = [
  { id: "page-header", label: "Page Header" },
  { id: "buttons", label: "Buttons" },
  { id: "badges", label: "Badges" },
  { id: "status-badge", label: "Status Badge" },
  { id: "cards", label: "Cards" },
  { id: "stat-cards", label: "Stat Cards" },
  { id: "data-table", label: "Data Table" },
  { id: "empty-state", label: "Empty State" },
  { id: "stepper", label: "Stepper" },
  { id: "form-inputs", label: "Form Inputs" },
  { id: "select-tabs", label: "Select & Tabs" },
  { id: "overlays", label: "Dialogs & Menus" },
  { id: "feedback", label: "Alerts & Progress" },
  { id: "misc", label: "Avatar & Skeleton" },
] as const

export function LibraryShowcase() {
  const [species, setSpecies] = useState("dog")
  const [reminders, setReminders] = useState(true)
  const [visitType, setVisitType] = useState("routine")
  const [notes, setNotes] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [step, setStep] = useState(2)

  const columns = useMemo<AdminColumnDef<AppointmentRow>[]>(
    () => [
      {
        accessorKey: "pet",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Pet" />
        ),
      },
      {
        accessorKey: "owner",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Owner" />
        ),
      },
      {
        accessorKey: "service",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Service" />
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "date",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date" />
        ),
      },
    ],
    []
  )

  return (
    <div className="container-px mx-auto max-w-7xl py-10">
      <div className="mb-10 space-y-2">
        <div className="flex items-center gap-2 text-gold">
          <PawPrint className="size-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">
            PetCare UI Kit
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Component Library
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Live previews of reusable primitives and shared composites. Each section
          includes a short spec and a copy-friendly usage snippet.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="hidden lg:block">
          <div className="sticky top-24 space-y-1 rounded-xl border border-border bg-card p-3 shadow-sm">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sections
            </p>
            {NAV_SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {section.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="space-y-14">
          <LibrarySection
            id="page-header"
            title="PageHeader"
            description="Top-of-page title block with optional description and action slot. Use on every admin list or detail view."
            importFrom="@/components/shared"
            usage={`<PageHeader
  title="Appointments"
  description="Manage today's clinic schedule."
  actions={<Button><Plus /> New appointment</Button>}
/>`}
          >
            <PageHeader
              title="Appointments"
              description="Manage today's clinic schedule."
              actions={
                <Button size="sm">
                  <Plus />
                  New appointment
                </Button>
              }
            />
          </LibrarySection>

          <LibrarySection
            id="buttons"
            title="Button"
            description="Primary actions across the app. Variants map to navy (default), outline, ghost, gold CTA, and destructive."
            importFrom="@/components/ui/button"
            usage={`<Button variant="default">Save</Button>
<Button variant="outline">Cancel</Button>
<Button variant="gold">Book now</Button>
<Button variant="destructive" size="sm">Delete</Button>`}
          >
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="gold">Gold</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
            <Separator className="my-4" />
            <div className="flex flex-wrap items-center gap-2">
              <Button size="xs">XS</Button>
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" variant="outline" aria-label="Add">
                <Plus />
              </Button>
            </div>
          </LibrarySection>

          <LibrarySection
            id="badges"
            title="Badge"
            description="Inline labels for counts, tags, and generic statuses. Appointment-specific colors use StatusBadge instead."
            importFrom="@/components/ui/badge"
            usage={`<Badge variant="confirmed">Confirmed</Badge>
<Badge variant="pending">Pending</Badge>
<Badge variant="outline">Draft</Badge>`}
          >
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="confirmed">Confirmed</Badge>
              <Badge variant="pending">Pending</Badge>
              <Badge variant="completed">Completed</Badge>
              <Badge variant="cancelled">Cancelled</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </LibrarySection>

          <LibrarySection
            id="status-badge"
            title="StatusBadge"
            description="Typed wrapper around Badge for appointment workflow statuses. Pass a status key from lib/constants."
            importFrom="@/components/shared"
            usage={`import type { AppointmentStatus } from "@/lib/constants/appointment-status"

<StatusBadge status="confirmed" />
<StatusBadge status="in_service" />`}
          >
            <div className="flex flex-wrap gap-2">
              {APPOINTMENT_STATUSES.map((status) => (
                <StatusBadge key={status} status={status} />
              ))}
            </div>
          </LibrarySection>

          <LibrarySection
            id="cards"
            title="Card"
            description="Grouped content container with header, title, description, and body slots."
            importFrom="@/components/ui/card"
            usage={`<Card>
  <CardHeader>
    <CardTitle>Pet profile</CardTitle>
    <CardDescription>Owner and medical notes</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>`}
          >
            <Card className="max-w-md shadow-sm">
              <CardHeader>
                <CardTitle>Luna — Golden Retriever</CardTitle>
                <CardDescription>Owner: Ayesha Khan · 3 yrs</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Last visit: grooming on Aug 12. Allergies: none recorded.
              </CardContent>
            </Card>
          </LibrarySection>

          <LibrarySection
            id="stat-cards"
            title="StatCard"
            description="Dashboard KPI tile with icon, value, and optional trend line."
            importFrom="@/components/shared"
            usage={`<StatCard
  title="Today's appointments"
  value={24}
  icon={CalendarDays}
  trend={{ value: "+12% vs yesterday", positive: true }}
/>`}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                title="Today's appointments"
                value={24}
                icon={CalendarDays}
                trend={{ value: "+12% vs yesterday", positive: true }}
              />
              <StatCard
                title="Active patients"
                value="1,284"
                icon={Dog}
                trend={{ value: "+3 this week", positive: true }}
              />
              <StatCard
                title="Staff on duty"
                value={6}
                icon={Users}
              />
            </div>
          </LibrarySection>

          <LibrarySection
            id="data-table"
            title="DataTable"
            description="TanStack Table v9 admin kit: sorting, search, pagination, column visibility, and optional row selection. Define columns per feature; pass data from a server query."
            importFrom="@/components/shared/data-table"
            usage={`// columns.tsx — use DataTableColumnHeader for sortable headers
const columns: AdminColumnDef<Appointment>[] = [
  {
    accessorKey: "pet",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pet" />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
]

<DataTable
  columns={columns}
  data={appointments}
  searchKey="pet"
  searchPlaceholder="Search pets…"
  enableColumnVisibility
  enableRowSelection
  pageSize={5}
/>`}
          >
            <DataTable
              columns={columns}
              data={DEMO_APPOINTMENTS}
              pageSize={3}
              searchKey="pet"
              searchPlaceholder="Search appointments…"
              enableColumnVisibility
              enableRowSelection
              showSelectionCount
            />
          </LibrarySection>

          <LibrarySection
            id="empty-state"
            title="EmptyState"
            description="Placeholder when a list or panel has no data. Supports icon, copy, and a CTA slot."
            importFrom="@/components/shared"
            usage={`<EmptyState
  icon={CalendarDays}
  title="No appointments"
  description="Create one to get started."
  action={<Button size="sm">New appointment</Button>}
/>`}
          >
            <EmptyState
              icon={CalendarDays}
              title="No appointments yet"
              description="When you add appointments they'll show up here."
              action={
                <Button size="sm">
                  <Plus />
                  New appointment
                </Button>
              }
            />
          </LibrarySection>

          <LibrarySection
            id="stepper"
            title="Stepper"
            description="Multi-step flow indicator for booking or onboarding wizards."
            importFrom="@/components/shared"
            usage={`const steps = [
  { id: "pet", label: "Pet details" },
  { id: "service", label: "Service" },
  { id: "confirm", label: "Confirm" },
]

<Stepper steps={steps} currentStep={2} />`}
          >
            <div className="space-y-4">
              <Stepper
                steps={[
                  { id: "pet", label: "Pet details" },
                  { id: "service", label: "Service" },
                  { id: "slot", label: "Time slot" },
                  { id: "confirm", label: "Confirm" },
                ]}
                currentStep={step}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={step <= 1}
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  disabled={step >= 4}
                  onClick={() => setStep((s) => Math.min(4, s + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </LibrarySection>

          <LibrarySection
            id="form-inputs"
            title="Form inputs"
            description="Native inputs use Field + register(). Controlled widgets (Select, Calendar) use FormField + Controller."
            importFrom="@/components/ui/*"
            usage={`// Simple field
<Field>
  <FieldLabel htmlFor="name">Pet name</FieldLabel>
  <Input id="name" {...register("name")} />
  <FieldError errors={[errors.name]} />
</Field>

// Controlled select — use FormField + Controller in real forms`}
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pet-name">Pet name</Label>
                <Input id="pet-name" placeholder="Luna" defaultValue="Luna" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Allergies, temperament…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="vaccinated" defaultChecked />
                <Label htmlFor="vaccinated">Vaccinations up to date</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="reminders"
                  checked={reminders}
                  onCheckedChange={setReminders}
                />
                <Label htmlFor="reminders">Send SMS reminders</Label>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Visit type</Label>
                <RadioGroup
                  value={visitType}
                  onValueChange={setVisitType}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="routine" id="routine" />
                    <Label htmlFor="routine">Routine</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="emergency" id="emergency" />
                    <Label htmlFor="emergency">Emergency</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Preferred date</Label>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start font-normal",
                          !date && "text-muted-foreground"
                        )}
                      />
                    }
                  >
                    <CalendarIcon />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </LibrarySection>

          <LibrarySection
            id="select-tabs"
            title="Select & Tabs"
            description="Select for compact option lists; Tabs for switching related views without navigation."
            importFrom="@/components/ui/select, @/components/ui/tabs"
            usage={`<Select value={species} onValueChange={setSpecies}>
  <SelectTrigger className="w-48">
    <SelectValue placeholder="Species" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="dog">Dog</SelectItem>
    <SelectItem value="cat">Cat</SelectItem>
  </SelectContent>
</Select>`}
          >
            <div className="space-y-6">
              <Select
                value={species}
                onValueChange={(value) => value && setSpecies(value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Species" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="bird">Bird</SelectItem>
                  <SelectItem value="rabbit">Rabbit</SelectItem>
                </SelectContent>
              </Select>

              <Tabs defaultValue="upcoming">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="text-sm text-muted-foreground">
                  3 appointments scheduled for today.
                </TabsContent>
                <TabsContent value="completed" className="text-sm text-muted-foreground">
                  12 completed this week.
                </TabsContent>
                <TabsContent value="cancelled" className="text-sm text-muted-foreground">
                  1 cancellation in the last 7 days.
                </TabsContent>
              </Tabs>
            </div>
          </LibrarySection>

          <LibrarySection
            id="overlays"
            title="Dialogs, menus & tooltips"
            description="Modal dialogs for forms, alert dialogs for destructive confirms, dropdowns for row actions."
            importFrom="@/components/ui/dialog, dropdown-menu, tooltip"
            usage={`<Dialog>
  <DialogTrigger render={<Button variant="outline" />}>Open</DialogTrigger>
  <DialogContent>...</DialogContent>
</Dialog>`}
          >
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger render={<Button variant="outline" />}>
                  Open dialog
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reschedule appointment</DialogTitle>
                    <DialogDescription>
                      Pick a new time slot for Luna&apos;s grooming session.
                    </DialogDescription>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">
                    Dialog body content goes here.
                  </p>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="destructive" />}>
                  Cancel appointment
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The owner will be notified. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep</AlertDialogCancel>
                    <AlertDialogAction>Cancel appointment</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline" size="icon" aria-label="Actions" />
                  }
                >
                  <MoreHorizontal />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View details</DropdownMenuItem>
                    <DropdownMenuItem>Reschedule</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">
                      Cancel
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip>
                <TooltipTrigger
                  render={<Button variant="ghost" size="sm" />}
                >
                  Hover me
                </TooltipTrigger>
                <TooltipContent>Quick tip about this action</TooltipContent>
              </Tooltip>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => toast.success("Appointment saved")}
              >
                Show toast
              </Button>
            </div>
          </LibrarySection>

          <LibrarySection
            id="feedback"
            title="Alerts & progress"
            description="Inline feedback banners and determinate progress for multi-step tasks."
            importFrom="@/components/ui/alert, progress"
            usage={`<Alert>
  <AlertTitle>Heads up</AlertTitle>
  <AlertDescription>Message body</AlertDescription>
</Alert>
<Progress value={66} />`}
          >
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Clinic note</AlertTitle>
                <AlertDescription>
                  Dr. Patel is out until 2 PM. Emergency cases go to Room B.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Daily capacity</span>
                  <span className="font-medium">16 / 24</span>
                </div>
                <Progress value={66} />
              </div>
            </div>
          </LibrarySection>

          <LibrarySection
            id="misc"
            title="Avatar, skeleton & scroll"
            description="Loading placeholders and compact scroll regions for side panels."
            importFrom="@/components/ui/avatar, skeleton, scroll-area"
            usage={`<Avatar>
  <AvatarImage src="/photo.jpg" alt="Luna" />
  <AvatarFallback>LU</AvatarFallback>
</Avatar>
<Skeleton className="h-4 w-32" />`}
          >
            <div className="flex flex-wrap items-start gap-6">
              <Avatar className="size-12">
                <AvatarImage
                  src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&q=80"
                  alt="Dog"
                />
                <AvatarFallback>LU</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-24" />
              </div>
              <ScrollArea className="h-24 w-48 rounded-md border p-3">
                <div className="space-y-2 text-sm text-muted-foreground">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <p key={i}>Activity log entry #{i + 1}</p>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </LibrarySection>
        </div>
      </div>
    </div>
  )
}
