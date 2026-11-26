"use client"

import { useState, useEffect, useCallback } from "react"

export interface SmartOptionItem {
  value: string
  label: string
}

export type SmartOptionInput = string | SmartOptionItem

export type SmartFieldKey =
  | "date_type"
  | "specialty"
  | "location"
  | "facility_type"
  | "pharmacy"
  | "reason_for_visit"
  | "medication_form"
  | "medication_frequency"
  | "medication_category"
  | "letter_direction"
  | "letter_status"
  | "referral_status"
  | "vitals_context"
  | "vitals_mood"
  | "insurance_plan_type"
  | "insurance_relationship"
  | "portal_type"
  | "custom"

export const DATE_TYPE_DEFAULTS: string[] = [
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
]

export const SMART_FIELD_DEFAULTS: Record<SmartFieldKey, SmartOptionInput[]> = {
  date_type: DATE_TYPE_DEFAULTS,
  specialty: [
    "Primary Care (PCP)",
    "Internal Medicine",
    "Family Medicine",
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Oncology",
    "Ophthalmology",
    "Orthopedic Surgery",
    "ENT (Otolaryngology)",
    "Pulmonology",
    "Rheumatology",
    "Urology",
    "OB/GYN",
    "Psychiatry",
    "Physical Therapy",
    "Podiatry",
    "Dentistry",
    "Optometry",
    "Allergy & Immunology",
    "Hematology",
    "Nephrology",
    "Pain Management",
    "Radiology",
    "Urgent Care",
    "Other",
  ],
  location: [
    "Main Clinic",
    "Hospital Main Campus",
    "Outpatient Center",
    "Telehealth / Video Visit",
    "Lab / Imaging Center",
    "Urgent Care",
    "Home",
    "Other",
  ],
  facility_type: [
    "Hospital",
    "Clinic",
    "Lab",
    "Imaging",
    "Pharmacy",
    "Urgent Care",
    "Surgery Center",
    "Rehab / Physical Therapy",
    "Dental Office",
    "Eye Care Center",
    "Other",
  ],
  pharmacy: [
    "CVS Pharmacy",
    "Walgreens",
    "Walmart Pharmacy",
    "Rite Aid",
    "Costco Pharmacy",
    "Kroger Pharmacy",
    "Publix Pharmacy",
    "Express Scripts (Mail Order)",
    "OptumRx (Mail Order)",
    "Amazon Pharmacy",
    "Local Independent Pharmacy",
    "Hospital Pharmacy",
  ],
  reason_for_visit: [
    "Annual Physical / Checkup",
    "Follow-up Visit",
    "Consultation",
    "New Symptom Evaluation",
    "Medication Review / Refill",
    "Lab Work / Blood Test",
    "Imaging (X-Ray / MRI / CT)",
    "Pre-Op Clearance",
    "Post-Op Follow-up",
    "Vaccination / Immunization",
    "Procedure / Biopsy",
    "Second Opinion",
    "Urgent / Sick Visit",
    "Specialist Referral",
    "Other",
  ],
  medication_form: [
    "Tablet",
    "Capsule",
    "Softgel",
    "Chewable Tablet",
    "Extended-Release Tablet",
    "Liquid / Syrup",
    "Suspension",
    "Drops (Eye / Ear)",
    "Inhaler",
    "Nebulizer Solution",
    "Nasal Spray",
    "Cream / Ointment",
    "Gel / Lotion",
    "Patch",
    "Injection / Pen",
    "Powder / Packet",
    "Suppository",
    "Lozenge",
    "Other",
  ],
  medication_frequency: [
    "Once Daily",
    "Once Daily - Morning",
    "Once Daily - Afternoon",
    "Once Daily - Evening",
    "Once Daily - Bedtime",
    "Twice Daily",
    "Three Times Daily",
    "Four Times Daily",
    "Every Other Day",
    "Weekly",
    "Every 4 Hours",
    "Every 6 Hours",
    "Every 8 Hours",
    "Every 12 Hours",
    "As needed",
    "With Meals",
    "Other",
  ],
  medication_category: [
    "Every Day Usage",
    "As Needed",
    "Surgery",
    "Short-term / Temporary",
    "Supplements",
    "Pain Relief",
    "Allergy",
    "Heart & Blood Pressure",
    "Cholesterol",
    "Sleep",
    "Cold & Flu",
  ],
  letter_direction: [
    { value: "received", label: "Received" },
    { value: "sent", label: "Sent" },
    { value: "draft", label: "Draft / Internal" },
  ],
  letter_status: [
    { value: "needed", label: "Needed" },
    { value: "requested", label: "Requested" },
    { value: "received", label: "Received" },
    { value: "sent", label: "Sent" },
    { value: "filed", label: "Filed" },
  ],
  referral_status: [
    { value: "needed", label: "Needed" },
    { value: "requested", label: "Requested" },
    { value: "scheduled", label: "Scheduled" },
    { value: "seen", label: "Seen" },
    { value: "completed", label: "Completed" },
  ],
  vitals_context: [
    "At Rest",
    "Waking Up",
    "Post Workout",
    "Feeling Stress",
    "Fasting",
    "2 hours after eating",
    "Random",
    "Before Medication",
    "After Medication",
    "Before Bed",
    "Other",
  ],
  vitals_mood: ["😊 Great", "🙂 Good", "😐 Okay", "😴 Tired", "😰 Stressed", "🤒 Unwell", "⚡ Energetic"],
  insurance_plan_type: [
    "PPO",
    "HMO",
    "EPO",
    "POS",
    "HDHP / HSA",
    "Medicare",
    "Medicare Advantage",
    "Medigap / Supplement",
    "Medicaid",
    "TRICARE",
    "Dental",
    "Vision",
    "Prescription (Part D)",
    "Other",
  ],
  insurance_relationship: ["Self", "Spouse", "Domestic Partner", "Child", "Parent", "Dependent", "Other"],
  portal_type: [
    "MyChart (Epic)",
    "Patient Gateway",
    "FollowMyHealth",
    "HealtheLife (Cerner)",
    "athenaPatient",
    "MyQuest (Quest Diagnostics)",
    "Labcorp Patient",
    "Pharmacy Portal",
    "Insurance Member Portal",
    "Hospital Portal",
    "Clinic Portal",
    "Other",
  ],
  custom: [],
}

