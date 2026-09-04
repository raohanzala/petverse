const STATUS_FILTERS = [
  "all",
  "active",
  "inactive",
] as const

type StatusFilter =
  (typeof STATUS_FILTERS)[number]

export const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "All statuses",
  active: "Active only",
  inactive: "Inactive only",
}

const VISIBILITY_FILTERS = [
  "all",
  "public",
  "private",
] as const

type VisibilityFilter =
  (typeof VISIBILITY_FILTERS)[number]

export const VISIBILITY_LABELS: Record<VisibilityFilter, string> = {
  all: "All visibilities",
  public: "Public only",
  private: "Private only",
}

const STEP_MODES = [
  "all",
  "sequential",
  "parallel",
] as const

type PackageStepModeFilter =
  (typeof STEP_MODES)[number]

export const PACKAGE_STEP_MODES: Record<PackageStepModeFilter, string> = {
  all: "All Modes",
  sequential: "Sequential",
  parallel: "Parallel",
}

export type ServiceCategoryRow = {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ServiceCategoryInsert = Pick<
  ServiceCategoryRow,
  "name" | "slug" | "description" | "sort_order" | "is_active"
>

export type ServiceCategoryUpdate = Partial<ServiceCategoryInsert>

export type ServiceKind =
  | "grooming"
  | "veterinary"
  | "boarding"
  | "daycare"
  | "other"

export type ServiceRow = {
  id: string
  category_id: string | null
  name: string
  description: string | null
  kind: ServiceKind
  duration_minutes: number
  price: number
  is_active: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export type ServiceInsert = Pick<
  ServiceRow,
  | "category_id"
  | "name"
  | "description"
  | "kind"
  | "duration_minutes"
  | "price"
  | "is_active"
  | "is_public"
>

export type ServiceListRow = ServiceRow & {
  category: {
    id: string
    name: string
  } | null
}

export type ServiceUpdate = Partial<ServiceInsert>

export type PackageStepMode =
  | "sequential"
  | "parallel"

export type ServicePackageRow = {
  id: number
  name: string
  description: string | null
  price: number
  duration_minutes: number
  step_mode: PackageStepMode
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ServicePackageInsert = Pick<
  ServicePackageRow,
  | "name"
  | "description"
  | "price"
  | "duration_minutes"
  | "step_mode"
  | "is_active"
>

export type ServicePackageUpdate =
  Partial<ServicePackageInsert>

export type ServicePackageStepListRow =
  ServicePackageStepRow & {
    package: {
      id: number
      name: string
    }
    service: {
      id: string
      name: string
    }
  }

export type ServicePackageStepRow = {
  id: string
  package_id: number
  service_id: string
  step_order: number
  parallel_group: number | null
  override_duration_minutes: number | null
  override_price: number | null
}

export type ServicePackageStepInsert = Pick<
  ServicePackageStepRow,
  | "package_id"
  | "service_id"
  | "step_order"
  | "parallel_group"
  | "override_duration_minutes"
  | "override_price"
>

export type ServicePackageStepUpdate =
  Partial<ServicePackageStepInsert>

export type BusinessSettingsRow = {
  id: string
  business_name: string
  logo_url: string | null
  timezone: string
  currency: string
  phone: string | null
  email: string | null
  address: string | null
  hero_title: string | null
  hero_subtitle: string | null
  created_at: string
  updated_at: string
}

export type BusinessSettingsInsert = Pick<
  BusinessSettingsRow,
  | "business_name"
  | "logo_url"
  | "timezone"
  | "currency"
  | "phone"
  | "email"
  | "address"
  | "hero_title"
  | "hero_subtitle"
>

export type BusinessSettingsUpdate =
  Partial<BusinessSettingsInsert>

export type EmployeeRole =
  | "admin"
  | "manager"
  | "groomer"
  | "veterinarian"
  | "boarding_attendant"

export type EmployeeRow = {
  id: string
  user_id: string | null
  display_name: string
  initials: string | null
  avatar_url: string | null
  role: EmployeeRole
  job_title: string | null
  color: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type EmployeeInsert = Pick<
  EmployeeRow,
  | "user_id"
  | "display_name"
  | "initials"
  | "avatar_url"
  | "role"
  | "job_title"
  | "color"
  | "is_active"
>

export type EmployeeUpdate = Partial<EmployeeInsert>

export type EmployeeScheduleRow = {
  id: string
  employee_id: string
  day_of_week: number
  start_time: string
  end_time: string
  employee: {
    display_name: string
    initials: string | null
  }[]
}

export type EmployeeScheduleInsert = Pick<
  EmployeeScheduleRow,
  | "employee_id"
  | "day_of_week"
  | "start_time"
  | "end_time"
>

export type EmployeeScheduleUpdate =
  Partial<EmployeeScheduleInsert>

export type OwnerRow = {
  id: string
  name: string
  phone: string
  email: string | null
  preferred_contact: string | null
  created_at: string
  updated_at: string
}

export type OwnerInsert = Pick<
  OwnerRow,
  | "name"
  | "phone"
  | "email"
  | "preferred_contact"
>

export type OwnerUpdate = Partial<OwnerInsert>

export type PetRow = {
  id: string
  owner_id: string
  name: string
  species: string
  breed: string | null
  birth_date: string | null
  weight_kg: number | null
  color: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  owner: {
    name: string
    phone: string
  }[]
}

export type PetInsert = Pick<
  PetRow,
  | "owner_id"
  | "name"
  | "species"
  | "breed"
  | "birth_date"
  | "weight_kg"
  | "color"
  | "notes"
  | "is_active"
>

export type PetUpdate = Partial<PetInsert>

export type BookingData = {
  serviceId: string | null
  packageId: number | null

  date: string | null
  time: string | null

  owner: {
    name: string
    phone: string
    email: string
    preferredContact: string
  }

  pet: {
    id: string | null
    name: string
    species: string
    breed: string
    birthDate: string
    weightKg: number | null
    color: string
    notes: string
  }
}

export const INITIAL_BOOKING_DATA: BookingData = {
  serviceId: null,
  packageId: null,

  date: null,
  time: null,

  owner: {
    name: "",
    phone: "",
    email: "",
    preferredContact: "phone",
  },

  pet: {
    id: null,
    name: "",
    species: "dog",
    breed: "",
    birthDate: "",
    weightKg: null,
    color: "",
    notes: "",
  },
}

export type AppointmentStatus =
  | "requested"
  | "confirmed"
  | "arrived"
  | "in_service"
  | "completed"
  | "cancelled"
  | "no_show"

export type AppointmentSource =
  | "online"
  | "admin"
  | "phone"

export type AppointmentRow = {
  id: string
  owner_id: string
  pet_id: string
  service_id: string | null
  package_id: string | null
  employee_id: string | null
  preferred_employee_id: string | null
  status: AppointmentStatus
  source: AppointmentSource
  starts_at: string
  ends_at: string
  duration_minutes: number
  price: number
  group_id: string | null
  step_order: number | null
  notes: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  created_at: string
  updated_at: string

  owner: {
    name: string
    phone: string
  }[]

  pet: {
    name: string
    species: string
  }[]

  service: {
    name: string
  }[]

  package: {
    name: string
  }[]

  employee: {
    display_name: string
  }[]

  preferred_employee: {
    display_name: string
  }[]
}

export type AppointmentInsert = Pick<
  AppointmentRow,
  | "owner_id"
  | "pet_id"
  | "service_id"
  | "package_id"
  | "employee_id"
  | "preferred_employee_id"
  | "status"
  | "source"
  | "starts_at"
  | "ends_at"
  | "duration_minutes"
  | "price"
  | "group_id"
  | "step_order"
  | "notes"
  | "cancelled_at"
  | "cancel_reason"
>

export type AppointmentUpdate = Partial<AppointmentInsert>