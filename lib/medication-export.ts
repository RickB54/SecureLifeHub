"use client"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"
import type { DoctorOption, FacilityOption } from "@/components/health-ui/health-field-helpers"
import { resolveDoctorInfo, resolveFacilityInfo } from "@/lib/health-store"
import {
  calculatePillCountEstimate,
  formatReminderTime12h,
  getEffectiveReminderTimes,
  getScheduledNextDose,
  isMedTracked,
  type PillCountEstimate,
} from "@/lib/pill-count"

export const DEFAULT_MED_CATEGORIES = [
  "Every Day Usage",
  "As Needed",
  "Surgery",
  "Short-term / Temporary",
  "Supplements",
] as const

export const UNCATEGORIZED_MED_CATEGORY = "Uncategorized"
export const CUSTOM_MED_CATEGORIES_KEY = "slh_med_custom_categories"
export const MED_EXPORT_PREFS_KEY = "slh_med_export_prefs"

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

/**
 * Formats YYYY-MM-DD strings by splitting directly — NEVER `new Date("YYYY-MM-DD")`
 * which parses as UTC midnight and shifts backward one day in local US timezones.
 */
export function formatMedDateOnly(val?: string | null): string {
  if (!val) return ""
  const trimmed = String(val).trim()
  if (!trimmed) return ""

  const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1])
    const monthIdx = Number(dateOnlyMatch[2]) - 1
    const day = Number(dateOnlyMatch[3])
    if (monthIdx >= 0 && monthIdx < 12 && day >= 1 && day <= 31) {
      return `${MONTH_ABBR[monthIdx]} ${day}, ${year}`
    }
  }

  // If ISO string starts with YYYY-MM-DDT00:00:00.000Z from a date-only picker, split date portion safely
  const isoMidnightMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T00:00:00(?:\.000)?Z$/)
  if (isoMidnightMatch) {
    const year = Number(isoMidnightMatch[1])
    const monthIdx = Number(isoMidnightMatch[2]) - 1
    const day = Number(isoMidnightMatch[3])
    if (monthIdx >= 0 && monthIdx < 12 && day >= 1 && day <= 31) {
      return `${MONTH_ABBR[monthIdx]} ${day}, ${year}`
    }
  }

  const parsed = new Date(trimmed)
  if (isNaN(parsed.getTime())) return trimmed
  return format(parsed, "MMM d, yyyy")
}

/**
 * Parses a YYYY-MM-DD string into a local-midnight Date object without UTC shift.
 */
export function parseMedLocalDate(val?: string | null): Date | null {
  if (!val) return null
  const trimmed = String(val).trim()
  const m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  }
  const d = new Date(trimmed)
  return isNaN(d.getTime()) ? null : d
}

export function formatMedDateTime(val?: string | null): string {
  if (!val) return ""
  const d = new Date(val)
  if (isNaN(d.getTime())) return String(val)
  return format(d, "MMM d, yyyy 'at' h:mm a")
}

export function getMedCategory(med: any): string {
  const raw = med?.item_metadata?.category
  if (typeof raw === "string" && raw.trim() && raw.trim() !== UNCATEGORIZED_MED_CATEGORY) {
    return raw.trim()
  }
  return UNCATEGORIZED_MED_CATEGORY
}

export function loadSavedCustomMedCategories(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(CUSTOM_MED_CATEGORIES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.map((c) => String(c).trim()).filter((c) => c && c !== UNCATEGORIZED_MED_CATEGORY)
      : []
  } catch {
    return []
  }
}

export function saveCustomMedCategories(categories: string[]) {
  if (typeof window === "undefined") return
  try {
    const clean = Array.from(
      new Set(categories.map((c) => c.trim()).filter((c) => c && c !== UNCATEGORIZED_MED_CATEGORY))
    )
    localStorage.setItem(CUSTOM_MED_CATEGORIES_KEY, JSON.stringify(clean))
  } catch {
    // ignore storage errors
  }
}

export function getAllMedicationCategories(meds: any[], customCategories: string[] = []): string[] {
  const seen = new Map<string, string>()
  const add = (name?: string | null) => {
    const trimmed = (name || "").trim()
    if (!trimmed || trimmed.toLowerCase() === UNCATEGORIZED_MED_CATEGORY.toLowerCase()) return
    const key = trimmed.toLowerCase()
    if (!seen.has(key)) seen.set(key, trimmed)
  }

  for (const def of DEFAULT_MED_CATEGORIES) add(def)
  for (const c of customCategories) add(c)
  for (const m of meds || []) add(m?.item_metadata?.category)

  return Array.from(seen.values())
}

const SHAPE_LABELS: Record<string, string> = {
  round: "Round Tablet",
  oval: "Oval Tablet",
  capsule: "Capsule",
  square: "Square Tablet",
  triangle: "Triangle Tablet",
  hexagon: "Hexagon Tablet",
  liquid: "Liquid",
  powder: "Powder / Packet",
  inhaler: "Inhaler",
}

export interface LabelValueField {
  key: string
  label: string
  value: string
}

export interface DoseScheduleDisplayRow {
  dayLabel: string
  dateLabel: string
  quantityLabel: string
}

export interface AdherenceDisplayEntry {
  logType: "taken" | "skipped"
  index: number
  timestamp: string
  formattedTime: string
}

/**
 * Single Source of Truth for a medication's display & export fields.
 * Consumed by: MedicationDetailView, Quick Reference (PDF/Print/Text), and Full Details (PDF/Print/Text).
 */
export interface NormalizedMedicationData {
  id: string
  name: string
  genericName: string
  drugClass: string
  dosage: string
  form: string
  category: string
  frequency: string
  purpose: string
  rxInstructions: string
  sideEffects: string
  interactions: string
  privateNotes: string
  medInfoText: string
  pillShapeLabel: string
  pillColor: string

  // Care team & pharmacy
  doctorId: string | null
  doctorName: string
  doctorSpecialty: string
  doctorPhone: string
  facilityName: string
  facilityAddress: string
  pharmacyName: string
  pharmacyPhone: string
  pharmacyAddress: string
  rxNumber: string
  refillsRemaining: string
  lastFilledDate: string

