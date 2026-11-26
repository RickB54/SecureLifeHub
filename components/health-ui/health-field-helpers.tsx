"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { Search, ChevronDown, Plus, User, Stethoscope, Check, X, Building2 } from "lucide-react"
import { format } from "date-fns"
import { SmartSelect } from "./smart-select"
import { SmartFieldKey } from "@/lib/health-field-defaults"

export const FACILITY_TYPES = [
  "Hospital",
  "Clinic",
  "Lab",
  "Imaging",
  "Pharmacy",
  "Urgent Care",
  "Other",
] as const

export type FacilityType = (typeof FACILITY_TYPES)[number]

export interface FacilityOption {
  id: string
  name: string
  type?: string
  address?: string
  phone?: string
  fax?: string
  website?: string
  hours?: string
  notes?: string
  doctor_ids?: string[]
  created_at?: string
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

/**
 * Format any date/timestamp into local YYYY-MM-DDTHH:mm for <input type="datetime-local">.
 * Avoids the 5-hour offset bug caused by toISOString() converting to UTC.
 */
export function formatForDateTimeInput(dateInput?: string | Date | null): string {
  if (!dateInput) return format(new Date(), "yyyy-MM-dd'T'HH:mm")
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    if (isNaN(d.getTime())) return format(new Date(), "yyyy-MM-dd'T'HH:mm")
    return format(d, "yyyy-MM-dd'T'HH:mm")
  } catch {
    return format(new Date(), "yyyy-MM-dd'T'HH:mm")
  }
}

/**
 * Extract distinct doctor records from existing vault items with zero extra queries.
 */
export function extractDoctorsFromRecords(records: any[] = []): DoctorOption[] {
  if (!Array.isArray(records)) return []
  return records
    .filter(
      (r) =>
        r &&
        (r.type === "doctor-record" ||
          r.category === "My Doctors" ||
          r.category === "Doctors" ||
          r.item_metadata?.is_doctor === true ||
          r.item_metadata?.custom_type === "doctor-record")
    )
    .map((r) => ({
      id: r.id,
      name: r.title || r.item_metadata?.doctorName || "Unnamed Doctor",
      specialty: r.item_metadata?.specialty || r.item_metadata?.doctorSpecialty || "",
      facility: r.item_metadata?.facility || r.item_metadata?.location || r.item_metadata?.address || "",
      address: r.item_metadata?.address || "",
      phone: r.item_metadata?.phone || r.item_metadata?.doctorPhone || "",
      portalUrl: r.website || r.item_metadata?.portalUrl || "",
      facility_ids: Array.isArray(r.item_metadata?.facility_ids) ? r.item_metadata.facility_ids : [],
    }))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
}

/**
 * Extract distinct medical facility records from existing vault items with zero extra queries.
 */
export function extractFacilitiesFromRecords(records: any[] = []): FacilityOption[] {
  if (!Array.isArray(records)) return []
  return records
    .filter(
      (r) =>
        r &&
        (r.type === "facility-record" ||
          r.category === "Medical Facilities" ||
          r.item_metadata?.is_facility === true ||
          r.item_metadata?.custom_type === "facility-record")
    )
    .map((r) => ({
      id: r.id,
      name: r.title || r.item_metadata?.facilityName || "Unnamed Facility",
      type: r.item_metadata?.facilityType || "Clinic",
      address: r.item_metadata?.address || "",
      phone: r.item_metadata?.phone || "",
      fax: r.item_metadata?.fax || "",
      website: r.website || r.item_metadata?.website || "",
      hours: r.item_metadata?.hours || "",
      notes: r.notes || r.item_metadata?.notes || "",
      doctor_ids: Array.isArray(r.item_metadata?.doctor_ids) ? r.item_metadata.doctor_ids : [],
      created_at: r.created_at,
    }))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
}

/**
 * Extract unique suggestion values from already loaded records (zero egress).
 */
