export type VisitHubSectionId =
  | "nextAppt"
  | "snapshot"
  | "questions"
  | "notes"
  | "letters"
  | "referrals"
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
    fullTabName: "Visits",
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
    nextSectionId: "visits",
  },
  {
    id: "visits",
    label: "Recent Visits",
    shortLabel: "Visits",
    fullTabTarget: "appointments",
    fullTabName: "Visits",
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
  visit_id?: string | null
  answer_notes?: string
  created_at?: string
  updated_at?: string
}

export interface HealthNote {
  id: string
  user_id?: string
  title: string
  text: string
  date: string
  doctor_id?: string | null
  doctor_name?: string
  visit_id?: string | null
  created_at?: string
  updated_at?: string
}

export type LetterDirection = "sent" | "received"
export type LetterStatus = "needed" | "requested" | "received" | "sent"

export interface HealthLetter {
  id: string
  user_id?: string
  doctor_id?: string | null
  doctor_name?: string
  visit_id?: string | null
  date: string
  direction: LetterDirection
  status: LetterStatus
  notes: string
  attachment_url?: string | null
  attachment_name?: string | null
  created_at?: string
  updated_at?: string
}

export type ReferralStatus = "needed" | "requested" | "scheduled" | "seen"

export interface HealthReferral {
  id: string
  user_id?: string
  specialist_name: string
  specialty: string
  doctor_id?: string | null // Linked doctor in My Doctors
  referred_by_doctor_id?: string | null
  referred_by_name?: string
  visit_id?: string | null
  reason: string
  date: string
  status: ReferralStatus
  phone: string
  notes: string
  created_at?: string
  updated_at?: string
}

export interface DoctorOption {
  id: string
  name: string
  specialty?: string
  phone?: string
  portalUrl?: string
}

export interface VisitOption {
  id: string
  title: string
  date: string
  doctor?: string
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