  // Schedule
  currentDose: string
  reminderTimesFormatted: string
  nextDoseFormatted: string
  startDateFormatted: string
  endDateFormatted: string // formatted date or "Ongoing" when startDate/frequency exists
  rawEndDateFormatted: string // empty if not set
  lastTakenFormatted: string
  doseScheduleRows: DoseScheduleDisplayRow[]

  // Inventory
  isTracked: boolean
  isLowStock: boolean
  pillEstimate: PillCountEstimate | null
  quantityRaw: string
  totalQuantityRaw: string
  pillsPerDose: string
  lowStockThreshold: string
  refillDateFormatted: string

  // Adherence
  takenCount: number
  skippedCount: number
  adherenceEntries: AdherenceDisplayEntry[]

  // Pre-built non-empty section rows (for Detail Screen & Full Details export)
  overviewRows: LabelValueField[]
  scheduleRows: LabelValueField[]
  prescriberPharmacyRows: LabelValueField[]
  inventoryRows: LabelValueField[]
  safetyRows: (includePrivateNotes: boolean) => LabelValueField[]
}

export function extractNormalizedMedicationData(
  med: any,
  doctors: DoctorOption[] = [],
  facilities: FacilityOption[] = [],
  externalMedInfoText?: string
): NormalizedMedicationData {
  const meta = med?.item_metadata || {}
  const docInfo = resolveDoctorInfo(meta.doctor_id, { name: meta.prescribedBy }, doctors)
  const facInfo = resolveFacilityInfo(
    meta.facility_id,
    { name: meta.facility_name || docInfo.location },
    facilities
  )

  const pillEstimate = calculatePillCountEstimate(meta)
  const tracked = isMedTracked(meta)
  const lowStock = Boolean(pillEstimate?.isLowStock)

  const rawShape = String(meta.pillShape || "").toLowerCase().trim()
  const pillShapeLabel = SHAPE_LABELS[rawShape] || (rawShape ? rawShape : "")
  const form = String(meta.dosageForm || "").trim() || pillShapeLabel

  const name = String(med?.title || meta.name || "Untitled Medication").trim()
  const genericName = String(meta.genericName || "").trim()
  const drugClass = String(meta.drugClass || "").trim()
  const dosage = String(meta.dosage || "").trim()
  const category = getMedCategory(med)
  const frequency = String(meta.frequency || "").trim()
  const purpose = String(meta.purpose || "").trim()
  const rxInstructions = String(meta.rxInstructions || "").trim()
  const sideEffects = String(meta.sideEffects || "").trim()
  const interactions = String(meta.interactions || "").trim()
  const privateNotes = String(meta.notes || "").trim()

  const savedAiText =
    typeof meta.aiDrugInfo === "string"
      ? meta.aiDrugInfo.trim()
      : meta.aiDrugInfo
      ? JSON.stringify(meta.aiDrugInfo, null, 2)
      : ""
  const medInfoText = (externalMedInfoText || savedAiText || "").trim()

  const doctorName = (docInfo.name || "").trim()
  const doctorSpecialty = (docInfo.specialty || "").trim()
  const doctorPhone = (docInfo.phone || "").trim()
  const facilityName = (facInfo.name || "").trim()
  const facilityAddress = (facInfo.address || "").trim()

  const pharmacyName = String(meta.pharmacy || "").trim()
  const pharmacyPhone = String(meta.pharmacyPhone || "").trim()
  const pharmacyAddress = String(meta.pharmacyAddress || "").trim()
  const rxNumber = String(meta.rxNumber || "").trim()
  const refillsRemaining =
    meta.refillsRemaining !== undefined && meta.refillsRemaining !== null && String(meta.refillsRemaining).trim() !== ""
      ? String(meta.refillsRemaining).trim()
      : ""
  const lastFilledDate = formatMedDateOnly(meta.lastFilledDate)

  const reminders = getEffectiveReminderTimes(meta)
  const reminderTimesFormatted =
    reminders.length > 0 ? reminders.map((r) => formatReminderTime12h(r.hh, r.mm)).join(", ") : ""

  // Current dose calculation
  let currentDose = dosage
  const rawSchedule: Array<{ dayIndex: number; quantity: number }> = Array.isArray(meta.doseSchedule)
    ? meta.doseSchedule
    : []
  const schedStartDate = parseMedLocalDate(meta.scheduleStartDate || meta.startDate)
  if (rawSchedule.length > 0 && schedStartDate) {
    const today = new Date()
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const dayIdx = Math.floor((todayMidnight.getTime() - schedStartDate.getTime()) / 86400000) + 1
    const match = rawSchedule.find((s) => Number(s.dayIndex) === dayIdx)
    if (match) {
      currentDose = `${match.quantity} pill(s)${reminderTimesFormatted ? ` at ${reminderTimesFormatted}` : ""}`
    } else if (dosage && reminderTimesFormatted) {
      currentDose = `${dosage} at ${reminderTimesFormatted}`
    }
  } else if (dosage && reminderTimesFormatted) {
    currentDose = `${dosage} at ${reminderTimesFormatted}`
  }

  const liveNext = getScheduledNextDose(meta) || meta.nextDose || ""
  const nextDoseFormatted = liveNext ? formatMedDateTime(liveNext) : ""
  const startDateFormatted = formatMedDateOnly(meta.startDate)
  const rawEndDateFormatted = formatMedDateOnly(meta.endDate)
  const endDateFormatted = rawEndDateFormatted || (startDateFormatted || frequency ? "Ongoing" : "")
  const lastTakenFormatted = meta.lastTaken ? formatMedDateTime(meta.lastTaken) : ""

  const doseScheduleRows: DoseScheduleDisplayRow[] = rawSchedule.map((entry) => {
    let dateLabel = ""
    if (schedStartDate) {
      const d = new Date(schedStartDate.getFullYear(), schedStartDate.getMonth(), schedStartDate.getDate() + (Number(entry.dayIndex) - 1))
      dateLabel = `${MONTH_ABBR[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    }
    return {
      dayLabel: `Day ${entry.dayIndex}`,
      dateLabel,
      quantityLabel: `${entry.quantity} pill(s)`,
    }
  })

  const quantityRaw =
    tracked && pillEstimate
      ? String(pillEstimate.remaining)
      : meta.quantity !== undefined && meta.quantity !== null && Number(meta.quantity) > 0
      ? String(meta.quantity)
      : meta.totalQuantity !== undefined && meta.totalQuantity !== null && Number(meta.totalQuantity) > 0
      ? String(meta.totalQuantity)
      : ""

  const totalQuantityRaw =
    meta.totalQuantity !== undefined && meta.totalQuantity !== null && Number(meta.totalQuantity) > 0
      ? String(meta.totalQuantity)
      : ""

  const pillsPerDose = meta.pillsPerDose ? String(meta.pillsPerDose) : "1"
  const lowStockThreshold =
    meta.lowStockThreshold !== undefined && meta.lowStockThreshold !== null
      ? String(meta.lowStockThreshold)
      : "5"
  const refillDateFormatted = formatMedDateOnly(meta.refillDate)

  const takenArr = Array.isArray(meta.takenLog) ? meta.takenLog : []
  const skippedArr = Array.isArray(meta.skippedLog) ? meta.skippedLog : []
  const adherenceEntries: AdherenceDisplayEntry[] = [
    ...takenArr.map((e: any, index: number) => {
      const ts = e?.timestamp || (typeof e === "string" ? e : "")
      return {
        logType: "taken" as const,
        index,
        timestamp: ts,
        formattedTime: ts ? formatMedDateTime(ts) : "Unknown time",
      }
    }),
    ...skippedArr.map((e: any, index: number) => {
      const ts = e?.timestamp || (typeof e === "string" ? e : "")
      return {
        logType: "skipped" as const,
        index,
        timestamp: ts,
        formattedTime: ts ? formatMedDateTime(ts) : "Unknown time",
      }
    }),
  ].sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())

  const pushIf = (arr: LabelValueField[], key: string, label: string, val?: string | null) => {
    const clean = (val || "").trim()
    if (clean) arr.push({ key, label, value: clean })
  }

  const overviewRows: LabelValueField[] = []
  pushIf(overviewRows, "name", "Medication Name", name)
  pushIf(overviewRows, "genericName", "Generic Name", genericName)
  pushIf(overviewRows, "drugClass", "Drug Class", drugClass)
  pushIf(overviewRows, "dosage", "Strength / Dosage", dosage)
  pushIf(overviewRows, "form", "Dosage Form", form)
  pushIf(overviewRows, "category", "Category", category !== UNCATEGORIZED_MED_CATEGORY ? category : "")
  pushIf(overviewRows, "purpose", "Purpose", purpose)

  const scheduleRows: LabelValueField[] = []
  pushIf(scheduleRows, "frequency", "Frequency", frequency)
  pushIf(scheduleRows, "currentDose", "Current Dose", currentDose)
  pushIf(scheduleRows, "reminderTimes", "Reminder Times", reminderTimesFormatted)
  pushIf(scheduleRows, "nextDose", "Next Scheduled Dose", nextDoseFormatted)
  pushIf(scheduleRows, "startDate", "Start Date", startDateFormatted)
  pushIf(scheduleRows, "endDate", "End Date", endDateFormatted)
  pushIf(scheduleRows, "lastTaken", "Last Taken", lastTakenFormatted)

  const prescriberPharmacyRows: LabelValueField[] = []
  pushIf(
    prescriberPharmacyRows,
    "doctor",
    "Prescribing Doctor",
    doctorName ? `${doctorName}${doctorSpecialty ? ` (${doctorSpecialty})` : ""}` : ""
  )
  pushIf(prescriberPharmacyRows, "doctorPhone", "Doctor Phone", doctorPhone)
  pushIf(prescriberPharmacyRows, "facility", "Facility", facilityName)
  pushIf(prescriberPharmacyRows, "facilityAddress", "Facility Address", facilityAddress)
  pushIf(prescriberPharmacyRows, "pharmacy", "Pharmacy", pharmacyName)
  pushIf(prescriberPharmacyRows, "pharmacyPhone", "Pharmacy Phone", pharmacyPhone)
  pushIf(prescriberPharmacyRows, "pharmacyAddress", "Pharmacy Address", pharmacyAddress)
  pushIf(prescriberPharmacyRows, "rxNumber", "Rx Number", rxNumber)
  pushIf(prescriberPharmacyRows, "refillsRemaining", "Refills Remaining", refillsRemaining)
  pushIf(prescriberPharmacyRows, "lastFilledDate", "Last Filled Date", lastFilledDate)

  const inventoryRows: LabelValueField[] = []
  if (tracked) {
    pushIf(
      inventoryRows,
      "estimatedRemaining",
      "Estimated Remaining",
      `Est. ${pillEstimate?.remaining ?? meta.quantity ?? 0} left${lowStock ? " (Low Stock)" : ""}`
    )
    pushIf(
      inventoryRows,
      "runOutDate",
      "Estimated Run-Out",
      pillEstimate?.runOutDateStr ? `Runs out about ${pillEstimate.runOutDateStr}` : ""
    )
    pushIf(inventoryRows, "pillsPerDose", "Pills per Dose", pillsPerDose)
    pushIf(inventoryRows, "totalQuantity", "Total Quantity (Bottle)", totalQuantityRaw)
    pushIf(inventoryRows, "lowStockThreshold", "Low-Stock Alert At", `<= ${lowStockThreshold}`)
    pushIf(inventoryRows, "refillDate", "Refill Date", refillDateFormatted)
  }

  const safetyRows = (includePrivateNotes: boolean): LabelValueField[] => {
    const list: LabelValueField[] = []
    pushIf(list, "rxInstructions", "RX Label Instructions", rxInstructions)
    pushIf(list, "sideEffects", "Common Side Effects", sideEffects)
    pushIf(list, "interactions", "Drug Interactions", interactions)
    if (includePrivateNotes) {
      pushIf(list, "privateNotes", "Private Notes", privateNotes)
    }
    return list
  }

  return {
    id: med?.id || "",
    name,
    genericName,
    drugClass,
    dosage,
    form,
    category,
    frequency,
    purpose,
    rxInstructions,
    sideEffects,
    interactions,
    privateNotes,
    medInfoText,
    pillShapeLabel,
    pillColor: String(meta.pillColor || "#FFFFFF"),
    doctorId: docInfo.id || meta.doctor_id || null,
    doctorName,
    doctorSpecialty,
    doctorPhone,
    facilityName,
    facilityAddress,
    pharmacyName,
    pharmacyPhone,
    pharmacyAddress,
    rxNumber,
    refillsRemaining,
    lastFilledDate,
    currentDose,
    reminderTimesFormatted,
    nextDoseFormatted,
    startDateFormatted,
    endDateFormatted,
    rawEndDateFormatted,
    lastTakenFormatted,
    doseScheduleRows,
    isTracked: tracked,
    isLowStock: lowStock,
    pillEstimate,
    quantityRaw,
    totalQuantityRaw,
    pillsPerDose,
    lowStockThreshold,
    refillDateFormatted,
    takenCount: takenArr.length,
    skippedCount: skippedArr.length,
    adherenceEntries,
    overviewRows,
    scheduleRows,
    prescriberPharmacyRows,
    inventoryRows,
    safetyRows,
  }
}

export interface MedicationExportOptions {
  formatType: "quick" | "full"
  groupByCategory: boolean
  patientName: string
  includePrivateNotes: boolean
  includeAdherence: boolean
  includeMedInfo: boolean
}

function groupAndSortMedications(
  items: NormalizedMedicationData[],
  groupByCategory: boolean
): Array<{ category: string | null; items: NormalizedMedicationData[] }> {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name))
  if (!groupByCategory) {
    return [{ category: null, items: sorted }]
  }

  const groups = new Map<string, NormalizedMedicationData[]>()
  for (const item of sorted) {
    const cat = item.category || UNCATEGORIZED_MED_CATEGORY
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat)!.push(item)
  }

  // Order: DEFAULT_MED_CATEGORIES first, then custom A-Z, then Uncategorized last
  const orderedKeys = Array.from(groups.keys()).sort((a, b) => {
    if (a === UNCATEGORIZED_MED_CATEGORY) return 1
    if (b === UNCATEGORIZED_MED_CATEGORY) return -1
    const ia = DEFAULT_MED_CATEGORIES.indexOf(a as any)
    const ib = DEFAULT_MED_CATEGORIES.indexOf(b as any)
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    return a.localeCompare(b)
  })

  return orderedKeys.map((k) => ({ category: k, items: groups.get(k)! }))
}

function buildQuickRefCells(item: NormalizedMedicationData) {
  const medParts = [
    item.name,
    item.genericName ? `Generic: ${item.genericName}` : "",
    [item.dosage, item.form].filter(Boolean).join(" • "),
  ].filter(Boolean)

  const dirParts = [
    item.frequency,
    item.rxInstructions ? `RX: ${item.rxInstructions}` : "",
    item.purpose ? `For: ${item.purpose}` : "",
  ].filter(Boolean)

  const docParts = [item.doctorName, item.doctorPhone].filter(Boolean)
  const pharmParts = [item.pharmacyName, item.pharmacyPhone, item.pharmacyAddress].filter(Boolean)

  const rxParts = [
    item.rxNumber ? `Rx #: ${item.rxNumber}` : "",
    item.refillsRemaining ? `Refills: ${item.refillsRemaining}` : "",
    item.lastFilledDate ? `Last filled: ${item.lastFilledDate}` : "",
    item.totalQuantityRaw ? `Qty: ${item.totalQuantityRaw}` : item.quantityRaw ? `Qty: ${item.quantityRaw}` : "",
    item.startDateFormatted ? `Started: ${item.startDateFormatted}` : "",
  ].filter(Boolean)

  return {
    medication: medParts.join("\n"),
    directions: dirParts.join("\n"),
    prescriber: docParts.join("\n"),
    pharmacy: pharmParts.join("\n"),
    rxDetails: rxParts.join("\n"),
  }
}

/**
 * Generates plain-text output suitable for pasting into a pharmacy / patient portal message.
 */
export function buildMedicationPlainText(
  items: NormalizedMedicationData[],
  options: MedicationExportOptions
): string {
  const todayStr = format(new Date(), "MMM d, yyyy")
  const lines: string[] = []

  lines.push(
    options.formatType === "quick"
      ? "MEDICATION QUICK REFERENCE (REFILL / PROVIDER LIST)"
      : "COMPLETE MEDICATION DETAILS"
  )
  if (options.patientName.trim()) {
    lines.push(`Patient: ${options.patientName.trim()}`)
  }
  lines.push(`Prepared: ${todayStr} (${items.length} medication${items.length === 1 ? "" : "s"})`)
  lines.push("------------------------------------------------------------")

  const groups = groupAndSortMedications(items, options.groupByCategory)

  if (options.formatType === "quick") {
    for (const grp of groups) {
      if (grp.category) {
        lines.push(`\n[${grp.category.toUpperCase()}]`)
      }
      for (const m of grp.items) {
        const header = [
          m.name,
          m.genericName ? `(${m.genericName})` : "",
          m.dosage ? `- ${m.dosage}` : "",
          m.form ? `[${m.form}]` : "",
        ]
          .filter(Boolean)
          .join(" ")
        lines.push(`• ${header}`)
        if (m.frequency || m.rxInstructions) {
          lines.push(`  Directions: ${[m.frequency, m.rxInstructions].filter(Boolean).join(" — ")}`)
        }
        if (m.purpose) lines.push(`  Purpose: ${m.purpose}`)
        if (m.doctorName || m.doctorPhone) {
          lines.push(`  Prescriber: ${[m.doctorName, m.doctorPhone].filter(Boolean).join(" | ")}`)
        }
        if (m.pharmacyName || m.pharmacyPhone || m.pharmacyAddress) {
          lines.push(`  Pharmacy: ${[m.pharmacyName, m.pharmacyPhone, m.pharmacyAddress].filter(Boolean).join(" | ")}`)
        }
        const rxMeta = [
          m.rxNumber ? `Rx #${m.rxNumber}` : "",
          m.refillsRemaining ? `Refills: ${m.refillsRemaining}` : "",
          m.lastFilledDate ? `Last filled: ${m.lastFilledDate}` : "",
          m.totalQuantityRaw ? `Qty: ${m.totalQuantityRaw}` : m.quantityRaw ? `Qty: ${m.quantityRaw}` : "",
          m.startDateFormatted ? `Start: ${m.startDateFormatted}` : "",
        ].filter(Boolean)
        if (rxMeta.length > 0) lines.push(`  Rx Info: ${rxMeta.join(" | ")}`)
      }
    }
    lines.push("\n------------------------------------------------------------")
    lines.push(`Prepared ${todayStr} • Verify with your pharmacist or doctor`)
    return lines.join("\n")
  }

  // Full Details plain text
  for (const grp of groups) {
    if (grp.category) lines.push(`\n=== CATEGORY: ${grp.category.toUpperCase()} ===`)
    for (const m of grp.items) {
      lines.push(`\n${m.name.toUpperCase()}${m.dosage ? ` (${m.dosage})` : ""}${m.frequency ? ` — ${m.frequency}` : ""}`)
      const writeSection = (title: string, rows: LabelValueField[]) => {
        if (rows.length === 0) return
        lines.push(`  ${title}:`)
        for (const r of rows) lines.push(`    - ${r.label}: ${r.value}`)
      }
      writeSection("Medication Overview", m.overviewRows)
      writeSection("Schedule & Dosing", m.scheduleRows)
      if (m.doseScheduleRows.length > 0) {
        lines.push("    - Periodic Dose Schedule:")
        for (const dr of m.doseScheduleRows) {
          lines.push(`        ${dr.dayLabel}${dr.dateLabel ? ` (${dr.dateLabel})` : ""}: ${dr.quantityLabel}`)
        }
      }
      writeSection("Prescriber & Pharmacy", m.prescriberPharmacyRows)
      if (m.isTracked) writeSection("Inventory & Refills", m.inventoryRows)
      writeSection("Safety & Instructions", m.safetyRows(options.includePrivateNotes))
      if (options.includeAdherence && (m.takenCount > 0 || m.skippedCount > 0)) {
        lines.push(`  Adherence: Taken ${m.takenCount}x, Skipped ${m.skippedCount}x`)
        for (const entry of m.adherenceEntries.slice(0, 20)) {
          lines.push(`    - ${entry.logType === "taken" ? "Taken" : "Skipped"}: ${entry.formattedTime}`)
        }
      }
      if (options.includeMedInfo && m.medInfoText) {
        lines.push(`  Medication Info:\n    ${m.medInfoText.replace(/\n/g, "\n    ")}`)
      }
    }
  }
  lines.push("\n------------------------------------------------------------")
  lines.push(`Generated ${todayStr} by Secure Life Hub - Verify with your pharmacist or doctor`)
  return lines.join("\n")
}

/**
 * Generates and downloads a Letter-size, high-contrast PDF (Quick Reference or Full Details).
 */
export function downloadMedicationPDF(
  items: NormalizedMedicationData[],
  options: MedicationExportOptions
) {
  const doc = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" })
  const pageWidth = doc.internal.pageSize.getWidth() // 612pt
  const pageHeight = doc.internal.pageSize.getHeight() // 792pt
  const marginX = 36
  const contentWidth = pageWidth - marginX * 2
  const bottomLimit = pageHeight - 48
  const todayStr = format(new Date(), "MMM d, yyyy")

  const groups = groupAndSortMedications(items, options.groupByCategory)

  if (options.formatType === "quick") {
    // Header
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.setTextColor(17, 24, 39)
    doc.text("Medication Quick Reference", marginX, 42)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10.5)
    doc.setTextColor(55, 65, 81)
    const subParts = [
      options.patientName.trim() ? `Patient: ${options.patientName.trim()}` : "",
      `Prepared: ${todayStr}`,
      `Total Medications: ${items.length}`,
    ].filter(Boolean)
    doc.text(subParts.join("   •   "), marginX, 58)

    doc.setDrawColor(180, 185, 195)
    doc.setLineWidth(1)
    doc.line(marginX, 66, pageWidth - marginX, 66)

    // Determine which optional columns actually have data so empty columns don't waste space
    const allCells = items.map(buildQuickRefCells)
    const hasDirections = allCells.some((c) => Boolean(c.directions))
    const hasPrescriber = allCells.some((c) => Boolean(c.prescriber))
    const hasPharmacy = allCells.some((c) => Boolean(c.pharmacy))
    const hasRxDetails = allCells.some((c) => Boolean(c.rxDetails))

    const columns: Array<{ key: keyof ReturnType<typeof buildQuickRefCells>; header: string }> = [
      { key: "medication", header: "Medication & Strength" },
    ]
    if (hasDirections) columns.push({ key: "directions", header: "Directions & Purpose" })
    if (hasPrescriber) columns.push({ key: "prescriber", header: "Prescriber" })
    if (hasPharmacy) columns.push({ key: "pharmacy", header: "Pharmacy" })
    if (hasRxDetails) columns.push({ key: "rxDetails", header: "Rx / Refill Info" })

    const bodyRows: any[] = []
    for (const grp of groups) {
      if (grp.category) {
        bodyRows.push([
          {
            content: `${grp.category} (${grp.items.length})`,
            colSpan: columns.length,
            styles: {
              fillColor: [238, 242, 255],
              textColor: [30, 41, 59],
              fontStyle: "bold",
              fontSize: 10.5,
              cellPadding: { top: 5, bottom: 5, left: 6, right: 6 },
            },
          },
        ])
      }
      for (const item of grp.items) {
        const c = buildQuickRefCells(item)
        bodyRows.push(columns.map((col) => c[col.key] || "—"))
      }
    }

    autoTable(doc, {
      startY: 76,
      margin: { left: marginX, right: marginX, bottom: 48 },
      head: [columns.map((c) => c.header)],
      body: bodyRows,
      rowPageBreak: "avoid",
      styles: {
        font: "helvetica",
        fontSize: items.length > 10 ? 9.5 : 10.5,
        textColor: [17, 24, 39],
        cellPadding: 5,
        lineColor: [209, 213, 219],
        lineWidth: 0.5,
        overflow: "linebreak",
        valign: "top",
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10.5,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: columns.length >= 4 ? 130 : "auto" },
      },
    })

    // Footers & page numbers
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p)
      doc.setDrawColor(209, 213, 219)
      doc.line(marginX, pageHeight - 34, pageWidth - marginX, pageHeight - 34)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(75, 85, 99)
      doc.text(`Prepared ${todayStr} • Verify with your pharmacist or doctor`, marginX, pageHeight - 20)
      doc.text(`Page ${p} of ${pageCount}`, pageWidth - marginX, pageHeight - 20, { align: "right" })
    }

    const fileSuffix = items.length === 1 ? items[0].name.replace(/[^a-z0-9]+/gi, "_") : "Quick_Reference"
    doc.save(`Medications_${fileSuffix}_${format(new Date(), "yyyy-MM-dd")}.pdf`)
    return
  }

  // =========================================================================
  // FULL DETAILS PDF: Optional 1-page summary table (if >1 med), then 1 sheet per drug
  // =========================================================================
  const orderedMeds = groups.flatMap((g) => g.items)

  if (orderedMeds.length > 1) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(17)
    doc.setTextColor(17, 24, 39)
    doc.text("Complete Medication Summary", marginX, 42)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.setTextColor(55, 65, 81)
    const hdrParts = [
      options.patientName.trim() ? `Patient: ${options.patientName.trim()}` : "",
      `Date: ${todayStr}`,
      `Medications: ${orderedMeds.length}`,
    ].filter(Boolean)
    doc.text(hdrParts.join("   •   "), marginX, 58)

    const summaryBody: any[] = []
    for (const grp of groups) {
      if (grp.category) {
        summaryBody.push([
          {
            content: `${grp.category} (${grp.items.length})`,
            colSpan: 5,
            styles: {
              fillColor: [238, 242, 255],
              textColor: [30, 41, 59],
              fontStyle: "bold",
              fontSize: 10.5,
            },
          },
        ])
      }
      for (const m of grp.items) {
        summaryBody.push([
          m.name + (m.genericName ? `\n(${m.genericName})` : ""),
          [m.dosage, m.form].filter(Boolean).join(" • ") || "—",
          m.frequency || "—",
          m.purpose || "—",
          m.doctorName || "—",
        ])
      }
    }

    autoTable(doc, {
      startY: 70,
      margin: { left: marginX, right: marginX, bottom: 48 },
      head: [["Medication", "Dose / Form", "Frequency", "Purpose", "Prescriber"]],
      body: summaryBody,
      rowPageBreak: "avoid",
      styles: {
        font: "helvetica",
        fontSize: 10.5,
        textColor: [17, 24, 39],
        cellPadding: 6,
        lineColor: [209, 213, 219],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    })
  }

  // Render one dedicated sheet per medication
  orderedMeds.forEach((med, medIdx) => {
    if (medIdx > 0 || orderedMeds.length > 1) {
      doc.addPage()
    }

    let y = 36

    // Header Band
    doc.setFillColor(243, 244, 246)
    doc.setDrawColor(209, 213, 219)
    doc.roundedRect(marginX, y, contentWidth, 58, 6, 6, "FD")

    // Pill visual circle swatch
    doc.setDrawColor(75, 85, 99)
    doc.setFillColor(med.pillColor || "#FFFFFF")
    doc.circle(marginX + 20, y + 29, 9, "FD")

    doc.setFont("helvetica", "bold")
    doc.setFontSize(15)
    doc.setTextColor(17, 24, 39)
    doc.text(med.name, marginX + 38, y + 23)

    // Category badge at top right of header band
    if (med.category) {
      const badgeText = med.category
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9.5)
      const bw = doc.getTextWidth(badgeText) + 14
      doc.setFillColor(224, 231, 255)
      doc.setDrawColor(165, 180, 252)
      doc.roundedRect(pageWidth - marginX - bw - 12, y + 10, bw, 18, 4, 4, "FD")
      doc.setTextColor(49, 46, 129)
      doc.text(badgeText, pageWidth - marginX - bw - 5, y + 22)
    }

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.setTextColor(55, 65, 81)
    const subLine = [
      med.dosage,
      med.form,
      med.frequency,
      options.patientName.trim() ? `Patient: ${options.patientName.trim()}` : "",
    ]
      .filter(Boolean)
      .join("   •   ")
    doc.text(subLine, marginX + 38, y + 42)

    y += 74

    const renderKeyValueSection = (title: string, rows: LabelValueField[]) => {
      if (rows.length === 0) return

      const labelColW = 150
      const valColW = contentWidth - labelColW - 16
      const measured = rows.map((r) => {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(11)
        const wrapped = doc.splitTextToSize(r.value, valColW) as string[]
        const rowH = Math.max(18, wrapped.length * 14 + 6)
        return { label: r.label, wrapped, rowH }
      })

      const totalBlockH = 26 + measured.reduce((sum, m) => sum + m.rowH, 0) + 10
      // Do not split a section across pages if the whole section fits on one page
      if (y + totalBlockH > bottomLimit && totalBlockH <= bottomLimit - 40) {
        doc.addPage()
        y = 40
      } else if (y + 48 > bottomLimit) {
        doc.addPage()
        y = 40
      }

      // Section Heading
      doc.setFillColor(248, 250, 252)
      doc.setDrawColor(203, 213, 225)
      doc.rect(marginX, y, contentWidth, 22, "FD")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.setTextColor(15, 23, 42)
      doc.text(title.toUpperCase(), marginX + 8, y + 15)
      y += 26

      for (const item of measured) {
        if (y + item.rowH > bottomLimit) {
          doc.addPage()
          y = 40
        }
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10.5)
        doc.setTextColor(71, 85, 105)
        doc.text(item.label, marginX + 6, y + 12)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(11)
        doc.setTextColor(17, 24, 39)

        // Wrap very long text cleanly across pages if needed
        let lineY = y + 12
        for (const line of item.wrapped) {
          if (lineY > bottomLimit) {
            doc.addPage()
            lineY = 48
          }
          doc.text(line, marginX + labelColW + 10, lineY)
          lineY += 14
        }

        y = Math.max(y + item.rowH, lineY - 8)
        doc.setDrawColor(229, 231, 235)
        doc.line(marginX, y, pageWidth - marginX, y)
      }

      y += 12
    }

    renderKeyValueSection("Medication Overview", med.overviewRows)
    renderKeyValueSection("Schedule & Dosing", med.scheduleRows)

    if (med.doseScheduleRows.length > 0) {
      if (y + 80 > bottomLimit) {
        doc.addPage()
        y = 40
      }
      autoTable(doc, {
        startY: y,
        margin: { left: marginX, right: marginX, bottom: 48 },
        head: [["Periodic Schedule Day", "Date", "Scheduled Dose"]],
        body: med.doseScheduleRows.map((dr) => [dr.dayLabel, dr.dateLabel || "—", dr.quantityLabel]),
        rowPageBreak: "avoid",
        styles: { fontSize: 10.5, textColor: [17, 24, 39], cellPadding: 5 },
        headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: "bold" },
      })
      y = (doc as any).lastAutoTable.finalY + 14
    }

    renderKeyValueSection("Prescriber & Pharmacy", med.prescriberPharmacyRows)
    if (med.isTracked) {
      renderKeyValueSection("Inventory & Refills", med.inventoryRows)
    }
    renderKeyValueSection("Safety & Instructions", med.safetyRows(options.includePrivateNotes))

    if (options.includeAdherence && (med.takenCount > 0 || med.skippedCount > 0)) {
      const adhRows: LabelValueField[] = [
        {
          key: "summary",
          label: "Adherence Summary",
          value: `Taken ${med.takenCount}x   •   Skipped ${med.skippedCount}x`,
        },
      ]
      if (med.adherenceEntries.length > 0) {
        adhRows.push({
          key: "recent",
          label: "Logged Doses",
          value: med.adherenceEntries
            .slice(0, 25)
            .map((e) => `${e.logType === "taken" ? "Taken" : "Skipped"} — ${e.formattedTime}`)
            .join("\n"),
        })
      }
      renderKeyValueSection("Adherence Log", adhRows)
    }

    if (options.includeMedInfo && med.medInfoText) {
      renderKeyValueSection("Medication Reference Info", [
        { key: "medInfo", label: "Reference Details", value: med.medInfoText },
      ])
    }
  })

  // Footer on every page
  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setDrawColor(209, 213, 219)
    doc.line(marginX, pageHeight - 34, pageWidth - marginX, pageHeight - 34)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(75, 85, 99)
    doc.text(
      `Generated ${todayStr} by Secure Life Hub - Verify with your pharmacist or doctor`,
      marginX,
      pageHeight - 20
    )
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginX, pageHeight - 20, { align: "right" })
  }

  const fileSuffix = orderedMeds.length === 1 ? orderedMeds[0].name.replace(/[^a-z0-9]+/gi, "_") : "Full_Details"
  doc.save(`Medications_${fileSuffix}_${format(new Date(), "yyyy-MM-dd")}.pdf`)
}