export function extractHealthSuggestions(records: any[] = [], extraLists?: {
  notes?: any[]
  letters?: any[]
  referrals?: any[]
  visits?: any[]
  meds?: any[]
}) {
  const specialties = new Set<string>()
  const locations = new Set<string>()
  const pharmacies = new Set<string>()
  const reasons = new Set<string>()
  const prescribers = new Set<string>()
  const dateTypes = new Set<string>([
    "Appointment date",
    "Visit date",
    "Letter date",
    "Received date",
    "Sent date",
    "Referral date",
    "Other",
  ])
  const referredBys = new Set<string>()
  const medicationNames = new Set<string>()

  // Helper to safely add non-empty trimmed string
  const add = (set: Set<string>, val?: string | null) => {
    if (val && typeof val === "string") {
      const trimmed = val.trim()
      if (trimmed && trimmed.length > 1 && !trimmed.toLowerCase().includes("unnamed")) {
        set.add(trimmed)
      }
    }
  }

  // Common clinical defaults
  ;["Cardiology", "Dermatology", "Primary Care / PCP", "Neurology", "Orthopedics", "Ophthalmology / Eye", "Gastroenterology", "Endocrinology", "ENT", "Psychiatry", "Dentistry"].forEach(s => specialties.add(s))
  ;["Annual Checkup", "Follow-up Visit", "Routine Screening", "Consultation", "Medication Review", "Lab Work Review", "Specialist Referral", "Pre-op Evaluation"].forEach(r => reasons.add(r))
  ;["CVS Pharmacy", "Walgreens", "Costco Pharmacy", "Rite Aid", "Local Independent Pharmacy", "Mail Order Pharmacy"].forEach(p => pharmacies.add(p))

  if (Array.isArray(records)) {
    for (const r of records) {
      if (!r) continue
      const meta = r.item_metadata || {}

      add(specialties, meta.specialty)
      add(specialties, meta.doctorSpecialty)
      add(locations, meta.location)
      add(locations, meta.facility)
      add(locations, meta.address)
      add(pharmacies, meta.pharmacy)
      add(pharmacies, meta.rxPharmacy)
      add(prescribers, meta.prescribedBy)
      add(prescribers, meta.doctor)
      add(dateTypes, meta.date_type)
      add(referredBys, meta.referred_by)
      add(referredBys, meta.referredBy)

      if (r.category === "Medications" || r.type === "medication" || meta.is_medication) {
        add(medicationNames, r.title)
      }

      if (meta.type === "Appointment" || r.category === "Appointments" || r.type === "appointment") {
        add(reasons, r.title)
        add(locations, meta.location)
        add(specialties, meta.specialty)
        add(prescribers, meta.doctor)
      }

      if (r.type === "doctor-record" || r.category === "My Doctors" || meta.is_doctor) {
        add(prescribers, r.title)
        add(referredBys, r.title)
        add(specialties, meta.specialty)
        add(locations, meta.facility)
      }
    }
  }

  if (extraLists?.notes) {
    for (const n of extraLists.notes) {
      add(reasons, n.title)
      add(dateTypes, n.date_type)
      add(prescribers, n.doctor_name)
    }
  }

  if (extraLists?.letters) {
    for (const l of extraLists.letters) {
      add(reasons, l.title)
      add(dateTypes, l.date_type)
      add(prescribers, l.doctor_name)
    }
  }

  if (extraLists?.referrals) {
    for (const ref of extraLists.referrals) {
      add(specialties, ref.specialty)
      add(referredBys, ref.referred_by_name)
      add(prescribers, ref.doctor_name)
      add(reasons, ref.reason)
    }
  }

  if (extraLists?.visits) {
    for (const v of extraLists.visits) {
      add(reasons, v.title)
      add(prescribers, v.doctor)
      add(locations, v.location)
    }
  }

  return {
    specialties: Array.from(specialties).sort(),
    locations: Array.from(locations).sort(),
    pharmacies: Array.from(pharmacies).sort(),
    reasons: Array.from(reasons).sort(),
    prescribers: Array.from(prescribers).sort(),
    dateTypes: Array.from(dateTypes),
    referredBys: Array.from(referredBys).sort(),
    medicationNames: Array.from(medicationNames).sort(),
  }
}

interface DoctorComboboxProps {
  value: string
  doctorId?: string | null
  doctors: DoctorOption[]
  onSelectDoctor: (doctor: {
    id: string | null
    name: string
    specialty?: string
    facility?: string
    phone?: string
    address?: string
    facility_ids?: string[]
  }) => void
  onClear?: () => void
  label?: string
  placeholder?: string
  className?: string
  inputClassName?: string
  compact?: boolean
  required?: boolean
  disabled?: boolean
}

/**
 * Searchable Doctor Combobox:
 * - Lists doctors saved in My Doctors
 * - Plus "+ Other (type a name)" to enter a custom doctor name
 * - Selecting stores doctor link (doctor_id) and name
 */
