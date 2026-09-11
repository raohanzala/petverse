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
  category: ServiceCategoryRow | null
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
  }
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
  }

  pet: {
    name: string
    species: string
  }

  service: {
    name: string
  }

  package: {
    name: string
  }

  employee: {
    display_name: string
  }

  preferred_employee: {
    display_name: string
  }
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

export type FacilityResourceType =
  | "kennel"
  | "suite"
  | "playroom"
  | "other"

export type FacilityResourceRow = {
  id: string
  name: string
  type: FacilityResourceType
  column_label: string | null
  row_number: number | null
  capacity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type FacilityResourceInsert = Pick<
  FacilityResourceRow,
  | "name"
  | "type"
  | "column_label"
  | "row_number"
  | "capacity"
  | "is_active"
>

export type FacilityResourceUpdate =
  Partial<FacilityResourceInsert>

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"

export type ReservationRow = {
  id: string

  pet_id: string
  owner_id: string
  resource_id: string | null
  service_id: string | null

  status: ReservationStatus

  check_in_at: string
  check_out_at: string

  notes: string | null

  created_at: string
  updated_at: string

  pet: {
    name: string
    species: string
  }

  owner: {
    name: string
    phone: string
  }

  resource: {
    name: string
    type: FacilityResourceType
  }

  service: {
    name: string
  }
}

export type ReservationInsert = Pick<
  ReservationRow,
  | "pet_id"
  | "owner_id"
  | "resource_id"
  | "service_id"
  | "status"
  | "check_in_at"
  | "check_out_at"
  | "notes"
>

export type ReservationUpdate =
  Partial<ReservationInsert>

export type AttendanceEntryType =
  | "check_in"
  | "check_out"
  | "note"
  | "incident"

export type AttendanceEntryRow = {
  id: string
  reservation_id: string
  type: AttendanceEntryType
  recorded_at: string
  recorded_by: string | null
  flags: string[]
  notes: string | null

  reservation: {
    id: string
    pet: {
      name: string
      species: string
    }
  }

  employee: {
    display_name: string
    initials: string | null
  } | null
}

export type AttendanceEntryInsert = Pick<
  AttendanceEntryRow,
  | "reservation_id"
  | "type"
  | "recorded_by"
  | "flags"
  | "notes"
>

export type AttendanceEntryUpdate =
  Partial<AttendanceEntryInsert>

export type DaycarePricingRow = {
  id: string
  full_day_price: number
  half_day_price: number
  updated_at: string
}

export type DaycarePackageRow = {
  id: string
  name: string
  visit_count: number
  price: number
  valid_days: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type DaycareWalletRow = {
  id: string
  owner_id: string
  pet_id: string | null
  package_id: string
  visits_remaining: number
  expires_at: string | null
  created_at: string
  updated_at: string
}

export type DaycareScheduleRow = {
  id: string
  pet_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export type DaycareSessionStatus =
  | "scheduled"
  | "checked_in"
  | "checked_out"
  | "cancelled"

export type DaycareTransactionRow = {
  id: string
  pet_id: string
  owner_id: string
  wallet_id: string | null
  status: DaycareSessionStatus
  scheduled_at: string | null
  check_in_at: string | null
  check_out_at: string | null
  amount: number | null
  notes: string | null
  created_at: string
}

export type InvoiceStatus =
  | "draft"
  | "open"
  | "paid"
  | "void"

export type InvoiceRow = {
  id: string
  owner_id: string
  appointment_id: string | null
  number: number | null
  status: InvoiceStatus
  subtotal: number
  tax: number
  total: number
  currency: string
  issued_at: string | null
  paid_at: string | null
  voided_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type InvoiceInsert = Pick<
  InvoiceRow,
  | "owner_id"
  | "appointment_id"
  | "number"
  | "status"
  | "subtotal"
  | "tax"
  | "total"
  | "currency"
  | "issued_at"
  | "paid_at"
  | "voided_at"
  | "notes"
>

export type InvoiceUpdate =
  Partial<InvoiceInsert>


export type InvoiceLineItemRow = {
  id: string
  invoice_id: string
  appointment_id: string | null
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
  total: number
}

export type InvoiceLineItemInsert = Pick<
  InvoiceLineItemRow,
  | "invoice_id"
  | "appointment_id"
  | "product_id"
  | "description"
  | "quantity"
  | "unit_price"
  | "total"
>

export type InvoiceLineItemUpdate =
  Partial<InvoiceLineItemInsert>


export type DepositRow = {
  id: string
  owner_id: string
  appointment_id: string | null
  invoice_id: string | null
  amount: number
  paid_at: string | null
  provider_ref: string | null
  created_at: string
}

export type DepositInsert = Pick<
  DepositRow,
  | "owner_id"
  | "appointment_id"
  | "invoice_id"
  | "amount"
  | "paid_at"
  | "provider_ref"
>

export type DepositUpdate =
  Partial<DepositInsert>


export type PaymentTokenRow = {
  id: string
  token: string
  invoice_id: string
  expires_at: string
  used_at: string | null
  created_at: string
}

export type PaymentTokenInsert = Pick<
  PaymentTokenRow,
  "token" | "invoice_id" | "expires_at" | "used_at"
>

export type PaymentTokenUpdate =
  Partial<PaymentTokenInsert>

export type PaymentLinkListRow =
  PaymentTokenRow & {
    invoice: {
      id: string
      number: number | null
      total: number
      currency: string
      status: string
    } | null
  }

export type BoardingWaitlistRow = {
  id: string

  pet_id: string
  owner_id: string

  desired_from: string
  desired_to: string

  notes: string | null

  created_at: string
}

export type BoardingWaitlistInsert = Pick<
  BoardingWaitlistRow,
  | "pet_id"
  | "owner_id"
  | "desired_from"
  | "desired_to"
  | "notes"
>

export type BoardingWaitlistUpdate =
  Partial<BoardingWaitlistInsert>

export type BoardingWaitlistListRow =
  BoardingWaitlistRow & {
    pet: {
      name: string
      species: string
    }

    owner: {
      name: string
      phone: string
    }
  }

export type PetBoardingInstructionsRow = {
  id: string

  pet_id: string
  reservation_id: string | null

  feeding_notes: string | null
  medication_notes: string | null
  behavior_notes: string | null

  updated_at: string
}

export type PetBoardingInstructionsInsert = Pick<
  PetBoardingInstructionsRow,
  | "pet_id"
  | "reservation_id"
  | "feeding_notes"
  | "medication_notes"
  | "behavior_notes"
>

export type PetBoardingInstructionsUpdate =
  Partial<PetBoardingInstructionsInsert>

  export type PetBoardingInstructionsHistoryRow = {
  id: string

  instruction_id: string

  snapshot: Record<string, unknown>

  created_at: string
}

export type PetBoardingInstructionsHistoryInsert = Pick<
  PetBoardingInstructionsHistoryRow,
  | "instruction_id"
  | "snapshot"
>

export type PetBoardingInstructionsListRow =
  PetBoardingInstructionsRow & {
    pet: {
      name: string
      species: string
    }

    reservation: {
      id: string
      status: ReservationStatus
      check_in_at: string
      check_out_at: string
    } | null
  }

export type RoomTransferRow = {
  id: string
  reservation_id: string
  from_resource_id: string | null
  to_resource_id: string
  transferred_at: string
  notes: string | null
}

export type RoomTransferInsert = Pick<
  RoomTransferRow,
  | "reservation_id"
  | "from_resource_id"
  | "to_resource_id"
  | "notes"
>

export type RoomTransferListRow =
  RoomTransferRow & {
    reservation: {
      id: string
      pet: {
        name: string
        species: string
      }
      owner: {
        name: string
        phone: string
      }
    }

    from_resource: {
      id: string
      name: string
      type: FacilityResourceType
    } | null

    to_resource: {
      id: string
      name: string
      type: FacilityResourceType
    }
  }

export type RoomTransferUpdate =
  Partial<RoomTransferInsert>