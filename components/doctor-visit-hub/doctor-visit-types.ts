export type VisitHubSectionId =
  | "nextAppt"
  | "snapshot"
  | "questions"
  | "notes"
  | "letters"
  | "referrals"
  | "summary"
  | "visits"

export interface VisitHubSectionConfig {
  id: VisitHubSectionId
  label: string
  shortLabel: string
  fullTabTarget: string
  fullTabName: string
  nextSectionId: VisitHubSectionId | null
}

export const VISIT_HUB_SECTIONS: VisitHubSectionConfig[] = [
  {
    id: "nextAppt",
    label: "Next Appointment",
    shortLabel: "Next Appt",
    fullTabTarget: "appointments",
    fullTabName: "Appointments",
    nextSectionId: "snapshot",
  },
  {
    id: "snapshot",
    label: "Snapshot & Profile",
    shortLabel: "Snapshot",
    fullTabTarget: "meds",
    fullTabName: "Meds & Doctors",
    nextSectionId: "questions",
  },
  {
    id: "questions",
    label: "Questions for Doctor",
    shortLabel: "Questions",
    fullTabTarget: "ai",
    fullTabName: "Dr. AI",
    nextSectionId: "notes",
  },
  {
    id: "notes",
    label: "Health Notes",
    shortLabel: "Notes",
    fullTabTarget: "records",
    fullTabName: "Medical History",
    nextSectionId: "letters",
  },
  {
    id: "letters",
    label: "Doctor Letters",
    shortLabel: "Letters",
    fullTabTarget: "doctors",
    fullTabName: "My Doctors",
    nextSectionId: "referrals",
  },
  {
    id: "referrals",
    label: "Referrals & Specialists",
    shortLabel: "Referrals",
    fullTabTarget: "doctors",
    fullTabName: "My Doctors",
    nextSectionId: "summary",
  },
  {
    id: "summary",
    label: "Visit Summary",
    shortLabel: "Visit Summary",
    fullTabTarget: "appointments",
    fullTabName: "Appointments",
    nextSectionId: "visits",
  },
  {
    id: "visits",
    label: "Appointments",
    shortLabel: "Appointments",
    fullTabTarget: "appointments",
    fullTabName: "Appointments",
    nextSectionId: "nextAppt",
  },
]

export interface HealthProfile {
  id?: string
  user_id?: string
  allergies: string
  conditions: string
  insurance_provider: string
  insurance_id: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relation: string
  created_at?: string
  updated_at?: string
}

export interface HealthPrepItem {
  id: string
  user_id?: string
  visit_id?: string | null
  text: string
  completed: boolean
  sort_order: number
  created_at?: string
}

export interface HealthQuestion {
  id: string
  user_id?: string
  question: string
  answered: boolean
  doctor_id?: string | null
  doctor_name?: string
  facility_id?: string | null
  facility_name?: string
  visit_id?: string | null
  answer_notes?: string
  created_at?: string
  updated_at?: string
}

export const DATE_TYPE_OPTIONS = [
  "Date written",
  "Planning (no appointment yet)",
  "Appointment date",
  "Visit date",
  "Follow-up due date",
  "Test / lab date",
  "Procedure / surgery date",
  "Prescription date",
  "Request date",
  "Letter date",
  "Received date",
  "Sent date",
  "Referral date",
  "Other",
] as const

export type DateType = string

/**
 * Format a date-only YYYY-MM-DD string manually (no UTC offset bug).
 * Returns "No date" when empty/null so undated items display cleanly everywhere.
 */
export function formatDateOnly(dateStr?: string | null): string {
  if (!dateStr || !String(dateStr).trim()) return "No date"
  const clean = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr.trim()
  const parts = clean.split("-")
  if (parts.length === 3) {
    const [y, m, d] = parts
    const month = parseInt(m, 10)
    const day = parseInt(d, 10)
    if (!isNaN(month) && !isNaN(day)) {
      return `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}/${y}`
    }
  }
  return dateStr
}

/**
 * Compare optional YYYY-MM-DD dates so undated items ALWAYS sort last in both newest & oldest orders.
 */
export function compareOptionalDates(
  a?: string | null,
  b?: string | null,
  order: "newest" | "oldest" = "newest"
): number {
  const sa = (a || "").trim()
  const sb = (b || "").trim()
  if (!sa && !sb) return 0
  if (!sa) return 1
  if (!sb) return -1
  return order === "oldest" ? sa.localeCompare(sb) : sb.localeCompare(sa)
}

/**
 * Return today's local date string formatted as YYYY-MM-DD.
 */
export function getTodayDateString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export type GivenMethod = "visit" | "portal"

export function parseGivenMethod(value?: string | null): GivenMethod | null {
  return value === "visit" || value === "portal" ? value : null
}

export interface HealthNote {
  id: string
  user_id?: string
  title: string
  text: string
  date?: string | null
  date_type?: string
  doctor_id?: string | null
  doctor_name?: string
  facility_id?: string | null
  facility_name?: string
  visit_id?: string | null
  given_to_doctor?: boolean
  given_method?: GivenMethod | null
  given_date?: string | null
  created_at?: string
  updated_at?: string
}

export type LetterDirection = string
export type LetterStatus = string

export interface HealthLetter {
  id: string
  user_id?: string
  doctor_id?: string | null
  doctor_name?: string
  facility_id?: string | null
  facility_name?: string
  visit_id?: string | null
  date?: string | null
  date_type?: string
  direction: LetterDirection
  status: LetterStatus
  notes: string
  attachment_url?: string | null
  attachment_name?: string | null
  given_to_doctor?: boolean
  given_method?: GivenMethod | null
  given_date?: string | null
  created_at?: string
  updated_at?: string
}

export type ReferralStatus = string

export interface HealthReferral {
  id: string
  user_id?: string
  specialist_name: string
  specialty: string
  doctor_id?: string | null // Linked doctor in My Doctors
  referred_by_doctor_id?: string | null
  referred_by_name?: string
  facility_id?: string | null
  facility_name?: string
  visit_id?: string | null
  reason: string
  date?: string | null
  date_type?: string
  status: ReferralStatus
  phone: string
  notes: string
  given_to_doctor?: boolean
  given_method?: GivenMethod | null
  given_date?: string | null
  created_at?: string
  updated_at?: string
}

export interface HealthVisitSummary {
  id: string
  user_id?: string
  title: string
  summary_text: string
  date?: string | null
  date_type?: string
  doctor_id?: string | null
  doctor_name?: string
  facility_id?: string | null
  facility_name?: string
  visit_id?: string | null
  given_to_doctor?: boolean
  given_method?: GivenMethod | null
  given_date?: string | null
  created_at?: string
  updated_at?: string
}

export interface DoctorOption {
  id: string
  name: string
  specialty?: string
  phone?: string
  facility?: string
  address?: string
  portalUrl?: string
  facility_ids?: string[]
}

export interface VisitOption {
  id: string
  title: string
  date: string
  doctor?: string
  doctor_id?: string | null
  facility_id?: string | null
  facility_name?: string
  location?: string
  notes?: string
}

export interface MedicationSummary {
  id: string
  name: string
  dose?: string
  frequency?: string
  instructions?: string
}
