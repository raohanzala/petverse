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

export type ServiceCategoryListRelation = Pick<
  ServiceCategoryRow,
  "id" | "name"
>

export type ServiceListRow = ServiceRow & {
  category: ServiceCategoryListRelation | null
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
  total_sales: number
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
  owner_id: string
  resource_id: string | null

  starts_at: string
  ends_at: string

  days_of_week: number[]

  is_active: boolean

  created_at: string
  updated_at: string
}

export type DaycareScheduleListRow =
  DaycareScheduleRow & {
    pet: {
      id: string
      name: string
      species: string
    } | null

    owner: {
      id: string
      name: string
      phone: string
    } | null

    resource: {
      id: string
      name: string
      type: FacilityResourceType
    } | null
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
  status: "draft" | "open" | "paid" | "void"
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

  owner: {
    id: string
    name: string
    phone: string
    email: string | null
  } | null

  pet: {
    id: string
    name: string
    species: string
  } | null
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

export type ConversationStage =
  | "inquiry"
  | "engaged"
  | "quoted"
  | "booked"
  | "visited"
  | "closed_lost"
  | "closed_won"

export type ConversationRow = {
  id: string

  owner_id: string | null
  channel: string
  external_id: string | null

  stage: ConversationStage

  closed_lost_reason: string | null
  quoted_amount: number | null
  lost_revenue: number | null

  assigned_employee_id: string | null
  first_staff_response_at: string | null

  ai_handled: boolean

  created_at: string
  updated_at: string
}

export type ConversationInsert = Pick<
  ConversationRow,
  | "owner_id"
  | "channel"
  | "external_id"
  | "stage"
  | "closed_lost_reason"
  | "quoted_amount"
  | "lost_revenue"
  | "assigned_employee_id"
  | "first_staff_response_at"
  | "ai_handled"
>

export type ConversationEmployeeOption = {
  id: string
  name: string
}

export type ConversationUpdate =
  Partial<ConversationInsert>

export type MessageDirection =
  | "inbound"
  | "outbound"

export type ConversationMessageRow = {
  id: string

  conversation_id: string
  direction: MessageDirection
  body: string
  sent_at: string
  external_id: string | null
}

export type ConversationMessageInsert = {
  conversation_id: string
  direction: MessageDirection
  body: string
  sent_at?: string
  external_id?: string | null
}

export type ConversationMessageUpdate =
  Partial<ConversationMessageInsert>

export type MessageTemplateRow = {
  id: string
  name: string
  channel: string
  body: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type MessageTemplateInsert = Pick<
  MessageTemplateRow,
  | "name"
  | "channel"
  | "body"
  | "is_active"
>

export type MessageTemplateUpdate =
  Partial<MessageTemplateInsert>

export type ReminderLogRow = {
  id: string
  owner_id: string | null
  appointment_id: string | null
  channel: string
  template_key: string | null
  status: string
  sent_at: string
  error_message: string | null
}

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "running"
  | "completed"
  | "cancelled"

export type OutboundCampaignRow = {
  id: string
  name: string
  channel: string
  status: CampaignStatus
  scheduled_at: string | null
  created_at: string
}

export type OutboundCampaignInsert = Pick<
  OutboundCampaignRow,
  | "name"
  | "channel"
  | "status"
  | "scheduled_at"
>

export type OutboundCampaignUpdate =
  Partial<OutboundCampaignInsert>

export type CampaignContactStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "failed"
  | "unsubscribed"

export type CampaignContactRow = {
  id: string
  campaign_id: string
  owner_id: string
  status: CampaignContactStatus
  sent_at: string | null
}

export type CampaignContactWithRelations =
  CampaignContactRow & {
    campaign: {
      id: string
      name: string
    } | null
    owner: {
      id: string
      name: string
    } | null
  }

export type CampaignContactInsert = Pick<
  CampaignContactRow,
  | "campaign_id"
  | "owner_id"
  | "status"
  | "sent_at"
>

export type CampaignContactUpdate =
  Partial<CampaignContactInsert>

export type CampaignBlackoutPeriodRow = {
  id: string
  campaign_id: string
  starts_at: string
  ends_at: string
}

export type CampaignBlackoutPeriodInsert = Pick<
  CampaignBlackoutPeriodRow,
  | "campaign_id"
  | "starts_at"
  | "ends_at"
>

export type CampaignBlackoutPeriodUpdate =
  Partial<CampaignBlackoutPeriodInsert>

export type VaccineTypeRow = {
  id: string
  name: string
  species: string | null
  interval_months: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type VaccineTypeInsert = Pick<
  VaccineTypeRow,
  | "name"
  | "species"
  | "interval_months"
  | "is_active"
>

export type VaccineTypeUpdate =
  Partial<VaccineTypeInsert>

export type PetVaccinationRow = {
  id: string
  pet_id: string
  vaccine_type_id: string
  administered_at: string
  expires_at: string | null
  notes: string | null
  recorded_by: string | null
}

export type PetVaccinationWithRelations =
  PetVaccinationRow & {
    pet: {
      id: string
      name: string
    } | null

    vaccine_type: {
      id: string
      name: string
    } | null

    employee: {
      id: string
      display_name: string
    } | null
  }

export type PetVaccinationInsert = Pick<
  PetVaccinationRow,
  | "pet_id"
  | "vaccine_type_id"
  | "administered_at"
  | "expires_at"
  | "notes"
  | "recorded_by"
>

export type PetVaccinationUpdate =
  Partial<PetVaccinationInsert>

export type ConsentFormTemplateRow = {
  id: string
  name: string
  body_html: string
  version: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ConsentFormTemplateInsert = Pick<
  ConsentFormTemplateRow,
  | "name"
  | "body_html"
  | "version"
  | "is_active"
>

export type ConsentFormTemplateUpdate =
  Partial<ConsentFormTemplateInsert>

export type ServiceConsentFormRow = {
  service_id: string
  template_id: string
}

export type ServiceConsentFormInsert =
  ServiceConsentFormRow

export type ServiceConsentFormWithTemplate =
  ServiceConsentFormRow & {
    template: {
      id: string
      name: string
      version: number
      is_active: boolean
    } | null
  }

export type ServiceConsentFormServiceOption = {
  id: string
  name: string
}

export type ServiceConsentFormTemplateOption = {
  id: string
  name: string
  version: number
  is_active: boolean
}

export type ConsentFormSubmissionRow = {
  id: string
  template_id: string
  appointment_id: string | null
  owner_id: string
  pet_id: string | null
  signed_at: string
  signature_data: Record<string, unknown> | null
}

export type ConsentFormSubmissionWithRelations =
  ConsentFormSubmissionRow & {
    template: {
      id: string
      name: string
      version: number
    } | null

    appointment: {
      id: string
      starts_at: string
    } | null

    owner: {
      id: string
      name: string
      phone: string
    } | null

    pet: {
      id: string
      name: string
      species: string
    } | null
  }

export type ConsentFormSubmissionInsert = Pick<
  ConsentFormSubmissionRow,
  | "template_id"
  | "appointment_id"
  | "owner_id"
  | "pet_id"
  | "signed_at"
  | "signature_data"
>

export type ConsentFormSubmissionUpdate =
  Partial<ConsentFormSubmissionInsert>

export type ConsentFormSubmissionTemplateOption = {
  id: string
  name: string
  version: number
}

export type ConsentFormSubmissionAppointmentOption = {
  id: string
  starts_at: string
  status: AppointmentStatus
  owner_id: string
  pet_id: string
}

export type ConsentFormSubmissionOwnerOption = {
  id: string
  name: string
  phone: string
}

export type ConsentFormSubmissionPetOption = {
  id: string
  name: string
  species: string
  owner_id: string
}

export type OwnerRetentionSettingsRow = {
  id: string
  owner_id: string
  lapsed_after_days: number
  reengagement_queued_at: string | null
  opt_out: boolean
}

export type OwnerRetentionSettingsWithOwner =
  OwnerRetentionSettingsRow & {
    owner: {
      id: string
      name: string
      phone: string
      email: string | null
    } | null
  }

export type OwnerRetentionSettingsInsert = Pick<
  OwnerRetentionSettingsRow,
  | "owner_id"
  | "lapsed_after_days"
  | "reengagement_queued_at"
  | "opt_out"
>

export type OwnerRetentionSettingsUpdate =
  Partial<OwnerRetentionSettingsInsert>

export type OwnerRetentionSettingsOwnerOption = {
  id: string
  name: string
  phone: string
  email: string | null
}

export type BusinessTargetRow = {
  id: string
  metric_key: string
  target_value: number
  period_start: string
  period_end: string
  notes: string | null
  created_at: string
}

export type BusinessTargetInsert = Pick<
  BusinessTargetRow,
  | "metric_key"
  | "target_value"
  | "period_start"
  | "period_end"
  | "notes"
>

export type BusinessTargetUpdate =
  Partial<BusinessTargetInsert>

export type DailyUpdateRow = {
  id: string
  pet_id: string
  appointment_id: string | null
  author_id: string | null
  body: string
  sent_to_owner_at: string | null
  created_at: string
}

export type DailyUpdateWithRelations = DailyUpdateRow & {
  pet: {
    id: string
    name: string
    species: string
    owner: {
      id: string
      name: string
      phone: string
    } | null
  } | null
  appointment: {
    id: string
    starts_at: string
    status: AppointmentStatus
  } | null
  author: {
    id: string
    display_name: string
    initials: string | null
  } | null
}

export type DailyUpdateInsert = Pick<
  DailyUpdateRow,
  | "pet_id"
  | "appointment_id"
  | "author_id"
  | "body"
  | "sent_to_owner_at"
>

export type DailyUpdateUpdate = Partial<DailyUpdateInsert>

export type DailyUpdatePetOption = {
  id: string
  name: string
  species: string
  owner_id: string
  owner: {
    name: string
    phone: string
  } | null
}

export type DailyUpdateAppointmentOption = {
  id: string
  pet_id: string
  starts_at: string
  status: AppointmentStatus
}

export type DailyUpdateEmployeeOption = {
  id: string
  display_name: string
  initials: string | null
}

export type PetUpdateImageRow = {
  id: string
  daily_update_id: string | null
  pet_id: string
  file_url: string
  sorted_at: string | null
  created_at: string
}

export type PetUpdateImageInsert = Pick<
  PetUpdateImageRow,
  | "daily_update_id"
  | "pet_id"
  | "file_url"
  | "sorted_at"
>

export type PetUpdateImageUpdate =
  Partial<PetUpdateImageInsert>

export type PetUpdateImageWithRelations =
  PetUpdateImageRow & {
    pet: {
      id: string
      name: string
      species: string
    } | null

    daily_update: {
      id: string
      body: string
      created_at: string
    } | null
  }

export type PetPhotoRow = {
  id: string
  pet_id: string
  file_url: string
  caption: string | null
  created_at: string
}

export type PetPhotoInsert = Pick<
  PetPhotoRow,
  | "pet_id"
  | "file_url"
  | "caption"
>

export type PetPhotoUpdate =
  Partial<PetPhotoInsert>

export type PetPhotoWithRelations =
  PetPhotoRow & {
    pet: {
      id: string
      name: string
      species: string
    } | null
  }

export const SUPPLIER_STATUS_FILTERS = [
  "all",
  "active",
  "inactive",
] as const

export type SupplierStatusFilter =
  (typeof SUPPLIER_STATUS_FILTERS)[number]

export const SUPPLIER_STATUS_LABELS: Record<
  SupplierStatusFilter,
  string
> = {
  all: "All statuses",
  active: "Active only",
  inactive: "Inactive only",
}

export type SupplierRow = {
  id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type SupplierInsert = Pick<
  SupplierRow,
  | "name"
  | "contact_name"
  | "email"
  | "phone"
  | "address"
  | "notes"
  | "is_active"
>

export type SupplierUpdate =
  Partial<SupplierInsert>

export const PRODUCT_STATUS_FILTERS = [
  "all",
  "active",
  "inactive",
] as const

export type ProductStatusFilter =
  (typeof PRODUCT_STATUS_FILTERS)[number]

export const PRODUCT_STATUS_LABELS: Record<
  ProductStatusFilter,
  string
> = {
  all: "All statuses",
  active: "Active only",
  inactive: "Inactive only",
}

export type ProductRow = {
  id: string
  supplier_id: string | null
  sku: string | null
  name: string
  brand: string | null
  category: string | null
  retail_price: number
  cost_price: number
  stock_qty: number
  is_active: boolean
  created_at: string
  updated_at: string

  supplier: {
    id: string
    name: string
  } | null
}

export type ProductInsert = Pick<
  ProductRow,
  | "supplier_id"
  | "sku"
  | "name"
  | "brand"
  | "category"
  | "retail_price"
  | "cost_price"
  | "stock_qty"
  | "is_active"
>

export type ProductUpdate =
  Partial<ProductInsert>

export type ProductListRow =
  ProductRow & {
    supplier: {
      id: string
      name: string
    } | null
  }

export type ProductSupplierOption = {
  id: string
  name: string
}