export function normalizeOptionItem(opt: SmartOptionInput): SmartOptionItem {
  if (typeof opt === "string") {
    return { value: opt, label: opt }
  }
  return { value: opt.value, label: opt.label || opt.value }
}

const CUSTOM_OPTIONS_STORAGE_KEY = "slh_smart_select_custom_v1"

type CustomStoreListener = () => void
const storeListeners = new Set<CustomStoreListener>()

function readAllCustomOptions(): Record<string, string[]> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(CUSTOM_OPTIONS_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function writeAllCustomOptions(map: Record<string, string[]>) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(CUSTOM_OPTIONS_STORAGE_KEY, JSON.stringify(map))
  } catch {
    // Ignore storage quota errors
  }
  storeListeners.forEach((fn) => fn())
}

export function getCustomOptionsForField(fieldKey: string): string[] {
  const all = readAllCustomOptions()
  const list = all[fieldKey]
  if (!Array.isArray(list)) return []
  return Array.from(new Set<string>(list.map((x) => String(x || "").trim()).filter(Boolean)))
}

export function addCustomOptionForField(fieldKey: string, value: string): string[] {
  const clean = value.trim()
  if (!clean) return getCustomOptionsForField(fieldKey)
  const all = readAllCustomOptions()
  const current = Array.isArray(all[fieldKey]) ? all[fieldKey] : []
  if (!current.some((x) => String(x).toLowerCase() === clean.toLowerCase())) {
    all[fieldKey] = [...current, clean].slice(-50)
    writeAllCustomOptions(all)
  }
  return all[fieldKey]
}

export function removeCustomOptionForField(fieldKey: string, value: string): string[] {
  const target = value.trim().toLowerCase()
  const all = readAllCustomOptions()
  const current = Array.isArray(all[fieldKey]) ? all[fieldKey] : []
  all[fieldKey] = current.filter((x) => String(x).trim().toLowerCase() !== target)
  writeAllCustomOptions(all)
  return all[fieldKey]
}

export function useCustomFieldOptions(fieldKey: string) {
  const [customOptions, setCustomOptions] = useState<string[]>([])

  useEffect(() => {
    const sync = () => setCustomOptions(getCustomOptionsForField(fieldKey))
    sync()
    storeListeners.add(sync)
    return () => {
      storeListeners.delete(sync)
    }
  }, [fieldKey])

  const addOption = useCallback(
    (val: string) => {
      addCustomOptionForField(fieldKey, val)
    },
    [fieldKey]
  )

  const removeOption = useCallback(
    (val: string) => {
      removeCustomOptionForField(fieldKey, val)
    },
    [fieldKey]
  )

  return { customOptions, addOption, removeOption }
}