function escapeHtml(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br/>")
}

/**
 * Opens a clean Letter-formatted high-contrast print window (Quick Reference or Full Details).
 */
export function printMedicationReport(
  items: NormalizedMedicationData[],
  options: MedicationExportOptions
) {
  const printWin = window.open("", "_blank")
  if (!printWin) return

  const todayStr = format(new Date(), "MMM d, yyyy")
  const groups = groupAndSortMedications(items, options.groupByCategory)

  const commonCss = `
    @page { size: letter portrait; margin: 0.5in; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.45;
      color: #111827;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    h1 { font-size: 18pt; margin: 0 0 4px 0; color: #0f172a; }
    .sub { font-size: 10pt; color: #374151; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 2px solid #1e293b; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10.5pt; }
    th { background: #1e293b; color: #ffffff; text-align: left; padding: 7px 8px; font-weight: 700; border: 1px solid #1e293b; }
    td { padding: 6px 8px; border: 1px solid #cbd5e1; vertical-align: top; color: #111827; }
    tr { page-break-inside: avoid; break-inside: avoid; }
    .cat-row td { background: #eef2ff; color: #1e293b; font-weight: 700; font-size: 10.5pt; }
    .drug-sheet { page-break-before: always; break-before: page; }
    .drug-sheet.first-sheet { page-break-before: auto; break-before: auto; }
    .band { background: #f3f4f6; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; page-break-inside: avoid; break-inside: avoid; }
    .band-title { font-size: 15pt; font-weight: 800; color: #0f172a; margin: 0; }
    .band-sub { font-size: 10.5pt; color: #374151; margin-top: 3px; }
    .badge { background: #e0e7ff; border: 1px solid #a5b4fc; color: #312e81; padding: 3px 9px; border-radius: 6px; font-size: 9.5pt; font-weight: 700; white-space: nowrap; }
    .sec { margin-bottom: 12px; page-break-inside: avoid; break-inside: avoid; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; }
    .sec-h { background: #f8fafc; padding: 6px 10px; font-weight: 700; font-size: 10.5pt; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #cbd5e1; }
    .kv { display: flex; border-bottom: 1px solid #e5e7eb; padding: 5px 10px; gap: 12px; }
    .kv:last-child { border-bottom: none; }
    .kv-l { width: 170px; flex-shrink: 0; font-weight: 700; color: #334155; font-size: 10pt; }
    .kv-v { flex: 1; color: #111827; font-size: 11pt; word-break: break-word; }
    .footer { margin-top: 18px; padding-top: 8px; border-top: 1px solid #cbd5e1; font-size: 9pt; color: #4b5563; display: flex; justify-content: space-between; }
  `

  let bodyHtml = ""

  if (options.formatType === "quick") {
    const allCells = items.map(buildQuickRefCells)
    const cols: Array<{ key: keyof ReturnType<typeof buildQuickRefCells>; header: string }> = [
      { key: "medication", header: "Medication & Strength" },
    ]
    if (allCells.some((c) => Boolean(c.directions))) cols.push({ key: "directions", header: "Directions & Purpose" })
    if (allCells.some((c) => Boolean(c.prescriber))) cols.push({ key: "prescriber", header: "Prescriber" })
    if (allCells.some((c) => Boolean(c.pharmacy))) cols.push({ key: "pharmacy", header: "Pharmacy" })
    if (allCells.some((c) => Boolean(c.rxDetails))) cols.push({ key: "rxDetails", header: "Rx / Refill Info" })

    const rowsHtml = groups
      .map((grp) => {
        const catTr = grp.category
          ? `<tr class="cat-row"><td colspan="${cols.length}">${escapeHtml(grp.category)} (${grp.items.length})</td></tr>`
          : ""
        const itemTrs = grp.items
          .map((item) => {
            const c = buildQuickRefCells(item)
            return `<tr>${cols
              .map((col, idx) => `<td style="${idx === 0 ? "font-weight:600;" : ""}">${escapeHtml(c[col.key] || "—")}</td>`)
              .join("")}</tr>`
          })
          .join("")
        return catTr + itemTrs
      })
      .join("")

    bodyHtml = `
      <h1>Medication Quick Reference</h1>
      <div class="sub">
        ${options.patientName.trim() ? `<strong>Patient:</strong> ${escapeHtml(options.patientName.trim())} &nbsp;&bull;&nbsp; ` : ""}
        <strong>Prepared:</strong> ${escapeHtml(todayStr)} &nbsp;&bull;&nbsp; <strong>Total Medications:</strong> ${items.length}
      </div>
      <table>
        <thead><tr>${cols.map((c) => `<th>${escapeHtml(c.header)}</th>`).join("")}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <div class="footer">
        <span>Prepared ${escapeHtml(todayStr)}</span>
        <span>Verify with your pharmacist or doctor</span>
      </div>
    `
  } else {
    const orderedMeds = groups.flatMap((g) => g.items)
    let summaryHtml = ""
    if (orderedMeds.length > 1) {
      const sumRows = groups
        .map((grp) => {
          const catTr = grp.category
            ? `<tr class="cat-row"><td colspan="5">${escapeHtml(grp.category)} (${grp.items.length})</td></tr>`
            : ""
          const trs = grp.items
            .map(
              (m) => `<tr>
                <td><strong>${escapeHtml(m.name)}</strong>${m.genericName ? `<br/><span style="font-size:9.5pt;color:#4b5563;">(${escapeHtml(m.genericName)})</span>` : ""}</td>
                <td>${escapeHtml([m.dosage, m.form].filter(Boolean).join(" • ") || "—")}</td>
                <td>${escapeHtml(m.frequency || "—")}</td>
                <td>${escapeHtml(m.purpose || "—")}</td>
                <td>${escapeHtml(m.doctorName || "—")}</td>
              </tr>`
            )
            .join("")
          return catTr + trs
        })
        .join("")

      summaryHtml = `
        <div class="first-sheet">
          <h1>Complete Medication Summary</h1>
          <div class="sub">
            ${options.patientName.trim() ? `<strong>Patient:</strong> ${escapeHtml(options.patientName.trim())} &nbsp;&bull;&nbsp; ` : ""}
            <strong>Date:</strong> ${escapeHtml(todayStr)} &nbsp;&bull;&nbsp; <strong>Medications:</strong> ${orderedMeds.length}
          </div>
          <table>
            <thead><tr><th>Medication</th><th>Dose / Form</th><th>Frequency</th><th>Purpose</th><th>Prescriber</th></tr></thead>
            <tbody>${sumRows}</tbody>
          </table>
          <div class="footer">
            <span>Generated ${escapeHtml(todayStr)} by Secure Life Hub</span>
            <span>Verify with your pharmacist or doctor</span>
          </div>
        </div>
      `
    }

    const renderSecHtml = (title: string, rows: LabelValueField[]) => {
      if (rows.length === 0) return ""
      return `
        <div class="sec">
          <div class="sec-h">${escapeHtml(title)}</div>
          ${rows
            .map(
              (r) => `<div class="kv"><div class="kv-l">${escapeHtml(r.label)}</div><div class="kv-v">${escapeHtml(r.value)}</div></div>`
            )
            .join("")}
        </div>
      `
    }

    const sheetsHtml = orderedMeds
      .map((m, idx) => {
        const isVeryFirstPage = orderedMeds.length === 1 && idx === 0
        const schedTable =
          m.doseScheduleRows.length > 0
            ? `<div class="sec"><div class="sec-h">Periodic Dose Schedule</div><table><thead><tr><th>Day</th><th>Date</th><th>Dose</th></tr></thead><tbody>${m.doseScheduleRows
                .map(
                  (dr) =>
                    `<tr><td>${escapeHtml(dr.dayLabel)}</td><td>${escapeHtml(dr.dateLabel || "—")}</td><td>${escapeHtml(dr.quantityLabel)}</td></tr>`
                )
                .join("")}</tbody></table></div>`
            : ""

        const adhSec =
          options.includeAdherence && (m.takenCount > 0 || m.skippedCount > 0)
            ? renderSecHtml("Adherence Log", [
                { key: "sum", label: "Summary", value: `Taken ${m.takenCount}x • Skipped ${m.skippedCount}x` },
                ...(m.adherenceEntries.length > 0
                  ? [
                      {
                        key: "logs",
                        label: "Logged Doses",
                        value: m.adherenceEntries
                          .slice(0, 25)
                          .map((e) => `${e.logType === "taken" ? "Taken" : "Skipped"} — ${e.formattedTime}`)
                          .join("\n"),
                      },
                    ]
                  : []),
              ])
            : ""

        const medInfoSec =
          options.includeMedInfo && m.medInfoText
            ? renderSecHtml("Medication Reference Info", [{ key: "info", label: "Details", value: m.medInfoText }])
            : ""

        return `
          <div class="${isVeryFirstPage ? "first-sheet" : "drug-sheet"}">
            <div class="band">
              <div>
                <div class="band-title">${escapeHtml(m.name)}</div>
                <div class="band-sub">${escapeHtml(
                  [
                    m.dosage,
                    m.form,
                    m.frequency,
                    options.patientName.trim() ? `Patient: ${options.patientName.trim()}` : "",
                  ]
                    .filter(Boolean)
                    .join(" • ")
                )}</div>
              </div>
              ${m.category ? `<div class="badge">${escapeHtml(m.category)}</div>` : ""}
            </div>
            ${renderSecHtml("Medication Overview", m.overviewRows)}
            ${renderSecHtml("Schedule & Dosing", m.scheduleRows)}
            ${schedTable}
            ${renderSecHtml("Prescriber & Pharmacy", m.prescriberPharmacyRows)}
            ${m.isTracked ? renderSecHtml("Inventory & Refills", m.inventoryRows) : ""}
            ${renderSecHtml("Safety & Instructions", m.safetyRows(options.includePrivateNotes))}
            ${adhSec}
            ${medInfoSec}
            <div class="footer">
              <span>Generated ${escapeHtml(todayStr)} by Secure Life Hub</span>
              <span>Verify with your pharmacist or doctor</span>
            </div>
          </div>
        `
      })
      .join("")

    bodyHtml = summaryHtml + sheetsHtml
  }

  printWin.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Medication Report - Secure Life Hub</title>
        <style>${commonCss}</style>
      </head>
      <body>
        ${bodyHtml}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `)
  printWin.document.close()
}
