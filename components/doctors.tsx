"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Users,
  Plus,
  Search,
  Trash2,
  Edit3,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Building2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Printer,
  Hospital,
  Sparkles,
  Check,
  X,
} from "lucide-react"
import { toast } from "sonner"
import {
  FieldSuggestionInput,
  extractHealthSuggestions,
  FACILITY_TYPES,
  type FacilityType,
} from "./health-ui/health-field-helpers"
import { HealthTooltip } from "./health-ui/health-tooltip"
import {
  getCachedHealthRecords,
  loadSharedHealthRecords,
  subscribeHealthStore,
  upsertSharedHealthRecord,
  removeSharedHealthRecord,
} from "@/lib/health-store"

const normalizeUrl = (url?: string) => {
  if (!url) return ""
  const trimmed = url.trim()
  if (!trimmed) return ""
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

interface DoctorsProps {
  records: any[]
  addItem: (item: any) => Promise<any>
  updateItem: (id: string, updates: any) => Promise<any>
  deleteItem: (id: string) => Promise<any>
  theme: string
  onOpenHelp?: (targetId?: string) => void
  setActivePage?: (page: string) => void
}

export default function Doctors({
  records,
  addItem,
  updateItem,
  deleteItem,
  theme,
  onOpenHelp,
  setActivePage,
}: DoctorsProps) {
  const [subTab, setSubTab] = useState<"doctors" | "facilities">("doctors")

  // Doctors state
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingDoctor, setEditingDoctor] = useState<any>(null)

  // Facilities state
  const [showFacilityModal, setShowFacilityModal] = useState(false)
  const [editingFacility, setEditingFacility] = useState<any>(null)
  const [facilitySearch, setFacilitySearch] = useState("")
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<string>("all")
  const [facilitySort, setFacilitySort] = useState<"name_asc" | "newest" | "type">("name_asc")
  const [expandedFacilities, setExpandedFacilities] = useState<Record<string, boolean>>({})
  const [importingFacilities, setImportingFacilities] = useState(false)

  // Reuse shared cached Health Hub store (zero duplicate fetches across tabs)
  const [sharedRecords, setSharedRecords] = useState<any[] | null>(() => getCachedHealthRecords())

  useEffect(() => {
    const unsub = subscribeHealthStore((data) => setSharedRecords(data))
    loadSharedHealthRecords()
    return unsub
  }, [])

  const effectiveRecords = sharedRecords && sharedRecords.length > 0 ? sharedRecords : records
  const healthSuggestions = useMemo(() => extractHealthSuggestions(effectiveRecords), [effectiveRecords])

  const doctors = useMemo(() => {
    return effectiveRecords
      .filter(
        (r) =>
          r.type === "doctor-record" ||
          r.category === "My Doctors" ||
          r.category === "Doctors" ||
          r.item_metadata?.is_doctor === true ||
          r.item_metadata?.custom_type === "doctor-record"
      )
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
  }, [effectiveRecords])

  const facilities = useMemo(() => {
    return effectiveRecords
      .filter(
        (r) =>
          r.type === "facility-record" ||
          r.category === "Medical Facilities" ||
          r.item_metadata?.is_facility === true ||
          r.item_metadata?.custom_type === "facility-record"
      )
  }, [effectiveRecords])

  const filteredDoctors = doctors.filter(
    (dr) =>
      dr.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dr.item_metadata?.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dr.item_metadata?.facility?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredFacilities = useMemo(() => {
    const q = facilitySearch.toLowerCase().trim()
    const list = facilities.filter((fac) => {
      if (facilityTypeFilter !== "all" && (fac.item_metadata?.facilityType || "Clinic") !== facilityTypeFilter) {
        return false
      }
      if (!q) return true
      return (
        fac.title?.toLowerCase().includes(q) ||
        fac.item_metadata?.facilityType?.toLowerCase().includes(q) ||
        fac.item_metadata?.address?.toLowerCase().includes(q) ||
        fac.item_metadata?.phone?.toLowerCase().includes(q)
      )
    })

    return [...list].sort((a, b) => {
      if (facilitySort === "newest") {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      }
      if (facilitySort === "type") {
        return (a.item_metadata?.facilityType || "Other").localeCompare(b.item_metadata?.facilityType || "Other") ||
          (a.title || "").localeCompare(b.title || "")
      }
      return (a.title || "").localeCompare(b.title || "")
    })
  }, [facilities, facilitySearch, facilityTypeFilter, facilitySort])

  // Resolve linked facilities for a doctor (bidirectional)
  const getLinkedFacilitiesForDoctor = (doctor: any) => {
    const docFacIds: string[] = Array.isArray(doctor.item_metadata?.facility_ids) ? doctor.item_metadata.facility_ids : []
    return facilities.filter(
      (f) => docFacIds.includes(f.id) || (Array.isArray(f.item_metadata?.doctor_ids) && f.item_metadata.doctor_ids.includes(doctor.id))
    )
  }

  // Resolve linked doctors for a facility (bidirectional)
  const getLinkedDoctorsForFacility = (facility: any) => {
    const facDocIds: string[] = Array.isArray(facility.item_metadata?.doctor_ids) ? facility.item_metadata.doctor_ids : []
    return doctors.filter(
      (d) => facDocIds.includes(d.id) || (Array.isArray(d.item_metadata?.facility_ids) && d.item_metadata.facility_ids.includes(facility.id))
    )
  }

  // Doctor form state
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    facility: "",
    facility_ids: [] as string[],
    phone: "",
    email: "",
    address: "",
    portalUrl: "",
    notes: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      specialty: "",
      facility: "",
      facility_ids: [],
      phone: "",
      email: "",
      address: "",
      portalUrl: "",
      notes: "",
    })
    setEditingDoctor(null)
  }

  // Facility form state
  const [facilityForm, setFacilityForm] = useState({
    name: "",
    facilityType: "Clinic" as FacilityType,
    address: "",
    phone: "",
    fax: "",
    website: "",
    hours: "",
    notes: "",
    doctor_ids: [] as string[],
  })

  const resetFacilityForm = () => {
    setFacilityForm({
      name: "",
      facilityType: "Clinic",
      address: "",
      phone: "",
      fax: "",
      website: "",
      hours: "",
      notes: "",
      doctor_ids: [],
    })
    setEditingFacility(null)
  }

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) {
      toast.error("Doctor name is required")
      return
    }

    const cleanPortalUrl = normalizeUrl(formData.portalUrl)
    const primaryFacilityName =
      formData.facility?.trim() ||
      (formData.facility_ids.length > 0
        ? facilities.find((f) => f.id === formData.facility_ids[0])?.title || ""
        : "")

    const doctorData = {
      type: "note",
      title: formData.name.trim(),
      category: "My Doctors",
      website: cleanPortalUrl || null,
      notes: formData.notes?.trim() || null,
      item_metadata: {
        specialty: formData.specialty?.trim() || "",
        facility: primaryFacilityName,
        facility_ids: formData.facility_ids,
        phone: formData.phone?.trim() || "",
        email: formData.email?.trim() || "",
        address: formData.address?.trim() || "",
        portalUrl: cleanPortalUrl || formData.portalUrl?.trim() || "",
        notes: formData.notes?.trim() || "",
        is_doctor: true,
        custom_type: "doctor-record",
      },
    }

    try {
      if (editingDoctor) {
        const res = await updateItem(editingDoctor.id, doctorData)
        if (res === false) throw new Error("Failed to update doctor")
        upsertSharedHealthRecord({ ...editingDoctor, ...doctorData })
        toast.success("Doctor updated successfully")
      } else {
        const created = await addItem(doctorData)
        if (!created) throw new Error("Failed to add doctor")
        upsertSharedHealthRecord(created)
        toast.success("Doctor added to your list")
      }
      setShowAddModal(false)
      resetForm()
    } catch (err: any) {
      console.error("Failed to save doctor:", err)
      toast.error(err?.message || "Failed to save doctor")
    }
  }

  const handleEditDoctor = (doctor: any) => {
    const linkedIds = getLinkedFacilitiesForDoctor(doctor).map((f) => f.id)
    setEditingDoctor(doctor)
    setFormData({
      name: doctor.title || "",
      specialty: doctor.item_metadata?.specialty || "",
      facility: doctor.item_metadata?.facility || "",
      facility_ids: linkedIds,
      phone: doctor.item_metadata?.phone || "",
      email: doctor.item_metadata?.email || "",
      address: doctor.item_metadata?.address || "",
      portalUrl: doctor.item_metadata?.portalUrl || doctor.website || doctor.item_metadata?.url || "",
      notes: doctor.item_metadata?.notes || doctor.notes || "",
    })
    setShowAddModal(true)
  }

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!facilityForm.name?.trim()) {
      toast.error("Facility name is required")
      return
    }

    const cleanWebsite = normalizeUrl(facilityForm.website)
    const payload = {
      type: "note",
      title: facilityForm.name.trim(),
      category: "Medical Facilities",
      website: cleanWebsite || null,
      notes: facilityForm.notes?.trim() || null,
      item_metadata: {
        facilityType: facilityForm.facilityType || "Clinic",
        address: facilityForm.address?.trim() || "",
        phone: facilityForm.phone?.trim() || "",
        fax: facilityForm.fax?.trim() || "",
        website: cleanWebsite || facilityForm.website?.trim() || "",
        hours: facilityForm.hours?.trim() || "",
        notes: facilityForm.notes?.trim() || "",
        doctor_ids: facilityForm.doctor_ids,
        is_facility: true,
        custom_type: "facility-record",
      },
    }

    try {
      if (editingFacility) {
        const res = await updateItem(editingFacility.id, payload)
        if (res === false) throw new Error("Failed to update facility")
        upsertSharedHealthRecord({ ...editingFacility, ...payload })
        toast.success("Facility updated")
      } else {
        const created = await addItem(payload)
        if (!created) throw new Error("Failed to save facility")
        upsertSharedHealthRecord(created)
        toast.success("Facility added")
      }
      setShowFacilityModal(false)
      resetFacilityForm()
    } catch (err: any) {
      toast.error(err?.message || "Failed to save facility")
    }
  }

  const handleEditFacility = (fac: any) => {
    const linkedDocIds = getLinkedDoctorsForFacility(fac).map((d) => d.id)
    setEditingFacility(fac)
    setFacilityForm({
      name: fac.title || "",
      facilityType: (fac.item_metadata?.facilityType as FacilityType) || "Clinic",
      address: fac.item_metadata?.address || "",
      phone: fac.item_metadata?.phone || "",
      fax: fac.item_metadata?.fax || "",
      website: fac.item_metadata?.website || fac.website || "",
      hours: fac.item_metadata?.hours || "",
      notes: fac.item_metadata?.notes || fac.notes || "",
      doctor_ids: linkedDocIds,
    })
    setShowFacilityModal(true)
  }

  // One-time import: create facilities from existing doctors' facility text (case-insensitive dedupe)
  const handleImportFacilitiesFromDoctors = async () => {
    setImportingFacilities(true)
    try {
      const existingByName = new Map<string, any>()
      for (const f of facilities) {
        if (f.title?.trim()) existingByName.set(f.title.trim().toLowerCase(), f)
      }

      let createdCount = 0
      let linkedCount = 0

      // Group doctors by normalized facility name
      const grouped = new Map<string, { displayName: string; doctors: any[] }>()
      for (const dr of doctors) {
        const rawFac = (dr.item_metadata?.facility || "").trim()
        if (!rawFac || rawFac.toLowerCase() === "independent clinic") continue
        const key = rawFac.toLowerCase()
        if (!grouped.has(key)) {
          grouped.set(key, { displayName: rawFac, doctors: [dr] })
        } else {
          grouped.get(key)!.doctors.push(dr)
        }
      }

      if (grouped.size === 0) {
        toast.info("No doctor facility names found to import.")
        setImportingFacilities(false)
        return
      }

      for (const [key, group] of grouped.entries()) {
        const existing = existingByName.get(key)
        const docIds = group.doctors.map((d) => d.id)

        if (existing) {
          const prevDocIds: string[] = Array.isArray(existing.item_metadata?.doctor_ids)
            ? existing.item_metadata.doctor_ids
            : []
          const mergedIds = Array.from(new Set([...prevDocIds, ...docIds]))
          if (mergedIds.length !== prevDocIds.length) {
            const updatedMeta = { ...existing.item_metadata, doctor_ids: mergedIds }
            await updateItem(existing.id, { item_metadata: updatedMeta })
            upsertSharedHealthRecord({ ...existing, item_metadata: updatedMeta })
            linkedCount += mergedIds.length - prevDocIds.length
          }
        } else {
          const sampleDoc = group.doctors[0]
          const created = await addItem({
            type: "note",
            title: group.displayName,
            category: "Medical Facilities",
            item_metadata: {
              facilityType: group.displayName.toLowerCase().includes("hospital")
                ? "Hospital"
                : group.displayName.toLowerCase().includes("pharmacy")
                ? "Pharmacy"
                : "Clinic",
              address: sampleDoc.item_metadata?.address || "",
              phone: sampleDoc.item_metadata?.phone || "",
              fax: "",
              website: "",
              hours: "",
              notes: "",
              doctor_ids: docIds,
              is_facility: true,
              custom_type: "facility-record",
            },
          })
          if (created) {
            upsertSharedHealthRecord(created)
            existingByName.set(key, created)
            createdCount++
            linkedCount += docIds.length
          }
        }
      }

      toast.success(`Imported ${createdCount} new facilities and linked ${linkedCount} doctor connection(s).`)
    } catch (err: any) {
      toast.error(err?.message || "Failed to import facilities")
    } finally {
      setImportingFacilities(false)
    }
  }

  return (
    <div className={`p-4 md:p-8 space-y-6 animate-in fade-in duration-500 ${theme === "light" ? "text-gray-900" : "text-white"}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3">
            {subTab === "doctors" ? (
              <Users className="h-8 w-8 text-blue-500" />
            ) : (
              <Building2 className="h-8 w-8 text-teal-400" />
            )}
            {subTab === "doctors" ? "My Medical Team" : "Medical Facilities"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {subTab === "doctors"
              ? "Directory of specialists, facilities, and care providers."
              : "Hospitals, clinics, labs, imaging centers, and pharmacies."}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <HealthTooltip content="Return to Health Hub Overview">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.setItem("slh-health-target-tab", "dashboard")
                }
                if (setActivePage) {
                  setActivePage("type-health-records")
                } else if (typeof window !== "undefined") {
                  window.location.href = "/?page=type-health-records"
                }
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <Hospital className="h-4 w-4 text-rose-400" />
              Health Hub
            </button>
          </HealthTooltip>
          {subTab === "doctors" ? (
            <HealthTooltip content="Add a new doctor, specialist, or care provider">
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setShowAddModal(true)
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-rose-500/20 transition-all font-bold flex items-center gap-2 cursor-pointer"
              >
                <Plus className="h-5 w-5" /> Add Provider
              </button>
            </HealthTooltip>
          ) : (
            <HealthTooltip content="Add a hospital, clinic, lab, imaging center, or pharmacy">
              <button
                type="button"
                onClick={() => {
                  resetFacilityForm()
                  setShowFacilityModal(true)
                }}
                className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-teal-500/20 transition-all font-bold flex items-center gap-2 cursor-pointer"
              >
                <Plus className="h-5 w-5" /> Add Facility
              </button>
            </HealthTooltip>
          )}
        </div>
      </div>

      {/* Two Sub-Tabs: Doctors | Facilities */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <HealthTooltip content="View and manage your doctors and specialists">
          <button
            type="button"
            onClick={() => setSubTab("doctors")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              subTab === "doctors"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Stethoscope className="h-4 w-4" />
            Doctors ({doctors.length})
          </button>
        </HealthTooltip>
        <HealthTooltip content="View and manage hospitals, clinics, labs, imaging centers, and pharmacies">
          <button
            type="button"
            onClick={() => setSubTab("facilities")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              subTab === "facilities"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Facilities ({facilities.length})
          </button>
        </HealthTooltip>
      </div>

      {/* ==================== DOCTORS TAB ==================== */}
      {subTab === "doctors" && (
        <>
          <div className="relative group max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-rose-400 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, specialty, or facility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-4 pl-12 pr-4 rounded-2xl border ${
                theme === "light" ? "bg-white border-gray-200" : "bg-white/5 border-white/10"
              } focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-medium`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
                <Users className="h-16 w-16 text-gray-700 mx-auto mb-4 opacity-20" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No providers found</p>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 text-rose-400 hover:text-rose-300 font-black text-xs uppercase underline"
                >
                  Add your first doctor
                </button>
              </div>
            ) : (
              filteredDoctors.map((dr) => {
                const linkedFacs = getLinkedFacilitiesForDoctor(dr)
                return (
                  <div
                    key={dr.id}
                    className={`group p-6 rounded-3xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden ${
                      theme === "light" ? "bg-white border-gray-200" : "bg-[#1a1a1a] border-white/5"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 shadow-inner">
                        <Stethoscope className="h-6 w-6" />
                      </div>
                      <div className="flex gap-1">
                        <HealthTooltip content="Edit provider">
                          <button
                            type="button"
                            onClick={() => handleEditDoctor(dr)}
                            aria-label={`Edit ${dr.title}`}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-400 cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </HealthTooltip>
                        <HealthTooltip content="Delete provider">
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm("Delete this provider?")) {
                                await deleteItem(dr.id)
                                removeSharedHealthRecord(dr.id)
                                toast.success("Provider deleted")
                              }
                            }}
                            aria-label={`Delete ${dr.title}`}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </HealthTooltip>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3
                        onClick={() => handleEditDoctor(dr)}
                        className="text-xl font-black uppercase tracking-tighter group-hover:text-rose-400 transition-colors leading-tight truncate cursor-pointer"
                        title="Tap to edit provider"
                      >
                        {dr.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-black uppercase text-rose-500/80 tracking-widest">
                          {dr.item_metadata?.specialty || "General Medicine"}
                        </span>
                        <div className="h-1 w-1 rounded-full bg-white/20" />
                        <span className="text-[10px] uppercase font-bold text-gray-500 truncate">
                          {linkedFacs[0]?.title || dr.item_metadata?.facility || "Independent Clinic"}
                        </span>
                      </div>
                    </div>

                    {/* Tappable Linked Facilities */}
                    {linkedFacs.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {linkedFacs.map((fac) => (
                          <button
                            key={fac.id}
                            type="button"
                            onClick={() => {
                              setSubTab("facilities")
                              setFacilitySearch(fac.title || "")
                              setExpandedFacilities((prev) => ({ ...prev, [fac.id]: true }))
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/25 text-[11px] font-semibold transition-colors cursor-pointer"
                            title="View facility"
                          >
                            <Building2 className="h-3 w-3" />
                            <span className="truncate max-w-[160px]">{fac.title}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        {dr.item_metadata?.phone && (
                          <a
                            href={`tel:${dr.item_metadata.phone.replace(/[^0-9+]/g, "")}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-3 text-sm text-gray-300 hover:text-rose-400 transition-colors group/item"
                          >
                            <div className="p-1.5 rounded-lg bg-white/5 group-hover/item:bg-rose-500/10 transition-colors">
                              <Phone className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium">{dr.item_metadata.phone}</span>
                          </a>
                        )}
                        {dr.item_metadata?.email && (
                          <a
                            href={`mailto:${dr.item_metadata.email.trim()}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-3 text-sm text-gray-300 hover:text-rose-400 transition-colors group/item"
                          >
                            <div className="p-1.5 rounded-lg bg-white/5 group-hover/item:bg-rose-500/10 transition-colors">
                              <Mail className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium truncate">{dr.item_metadata.email}</span>
                          </a>
                        )}
                        {dr.item_metadata?.address && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dr.item_metadata.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-3 text-sm text-gray-300 hover:text-rose-400 transition-colors group/item"
                          >
                            <div className="p-1.5 rounded-lg bg-white/5 group-hover/item:bg-rose-500/10 transition-colors shrink-0">
                              <MapPin className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium text-xs leading-relaxed">{dr.item_metadata.address}</span>
                          </a>
                        )}
                      </div>

                      {(() => {
                        const portalUrl = normalizeUrl(dr.item_metadata?.portalUrl || dr.website || dr.item_metadata?.url)
                        const notes = dr.item_metadata?.notes || dr.notes
                        if (!notes && !portalUrl) return null

                        return (
                          <div className="pt-4 border-t border-white/5 space-y-3">
                            {notes && <p className="text-xs text-gray-500 italic line-clamp-2">&ldquo;{notes}&rdquo;</p>}
                            {portalUrl && (
                              <a
                                href={portalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 transition-all group/portal cursor-pointer"
                              >
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/portal:text-rose-400">
                                  Patient Portal
                                </span>
                                <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover/portal:text-rose-400 transition-colors" />
                              </a>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      {/* ==================== FACILITIES TAB ==================== */}
      {subTab === "facilities" && (
        <div className="space-y-4">
          {/* Toolbar: Search, Type Filter, Sort, One-Time Import */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search facilities, type, address..."
                  value={facilitySearch}
                  onChange={(e) => setFacilitySearch(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                />
              </div>
              <select
                value={facilityTypeFilter}
                onChange={(e) => setFacilityTypeFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 text-xs font-semibold text-gray-200 focus:outline-none focus:border-teal-500"
              >
                <option value="all">All Types</option>
                {FACILITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                value={facilitySort}
                onChange={(e) => setFacilitySort(e.target.value as any)}
                className="px-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 text-xs font-semibold text-gray-200 focus:outline-none focus:border-teal-500"
              >
                <option value="name_asc">Name A-Z</option>
                <option value="newest">Newest</option>
                <option value="type">Type</option>
              </select>
            </div>

            <HealthTooltip content="Automatically build facility records from hospital/clinic names already entered on your doctors and link them together">
              <button
                type="button"
                disabled={importingFacilities}
                onClick={handleImportFacilitiesFromDoctors}
                className="px-4 py-2.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Sparkles className="h-4 w-4" />
                {importingFacilities ? "Importing..." : "Create facilities from existing doctors"}
              </button>
            </HealthTooltip>
          </div>

          {/* Facilities Collapsed List */}
          <div className="space-y-2.5">
            {filteredFacilities.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-white/10 rounded-2xl">
                <Building2 className="h-12 w-12 text-gray-700 mx-auto mb-3 opacity-30" />
                <p className="text-gray-400 text-sm">No facilities found.</p>
                <button
                  type="button"
                  onClick={() => {
                    resetFacilityForm()
                    setShowFacilityModal(true)
                  }}
                  className="mt-3 text-teal-400 hover:text-teal-300 font-bold text-xs uppercase underline"
                >
                  Add your first facility
                </button>
              </div>
            ) : (
              filteredFacilities.map((fac) => {
                const isExpanded = expandedFacilities[fac.id] === true
                const meta = fac.item_metadata || {}
                const linkedDocs = getLinkedDoctorsForFacility(fac)
                const websiteUrl = normalizeUrl(meta.website || fac.website)

                return (
                  <div
                    key={fac.id}
                    className="rounded-2xl bg-[#1a1a1a] border border-white/10 overflow-hidden transition-all"
                  >
                    {/* Collapsed compact bar */}
                    <div
                      onClick={() =>
                        setExpandedFacilities((prev) => ({ ...prev, [fac.id]: !isExpanded }))
                      }
                      className="px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] select-none"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <Building2 className="h-4 w-4 text-teal-400 shrink-0" />
                        <span className="text-sm font-bold text-white truncate">{fac.title}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-teal-500/15 text-teal-300 border border-teal-500/25 shrink-0">
                          {meta.facilityType || "Clinic"}
                        </span>
                        {linkedDocs.length > 0 && (
                          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 text-gray-300 shrink-0">
                            {linkedDocs.length} {linkedDocs.length === 1 ? "doctor" : "doctors"}
                          </span>
                        )}
                        {meta.phone && (
                          <span className="hidden md:inline text-xs text-gray-400 truncate">
                            &bull; {meta.phone}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <HealthTooltip content="Edit facility">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditFacility(fac)
                            }}
                            aria-label={`Edit ${fac.title}`}
                            className="p-1.5 rounded-lg hover:bg-teal-500/20 text-gray-400 hover:text-teal-300 cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </HealthTooltip>
                        <HealthTooltip content="Delete facility">
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation()
                              if (confirm(`Delete ${fac.title}?`)) {
                                await deleteItem(fac.id)
                                removeSharedHealthRecord(fac.id)
                                toast.success("Facility deleted")
                              }
                            }}
                            aria-label={`Delete ${fac.title}`}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </HealthTooltip>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-3 border-t border-white/10 space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {meta.address && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meta.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-300 hover:text-teal-300"
                            >
                              <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                              <span>{meta.address}</span>
                            </a>
                          )}
                          {meta.phone && (
                            <a
                              href={`tel:${meta.phone.replace(/[^0-9+]/g, "")}`}
                              className="flex items-center gap-2 text-gray-300 hover:text-teal-300"
                            >
                              <Phone className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                              <span>{meta.phone}</span>
                            </a>
                          )}
                          {meta.fax && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <Printer className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                              <span>Fax: {meta.fax}</span>
                            </div>
                          )}
                          {meta.hours && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <Clock className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                              <span>{meta.hours}</span>
                            </div>
                          )}
                          {websiteUrl && (
                            <a
                              href={websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                            >
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{meta.website || fac.website}</span>
                            </a>
                          )}
                        </div>

                        {meta.notes && (
                          <p className="text-gray-400 italic leading-relaxed">{meta.notes}</p>
                        )}

                        {linkedDocs.length > 0 && (
                          <div className="pt-2 border-t border-white/5 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                              Linked Doctors
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {linkedDocs.map((doc) => (
                                <button
                                  key={doc.id}
                                  type="button"
                                  onClick={() => {
                                    setSubTab("doctors")
                                    setSearchQuery(doc.title || "")
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-[11px] font-semibold cursor-pointer"
                                >
                                  <Stethoscope className="h-3 w-3" />
                                  <span>{doc.title}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ==================== ADD / EDIT DOCTOR MODAL ==================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div
            className={`relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 ${
              theme === "light" ? "bg-white" : "bg-[#1a1a1a] border border-white/10"
            }`}
          >
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                <Users className="h-6 w-6" />
              </div>
              {editingDoctor ? "Update Provider" : "Add New Provider"}
            </h2>

            <form onSubmit={handleSaveDoctor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Full Name</label>
                  <input
                    autoFocus
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. John Smith"
                    className={`w-full p-4 rounded-2xl border ${theme === "light" ? "bg-gray-100" : "bg-white/5 border-white/10"} focus:ring-2 focus:ring-rose-500 outline-none`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Specialty</label>
                  <FieldSuggestionInput
                    name="doctor-specialty"
                    required
                    value={formData.specialty}
                    onChange={(val) => setFormData({ ...formData, specialty: val })}
                    suggestions={healthSuggestions.specialties}
                    placeholder="e.g. Cardiologist"
                    inputClassName={`w-full p-4 pr-10 rounded-2xl border ${theme === "light" ? "bg-gray-100 text-gray-900" : "bg-white/5 border-white/10 text-white"} focus:ring-2 focus:ring-rose-500 outline-none`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Primary Facility / Hospital</label>
                <FieldSuggestionInput
                  name="doctor-facility"
                  value={formData.facility}
                  onChange={(val) => setFormData({ ...formData, facility: val })}
                  suggestions={healthSuggestions.locations}
                  placeholder="e.g. City General Hospital"
                  icon={<Building2 className="h-5 w-5 opacity-50" />}
                  inputClassName={`w-full p-4 pr-10 rounded-2xl border ${theme === "light" ? "bg-gray-100 text-gray-900" : "bg-white/5 border-white/10 text-white"} focus:ring-2 focus:ring-rose-500 outline-none`}
                />
              </div>

              {/* Multi-select Linked Facilities */}
              {facilities.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                    Linked Facilities (Select 0, 1 or many)
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/10 max-h-32 overflow-y-auto">
                    {facilities.map((fac) => {
                      const selected = formData.facility_ids.includes(fac.id)
                      return (
                        <button
                          key={fac.id}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              facility_ids: selected
                                ? prev.facility_ids.filter((id) => id !== fac.id)
                                : [...prev.facility_ids, fac.id],
                            }))
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            selected
                              ? "bg-teal-600 text-white"
                              : "bg-white/5 text-gray-300 hover:bg-white/10"
                          }`}
                        >
                          {selected && <Check className="h-3 w-3" />}
                          <span>{fac.title}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Phone Number</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full p-4 rounded-2xl border ${theme === "light" ? "bg-gray-100" : "bg-white/5 border-white/10"} focus:ring-2 focus:ring-rose-500 outline-none`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="dr@example.com"
                    className={`w-full p-4 rounded-2xl border ${theme === "light" ? "bg-gray-100" : "bg-white/5 border-white/10"} focus:ring-2 focus:ring-rose-500 outline-none`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Practice Location</label>
                <input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Hospital Way, Suite 400"
                  className={`w-full p-4 rounded-2xl border ${theme === "light" ? "bg-gray-100" : "bg-white/5 border-white/10"} focus:ring-2 focus:ring-rose-500 outline-none`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Portal URL</label>
                <input
                  type="url"
                  value={formData.portalUrl}
                  onChange={(e) => setFormData({ ...formData, portalUrl: e.target.value })}
                  placeholder="https://..."
                  className={`w-full p-4 rounded-2xl border ${theme === "light" ? "bg-gray-100" : "bg-white/5 border-white/10"} focus:ring-2 focus:ring-rose-500 outline-none`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Notes / Instructions</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Office hours, preferred contact method, etc."
                  className={`w-full p-4 rounded-2xl border ${theme === "light" ? "bg-gray-100" : "bg-white/5 border-white/10"} focus:ring-2 focus:ring-rose-500 outline-none min-h-[100px]`}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 py-4 rounded-[2rem] bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest shadow-xl shadow-rose-500/30 transition-all active:scale-95"
                >
                  {editingDoctor ? "Update Provider" : "Confirm Provider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== ADD / EDIT FACILITY MODAL ==================== */}
      {showFacilityModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowFacilityModal(false)} />
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 bg-[#1a1a1a] border border-white/10 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400">
                  <Building2 className="h-5 w-5" />
                </div>
                {editingFacility ? "Edit Medical Facility" : "Add Medical Facility"}
              </h2>
              <button
                type="button"
                onClick={() => setShowFacilityModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFacility} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Facility Name *</label>
                  <input
                    autoFocus
                    required
                    value={facilityForm.name}
                    onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })}
                    placeholder="e.g. Mass General Hospital"
                    className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-teal-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Type</label>
                  <select
                    value={facilityForm.facilityType}
                    onChange={(e) => setFacilityForm({ ...facilityForm, facilityType: e.target.value as FacilityType })}
                    className="w-full p-3.5 rounded-xl bg-[#242424] border border-white/10 text-sm text-white focus:border-teal-500 outline-none"
                  >
                    {FACILITY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Address</label>
                <input
                  value={facilityForm.address}
                  onChange={(e) => setFacilityForm({ ...facilityForm, address: e.target.value })}
                  placeholder="123 Medical Center Blvd, Suite 200"
                  className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone</label>
                  <input
                    value={facilityForm.phone}
                    onChange={(e) => setFacilityForm({ ...facilityForm, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-teal-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Fax</label>
                  <input
                    value={facilityForm.fax}
                    onChange={(e) => setFacilityForm({ ...facilityForm, fax: e.target.value })}
                    placeholder="(555) 123-4568"
                    className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Website / Portal URL</label>
                  <input
                    value={facilityForm.website}
                    onChange={(e) => setFacilityForm({ ...facilityForm, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-teal-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Hours</label>
                  <input
                    value={facilityForm.hours}
                    onChange={(e) => setFacilityForm({ ...facilityForm, hours: e.target.value })}
                    placeholder="Mon–Fri 8am–5pm"
                    className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              {/* Multi-select Linked Doctors (0, 1 or many) */}
              {doctors.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Linked Doctors (Optional — 0, 1 or many)
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 max-h-32 overflow-y-auto">
                    {doctors.map((doc) => {
                      const selected = facilityForm.doctor_ids.includes(doc.id)
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() =>
                            setFacilityForm((prev) => ({
                              ...prev,
                              doctor_ids: selected
                                ? prev.doctor_ids.filter((id) => id !== doc.id)
                                : [...prev.doctor_ids, doc.id],
                            }))
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            selected
                              ? "bg-rose-600 text-white"
                              : "bg-white/5 text-gray-300 hover:bg-white/10"
                          }`}
                        >
                          {selected && <Check className="h-3 w-3" />}
                          <span>{doc.title}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Notes</label>
                <textarea
                  rows={3}
                  value={facilityForm.notes}
                  onChange={(e) => setFacilityForm({ ...facilityForm, notes: e.target.value })}
                  placeholder="Parking, check-in desk, lab floor..."
                  className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-teal-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowFacilityModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase shadow-lg shadow-teal-600/25"
                >
                  {editingFacility ? "Update Facility" : "Save Facility"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