export function DoctorCombobox({
  value,
  doctorId,
  doctors = [],
  onSelectDoctor,
  onClear,
  label = "Doctor / Provider",
  placeholder = "Select doctor or type name...",
  className = "",
  inputClassName = "",
  compact = false,
  required = false,
  disabled = false,
}: DoctorComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isTypingCustom, setIsTypingCustom] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync internal display
  useEffect(() => {
    setSearchTerm(value || "")
  }, [value])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setIsTypingCustom(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredDoctors = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()
    if (!q) return doctors
    return doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialty?.toLowerCase().includes(q) ||
        d.facility?.toLowerCase().includes(q)
    )
  }, [doctors, searchTerm])

  const handleSelect = (doc: DoctorOption) => {
    onSelectDoctor({
      id: doc.id,
      name: doc.name,
      specialty: doc.specialty || "",
      facility: doc.facility || doc.address || "",
      phone: doc.phone || "",
      address: doc.address || "",
      facility_ids: doc.facility_ids || [],
    })
    setSearchTerm(doc.name)
    setIsOpen(false)
    setIsTypingCustom(false)
  }

  const handleChooseOther = () => {
    setIsTypingCustom(true)
    setIsOpen(false)
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setSearchTerm(text)
    // When typing a custom name, store null id and the typed text
    onSelectDoctor({
      id: null,
      name: text,
    })
    if (!isOpen) setIsOpen(true)
  }

  const selectedDoctorObj = useMemo(() => {
    if (doctorId) return doctors.find((d) => d.id === doctorId)
    if (value) return doctors.find((d) => d.name.toLowerCase() === value.toLowerCase())
    return null
  }, [doctorId, value, doctors])

  return (
    <div ref={containerRef} className={`relative space-y-1.5 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <label className={compact ? "text-slate-400 font-semibold text-xs flex items-center gap-1" : "text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1 flex items-center gap-1.5"}>
            {!compact && <Stethoscope className="h-3 w-3 text-blue-400" />}
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {selectedDoctorObj && (
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="h-2.5 w-2.5" /> {compact ? "Linked" : "Linked to My Doctors"}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required && !searchTerm}
          className={
            inputClassName ||
            (compact
              ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              : "w-full p-4 pr-12 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-blue-500/50 transition-all font-bold text-white text-sm placeholder:text-gray-500")
          }
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchTerm && onClear && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("")
                onClear()
              }}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              title="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            tabIndex={-1}
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-64 overflow-y-auto rounded-2xl bg-[#1e1e1e] border border-white/15 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-50 zoom-in-95 custom-scrollbar">
          {/* Option: + Other (type a name) */}
          <button
            type="button"
            onClick={handleChooseOther}
            className="w-full text-left p-3 rounded-xl hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 font-bold text-xs flex items-center gap-2 border border-blue-500/20 mb-1 transition-all"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>+ Other (type a new doctor name)</span>
          </button>

          {filteredDoctors.length > 0 ? (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                My Doctors ({filteredDoctors.length})
              </div>
              {filteredDoctors.map((doc) => {
                const isSelected = doc.id === doctorId || doc.name.toLowerCase() === value?.toLowerCase()
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleSelect(doc)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? "bg-blue-600/30 border border-blue-500/40 text-white"
                        : "hover:bg-white/5 text-gray-200 hover:text-white"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm flex items-center gap-1.5 truncate">
                        <User className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                      {(doc.specialty || doc.facility || doc.phone) && (
                        <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                          {doc.specialty && <span className="text-blue-300/90 font-medium">{doc.specialty}</span>}
                          {doc.specialty && (doc.facility || doc.phone) && " • "}
                          {doc.facility || doc.phone}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-gray-400">
              No matching doctor found in My Doctors. Click &ldquo;+ Other&rdquo; above to enter a custom name.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface FieldSuggestionInputProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  fieldKey?: SmartFieldKey | string
  name?: string
  label?: string
  placeholder?: string
  className?: string
  inputClassName?: string
  compact?: boolean
  required?: boolean
  type?: string
  icon?: React.ReactNode
}

function inferSmartFieldKey(name?: string, label?: string): SmartFieldKey {
  const combined = `${name || ""} ${label || ""}`.toLowerCase()
  if (combined.includes("date-type") || combined.includes("date type") || combined.includes("datetype")) return "date_type"
  if (combined.includes("specialty")) return "specialty"
  if (combined.includes("pharmacy")) return "pharmacy"
  if (combined.includes("location") || combined.includes("address")) return "location"
  if (combined.includes("form") && combined.includes("dosage")) return "medication_form"
  if (combined.includes("reason") || combined.includes("title")) return "reason_for_visit"
  return "custom"
}

/**
 * Upgraded to delegate to the shared SmartSelect component so EVERY field always has:
 * (a) built-in defaults, (b) previously used & saved custom values (with removable "x"), and (c) "+ Custom...".
 */
export function FieldSuggestionInput({
  value,
  onChange,
  suggestions = [],
  fieldKey,
  name,
  label,
  placeholder,
  className = "",
  inputClassName = "",
  compact = false,
  required = false,
  icon,
}: FieldSuggestionInputProps) {
  const resolvedKey = fieldKey || inferSmartFieldKey(name, label)
  return (
    <SmartSelect
      fieldKey={resolvedKey}
      value={value}
      onChange={onChange}
      previousValues={suggestions}
      name={name}
      label={label}
      placeholder={placeholder}
      className={className}
      triggerClassName={inputClassName}
      compact={compact}
      required={required}
      icon={icon}
      allowClear={!required}
    />
  )
}


/**
 * If a doctor has exactly one linked facility, return it so forms can pre-select it (editable).
 */
export function findSingleLinkedFacility(
  doctor: { id: string | null; facility_ids?: string[] },
  facilities: FacilityOption[]
): FacilityOption | null {
  if (!doctor.id) return null
  const linked = facilities.filter(
    (f) =>
      doctor.facility_ids?.includes(f.id) ||
      f.doctor_ids?.includes(doctor.id as string)
  )
  return linked.length === 1 ? linked[0] : null
}

interface FacilityComboboxProps {
  value: string
  facilityId?: string | null
  facilities: FacilityOption[]
  onSelectFacility: (facility: {
    id: string | null
    name: string
    type?: string
    address?: string
    phone?: string
  }) => void
  onClear?: () => void
  label?: string
  placeholder?: string
  className?: string
  inputClassName?: string
  compact?: boolean
  required?: boolean
  disabled?: boolean
}

/**
 * Searchable Facility Combobox:
 * - Lists facilities saved in Medical Facilities
 * - Plus "+ Other (type a name)" to enter a custom facility name
 * - Selecting stores facility link (facility_id) and name
 */
export function FacilityCombobox({
  value,
  facilityId,
  facilities = [],
  onSelectFacility,
  onClear,
  label = "Facility / Location",
  placeholder = "Select facility or type name...",
  className = "",
  inputClassName = "",
  compact = false,
  required = false,
  disabled = false,
}: FacilityComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSearchTerm(value || "")
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredFacilities = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()
    if (!q) return facilities
    return facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.type?.toLowerCase().includes(q) ||
        f.address?.toLowerCase().includes(q)
    )
  }, [facilities, searchTerm])

  const selectedObj = useMemo(() => {
    if (facilityId) return facilities.find((f) => f.id === facilityId)
    if (value) return facilities.find((f) => f.name.toLowerCase() === value.toLowerCase())
    return null
  }, [facilityId, value, facilities])

  return (
    <div ref={containerRef} className={`relative space-y-1.5 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <label
            className={
              compact
                ? "text-slate-400 font-semibold text-xs flex items-center gap-1"
                : "text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1 flex items-center gap-1.5"
            }
          >
            {!compact && <Building2 className="h-3 w-3 text-teal-400" />}
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {selectedObj && (
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="h-2.5 w-2.5" /> {compact ? "Linked" : "Linked Facility"}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            const text = e.target.value
            setSearchTerm(text)
            onSelectFacility({ id: null, name: text })
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required && !searchTerm}
          className={
            inputClassName ||
            (compact
              ? "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              : "w-full p-4 pr-12 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-teal-500/50 transition-all font-bold text-white text-sm placeholder:text-gray-500")
          }
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchTerm && onClear && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("")
                onClear()
              }}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              title="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            tabIndex={-1}
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-teal-400" : ""}`} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-64 overflow-y-auto rounded-2xl bg-[#1e1e1e] border border-white/15 p-2 shadow-2xl backdrop-blur-xl custom-scrollbar">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              if (inputRef.current) {
                inputRef.current.focus()
                inputRef.current.select()
              }
            }}
            className="w-full text-left p-3 rounded-xl hover:bg-teal-600/20 text-teal-400 hover:text-teal-300 font-bold text-xs flex items-center gap-2 border border-teal-500/20 mb-1 transition-all"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>+ Other (type a name)</span>
          </button>

          {filteredFacilities.length > 0 ? (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                Medical Facilities ({filteredFacilities.length})
              </div>
              {filteredFacilities.map((fac) => {
                const isSelected = fac.id === facilityId || fac.name.toLowerCase() === value?.toLowerCase()
                return (
                  <button
                    key={fac.id}
                    type="button"
                    onClick={() => {
                      onSelectFacility({
                        id: fac.id,
                        name: fac.name,
                        type: fac.type || "",
                        address: fac.address || "",
                        phone: fac.phone || "",
                      })
                      setSearchTerm(fac.name)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? "bg-teal-600/30 border border-teal-500/40 text-white"
                        : "hover:bg-white/5 text-gray-200 hover:text-white"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm flex items-center gap-1.5 truncate">
                        <Building2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                        <span className="truncate">{fac.name}</span>
                      </div>
                      {(fac.type || fac.address || fac.phone) && (
                        <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                          {fac.type && <span className="text-teal-300/90 font-medium">{fac.type}</span>}
                          {fac.type && (fac.address || fac.phone) && " • "}
                          {fac.address || fac.phone}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-gray-400">
              No matching facility found. Click &ldquo;+ Other&rdquo; above to type a custom name.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
