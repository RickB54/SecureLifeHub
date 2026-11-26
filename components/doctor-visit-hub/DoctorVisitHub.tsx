"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Pill,
  User,
  HelpCircle,
  FileText,
  Mail,
  Share2,
  Stethoscope,
  Eye,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  ChevronsDownUp,
  ChevronsUpDown,
  Search,
  Filter,
  Paperclip,
  Upload,
  AlertTriangle,
  WifiOff,
  Check,
  X,
  MapPin,
  ShieldCheck,
  Phone,
  FileCheck2,
  Copy,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"
import { HealthTooltip, FieldHelpPopover } from "@/components/health-ui/health-tooltip"
import { SmartSelect } from "@/components/health-ui/smart-select"
import {
  DoctorCombobox,
  FacilityCombobox,
  FieldSuggestionInput,
  extractDoctorsFromRecords,
  extractFacilitiesFromRecords,
  extractHealthSuggestions,
  findSingleLinkedFacility,
  type FacilityOption,
} from "@/components/health-ui/health-field-helpers"
import { resolveDoctorInfo, resolveFacilityInfo, subscribeHealthStore } from "@/lib/health-store"
import {
  VisitHubSectionId,
  VISIT_HUB_SECTIONS,
  HealthProfile,
  HealthPrepItem,
  HealthQuestion,
  HealthNote,
  HealthLetter,
  HealthReferral,
  HealthVisitSummary,
  DoctorOption,
  VisitOption,
  MedicationSummary,
  DATE_TYPE_OPTIONS,
  GivenMethod,
  parseGivenMethod,
  formatDateOnly,
  compareOptionalDates,
  getTodayDateString,
} from "./doctor-visit-types"
import {
  fetchHealthProfile,
  saveHealthProfile,
  fetchPrepItems,
  savePrepItem,
  deletePrepItem,
  fetchQuestions,
  saveQuestion,
  deleteQuestion,
  fetchHealthNotes,
  saveHealthNote,
  deleteHealthNote,
  fetchHealthLetters,
  saveHealthLetter,
  deleteHealthLetter,
  fetchHealthReferrals,
  saveHealthReferral,
  deleteHealthReferral,
  fetchVisitSummaries,
  saveVisitSummary,
  deleteVisitSummary,
  updateItemGivenStatus,
  fetchExistingDoctors,
  fetchExistingFacilities,
  fetchExistingVisits,
  fetchExistingMedications,
  saveSelectedSectionsToStorage,
  getSelectedSectionsFromStorage,
  getLastCacheUpdated,
  compressAndUploadAttachment,
  getAttachmentSignedUrl,
  deleteHealthAttachment,
} from "./doctor-visit-api"
import DoctorVisitMode from "./DoctorVisitMode"

interface SectionToolbarProps {
  search: string
  onSearchChange: (val: string) => void
  doctorFilter: string
  onDoctorFilterChange: (val: string) => void
  sort: string
  onSortChange: (val: string) => void
  existingDoctors: DoctorOption[]
  includeStatus?: boolean
  searchPlaceholder?: string
  givenFilter?: string
  onGivenFilterChange?: (val: string) => void
}

function SectionToolbar({
  search,
  onSearchChange,
  doctorFilter,
  onDoctorFilterChange,
  sort,
  onSortChange,
  existingDoctors,
  includeStatus = false,
  searchPlaceholder = "Search...",
  givenFilter,
  onGivenFilterChange,
}: SectionToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center text-xs">
      <div className="relative flex-1">
        <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <select
          value={doctorFilter}
          onChange={(e) => onDoctorFilterChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none flex-1 sm:flex-initial"
        >
          <option value="all">All Doctors</option>
          {existingDoctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        {onGivenFilterChange && (
          <select
            value={givenFilter || "all"}
            onChange={(e) => onGivenFilterChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none flex-1 sm:flex-initial"
          >
            <option value="all">All Given Status</option>
            <option value="not_given">Not given</option>
            <option value="given">Given</option>
          </select>
        )}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none flex-1 sm:flex-initial"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="doctor_asc">Doctor A-Z</option>
          <option value="title_asc">Title A-Z</option>
          {includeStatus && <option value="status_asc">Status</option>}
        </select>
      </div>
    </div>
  )
}

interface AttachmentThumbnailProps {
  pathOrUrl: string
  name?: string | null
  onOpenFull?: (signedUrl: string, name: string) => void
}

function AttachmentThumbnail({ pathOrUrl, name, onOpenFull }: AttachmentThumbnailProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  const displayName = name || "Attachment"
  const isPdf =
    displayName.toLowerCase().endsWith(".pdf") ||
    pathOrUrl.toLowerCase().includes(".pdf")

  useEffect(() => {
    let active = true
    setLoading(true)
    setFailed(false)
    getAttachmentSignedUrl(pathOrUrl)
      .then((url) => {
        if (!active) return
        if (url) {
          setSignedUrl(url)
        } else {
          setFailed(true)
        }
      })
      .catch(() => {
        if (active) setFailed(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [pathOrUrl])

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
        <Paperclip className="h-3.5 w-3.5 animate-pulse" />
        <span>Loading attachment...</span>
      </div>
    )
  }

  if (failed || !signedUrl) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300">
        <AlertTriangle className="h-3.5 w-3.5" />
        <span>Attachment unavailable ({displayName})</span>
      </div>
    )
  }

  if (isPdf) {
    return (
      <a
        href={signedUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-blue-300 text-xs font-medium border border-slate-800"
      >
        <Paperclip className="h-3.5 w-3.5" />
        <span>{displayName}</span>
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        if (onOpenFull) {
          onOpenFull(signedUrl, displayName)
        } else {
          window.open(signedUrl, "_blank", "noopener,noreferrer")
        }
      }}
      className="group/thumb flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all text-left cursor-pointer"
      title="Tap to view full size"
    >
      <img
        src={signedUrl}
        alt={displayName}
        loading="lazy"
        className="h-14 w-14 rounded-lg object-cover bg-black border border-slate-700 shrink-0"
      />
      <div className="min-w-0">
        <div className="text-xs font-semibold text-blue-400 group-hover/thumb:text-blue-300 truncate max-w-[200px]">
          {displayName}
        </div>
        <div className="text-[10px] text-slate-400">Tap to view full size</div>
      </div>
    </button>
  )
}

interface DoctorVisitHubProps {
  onClose: () => void
  onNavigateTab?: (tab: string) => void
  theme?: string
  initialSection?: VisitHubSectionId
}

export default function DoctorVisitHub({
  onClose,
  onNavigateTab,
  theme = "dark",
  initialSection,
}: DoctorVisitHubProps) {
  const { user } = useAuth()
  const userId = user?.id

  // 1. Expand/Collapse State (allExpanded controls all sections & items, default true)
  const [allExpanded, setAllExpanded] = useState<boolean>(true)
  const [sectionExpanded, setSectionExpanded] = useState<Record<string, boolean>>({})

  const isSectionOpen = (secId: string) => {
    if (sectionExpanded[secId] !== undefined) {
      return sectionExpanded[secId]
    }
    return allExpanded
  }

  const toggleSection = (secId: string) => {
    setSectionExpanded((prev) => ({
      ...prev,
      [secId]: !isSectionOpen(secId),
    }))
  }

  // 2. Visit Mode State
  const [visitModeActive, setVisitModeActive] = useState(false)

  // 3. Online/Offline State (fixed SSR default; hydrate in useEffect)
  const [isOnline, setIsOnline] = useState(true)
  const [lastCacheDate, setLastCacheDate] = useState<string | null>(null)
  const [attachmentPreview, setAttachmentPreview] = useState<{ url: string; name: string } | null>(null)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => {
      setIsOnline(false)
      setLastCacheDate(getLastCacheUpdated())
    }
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    setLastCacheDate(getLastCacheUpdated())
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // 4. Section Chips Multi-Select State (fixed SSR default; hydrate from URL/localStorage after mount)
  const [selectedSections, setSelectedSections] = useState<VisitHubSectionId[]>(() => {
    if (initialSection && VISIT_HUB_SECTIONS.some((s) => s.id === initialSection)) {
      return [initialSection]
    }
    return VISIT_HUB_SECTIONS.map((s) => s.id)
  })

  useEffect(() => {
    if (initialSection && VISIT_HUB_SECTIONS.some((s) => s.id === initialSection)) {
      setSelectedSections([initialSection])
      return
    }
    const urlParams = new URLSearchParams(window.location.search)
    const secParam = urlParams.get("section") as VisitHubSectionId
    if (secParam && VISIT_HUB_SECTIONS.some((s) => s.id === secParam)) {
      setSelectedSections([secParam])
      return
    }
    const pendingSection = localStorage.getItem("slh-pending-visit-hub-section") as VisitHubSectionId
    if (pendingSection && VISIT_HUB_SECTIONS.some((s) => s.id === pendingSection)) {
      localStorage.removeItem("slh-pending-visit-hub-section")
      setSelectedSections([pendingSection])
      return
    }
    const saved = getSelectedSectionsFromStorage()
    if (saved.length > 0) {
      setSelectedSections(saved as VisitHubSectionId[])
    }
  }, [initialSection])

  const handleToggleChip = (sectionId: VisitHubSectionId) => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      if (url.searchParams.has("section")) {
        url.searchParams.delete("section")
        window.history.replaceState({}, "", url.toString())
      }
    }
    setSelectedSections((prev) => {
      let next: VisitHubSectionId[]
      if (prev.length === 1 && prev[0] === sectionId) {
        // Already only this section selected, keep it
        next = prev
      } else if (prev.includes(sectionId)) {
        // Remove this section if multiple selected
        next = prev.filter((id) => id !== sectionId)
      } else {
        // Add section and keep fixed order
        const allIds = VISIT_HUB_SECTIONS.map((s) => s.id)
        next = allIds.filter((id) => prev.includes(id) || id === sectionId)
      }
      saveSelectedSectionsToStorage(next)
      return next
    })
  }

  const handleToggleAll = () => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      if (url.searchParams.has("section")) {
        url.searchParams.delete("section")
        window.history.replaceState({}, "", url.toString())
      }
    }
    const allIds = VISIT_HUB_SECTIONS.map((s) => s.id)
    if (selectedSections.length === allIds.length) {
      // Collapse back to first
      const collapsed: VisitHubSectionId[] = ["nextAppt"]
      setSelectedSections(collapsed)
      saveSelectedSectionsToStorage(collapsed)
    } else {
      setSelectedSections(allIds)
      saveSelectedSectionsToStorage(allIds)
    }
  }

  const handleGoToNextSection = (currentId: VisitHubSectionId) => {
    const currentIndex = VISIT_HUB_SECTIONS.findIndex((s) => s.id === currentId)
    const nextSec = VISIT_HUB_SECTIONS[(currentIndex + 1) % VISIT_HUB_SECTIONS.length]
    setSelectedSections((prev) => {
      const allIds = VISIT_HUB_SECTIONS.map((s) => s.id)
      const next = allIds.filter((id) => prev.includes(id) || id === nextSec.id)
      saveSelectedSectionsToStorage(next)
      return next
    })
    setTimeout(() => {
      const el = document.getElementById(`section-${nextSec.id}`)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  // 5. Data States
  const [profile, setProfile] = useState<HealthProfile>({
    allergies: "",
    conditions: "",
    insurance_provider: "",
    insurance_id: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
  })
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState<HealthProfile>(profile)

  const [existingDoctors, setExistingDoctors] = useState<DoctorOption[]>([])
  const [existingFacilities, setExistingFacilities] = useState<FacilityOption[]>([])
  const [existingVisits, setExistingVisits] = useState<VisitOption[]>([])
  const [medications, setMedications] = useState<MedicationSummary[]>([])

  const [prepItems, setPrepItems] = useState<HealthPrepItem[]>([])
  const [newPrepText, setNewPrepText] = useState("")

  const [questions, setQuestions] = useState<HealthQuestion[]>([])
  const [questionInput, setQuestionInput] = useState("")
  const [questionDoctorId, setQuestionDoctorId] = useState("")
  const [questionDoctorName, setQuestionDoctorName] = useState("")
  const [questionFacilityId, setQuestionFacilityId] = useState("")
  const [questionFacilityName, setQuestionFacilityName] = useState("")
  const [editingQuestion, setEditingQuestion] = useState<HealthQuestion | null>(null)
  const [questionEditForm, setQuestionEditForm] = useState({
    question: "",
    doctor_id: "",
    doctor_name: "",
    facility_id: "",
    facility_name: "",
    answer_notes: "",
  })

  const [notes, setNotes] = useState<HealthNote[]>([])
  const [noteDoctorFilter, setNoteDoctorFilter] = useState("all")
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<HealthNote | null>(null)
  const [noteForm, setNoteForm] = useState({
    title: "",
    text: "",
    date: getTodayDateString(),
    date_type: "Date written",
    doctor_id: "",
    doctor_name: "",
    facility_id: "",
    facility_name: "",
    visit_id: "",
  })

  const [letters, setLetters] = useState<HealthLetter[]>([])
  const [letterModalOpen, setLetterModalOpen] = useState(false)
  const [editingLetter, setEditingLetter] = useState<HealthLetter | null>(null)
  const [letterForm, setLetterForm] = useState({
    doctor_name: "",
    doctor_id: "",
    facility_id: "",
    facility_name: "",
    visit_id: "",
    date: getTodayDateString(),
    date_type: "Date written",
    direction: "received" as string,
    status: "needed" as string,
    notes: "",
    attachment_url: "",
    attachment_name: "",
  })
  const [uploadingFile, setUploadingFile] = useState(false)

  const [referrals, setReferrals] = useState<HealthReferral[]>([])
  const [referralModalOpen, setReferralModalOpen] = useState(false)
  const [editingReferral, setEditingReferral] = useState<HealthReferral | null>(null)
  const [referralForm, setReferralForm] = useState({
    specialist_name: "",
    specialty: "",
    doctor_id: "",
    referred_by_name: "",
    referred_by_doctor_id: "",
    facility_id: "",
    facility_name: "",
    visit_id: "",
    reason: "",
    date: getTodayDateString(),
    date_type: "Date written",
    status: "needed" as string,
    phone: "",
    notes: "",
  })

  // Visit Summaries State
  const [visitSummaries, setVisitSummaries] = useState<HealthVisitSummary[]>([])
  const [summaryModalOpen, setSummaryModalOpen] = useState(false)
  const [editingSummary, setEditingSummary] = useState<HealthVisitSummary | null>(null)
  const [summaryForm, setSummaryForm] = useState({
    title: "",
    summary_text: "",
    date: getTodayDateString(),
    date_type: "Date written",
    doctor_id: "",
    doctor_name: "",
    facility_id: "",
    facility_name: "",
    visit_id: "",
  })

  // List Sections: Toolbar, Filters, Sorts, and Expanded States (fixed SSR defaults; hydrate after mount)
  const [questionsSort, setQuestionsSort] = useState<string>("newest")
  const [questionsSearch, setQuestionsSearch] = useState("")
  const [questionsDoctorFilter, setQuestionsDoctorFilter] = useState("all")
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({})

  const [notesSort, setNotesSort] = useState<string>("newest")
  const [notesSearch, setNotesSearch] = useState("")
  const [notesGivenFilter, setNotesGivenFilter] = useState<string>("all")
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({})

  const [lettersSort, setLettersSort] = useState<string>("newest")
  const [lettersSearch, setLettersSearch] = useState("")
  const [lettersDoctorFilter, setLettersDoctorFilter] = useState("all")
  const [lettersGivenFilter, setLettersGivenFilter] = useState<string>("all")
  const [expandedLetters, setExpandedLetters] = useState<Record<string, boolean>>({})

  const [referralsSort, setReferralsSort] = useState<string>("newest")
  const [referralsSearch, setReferralsSearch] = useState("")
  const [referralsDoctorFilter, setReferralsDoctorFilter] = useState("all")
  const [referralsGivenFilter, setReferralsGivenFilter] = useState<string>("all")
  const [expandedReferrals, setExpandedReferrals] = useState<Record<string, boolean>>({})

  const [visitsSort, setVisitsSort] = useState<string>("newest")
  const [visitsSearch, setVisitsSearch] = useState("")
  const [visitsDoctorFilter, setVisitsDoctorFilter] = useState("all")
  const [expandedVisits, setExpandedVisits] = useState<Record<string, boolean>>({})

  const [summariesSort, setSummariesSort] = useState<string>("newest")
  const [summariesSearch, setSummariesSearch] = useState("")
  const [summariesDoctorFilter, setSummariesDoctorFilter] = useState("all")
  const [summariesGivenFilter, setSummariesGivenFilter] = useState<string>("all")
  const [expandedSummaries, setExpandedSummaries] = useState<Record<string, boolean>>({})

  // Hydrate saved sort/filter preferences after mount to prevent hydration mismatch
  useEffect(() => {
    const qs = localStorage.getItem("slh_vh_sort_questions")
    if (qs) setQuestionsSort(qs)
    const ns = localStorage.getItem("slh_vh_sort_notes")
    if (ns) setNotesSort(ns)
    const ng = localStorage.getItem("slh_vh_given_notes")
    if (ng) setNotesGivenFilter(ng)
    const ls = localStorage.getItem("slh_vh_sort_letters")
    if (ls) setLettersSort(ls)
    const lg = localStorage.getItem("slh_vh_given_letters")
    if (lg) setLettersGivenFilter(lg)
    const rs = localStorage.getItem("slh_vh_sort_referrals")
    if (rs) setReferralsSort(rs)
    const rg = localStorage.getItem("slh_vh_given_referrals")
    if (rg) setReferralsGivenFilter(rg)
    const vs = localStorage.getItem("slh_vh_sort_visits")
    if (vs) setVisitsSort(vs)
    const ss = localStorage.getItem("slh_vh_sort_summaries")
    if (ss) setSummariesSort(ss)
    const sg = localStorage.getItem("slh_vh_given_summaries")
    if (sg) setSummariesGivenFilter(sg)
  }, [])

  const handleSortChange = (
    section: "questions" | "notes" | "letters" | "referrals" | "visits" | "summaries",
    val: string
  ) => {
    if (section === "questions") {
      setQuestionsSort(val)
      if (typeof window !== "undefined") localStorage.setItem("slh_vh_sort_questions", val)
    } else if (section === "notes") {
      setNotesSort(val)
      if (typeof window !== "undefined") localStorage.setItem("slh_vh_sort_notes", val)
    } else if (section === "letters") {
      setLettersSort(val)
      if (typeof window !== "undefined") localStorage.setItem("slh_vh_sort_letters", val)
    } else if (section === "referrals") {
      setReferralsSort(val)
      if (typeof window !== "undefined") localStorage.setItem("slh_vh_sort_referrals", val)
    } else if (section === "visits") {
      setVisitsSort(val)
      if (typeof window !== "undefined") localStorage.setItem("slh_vh_sort_visits", val)
    } else if (section === "summaries") {
      setSummariesSort(val)
      if (typeof window !== "undefined") localStorage.setItem("slh_vh_sort_summaries", val)
    }
  }

  const handleGivenFilterChange = (
    section: "notes" | "letters" | "referrals" | "summaries",
    val: string
  ) => {
    if (section === "notes") {
      setNotesGivenFilter(val)
      if (typeof window !== "undefined") localStorage.setItem("slh_vh_given_notes", val)
    } else if (section === "letters") {
      setLettersGivenFilter(val)
      if (typeof window !== "undefined") localStorage.setItem("slh_vh_given_letters", val)
    } else if (section === "referrals") {
      setReferralsGivenFilter(val)
      if (typeof window !== "undefined") localStorage.setItem("slh_vh_given_referrals", val)
    } else if (section === "summaries") {
      setSummariesGivenFilter(val)
      if (typeof window !== "undefined") localStorage.setItem("slh_vh_given_summaries", val)
    }
  }

  const handleUpdateGivenStatus = async (
    table: "health_notes" | "health_letters" | "health_referrals" | "health_visit_summaries",
    id: string,
    given_to_doctor: boolean,
    given_method?: GivenMethod | null,
    given_date?: string | null
  ) => {
    const method: GivenMethod | null = given_to_doctor ? parseGivenMethod(given_method) || "visit" : null
    const gDate = given_to_doctor ? given_date || getTodayDateString() : null

    if (table === "health_notes") {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, given_to_doctor, given_method: method, given_date: gDate } : n
        )
      )
    } else if (table === "health_letters") {
      setLetters((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, given_to_doctor, given_method: method, given_date: gDate } : l
        )
      )
    } else if (table === "health_referrals") {
      setReferrals((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, given_to_doctor, given_method: method, given_date: gDate } : r
        )
      )
    } else if (table === "health_visit_summaries") {
      setVisitSummaries((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, given_to_doctor, given_method: method, given_date: gDate } : s
        )
      )
    }

    const cacheKey =
      table === "health_notes"
        ? "notes"
        : table === "health_letters"
        ? "letters"
        : table === "health_referrals"
        ? "referrals"
        : "visit_summaries"

    try {
      await updateItemGivenStatus(table, cacheKey, id, given_to_doctor, method, gDate, userId)
    } catch (err) {
      console.error("Failed to update given status:", err)
    }
  }

  const toggleExpand = (
    section: "questions" | "notes" | "letters" | "referrals" | "visits" | "summaries",
    id: string
  ) => {
    if (section === "questions") {
      setExpandedQuestions((prev) => ({ ...prev, [id]: !(prev[id] === true) }))
    } else if (section === "notes") {
      setExpandedNotes((prev) => ({ ...prev, [id]: !(prev[id] === true) }))
    } else if (section === "letters") {
      setExpandedLetters((prev) => ({ ...prev, [id]: !(prev[id] === true) }))
    } else if (section === "referrals") {
      setExpandedReferrals((prev) => ({ ...prev, [id]: !(prev[id] === true) }))
    } else if (section === "visits") {
      setExpandedVisits((prev) => ({ ...prev, [id]: !(prev[id] === true) }))
    } else if (section === "summaries") {
      setExpandedSummaries((prev) => ({ ...prev, [id]: !(prev[id] === true) }))
    }
  }

  const toggleExpandAll = (
    section: "questions" | "notes" | "letters" | "referrals" | "visits" | "summaries",
    ids: string[]
  ) => {
    if (ids.length === 0) return
    const getTargetState = (currentMap: Record<string, boolean>) => {
      const allItemsExpanded = ids.every((id) => currentMap[id] === true)
      const next: Record<string, boolean> = {}
      ids.forEach((id) => { next[id] = !allItemsExpanded })
      return next
    }

    if (section === "questions") {
      setExpandedQuestions((prev) => getTargetState(prev))
    } else if (section === "notes") {
      setExpandedNotes((prev) => getTargetState(prev))
    } else if (section === "letters") {
      setExpandedLetters((prev) => getTargetState(prev))
    } else if (section === "referrals") {
      setExpandedReferrals((prev) => getTargetState(prev))
    } else if (section === "visits") {
      setExpandedVisits((prev) => getTargetState(prev))
    } else if (section === "summaries") {
      setExpandedSummaries((prev) => getTargetState(prev))
    }
  }

  // Global Expand / Collapse All across all active sections & items
  const handleToggleGlobalExpandAll = () => {
    const nextVal = !allExpanded
    setAllExpanded(nextVal)
    setSectionExpanded({}) // reset per-section manual overrides

    // Also toggle all item cards inside sections
    const qIds = filteredQuestions.map((q) => q.id)
    const nIds = filteredNotes.map((n) => n.id)
    const lIds = filteredLetters.map((l) => l.id)
    const rIds = filteredReferrals.map((r) => r.id)
    const sIds = filteredVisitSummaries.map((s) => s.id)
    const vIds = filteredVisits.map((v) => v.id)

    const setAll = (ids: string[]) => {
      const map: Record<string, boolean> = {}
      ids.forEach((id) => { map[id] = nextVal })
      return map
    }

    setExpandedQuestions(setAll(qIds))
    setExpandedNotes(setAll(nIds))
    setExpandedLetters(setAll(lIds))
    setExpandedReferrals(setAll(rIds))
    setExpandedSummaries(setAll(sIds))
    setExpandedVisits(setAll(vIds))
  }

  // Filtered & Sorted Questions
  const filteredQuestions = useMemo(() => {
    let list = [...questions]
    if (questionsDoctorFilter !== "all") {
      const selectedDoc = existingDoctors.find((d) => d.id === questionsDoctorFilter)
      const docName = selectedDoc ? selectedDoc.name.toLowerCase() : ""
      list = list.filter(
        (q) =>
          q.doctor_id === questionsDoctorFilter ||
          (q.doctor_name && q.doctor_name.toLowerCase() === docName)
      )
    }
    if (questionsSearch.trim()) {
      const qLower = questionsSearch.toLowerCase()
      list = list.filter(
        (q) =>
          q.question.toLowerCase().includes(qLower) ||
          (q.doctor_name && q.doctor_name.toLowerCase().includes(qLower))
      )
    }
    list.sort((a, b) => {
      if (questionsSort === "oldest") {
        return (a.created_at || "").localeCompare(b.created_at || "")
      } else if (questionsSort === "doctor_asc") {
        return (a.doctor_name || "").localeCompare(b.doctor_name || "")
      } else if (questionsSort === "title_asc") {
        return a.question.localeCompare(b.question)
      } else {
        return (b.created_at || "").localeCompare(a.created_at || "")
      }
    })
    return list
  }, [questions, questionsDoctorFilter, questionsSearch, questionsSort, existingDoctors])

  // Filtered & Sorted Notes
  const filteredNotes = useMemo(() => {
    let list = [...notes]
    if (noteDoctorFilter !== "all") {
      const selectedDoc = existingDoctors.find((d) => d.id === noteDoctorFilter)
      const docName = selectedDoc ? selectedDoc.name.toLowerCase() : ""
      list = list.filter(
        (n) =>
          n.doctor_id === noteDoctorFilter ||
          (n.doctor_name && n.doctor_name.toLowerCase() === docName)
      )
    }
    if (notesGivenFilter === "given") {
      list = list.filter((n) => n.given_to_doctor)
    } else if (notesGivenFilter === "not_given") {
      list = list.filter((n) => !n.given_to_doctor)
    }
    if (notesSearch.trim()) {
      const qLower = notesSearch.toLowerCase()
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(qLower) ||
          n.text.toLowerCase().includes(qLower) ||
          (n.doctor_name && n.doctor_name.toLowerCase().includes(qLower)) ||
          (n.date_type && n.date_type.toLowerCase().includes(qLower)) ||
          (!n.date && "no date".includes(qLower))
      )
    }
    list.sort((a, b) => {
      if (notesSort === "oldest") {
        return compareOptionalDates(a.date, b.date, "oldest")
      } else if (notesSort === "doctor_asc") {
        return (a.doctor_name || "").localeCompare(b.doctor_name || "")
      } else if (notesSort === "title_asc") {
        return a.title.localeCompare(b.title)
      } else {
        return compareOptionalDates(a.date, b.date, "newest")
      }
    })
    return list
  }, [notes, noteDoctorFilter, notesGivenFilter, notesSearch, notesSort, existingDoctors])

  // Filtered & Sorted Letters
  const filteredLetters = useMemo(() => {
    let list = [...letters]
    if (lettersDoctorFilter !== "all") {
      const selectedDoc = existingDoctors.find((d) => d.id === lettersDoctorFilter)
      const docName = selectedDoc ? selectedDoc.name.toLowerCase() : ""
      list = list.filter(
        (l) =>
          l.doctor_id === lettersDoctorFilter ||
          (l.doctor_name && l.doctor_name.toLowerCase() === docName)
      )
    }
    if (lettersGivenFilter === "given") {
      list = list.filter((l) => l.given_to_doctor)
    } else if (lettersGivenFilter === "not_given") {
      list = list.filter((l) => !l.given_to_doctor)
    }
    if (lettersSearch.trim()) {
      const qLower = lettersSearch.toLowerCase()
      list = list.filter(
        (l) =>
          (l.doctor_name && l.doctor_name.toLowerCase().includes(qLower)) ||
          (l.notes && l.notes.toLowerCase().includes(qLower)) ||
          (l.status && l.status.toLowerCase().includes(qLower)) ||
          (l.direction && l.direction.toLowerCase().includes(qLower)) ||
          (l.date_type && l.date_type.toLowerCase().includes(qLower)) ||
          (!l.date && "no date".includes(qLower)) ||
          (l.attachment_name && l.attachment_name.toLowerCase().includes(qLower))
      )
    }
    list.sort((a, b) => {
      if (lettersSort === "oldest") {
        return compareOptionalDates(a.date, b.date, "oldest")
      } else if (lettersSort === "doctor_asc") {
        return (a.doctor_name || "").localeCompare(b.doctor_name || "")
      } else if (lettersSort === "title_asc") {
        return (a.doctor_name || "").localeCompare(b.doctor_name || "")
      } else if (lettersSort === "status_asc") {
        return (a.status || "").localeCompare(b.status || "")
      } else {
        return compareOptionalDates(a.date, b.date, "newest")
      }
    })
    return list
  }, [letters, lettersDoctorFilter, lettersGivenFilter, lettersSearch, lettersSort, existingDoctors])

  // Filtered & Sorted Referrals
  const filteredReferrals = useMemo(() => {
    let list = [...referrals]
    if (referralsDoctorFilter !== "all") {
      const selectedDoc = existingDoctors.find((d) => d.id === referralsDoctorFilter)
      const docName = selectedDoc ? selectedDoc.name.toLowerCase() : ""
      list = list.filter(
        (r) =>
          r.doctor_id === referralsDoctorFilter ||
          r.referred_by_doctor_id === referralsDoctorFilter ||
          (r.specialist_name && r.specialist_name.toLowerCase().includes(docName)) ||
          (r.referred_by_name && r.referred_by_name.toLowerCase().includes(docName))
      )
    }
    if (referralsGivenFilter === "given") {
      list = list.filter((r) => r.given_to_doctor)
    } else if (referralsGivenFilter === "not_given") {
      list = list.filter((r) => !r.given_to_doctor)
    }
    if (referralsSearch.trim()) {
      const qLower = referralsSearch.toLowerCase()
      list = list.filter(
        (r) =>
          r.specialist_name.toLowerCase().includes(qLower) ||
          r.specialty.toLowerCase().includes(qLower) ||
          (r.referred_by_name && r.referred_by_name.toLowerCase().includes(qLower)) ||
          (r.reason && r.reason.toLowerCase().includes(qLower)) ||
          (r.notes && r.notes.toLowerCase().includes(qLower)) ||
          (r.status && r.status.toLowerCase().includes(qLower)) ||
          (r.date_type && r.date_type.toLowerCase().includes(qLower)) ||
          (!r.date && "no date".includes(qLower))
      )
    }
    list.sort((a, b) => {
      if (referralsSort === "oldest") {
        return compareOptionalDates(a.date, b.date, "oldest")
      } else if (referralsSort === "doctor_asc") {
        return (a.specialist_name || a.referred_by_name || "").localeCompare(
          b.specialist_name || b.referred_by_name || ""
        )
      } else if (referralsSort === "title_asc") {
        return a.specialist_name.localeCompare(b.specialist_name)
      } else if (referralsSort === "status_asc") {
        return (a.status || "").localeCompare(b.status || "")
      } else {
        return compareOptionalDates(a.date, b.date, "newest")
      }
    })
    return list
  }, [referrals, referralsDoctorFilter, referralsGivenFilter, referralsSearch, referralsSort, existingDoctors])

  // Filtered & Sorted Visits
  const filteredVisits = useMemo(() => {
    let list = [...existingVisits]
    if (visitsDoctorFilter !== "all") {
      const selectedDoc = existingDoctors.find((d) => d.id === visitsDoctorFilter)
      const docName = selectedDoc ? selectedDoc.name.toLowerCase() : ""
      list = list.filter(
        (v) =>
          (v.doctor && v.doctor.toLowerCase().includes(docName)) ||
          (v.title && v.title.toLowerCase().includes(docName))
      )
    }
    if (visitsSearch.trim()) {
      const qLower = visitsSearch.toLowerCase()
      list = list.filter(
        (v) =>
          (v.doctor && v.doctor.toLowerCase().includes(qLower)) ||
          (v.title && v.title.toLowerCase().includes(qLower)) ||
          (v.location && v.location.toLowerCase().includes(qLower)) ||
          (v.notes && v.notes.toLowerCase().includes(qLower))
      )
    }
    list.sort((a, b) => {
      if (visitsSort === "oldest") {
        return compareOptionalDates(a.date, b.date, "oldest")
      } else if (visitsSort === "doctor_asc") {
        return (a.doctor || a.title || "").localeCompare(b.doctor || b.title || "")
      } else if (visitsSort === "title_asc") {
        return (a.title || a.doctor || "").localeCompare(b.title || b.doctor || "")
      } else {
        return compareOptionalDates(a.date, b.date, "newest")
      }
    })
    return list
  }, [existingVisits, visitsDoctorFilter, visitsSearch, visitsSort, existingDoctors])

  // Filtered & Sorted Visit Summaries
  const filteredVisitSummaries = useMemo(() => {
    let list = [...visitSummaries]
    if (summariesDoctorFilter !== "all") {
      const selectedDoc = existingDoctors.find((d) => d.id === summariesDoctorFilter)
      const docName = selectedDoc ? selectedDoc.name.toLowerCase() : ""
      list = list.filter(
        (s) =>
          s.doctor_id === summariesDoctorFilter ||
          (s.doctor_name && s.doctor_name.toLowerCase() === docName)
      )
    }
    if (summariesGivenFilter === "given") {
      list = list.filter((s) => s.given_to_doctor)
    } else if (summariesGivenFilter === "not_given") {
      list = list.filter((s) => !s.given_to_doctor)
    }
    if (summariesSearch.trim()) {
      const qLower = summariesSearch.toLowerCase()
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(qLower) ||
          s.summary_text.toLowerCase().includes(qLower) ||
          (s.doctor_name && s.doctor_name.toLowerCase().includes(qLower)) ||
          (s.date_type && s.date_type.toLowerCase().includes(qLower)) ||
          (!s.date && "no date".includes(qLower))
      )
    }
    list.sort((a, b) => {
      if (summariesSort === "oldest") {
        return compareOptionalDates(a.date, b.date, "oldest")
      } else if (summariesSort === "doctor_asc") {
        return (a.doctor_name || "").localeCompare(b.doctor_name || "")
      } else if (summariesSort === "title_asc") {
        return a.title.localeCompare(b.title)
      } else {
        return compareOptionalDates(a.date, b.date, "newest")
      }
    })
    return list
  }, [visitSummaries, summariesDoctorFilter, summariesGivenFilter, summariesSearch, summariesSort, existingDoctors])

  // 6. Summary Initial Fetch (Low Egress: only 1 consolidated initial fetch)
  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
      try {
        const [prof, docs, facs, vsts, meds] = await Promise.all([
          fetchHealthProfile(userId),
          fetchExistingDoctors(userId),
          fetchExistingFacilities(userId),
          fetchExistingVisits(userId),
          fetchExistingMedications(userId),
        ])
        if (isMounted) {
          setProfile(prof)
          setProfileForm(prof)
          setExistingDoctors(docs)
          setExistingFacilities(facs)
          setExistingVisits(vsts)
          setMedications(meds)
        }
      } catch (err) {
        console.warn("Error loading initial visit hub data:", err)
      }
    }

    loadInitialData()
    return () => {
      isMounted = false
    }
  }, [userId])

  // Nearest upcoming appointment
  const nextAppt = useMemo<VisitOption | null>(() => {
    const now = new Date()
    const upcoming = existingVisits
      .filter((v) => v.date && new Date(v.date).getTime() >= now.getTime() - 24 * 3600000)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return upcoming.length > 0 ? upcoming[0] : null
  }, [existingVisits])

  // Calculate days away
  const daysAwayText = useMemo(() => {
    if (!nextAppt?.date) return null
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(nextAppt.date)
    target.setHours(0, 0, 0, 0)
    const diffDays = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Today!"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays > 1) return `In ${diffDays} days`
    return "Recently past"
  }, [nextAppt])

  // 7. On-demand section data fetching (Low Egress: load section only when selected)
  useEffect(() => {
    if (selectedSections.includes("nextAppt") && prepItems.length === 0) {
      fetchPrepItems(nextAppt?.id, userId).then(setPrepItems)
    }
  }, [selectedSections, nextAppt?.id, userId, prepItems.length])

  useEffect(() => {
    if (selectedSections.includes("questions") && questions.length === 0) {
      fetchQuestions(userId).then(setQuestions)
    }
  }, [selectedSections, userId, questions.length])

  useEffect(() => {
    if (selectedSections.includes("notes") && notes.length === 0) {
      fetchHealthNotes(userId).then(setNotes)
    }
  }, [selectedSections, userId, notes.length])

  useEffect(() => {
    if (selectedSections.includes("letters") && letters.length === 0) {
      fetchHealthLetters(userId).then(setLetters)
    }
  }, [selectedSections, userId, letters.length])

  useEffect(() => {
    if (selectedSections.includes("referrals") && referrals.length === 0) {
      fetchHealthReferrals(userId).then(setReferrals)
    }
  }, [selectedSections, userId, referrals.length])

  useEffect(() => {
    if (selectedSections.includes("summary") && visitSummaries.length === 0) {
      fetchVisitSummaries(userId).then(setVisitSummaries)
    }
  }, [selectedSections, userId, visitSummaries.length])

  // Count linked items per visit
  const visitItemCounts = useMemo(() => {
    const map: Record<string, { notes: number; letters: number; referrals: number }> = {}
    for (const v of existingVisits) {
      map[v.id] = {
        notes: notes.filter((n) => n.visit_id === v.id).length,
        letters: letters.filter((l) => l.visit_id === v.id).length,
        referrals: referrals.filter((r) => r.visit_id === v.id).length,
      }
    }
    return map
  }, [existingVisits, notes, letters, referrals])

  // Keep Visit Hub doctors/meds/visits synced live when edited in Health Hub (zero refetch)
  useEffect(() => {
    return subscribeHealthStore((allRecords) => {
      if (!allRecords || allRecords.length === 0) return
      const liveDocs = extractDoctorsFromRecords(allRecords)
      if (liveDocs.length > 0) setExistingDoctors(liveDocs)

      const liveFacs = extractFacilitiesFromRecords(allRecords)
      if (liveFacs.length > 0) setExistingFacilities(liveFacs)

      const liveMeds: MedicationSummary[] = allRecords
        .filter((r) => (r.category || "").toLowerCase() === "medications" || (r.type || "").toLowerCase() === "medication")
        .map((d) => ({
          id: d.id,
          name: d.title || "Unnamed Medication",
          dose: d.item_metadata?.dosage || d.item_metadata?.strength || "",
          frequency: d.item_metadata?.frequency || "",
          instructions: d.item_metadata?.rxInstructions || d.item_metadata?.instructions || d.notes || "",
        }))
      if (liveMeds.length > 0) setMedications(liveMeds)

      const liveVisits: VisitOption[] = allRecords
        .filter((d) => d.item_metadata?.type === "Appointment" || d.type === "appointment" || d.category === "Appointments" || d.item_metadata?.is_appointment)
        .map((d) => ({
          id: d.id,
          title: d.title || d.item_metadata?.title || "Doctor Visit",
          date: d.item_metadata?.date || d.created_at || "",
          doctor: resolveDoctorInfo(d.item_metadata?.doctor_id, { name: d.item_metadata?.doctor }, liveDocs).name,
          facility_id: d.item_metadata?.facility_id || null,
          facility_name: resolveFacilityInfo(d.item_metadata?.facility_id, { name: d.item_metadata?.facility_name }, liveFacs).name,
          location: d.item_metadata?.location || "",
          notes: d.item_metadata?.notes || d.notes || "",
        }))
      if (liveVisits.length > 0) setExistingVisits(liveVisits)
    })
  }, [])

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const saved = await saveHealthProfile(profileForm, userId)
      setProfile(saved)
      setIsEditingProfile(false)
      toast.success("Health profile saved")
    } catch (err: any) {
      toast.error(err?.message || "Failed to save health profile")
    }
  }

  // Prep Item Handlers
  const handleAddPrepItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newPrepText.trim()) return
    const item = await savePrepItem(
      {
        visit_id: nextAppt?.id || null,
        text: newPrepText.trim(),
        completed: false,
        sort_order: prepItems.length,
      },
      userId
    )
    setPrepItems((prev) => [...prev, item])
    setNewPrepText("")
  }

  const handleTogglePrepItem = async (id: string, current: boolean) => {
    setPrepItems((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !current } : item)))
    const target = prepItems.find((i) => i.id === id)
    if (target) {
      await savePrepItem({ ...target, completed: !current }, userId)
    }
  }

  const handleDeletePrepItem = async (id: string) => {
    setPrepItems((prev) => prev.filter((item) => item.id !== id))
    await deletePrepItem(id, userId)
  }

  // Zero-egress field suggestions built from already-loaded Visit Hub data
  const hubSuggestions = useMemo(() => {
    const base = extractHealthSuggestions([], {
      notes,
      letters,
      referrals,
      visits: existingVisits,
      meds: medications,
    })
    const specSet = new Set(base.specialties)
    const locSet = new Set(base.locations)
    for (const d of existingDoctors) {
      if (d.specialty?.trim()) specSet.add(d.specialty.trim())
      if (d.facility?.trim()) locSet.add(d.facility.trim())
      if (d.address?.trim()) locSet.add(d.address.trim())
    }
    return {
      ...base,
      specialties: Array.from(specSet).sort(),
      locations: Array.from(locSet).sort(),
    }
  }, [notes, letters, referrals, existingVisits, medications, existingDoctors])

  // Questions Handlers
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionInput.trim()) return
    try {
      const doctorObj = existingDoctors.find((d) => d.id === questionDoctorId)
      const facObj = existingFacilities.find((f) => f.id === questionFacilityId)
      const newQ = await saveQuestion(
        {
          question: questionInput.trim(),
          answered: false,
          doctor_id: questionDoctorId || null,
          doctor_name: doctorObj?.name || questionDoctorName.trim() || "",
          facility_id: questionFacilityId || null,
          facility_name: facObj?.name || questionFacilityName.trim() || "",
          visit_id: nextAppt?.id || null,
        },
        userId
      )
      setQuestions((prev) => [newQ, ...prev])
      setQuestionInput("")
      toast.success("Question added")
    } catch (err: any) {
      toast.error(err?.message || "Failed to add question")
    }
  }

  const openEditQuestionModal = (q: HealthQuestion) => {
    const docInfo = resolveDoctorInfo(q.doctor_id, { name: q.doctor_name }, existingDoctors)
    const facInfo = resolveFacilityInfo(q.facility_id, { name: q.facility_name }, existingFacilities)
    setEditingQuestion(q)
    setQuestionEditForm({
      question: q.question || "",
      doctor_id: q.doctor_id || "",
      doctor_name: docInfo.name,
      facility_id: q.facility_id || "",
      facility_name: facInfo.name,
      answer_notes: q.answer_notes || "",
    })
  }

  const handleSaveQuestionEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingQuestion || !questionEditForm.question.trim()) return
    try {
      const doctorObj = existingDoctors.find((d) => d.id === questionEditForm.doctor_id)
      const facObj = existingFacilities.find((f) => f.id === questionEditForm.facility_id)
      const saved = await saveQuestion(
        {
          ...editingQuestion,
          question: questionEditForm.question.trim(),
          doctor_id: questionEditForm.doctor_id || null,
          doctor_name: doctorObj?.name || questionEditForm.doctor_name.trim() || "",
          facility_id: questionEditForm.facility_id || null,
          facility_name: facObj?.name || questionEditForm.facility_name.trim() || "",
          answer_notes: questionEditForm.answer_notes.trim(),
        },
        userId
      )
      setQuestions((prev) => prev.map((item) => (item.id === saved.id ? saved : item)))
      setEditingQuestion(null)
      toast.success("Question updated")
    } catch (err: any) {
      toast.error(err?.message || "Failed to update question")
    }
  }

  const handleToggleQuestion = async (q: HealthQuestion) => {
    const updated = { ...q, answered: !q.answered }
    setQuestions((prev) => prev.map((item) => (item.id === q.id ? updated : item)))
    try {
      await saveQuestion(updated, userId)
    } catch (err: any) {
      setQuestions((prev) => prev.map((item) => (item.id === q.id ? q : item)))
      toast.error(err?.message || "Failed to update question")
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
    await deleteQuestion(id, userId)
    toast.success("Question deleted")
  }

  // Health Notes Handlers
  const handleSaveNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteForm.title.trim()) {
      toast.error("Note title is required")
      return
    }
    try {
      const doctorObj = existingDoctors.find((d) => d.id === noteForm.doctor_id)
      const facObj = existingFacilities.find((f) => f.id === noteForm.facility_id)
      const payload = {
        ...(editingNote
          ? {
              id: editingNote.id,
              created_at: editingNote.created_at,
              given_to_doctor: editingNote.given_to_doctor,
              given_method: editingNote.given_method,
              given_date: editingNote.given_date,
            }
          : {}),
        title: noteForm.title.trim(),
        text: noteForm.text.trim(),
        date: noteForm.date?.trim() || null,
        date_type: noteForm.date_type || "Date written",
        doctor_id: noteForm.doctor_id || null,
        doctor_name: doctorObj?.name || noteForm.doctor_name || "",
        facility_id: noteForm.facility_id || null,
        facility_name: facObj?.name || noteForm.facility_name.trim() || "",
        visit_id: noteForm.visit_id || null,
      }
      const saved = await saveHealthNote(payload, userId)
      if (editingNote) {
        setNotes((prev) => prev.map((n) => (n.id === saved.id ? saved : n)))
      } else {
        setNotes((prev) => [saved, ...prev])
      }
      setNoteModalOpen(false)
      setEditingNote(null)
      toast.success(editingNote ? "Health note updated" : "Health note saved")
    } catch (err: any) {
      toast.error(err?.message || "Failed to save health note")
    }
  }

  // Health Letters Handlers
  const handleSaveLetterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const doctorObj = existingDoctors.find((d) => d.id === letterForm.doctor_id)
      const facObj = existingFacilities.find((f) => f.id === letterForm.facility_id)
      const payload = {
        ...(editingLetter
          ? {
              id: editingLetter.id,
              created_at: editingLetter.created_at,
              given_to_doctor: editingLetter.given_to_doctor,
              given_method: editingLetter.given_method,
              given_date: editingLetter.given_date,
            }
          : {}),
        doctor_name: doctorObj?.name || letterForm.doctor_name || "Doctor Letter",
        doctor_id: letterForm.doctor_id || null,
        facility_id: letterForm.facility_id || null,
        facility_name: facObj?.name || letterForm.facility_name.trim() || "",
        visit_id: letterForm.visit_id || null,
        date: letterForm.date?.trim() || null,
        date_type: letterForm.date_type || "Date written",
        direction: letterForm.direction,
        status: letterForm.status,
        notes: letterForm.notes.trim(),
        attachment_url: letterForm.attachment_url || null,
        attachment_name: letterForm.attachment_name || null,
      }
      const saved = await saveHealthLetter(payload, userId)
      if (
        editingLetter?.attachment_url &&
        editingLetter.attachment_url !== saved.attachment_url
      ) {
        await deleteHealthAttachment(editingLetter.attachment_url)
      }
      if (editingLetter) {
        setLetters((prev) => prev.map((l) => (l.id === saved.id ? saved : l)))
      } else {
        setLetters((prev) => [saved, ...prev])
      }
      setLetterModalOpen(false)
      setEditingLetter(null)
      toast.success(editingLetter ? "Letter updated" : "Letter saved")
    } catch (err: any) {
      toast.error(err?.message || "Failed to save letter")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFile(true)
    try {
      const previousPath = letterForm.attachment_url
      const res = await compressAndUploadAttachment(file, userId)
      // Delete replaced file from storage if it was a different path
      if (previousPath && previousPath !== res.path && previousPath !== editingLetter?.attachment_url) {
        await deleteHealthAttachment(previousPath)
      }
      setLetterForm((prev) => ({
        ...prev,
        attachment_url: res.path,
        attachment_name: res.name,
      }))
      toast.success(res.isImage ? `Uploaded — ${res.sizeSummary}` : `Attached ${res.name}`)
    } catch (err: any) {
      console.warn("Upload failed:", err)
      toast.error(err?.message || "Attachment upload failed")
    } finally {
      setUploadingFile(false)
      if (e.target) e.target.value = ""
    }
  }

  // Health Referrals Handlers
  const handleSaveReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!referralForm.specialist_name.trim()) {
      toast.error("Specialist name is required")
      return
    }
    try {
      const refDoctorObj = existingDoctors.find((d) => d.id === referralForm.referred_by_doctor_id)
      const specDoctorObj = existingDoctors.find((d) => d.id === referralForm.doctor_id)
      const facObj = existingFacilities.find((f) => f.id === referralForm.facility_id)
      const payload = {
        ...(editingReferral
          ? {
              id: editingReferral.id,
              created_at: editingReferral.created_at,
              given_to_doctor: editingReferral.given_to_doctor,
              given_method: editingReferral.given_method,
              given_date: editingReferral.given_date,
            }
          : {}),
        specialist_name: referralForm.specialist_name.trim() || specDoctorObj?.name || "",
        specialty: referralForm.specialty.trim() || specDoctorObj?.specialty || "",
        doctor_id: referralForm.doctor_id || null,
        facility_id: referralForm.facility_id || null,
        facility_name: facObj?.name || referralForm.facility_name.trim() || "",
        referred_by_doctor_id: referralForm.referred_by_doctor_id || null,
        referred_by_name: refDoctorObj?.name || referralForm.referred_by_name.trim(),
        visit_id: referralForm.visit_id || null,
        reason: referralForm.reason.trim(),
        date: referralForm.date?.trim() || null,
        date_type: referralForm.date_type || "Date written",
        status: referralForm.status,
        phone: referralForm.phone.trim() || specDoctorObj?.phone || facObj?.phone || "",
        notes: referralForm.notes.trim(),
      }
      const saved = await saveHealthReferral(payload, userId)
      if (editingReferral) {
        setReferrals((prev) => prev.map((r) => (r.id === saved.id ? saved : r)))
      } else {
        setReferrals((prev) => [saved, ...prev])
      }
      setReferralModalOpen(false)
      setEditingReferral(null)
      toast.success(editingReferral ? "Referral updated" : "Referral saved")
    } catch (err: any) {
      toast.error(err?.message || "Failed to save referral")
    }
  }

  // Visit Summaries Handlers
  const handleSaveSummarySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!summaryForm.title.trim()) {
      toast.error("Summary title is required")
      return
    }
    try {
      const doctorObj = existingDoctors.find((d) => d.id === summaryForm.doctor_id)
      const facObj = existingFacilities.find((f) => f.id === summaryForm.facility_id)
      const payload = {
        ...(editingSummary
          ? {
              id: editingSummary.id,
              created_at: editingSummary.created_at,
              given_to_doctor: editingSummary.given_to_doctor,
              given_method: editingSummary.given_method,
              given_date: editingSummary.given_date,
            }
          : {}),
        title: summaryForm.title.trim(),
        summary_text: summaryForm.summary_text.trim(),
        date: summaryForm.date?.trim() || null,
        date_type: summaryForm.date_type || "Date written",
        doctor_id: summaryForm.doctor_id || null,
        doctor_name: doctorObj?.name || summaryForm.doctor_name || "",
        facility_id: summaryForm.facility_id || null,
        facility_name: facObj?.name || summaryForm.facility_name.trim() || "",
        visit_id: summaryForm.visit_id || null,
      }
      const saved = await saveVisitSummary(payload, userId)
      if (editingSummary) {
        setVisitSummaries((prev) => prev.map((s) => (s.id === saved.id ? saved : s)))
      } else {
        setVisitSummaries((prev) => [saved, ...prev])
      }
      setSummaryModalOpen(false)
      setEditingSummary(null)
      toast.success(editingSummary ? "Visit summary updated" : "Visit summary saved")
    } catch (err: any) {
      toast.error(err?.message || "Failed to save visit summary")
    }
  }

  const handleDeleteHealthNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return
    setNotes((prev) => prev.filter((n) => n.id !== id))
    await deleteHealthNote(id, userId)
  }

  const handleDeleteLetter = async (id: string) => {
    if (!confirm("Are you sure you want to delete this letter?")) return
    setLetters((prev) => prev.filter((l) => l.id !== id))
    await deleteHealthLetter(id, userId)
  }

  const handleDeleteReferral = async (id: string) => {
    if (!confirm("Are you sure you want to delete this referral?")) return
    setReferrals((prev) => prev.filter((r) => r.id !== id))
    await deleteHealthReferral(id, userId)
  }

  const handleDeleteSummary = async (id: string) => {
    if (!confirm("Are you sure you want to delete this visit summary?")) return
    setVisitSummaries((prev) => prev.filter((s) => s.id !== id))
    await deleteVisitSummary(id, userId)
  }

  const handleNavigateToFullTab = (targetTab: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("slh-health-target-tab", targetTab)
    }
    if (onNavigateTab) {
      onNavigateTab(targetTab)
    } else {
      onClose()
    }
  }

  // If Visit Mode active, show Visit Mode
  if (visitModeActive) {
    return (
      <DoctorVisitMode
        onClose={() => setVisitModeActive(false)}
        profile={profile}
        nextAppt={nextAppt}
        medications={medications}
        doctors={existingDoctors}
        questions={questions}
        letters={letters}
        referrals={referrals}
        visitSummaries={visitSummaries}
        theme={theme}
      />
    )
  }

  const isAllSelected = selectedSections.length === VISIT_HUB_SECTIONS.length

  return (
    <div className="fixed inset-0 z-[100020] bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* 1. TOP HEADER */}
      <header className="flex-shrink-0 bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <HealthTooltip content="Return to Health Hub Overview">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs md:text-sm font-semibold transition-all cursor-pointer border border-slate-700/60"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Health Hub</span>
              <span className="sm:hidden">Back</span>
            </button>
          </HealthTooltip>
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Stethoscope className="h-5 w-5" />
            </div>
            <h1 className="text-base md:text-lg font-black tracking-tight text-white truncate">
              Doctor Visit Hub
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Global Expand All / Collapse All Toggle Icon */}
          <HealthTooltip content={allExpanded ? "Collapse all sections and item cards" : "Expand all sections and item cards"}>
            <button
              type="button"
              onClick={handleToggleGlobalExpandAll}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer"
              aria-label={allExpanded ? "Collapse all sections and items" : "Expand all sections and items"}
            >
              {allExpanded ? (
                <ChevronsDownUp className="h-4 w-4" />
              ) : (
                <ChevronsUpDown className="h-4 w-4" />
              )}
            </button>
          </HealthTooltip>

          {/* Visit Mode Toggle Button */}
          <HealthTooltip content="Open large-text, high-contrast Visit Mode to hand to your doctor, print, or copy as text">
            <button
              type="button"
              onClick={() => setVisitModeActive(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              <span>Visit Mode</span>
            </button>
          </HealthTooltip>
        </div>
      </header>

      {/* OFFLINE BANNER */}
      {!isOnline && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>Offline Mode:</strong> Showing cached data. Changes will sync when reconnected.
            </span>
          </div>
          {lastCacheDate && (
            <span className="hidden sm:inline text-amber-400/80">
              Saved: {new Date(lastCacheDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: VISIT SUMMARY FORM                                      */}
      {/* ============================================================== */}
      {summaryModalOpen && (
        <div
          className="fixed inset-0 z-[100060] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSummaryModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingSummary ? "Edit Visit Summary" : "New Visit Summary"}
              </h3>
              <button
                type="button"
                onClick={() => setSummaryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSummarySubmit} className="space-y-3 text-xs">
              <FieldSuggestionInput
                compact
                name="summary-title"
                label="Title"
                required
                value={summaryForm.title}
                onChange={(val) => setSummaryForm({ ...summaryForm, title: val })}
                suggestions={hubSuggestions.reasons}
                placeholder="e.g. Annual physical exam summary, Consultation recap"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-semibold">Date (Optional)</label>
                    {summaryForm.date && (
                      <button
                        type="button"
                        onClick={() => setSummaryForm({ ...summaryForm, date: "" })}
                        className="text-[10px] text-slate-400 hover:text-rose-300 font-semibold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={summaryForm.date}
                    onChange={(e) => setSummaryForm({ ...summaryForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <FieldSuggestionInput
                  compact
                  fieldKey="date_type"
                  name="summary-date-type"
                  label="Date Type"
                  value={summaryForm.date_type}
                  onChange={(val) => setSummaryForm({ ...summaryForm, date_type: val })}
                  suggestions={hubSuggestions.dateTypes}
                  placeholder="Date written"
                />
                <DoctorCombobox
                  compact
                  label="Related Doctor"
                  value={summaryForm.doctor_name}
                  doctorId={summaryForm.doctor_id || null}
                  doctors={existingDoctors}
                  placeholder="Select or type doctor..."
                  onSelectDoctor={(doc) => {
                    const linked = findSingleLinkedFacility(doc, existingFacilities)
                    setSummaryForm((prev) => ({
                      ...prev,
                      doctor_id: doc.id || "",
                      doctor_name: doc.name,
                      facility_id: prev.facility_name?.trim() ? prev.facility_id : (linked?.id || prev.facility_id),
                      facility_name: prev.facility_name?.trim() ? prev.facility_name : (linked?.name || prev.facility_name),
                    }))
                  }}
                  onClear={() =>
                    setSummaryForm((prev) => ({
                      ...prev,
                      doctor_id: "",
                      doctor_name: "",
                    }))
                  }
                />
              </div>

              <FacilityCombobox
                compact
                label="Facility"
                value={summaryForm.facility_name}
                facilityId={summaryForm.facility_id || null}
                facilities={existingFacilities}
                placeholder="Select or type facility..."
                onSelectFacility={(fac) =>
                  setSummaryForm((prev) => ({
                    ...prev,
                    facility_id: fac.id || "",
                    facility_name: fac.name,
                  }))
                }
                onClear={() =>
                  setSummaryForm((prev) => ({
                    ...prev,
                    facility_id: "",
                    facility_name: "",
                  }))
                }
              />

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Linked Visit (Optional)</label>
                <select
                  value={summaryForm.visit_id}
                  onChange={(e) => setSummaryForm({ ...summaryForm, visit_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">None</option>
                  {existingVisits.map((v) => (
                    <option key={v.id} value={v.id}>
                      {formatDateOnly(v.date)} - {v.doctor || v.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  What happened at the visit? (Clinical paste box) *
                </label>
                <textarea
                  required
                  rows={7}
                  value={summaryForm.summary_text}
                  onChange={(e) => setSummaryForm({ ...summaryForm, summary_text: e.target.value })}
                  placeholder="Paste doctor visit instructions, encounter recap, changes in therapy, test results discussed, or what happened at the visit..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white leading-relaxed custom-scrollbar font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSummaryModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Save Summary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. STICKY ROW OF SECTION CHIPS (The Key Layout Requirement) */}
      <nav className="flex-shrink-0 bg-slate-900 border-b border-slate-800 px-2.5 py-1.5 sm:px-3 sm:py-2">
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          {VISIT_HUB_SECTIONS.map((sec) => {
            const isSelected = selectedSections.includes(sec.id)
            return (
              <HealthTooltip key={sec.id} content={`${isSelected ? "Hide" : "Show"} ${sec.label} section`}>
                <button
                  type="button"
                  onClick={() => handleToggleChip(sec.id)}
                  className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer select-none ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/40"
                      : "bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50"
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 text-blue-200" />}
                  <span>{sec.shortLabel}</span>
                </button>
              </HealthTooltip>
            )
          })}

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* ALL CHIP */}
          <HealthTooltip content={isAllSelected ? "Collapse back to Next Appointment only" : "Show every Visit Hub section in order"}>
            <button
              type="button"
              onClick={handleToggleAll}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer select-none ${
                isAllSelected
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/40"
                  : "bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50"
              }`}
            >
              All
            </button>
          </HealthTooltip>
        </div>
      </nav>

      {/* 3. SCROLLABLE SECTIONS CONTAINER */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
          {/* ============================================================== */}
          {/* SECTION 1: NEXT APPOINTMENT                                    */}
          {/* ============================================================== */}
          {selectedSections.includes("nextAppt") && (
            <section
              id="section-nextAppt"
              className={`bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-4 md:p-6 shadow-xl transition-all ${
                isSectionOpen("nextAppt") ? "space-y-4" : "space-y-0"
              }`}
            >
              <div className={`flex items-center justify-between ${isSectionOpen("nextAppt") ? "border-b border-slate-800 pb-3" : ""} flex-wrap gap-2`}>
                <div
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => toggleSection("nextAppt")}
                >
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-white">Next Appointment</h2>
                    <p className="text-xs text-slate-400">Upcoming visit and visit preparation checklist</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSection("nextAppt")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title={isSectionOpen("nextAppt") ? "Collapse Next Appointment" : "Expand Next Appointment"}
                    aria-label={isSectionOpen("nextAppt") ? "Collapse Next Appointment" : "Expand Next Appointment"}
                  >
                    {isSectionOpen("nextAppt") ? (
                      <ChevronsDownUp className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateToFullTab("appointments")}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    <span>Go to full tab (Appointments)</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {isSectionOpen("nextAppt") && (
                <>
                  {/* Appointment Card */}
              {nextAppt ? (
                <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                      Confirmed Next Appointment
                    </span>
                    {daysAwayText && (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500 text-white shadow-sm">
                        {daysAwayText}
                      </span>
                    )}
                  </div>

                  <div className="text-lg md:text-xl font-bold text-white flex items-center gap-2 flex-wrap">
                    <span>{nextAppt.doctor || nextAppt.title}</span>
                    {(() => {
                      const facName = resolveFacilityInfo(nextAppt.facility_id, { name: nextAppt.facility_name }, existingFacilities).name
                      return facName ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                          {facName}
                        </span>
                      ) : null
                    })()}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                    <Clock className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>
                      {formatDateOnly(nextAppt.date)}
                      {nextAppt.date.includes("T") &&
                        ` at ${new Date(nextAppt.date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}
                    </span>
                  </div>

                  {nextAppt.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{nextAppt.location}</span>
                    </div>
                  )}

                  {nextAppt.notes && (
                    <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      <strong className="text-slate-400 block mb-0.5">Reason / Notes:</strong>
                      {nextAppt.notes}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 space-y-2">
                  <Calendar className="h-8 w-8 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-400">No upcoming appointment scheduled.</p>
                  <button
                    type="button"
                    onClick={() => handleNavigateToFullTab("appointments")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Schedule in Appointments</span>
                  </button>
                </div>
              )}

              {/* Prep Checklist */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Appointment Prep Checklist ({prepItems.filter((i) => i.completed).length}/{prepItems.length})</span>
                  </h3>
                </div>

                {/* Quick Add Suggestions */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {["Bring Insurance Card", "Bring Med List", "Fasting 12h", "Copay ready", "Write Symptoms"].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setNewPrepText(sug)
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-medium border border-slate-700/60 transition-colors"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleAddPrepItem} className="flex gap-2">
                  <input
                    type="text"
                    value={newPrepText}
                    onChange={(e) => setNewPrepText(e.target.value)}
                    placeholder="Add prep item (e.g. Bring recent bloodwork)..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shrink-0"
                  >
                    Add
                  </button>
                </form>

                <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {prepItems.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-1">No prep checklist items added yet.</p>
                  ) : (
                    prepItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          item.completed
                            ? "bg-slate-950/40 border-slate-800/40 text-slate-500"
                            : "bg-slate-950/80 border-slate-800 text-slate-200"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleTogglePrepItem(item.id, item.completed)}
                          className="flex items-center gap-2.5 flex-1 text-left text-xs font-medium cursor-pointer"
                        >
                          {item.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-slate-500 shrink-0" />
                          )}
                          <span className={item.completed ? "line-through" : ""}>{item.text}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePrepItem(item.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Next Section Button */}
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleGoToNextSection("nextAppt")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Next: Snapshot &bull; Profile</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </>
          )}
        </section>
          )}

          {/* ============================================================== */}
          {/* SECTION 2: SNAPSHOT                                            */}
          {/* ============================================================== */}
          {selectedSections.includes("snapshot") && (
            <section
              id="section-snapshot"
              className={`bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-4 md:p-6 shadow-xl transition-all ${
                isSectionOpen("snapshot") ? "space-y-4" : "space-y-0"
              }`}
            >
              <div className={`flex items-center justify-between ${isSectionOpen("snapshot") ? "border-b border-slate-800 pb-3" : ""} flex-wrap gap-2`}>
                <div
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => toggleSection("snapshot")}
                >
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-white">Snapshot & Profile</h2>
                    <p className="text-xs text-slate-400">Current medications, doctors, and health profile</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSection("snapshot")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title={isSectionOpen("snapshot") ? "Collapse Snapshot & Profile" : "Expand Snapshot & Profile"}
                    aria-label={isSectionOpen("snapshot") ? "Collapse Snapshot & Profile" : "Expand Snapshot & Profile"}
                  >
                    {isSectionOpen("snapshot") ? (
                      <ChevronsDownUp className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateToFullTab("meds")}
                    className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                  >
                    <span>Go to Meds</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateToFullTab("doctors")}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    <span>My Doctors</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {isSectionOpen("snapshot") && (
                <>
                  {/* Editable Profile Block */}
              <div className="p-4 md:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                    Medical Profile Block
                  </span>
                  {!isEditingProfile ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {!isEditingProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-rose-400 font-bold block mb-0.5">Allergies:</span>
                      <p className="text-slate-200 font-medium">{profile.allergies || "None reported"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-amber-400 font-bold block mb-0.5">Conditions:</span>
                      <p className="text-slate-200 font-medium">{profile.conditions || "None listed"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-teal-400 font-bold block mb-0.5">Insurance Provider / ID:</span>
                      <p className="text-slate-200 font-medium">
                        {profile.insurance_provider || "No provider specified"}
                        {profile.insurance_id && ` • ID: ${profile.insurance_id}`}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-blue-400 font-bold block mb-0.5">Emergency Contact:</span>
                      <p className="text-slate-200 font-medium">
                        {profile.emergency_contact_name || "None listed"}
                        {profile.emergency_contact_phone && ` (${profile.emergency_contact_phone})`}
                        {profile.emergency_contact_relation && ` • ${profile.emergency_contact_relation}`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 font-semibold block mb-1">Allergies</label>
                        <input
                          type="text"
                          value={profileForm.allergies}
                          onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                          placeholder="e.g. Penicillin, Latex, Peanuts"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 font-semibold block mb-1">Medical Conditions</label>
                        <input
                          type="text"
                          value={profileForm.conditions}
                          onChange={(e) => setProfileForm({ ...profileForm, conditions: e.target.value })}
                          placeholder="e.g. Hypertension, Asthma"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 font-semibold block mb-1">Insurance Provider</label>
                        <input
                          type="text"
                          value={profileForm.insurance_provider}
                          onChange={(e) => setProfileForm({ ...profileForm, insurance_provider: e.target.value })}
                          placeholder="e.g. Blue Cross Blue Shield"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 font-semibold block mb-1">Insurance Policy / Member ID</label>
                        <input
                          type="text"
                          value={profileForm.insurance_id}
                          onChange={(e) => setProfileForm({ ...profileForm, insurance_id: e.target.value })}
                          placeholder="e.g. XYZ12345678"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 font-semibold block mb-1">Emergency Contact Name</label>
                        <input
                          type="text"
                          value={profileForm.emergency_contact_name}
                          onChange={(e) => setProfileForm({ ...profileForm, emergency_contact_name: e.target.value })}
                          placeholder="e.g. Jane Doe"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 font-semibold block mb-1">Phone</label>
                          <input
                            type="text"
                            value={profileForm.emergency_contact_phone}
                            onChange={(e) => setProfileForm({ ...profileForm, emergency_contact_phone: e.target.value })}
                            placeholder="555-0199"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 font-semibold block mb-1">Relation</label>
                          <input
                            type="text"
                            value={profileForm.emergency_contact_relation}
                            onChange={(e) => setProfileForm({ ...profileForm, emergency_contact_relation: e.target.value })}
                            placeholder="Spouse"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                      >
                        Save Profile
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Current Medications Read-Only Summary */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Current Medications ({medications.length})
                </span>
                {medications.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No medications recorded in Meds tab.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {medications.map((m) => (
                      <div key={m.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        <span className="font-bold text-white block truncate">{m.name}</span>
                        {m.dose && <span className="text-purple-300 font-medium block">{m.dose}</span>}
                        {m.frequency && <span className="text-slate-400 text-[11px] block">{m.frequency}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Doctors Read-Only Summary */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  My Doctors ({existingDoctors.length})
                </span>
                {existingDoctors.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No doctors found in My Doctors tab.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {existingDoctors.map((d) => (
                      <div key={d.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-start gap-2">
                        <div>
                          <span className="font-bold text-white block">{d.name}</span>
                          <span className="text-blue-300 text-[11px] block">{d.specialty || "General Care"}</span>
                          {d.phone && <span className="text-slate-400 text-[11px] block">{d.phone}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNavigateToFullTab("doctors")}
                          className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
                          title="View doctor in My Doctors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Next Section Button */}
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleGoToNextSection("snapshot")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Next: Questions for Doctor</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </>
          )}
        </section>
          )}

          {/* ============================================================== */}
          {/* SECTION 3: QUESTIONS FOR DOCTOR                                */}
          {/* ============================================================== */}
          {selectedSections.includes("questions") && (
            <section
              id="section-questions"
              className={`bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-4 md:p-6 shadow-xl transition-all ${
                isSectionOpen("questions") ? "space-y-4" : "space-y-0"
              }`}
            >
              <div className={`flex items-center justify-between ${isSectionOpen("questions") ? "border-b border-slate-800 pb-3" : ""} flex-wrap gap-2`}>
                <div
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => toggleSection("questions")}
                >
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-white">Questions for Doctor</h2>
                    <p className="text-xs text-slate-400">Running list to ask during consultation</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSection("questions")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title={isSectionOpen("questions") ? "Collapse Questions" : "Expand Questions"}
                    aria-label={isSectionOpen("questions") ? "Collapse Questions" : "Expand Questions"}
                  >
                    {isSectionOpen("questions") ? (
                      <ChevronsDownUp className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateToFullTab("ai")}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                  >
                    <span>Dr. AI Assistant</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {isSectionOpen("questions") && (
                <>

              {/* Toolbar: Search, Doctor Filter, Sort */}
              <SectionToolbar
                search={questionsSearch}
                onSearchChange={setQuestionsSearch}
                doctorFilter={questionsDoctorFilter}
                onDoctorFilterChange={setQuestionsDoctorFilter}
                sort={questionsSort}
                onSortChange={(val) => handleSortChange("questions", val)}
                existingDoctors={existingDoctors}
                searchPlaceholder="Search questions..."
              />

              {/* Add Question Form */}
              <form onSubmit={handleAddQuestion} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    placeholder="Enter question to ask doctor..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="sm:w-44 shrink-0">
                    <DoctorCombobox
                      compact
                      label=""
                      value={questionDoctorName}
                      doctorId={questionDoctorId || null}
                      doctors={existingDoctors}
                      placeholder="Any Doctor..."
                      onSelectDoctor={(doc) => {
                        setQuestionDoctorId(doc.id || "")
                        setQuestionDoctorName(doc.name)
                        const linked = findSingleLinkedFacility(doc, existingFacilities)
                        if (linked && !questionFacilityName.trim()) {
                          setQuestionFacilityId(linked.id)
                          setQuestionFacilityName(linked.name)
                        }
                      }}
                      onClear={() => {
                        setQuestionDoctorId("")
                        setQuestionDoctorName("")
                      }}
                    />
                  </div>
                  <div className="sm:w-44 shrink-0">
                    <FacilityCombobox
                      compact
                      label=""
                      value={questionFacilityName}
                      facilityId={questionFacilityId || null}
                      facilities={existingFacilities}
                      placeholder="Any Facility..."
                      onSelectFacility={(fac) => {
                        setQuestionFacilityId(fac.id || "")
                        setQuestionFacilityName(fac.name)
                      }}
                      onClear={() => {
                        setQuestionFacilityId("")
                        setQuestionFacilityName("")
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    Add Question
                  </button>
                </div>
              </form>

              {/* Questions List */}
              <div className="space-y-2">
                {filteredQuestions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    {questions.length === 0
                      ? "No questions yet. Add items you wish to discuss."
                      : "No questions match your filter."}
                  </p>
                ) : (
                  filteredQuestions.map((q) => {
                    const isExpanded = expandedQuestions[q.id] === true
                    const dateStr = q.created_at
                      ? formatDateOnly(q.created_at)
                      : ""
                    return (
                      <div
                        key={q.id}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          q.answered
                            ? "bg-slate-950/40 border-slate-800/50 text-slate-500"
                            : "bg-slate-950 border-slate-800 text-slate-200"
                        }`}
                      >
                        {/* Compact bar */}
                        <div
                          onClick={() => toggleExpand("questions", q.id)}
                          className="p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] select-none"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleQuestion(q)
                              }}
                              className="p-0.5 hover:scale-110 transition-transform shrink-0 cursor-pointer"
                              title={q.answered ? "Mark unanswered" : "Mark answered"}
                            >
                              {q.answered ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-slate-500 shrink-0" />
                              )}
                            </button>
                            <span
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditQuestionModal(q)
                              }}
                              className={`text-xs md:text-sm font-semibold truncate hover:text-indigo-400 transition-colors ${
                                q.answered ? "line-through text-slate-500" : "text-white"
                              }`}
                              title="Tap to edit question"
                            >
                              {q.question}
                            </span>
                            {(() => {
                              const resolvedDoc = resolveDoctorInfo(q.doctor_id, { name: q.doctor_name }, existingDoctors).name
                              const resolvedFac = resolveFacilityInfo(q.facility_id, { name: q.facility_name }, existingFacilities).name
                              return (
                                <>
                                  {resolvedDoc && (
                                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 shrink-0 truncate max-w-[120px]">
                                      {resolvedDoc}
                                    </span>
                                  )}
                                  {resolvedFac && (
                                    <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 shrink-0 truncate max-w-[120px]">
                                      {resolvedFac}
                                    </span>
                                  )}
                                </>
                              )
                            })()}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {dateStr && <span className="text-[11px] text-slate-500">{dateStr}</span>}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditQuestionModal(q)
                              }}
                              className="p-1 rounded-lg hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400"
                              title="Edit question"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="px-4 pb-3 pt-2 border-t border-slate-900 flex items-start justify-between gap-3">
                            <div className="space-y-1 text-xs flex-1">
                              <p className="text-slate-200 whitespace-pre-wrap">{q.question}</p>
                              {q.doctor_name && (
                                <span className="text-[11px] text-indigo-400 block">
                                  Doctor: Dr. {q.doctor_name}
                                </span>
                              )}
                              {dateStr && (
                                <span className="text-[10px] text-slate-500 block">
                                  Added: {dateStr}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteQuestion(q.id)
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors shrink-0"
                              title="Delete question"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Bottom Next Section Button */}
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleGoToNextSection("questions")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Next: Health Notes</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </>
          )}
        </section>
          )}

          {/* ============================================================== */}
          {/* SECTION 4: HEALTH NOTES                                        */}
          {/* ============================================================== */}
          {selectedSections.includes("notes") && (
            <section
              id="section-notes"
              className={`bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-4 md:p-6 shadow-xl transition-all ${
                isSectionOpen("notes") ? "space-y-4" : "space-y-0"
              }`}
            >
              <div className={`flex items-center justify-between ${isSectionOpen("notes") ? "border-b border-slate-800 pb-3" : ""} flex-wrap gap-2`}>
                <div
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => toggleSection("notes")}
                >
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-white">Health Notes</h2>
                    <p className="text-xs text-slate-400">Clinical notes separate from general notes</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSection("notes")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title={isSectionOpen("notes") ? "Collapse Health Notes" : "Expand Health Notes"}
                    aria-label={isSectionOpen("notes") ? "Collapse Health Notes" : "Expand Health Notes"}
                  >
                    {isSectionOpen("notes") ? (
                      <ChevronsDownUp className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNote(null)
                      setNoteForm({
                        title: "",
                        text: "",
                        date: getTodayDateString(),
                        date_type: "Date written",
                        doctor_id: "",
                        doctor_name: "",
                        facility_id: "",
                        facility_name: "",
                        visit_id: "",
                      })
                      setNoteModalOpen(true)
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Note</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateToFullTab("records")}
                    className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-semibold"
                  >
                    <span>Medical History</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {isSectionOpen("notes") && (
                <>
                  {/* Toolbar: Search, Doctor Filter, Sort, Given Filter */}
              <SectionToolbar
                search={notesSearch}
                onSearchChange={setNotesSearch}
                doctorFilter={noteDoctorFilter}
                onDoctorFilterChange={setNoteDoctorFilter}
                sort={notesSort}
                onSortChange={(val) => handleSortChange("notes", val)}
                existingDoctors={existingDoctors}
                searchPlaceholder="Search notes..."
                givenFilter={notesGivenFilter}
                onGivenFilterChange={(val) => handleGivenFilterChange("notes", val)}
              />

              {/* Notes List */}
              <div className="space-y-3">
                {filteredNotes.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    {notes.length === 0
                      ? "No health notes recorded yet."
                      : "No notes match your filter."}
                  </p>
                ) : (
                  filteredNotes.map((n) => {
                    const isExpanded = expandedNotes[n.id] === true
                    const dateFormatted = formatDateOnly(n.date)
                    const dateWithLabel = n.date_type ? `${n.date_type}: ${dateFormatted}` : dateFormatted
                    return (
                      <div
                        key={n.id}
                        className="rounded-2xl bg-slate-950 border border-slate-800 transition-all overflow-hidden"
                      >
                        {/* Compact bar */}
                        <div
                          onClick={() => toggleExpand("notes", n.id)}
                          className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] select-none"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <span
                              className={`text-xs md:text-sm font-bold truncate ${
                                n.given_to_doctor ? "text-emerald-400" : "text-blue-400"
                              }`}
                            >
                              {n.title}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                n.given_to_doctor
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {n.given_to_doctor ? `Given - ${n.given_method || "visit"}` : "Not given"}
                            </span>
                            {(() => {
                              const resolvedDoc = resolveDoctorInfo(n.doctor_id, { name: n.doctor_name }, existingDoctors).name
                              const resolvedFac = resolveFacilityInfo(n.facility_id, { name: n.facility_name }, existingFacilities).name
                              return (
                                <>
                                  {resolvedDoc && (
                                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-400 shrink-0 truncate max-w-[120px]">
                                      {resolvedDoc}
                                    </span>
                                  )}
                                  {resolvedFac && (
                                    <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 shrink-0 truncate max-w-[120px]">
                                      {resolvedFac}
                                    </span>
                                  )}
                                </>
                              )
                            })()}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {dateWithLabel && <span className="text-[11px] text-slate-400">{dateWithLabel}</span>}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingNote(n)
                                setNoteForm({
                                  title: n.title,
                                  text: n.text,
                                  date: n.date || "",
                                  date_type: n.date_type || "Date written",
                                  doctor_id: n.doctor_id || "",
                                  doctor_name: resolveDoctorInfo(n.doctor_id, { name: n.doctor_name }, existingDoctors).name,
                                  facility_id: n.facility_id || "",
                                  facility_name: resolveFacilityInfo(n.facility_id, { name: n.facility_name }, existingFacilities).name,
                                  visit_id: n.visit_id || "",
                                })
                                setNoteModalOpen(true)
                              }}
                              className="p-1 rounded-lg hover:bg-teal-500/20 text-slate-400 hover:text-teal-300"
                              title="Edit note"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="p-4 pt-2 border-t border-slate-900 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                                <span>{dateWithLabel}</span>
                                {n.doctor_name && <span>&bull; Dr. {n.doctor_name}</span>}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingNote(n)
                                    setNoteForm({
                                      title: n.title,
                                      text: n.text,
                                      date: n.date || "",
                                      date_type: n.date_type || "Date written",
                                      doctor_id: n.doctor_id || "",
                                      doctor_name: resolveDoctorInfo(n.doctor_id, { name: n.doctor_name }, existingDoctors).name,
                                      facility_id: n.facility_id || "",
                                      facility_name: resolveFacilityInfo(n.facility_id, { name: n.facility_name }, existingFacilities).name,
                                      visit_id: n.visit_id || "",
                                    })
                                    setNoteModalOpen(true)
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
                                  title="Edit note"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteHealthNote(n.id)
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                                  title="Delete note"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Given to Doctor Tracker */}
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <HealthTooltip content="Track whether you already shared this note with your doctor (at visit or via portal)">
                                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-300">
                                    <input
                                      type="checkbox"
                                      checked={!!n.given_to_doctor}
                                      onChange={(e) =>
                                        handleUpdateGivenStatus(
                                          "health_notes",
                                          n.id,
                                          e.target.checked,
                                          n.given_method || "visit",
                                          n.given_date || getTodayDateString()
                                        )
                                      }
                                      className="rounded border-slate-700 text-teal-600 focus:ring-0"
                                    />
                                    <span>Given to doctor</span>
                                  </label>
                                </HealthTooltip>
                                <FieldHelpPopover
                                  title="Given to Doctor"
                                  content="Check this once you hand or send an item to your doctor. Choose 'At visit' or 'Via portal' and the date so the card turns green."
                                />
                              </div>
                              {n.given_to_doctor && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <select
                                    value={n.given_method || "visit"}
                                    onChange={(e) =>
                                      handleUpdateGivenStatus(
                                        "health_notes",
                                        n.id,
                                        true,
                                        parseGivenMethod(e.target.value),
                                        n.given_date || getTodayDateString()
                                      )
                                    }
                                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs"
                                  >
                                    <option value="visit">At visit</option>
                                    <option value="portal">Via portal</option>
                                  </select>
                                  <input
                                    type="date"
                                    value={n.given_date || getTodayDateString()}
                                    onChange={(e) =>
                                      handleUpdateGivenStatus(
                                        "health_notes",
                                        n.id,
                                        true,
                                        n.given_method || "visit",
                                        e.target.value
                                      )
                                    }
                                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs"
                                  />
                                </div>
                              )}
                            </div>

                            <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{n.text}</p>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Bottom Next Section Button */}
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleGoToNextSection("notes")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Next: Doctor Letters</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </>
          )}
        </section>
          )}

          {/* ============================================================== */}
          {/* SECTION 5: LETTERS                                             */}
          {/* ============================================================== */}
          {selectedSections.includes("letters") && (
            <section
              id="section-letters"
              className={`bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-4 md:p-6 shadow-xl transition-all ${
                isSectionOpen("letters") ? "space-y-4" : "space-y-0"
              }`}
            >
              <div className={`flex items-center justify-between ${isSectionOpen("letters") ? "border-b border-slate-800 pb-3" : ""} flex-wrap gap-2`}>
                <div
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => toggleSection("letters")}
                >
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-white">Doctor Letters</h2>
                    <p className="text-xs text-slate-400">Medical letters, clearance, records requests & attachments</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSection("letters")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title={isSectionOpen("letters") ? "Collapse Doctor Letters" : "Expand Doctor Letters"}
                    aria-label={isSectionOpen("letters") ? "Collapse Doctor Letters" : "Expand Doctor Letters"}
                  >
                    {isSectionOpen("letters") ? (
                      <ChevronsDownUp className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLetter(null)
                      setLetterForm({
                        doctor_name: "",
                        doctor_id: "",
                        facility_id: "",
                        facility_name: "",
                        visit_id: "",
                        date: getTodayDateString(),
                        date_type: "Date written",
                        direction: "received",
                        status: "needed",
                        notes: "",
                        attachment_url: "",
                        attachment_name: "",
                      })
                      setLetterModalOpen(true)
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Letter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateToFullTab("doctors")}
                    className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    <span>My Doctors</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {isSectionOpen("letters") && (
                <>
                  {/* Toolbar: Search, Doctor Filter, Sort, Given Filter */}
              <SectionToolbar
                search={lettersSearch}
                onSearchChange={setLettersSearch}
                doctorFilter={lettersDoctorFilter}
                onDoctorFilterChange={setLettersDoctorFilter}
                sort={lettersSort}
                onSortChange={(val) => handleSortChange("letters", val)}
                existingDoctors={existingDoctors}
                includeStatus={true}
                searchPlaceholder="Search letters..."
                givenFilter={lettersGivenFilter}
                onGivenFilterChange={(val) => handleGivenFilterChange("letters", val)}
              />

              {/* Letters List */}
              <div className="space-y-3">
                {filteredLetters.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    {letters.length === 0
                      ? "No letters logged yet."
                      : "No letters match your filter."}
                  </p>
                ) : (
                  filteredLetters.map((l) => {
                    const isExpanded = expandedLetters[l.id] === true
                    const dateFormatted = formatDateOnly(l.date)
                    const dateWithLabel = l.date_type ? `${l.date_type}: ${dateFormatted}` : dateFormatted
                    return (
                      <div
                        key={l.id}
                        className="rounded-2xl bg-slate-950 border border-slate-800 transition-all overflow-hidden"
                      >
                        {/* Compact bar */}
                        <div
                          onClick={() => toggleExpand("letters", l.id)}
                          className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] select-none"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span
                              className={`text-xs md:text-sm font-bold truncate ${
                                l.given_to_doctor ? "text-emerald-400" : "text-blue-400"
                              }`}
                            >
                              {resolveDoctorInfo(l.doctor_id, { name: l.doctor_name }, existingDoctors).name || "Doctor Letter"}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                l.given_to_doctor
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {l.given_to_doctor ? `Given - ${l.given_method || "visit"}` : "Not given"}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0 ${
                                l.status === "received" || l.status === "sent"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-amber-500/20 text-amber-400"
                              }`}
                            >
                              {l.status}
                            </span>
                            <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-blue-500/20 text-blue-300 shrink-0">
                              {l.direction}
                            </span>
                            {(() => {
                              const resolvedFac = resolveFacilityInfo(l.facility_id, { name: l.facility_name }, existingFacilities).name
                              return resolvedFac ? (
                                <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 shrink-0 truncate max-w-[120px]">
                                  {resolvedFac}
                                </span>
                              ) : null
                            })()}
                            {l.attachment_url && (
                              <Paperclip className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {dateWithLabel && <span className="text-[11px] text-slate-400">{dateWithLabel}</span>}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingLetter(l)
                                setLetterForm({
                                  doctor_name: resolveDoctorInfo(l.doctor_id, { name: l.doctor_name }, existingDoctors).name,
                                  doctor_id: l.doctor_id || "",
                                  facility_id: l.facility_id || "",
                                  facility_name: resolveFacilityInfo(l.facility_id, { name: l.facility_name }, existingFacilities).name,
                                  visit_id: l.visit_id || "",
                                  date: l.date || "",
                                  date_type: l.date_type || "Date written",
                                  direction: l.direction,
                                  status: l.status,
                                  notes: l.notes,
                                  attachment_url: l.attachment_url || "",
                                  attachment_name: l.attachment_name || "",
                                })
                                setLetterModalOpen(true)
                              }}
                              className="p-1 rounded-lg hover:bg-amber-500/20 text-slate-400 hover:text-amber-300"
                              title="Edit letter"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="p-4 pt-2 border-t border-slate-900 space-y-3">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                                <span>{dateWithLabel}</span>
                                <span>&bull; Direction: {l.direction}</span>
                                <span>&bull; Status: {l.status}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingLetter(l)
                                    setLetterForm({
                                      doctor_name: resolveDoctorInfo(l.doctor_id, { name: l.doctor_name }, existingDoctors).name,
                                      doctor_id: l.doctor_id || "",
                                      facility_id: l.facility_id || "",
                                      facility_name: resolveFacilityInfo(l.facility_id, { name: l.facility_name }, existingFacilities).name,
                                      visit_id: l.visit_id || "",
                                      date: l.date || "",
                                      date_type: l.date_type || "Date written",
                                      direction: l.direction,
                                      status: l.status,
                                      notes: l.notes,
                                      attachment_url: l.attachment_url || "",
                                      attachment_name: l.attachment_name || "",
                                    })
                                    setLetterModalOpen(true)
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
                                  title="Edit letter"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteLetter(l.id)
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                                  title="Delete letter"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Given to Doctor Tracker */}
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={!!l.given_to_doctor}
                                  onChange={(e) =>
                                    handleUpdateGivenStatus(
                                      "health_letters",
                                      l.id,
                                      e.target.checked,
                                      l.given_method || "visit",
                                      l.given_date || getTodayDateString()
                                    )
                                  }
                                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                                />
                                <span>Given to doctor</span>
                              </label>
                              {l.given_to_doctor && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <select
                                    value={l.given_method || "visit"}
                                    onChange={(e) =>
                                      handleUpdateGivenStatus(
                                        "health_letters",
                                        l.id,
                                        true,
                                        parseGivenMethod(e.target.value),
                                        l.given_date || getTodayDateString()
                                      )
                                    }
                                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs"
                                  >
                                    <option value="visit">At visit</option>
                                    <option value="portal">Via portal</option>
                                  </select>
                                  <input
                                    type="date"
                                    value={l.given_date || getTodayDateString()}
                                    onChange={(e) =>
                                      handleUpdateGivenStatus(
                                        "health_letters",
                                        l.id,
                                        true,
                                        l.given_method || "visit",
                                        e.target.value
                                      )
                                    }
                                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs"
                                  />
                                </div>
                              )}
                            </div>

                            {l.notes && <p className="text-xs text-slate-300 leading-relaxed">{l.notes}</p>}

                            {l.attachment_url && (
                              <div className="pt-1">
                                <AttachmentThumbnail
                                  pathOrUrl={l.attachment_url}
                                  name={l.attachment_name}
                                  onOpenFull={(url, name) => setAttachmentPreview({ url, name })}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Bottom Next Section Button */}
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleGoToNextSection("letters")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Next: Referrals &bull; Specialists</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </>
          )}
        </section>
          )}

          {/* ============================================================== */}
          {/* SECTION 6: REFERRALS & SPECIALISTS                             */}
          {/* ============================================================== */}
          {selectedSections.includes("referrals") && (
            <section
              id="section-referrals"
              className={`bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-4 md:p-6 shadow-xl transition-all ${
                isSectionOpen("referrals") ? "space-y-4" : "space-y-0"
              }`}
            >
              <div className={`flex items-center justify-between ${isSectionOpen("referrals") ? "border-b border-slate-800 pb-3" : ""} flex-wrap gap-2`}>
                <div
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => toggleSection("referrals")}
                >
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-white">Referrals & Specialists</h2>
                    <p className="text-xs text-slate-400">Specialist tracking and linked doctor records</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSection("referrals")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title={isSectionOpen("referrals") ? "Collapse Referrals & Specialists" : "Expand Referrals & Specialists"}
                    aria-label={isSectionOpen("referrals") ? "Collapse Referrals & Specialists" : "Expand Referrals & Specialists"}
                  >
                    {isSectionOpen("referrals") ? (
                      <ChevronsDownUp className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReferral(null)
                      setReferralForm({
                        specialist_name: "",
                        specialty: "",
                        doctor_id: "",
                        facility_id: "",
                        facility_name: "",
                        referred_by_name: "",
                        referred_by_doctor_id: "",
                        visit_id: "",
                        reason: "",
                        date: getTodayDateString(),
                        date_type: "Date written",
                        status: "needed",
                        phone: "",
                        notes: "",
                      })
                      setReferralModalOpen(true)
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Referral</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateToFullTab("doctors")}
                    className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    <span>My Doctors</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {isSectionOpen("referrals") && (
                <>
                  {/* Toolbar: Search, Doctor Filter, Sort, Given Filter */}
              <SectionToolbar
                search={referralsSearch}
                onSearchChange={setReferralsSearch}
                doctorFilter={referralsDoctorFilter}
                onDoctorFilterChange={setReferralsDoctorFilter}
                sort={referralsSort}
                onSortChange={(val) => handleSortChange("referrals", val)}
                existingDoctors={existingDoctors}
                includeStatus={true}
                searchPlaceholder="Search referrals..."
                givenFilter={referralsGivenFilter}
                onGivenFilterChange={(val) => handleGivenFilterChange("referrals", val)}
              />

              {/* Referrals List */}
              <div className="space-y-3">
                {filteredReferrals.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    {referrals.length === 0
                      ? "No specialist referrals logged yet."
                      : "No referrals match your filter."}
                  </p>
                ) : (
                  filteredReferrals.map((r) => {
                    const isExpanded = expandedReferrals[r.id] === true
                    const dateFormatted = formatDateOnly(r.date)
                    const dateWithLabel = r.date_type ? `${r.date_type}: ${dateFormatted}` : dateFormatted
                    return (
                      <div
                        key={r.id}
                        className="rounded-2xl bg-slate-950 border border-slate-800 transition-all overflow-hidden"
                      >
                        {/* Compact bar */}
                        <div
                          onClick={() => toggleExpand("referrals", r.id)}
                          className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] select-none"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span
                              className={`text-xs md:text-sm font-bold truncate ${
                                r.given_to_doctor ? "text-emerald-400" : "text-blue-400"
                              }`}
                            >
                              {resolveDoctorInfo(r.doctor_id, { name: r.specialist_name }, existingDoctors).name || r.specialist_name}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                r.given_to_doctor
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {r.given_to_doctor ? `Given - ${r.given_method || "visit"}` : "Not given"}
                            </span>
                            {r.specialty && (
                              <span className="hidden sm:inline-flex text-xs text-rose-300 font-medium truncate max-w-[120px]">
                                &bull; {r.specialty}
                              </span>
                            )}
                            {(() => {
                              const resolvedFac = resolveFacilityInfo(r.facility_id, { name: r.facility_name }, existingFacilities).name
                              return resolvedFac ? (
                                <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 shrink-0 truncate max-w-[120px]">
                                  {resolvedFac}
                                </span>
                              ) : null
                            })()}
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0 ${
                                r.status === "seen"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : r.status === "scheduled"
                                  ? "bg-purple-500/20 text-purple-400"
                                  : r.status === "requested"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-amber-500/20 text-amber-400"
                              }`}
                            >
                              {r.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {dateWithLabel && <span className="text-[11px] text-slate-400">{dateWithLabel}</span>}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingReferral(r)
                                setReferralForm({
                                  specialist_name: r.specialist_name || "",
                                  specialty: r.specialty || "",
                                  doctor_id: r.doctor_id || "",
                                  facility_id: r.facility_id || "",
                                  facility_name: resolveFacilityInfo(r.facility_id, { name: r.facility_name }, existingFacilities).name,
                                  referred_by_name: r.referred_by_name || "",
                                  referred_by_doctor_id: r.referred_by_doctor_id || "",
                                  visit_id: r.visit_id || "",
                                  reason: r.reason || "",
                                  date: r.date || "",
                                  date_type: r.date_type || "Date written",
                                  status: r.status || "needed",
                                  phone: r.phone || "",
                                  notes: r.notes || "",
                                })
                                setReferralModalOpen(true)
                              }}
                              className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300"
                              title="Edit referral"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="p-4 pt-2 border-t border-slate-900 space-y-3">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                                {r.specialty && <span className="text-rose-300 font-semibold">{r.specialty}</span>}
                                <span>{dateWithLabel}</span>
                                {r.referred_by_name && <span>Referred by: Dr. {r.referred_by_name}</span>}
                                {r.phone && <span>Phone: {r.phone}</span>}
                              </div>
                              <div className="flex items-center gap-1.5">
                                {r.doctor_id && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleNavigateToFullTab("doctors")
                                    }}
                                    className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 hover:text-blue-300 text-[11px] font-semibold border border-blue-500/20 flex items-center gap-1"
                                    title="Open doctor record in My Doctors tab"
                                  >
                                    <span>Open in My Doctors</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingReferral(r)
                                    setReferralForm({
                                      specialist_name: r.specialist_name,
                                      specialty: r.specialty,
                                      doctor_id: r.doctor_id || "",
                                      facility_id: r.facility_id || "",
                                      facility_name: resolveFacilityInfo(r.facility_id, { name: r.facility_name }, existingFacilities).name,
                                      referred_by_name: r.referred_by_name || "",
                                      referred_by_doctor_id: r.referred_by_doctor_id || "",
                                      visit_id: r.visit_id || "",
                                      reason: r.reason,
                                      date: r.date || "",
                                      date_type: r.date_type || "Date written",
                                      status: r.status,
                                      phone: r.phone,
                                      notes: r.notes,
                                    })
                                    setReferralModalOpen(true)
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
                                  title="Edit referral"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteReferral(r.id)
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                                  title="Delete referral"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Given to Doctor Tracker */}
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={!!r.given_to_doctor}
                                  onChange={(e) =>
                                    handleUpdateGivenStatus(
                                      "health_referrals",
                                      r.id,
                                      e.target.checked,
                                      r.given_method || "visit",
                                      r.given_date || getTodayDateString()
                                    )
                                  }
                                  className="rounded border-slate-700 text-rose-500 focus:ring-0"
                                />
                                <span>Given to doctor</span>
                              </label>
                              {r.given_to_doctor && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <select
                                    value={r.given_method || "visit"}
                                    onChange={(e) =>
                                      handleUpdateGivenStatus(
                                        "health_referrals",
                                        r.id,
                                        true,
                                        parseGivenMethod(e.target.value),
                                        r.given_date || getTodayDateString()
                                      )
                                    }
                                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs"
                                  >
                                    <option value="visit">At visit</option>
                                    <option value="portal">Via portal</option>
                                  </select>
                                  <input
                                    type="date"
                                    value={r.given_date || getTodayDateString()}
                                    onChange={(e) =>
                                      handleUpdateGivenStatus(
                                        "health_referrals",
                                        r.id,
                                        true,
                                        r.given_method || "visit",
                                        e.target.value
                                      )
                                    }
                                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs"
                                  />
                                </div>
                              )}
                            </div>

                            {r.reason && (
                              <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                                <strong className="text-slate-400 block mb-0.5">Reason:</strong>
                                {r.reason}
                              </p>
                            )}

                            {r.notes && <p className="text-xs text-slate-400 italic leading-relaxed">{r.notes}</p>}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Bottom Next Section Button */}
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleGoToNextSection("referrals")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Next: Visit Summary</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </>
          )}
        </section>
          )}

          {/* ============================================================== */}
          {/* SECTION 7: VISIT SUMMARY                                       */}
          {/* ============================================================== */}
          {selectedSections.includes("summary") && (
            <section
              id="section-summary"
              className={`bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-4 md:p-6 shadow-xl transition-all ${
                isSectionOpen("summary") ? "space-y-4" : "space-y-0"
              }`}
            >
              <div className={`flex items-center justify-between ${isSectionOpen("summary") ? "border-b border-slate-800 pb-3" : ""} flex-wrap gap-2`}>
                <div
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => toggleSection("summary")}
                >
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-white">Visit Summary</h2>
                    <p className="text-xs text-slate-400">Clinical visit summaries & doctor encounter notes</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSection("summary")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title={isSectionOpen("summary") ? "Collapse Visit Summary" : "Expand Visit Summary"}
                    aria-label={isSectionOpen("summary") ? "Collapse Visit Summary" : "Expand Visit Summary"}
                  >
                    {isSectionOpen("summary") ? (
                      <ChevronsDownUp className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSummary(null)
                      setSummaryForm({
                        title: "",
                        summary_text: "",
                        date: getTodayDateString(),
                        date_type: "Date written",
                        doctor_id: "",
                        doctor_name: "",
                        facility_id: "",
                        facility_name: "",
                        visit_id: "",
                      })
                      setSummaryModalOpen(true)
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Summary</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateToFullTab("records")}
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    <span>Medical History</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {isSectionOpen("summary") && (
                <>
                  {/* Toolbar: Search, Doctor Filter, Sort, Given Filter */}
              <SectionToolbar
                search={summariesSearch}
                onSearchChange={setSummariesSearch}
                doctorFilter={summariesDoctorFilter}
                onDoctorFilterChange={setSummariesDoctorFilter}
                sort={summariesSort}
                onSortChange={(val) => handleSortChange("summaries", val)}
                existingDoctors={existingDoctors}
                searchPlaceholder="Search visit summaries..."
                givenFilter={summariesGivenFilter}
                onGivenFilterChange={(val) => handleGivenFilterChange("summaries", val)}
              />

              {/* Summaries List */}
              <div className="space-y-3">
                {filteredVisitSummaries.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    {visitSummaries.length === 0
                      ? "No visit summaries recorded yet."
                      : "No visit summaries match your filter."}
                  </p>
                ) : (
                  filteredVisitSummaries.map((s) => {
                    const isExpanded = expandedSummaries[s.id] === true
                    const dateFormatted = formatDateOnly(s.date)
                    const dateWithLabel = s.date_type ? `${s.date_type}: ${dateFormatted}` : dateFormatted
                    return (
                      <div
                        key={s.id}
                        className="rounded-2xl bg-slate-950 border border-slate-800 transition-all overflow-hidden"
                      >
                        {/* Compact bar */}
                        <div
                          onClick={() => toggleExpand("summaries", s.id)}
                          className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] select-none"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <span
                              className={`text-xs md:text-sm font-bold truncate ${
                                s.given_to_doctor ? "text-emerald-400" : "text-blue-400"
                              }`}
                            >
                              {s.title}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                s.given_to_doctor
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {s.given_to_doctor ? `Given - ${s.given_method || "visit"}` : "Not given"}
                            </span>
                            {(() => {
                              const resolvedDoc = resolveDoctorInfo(s.doctor_id, { name: s.doctor_name }, existingDoctors).name
                              const resolvedFac = resolveFacilityInfo(s.facility_id, { name: s.facility_name }, existingFacilities).name
                              return (
                                <>
                                  {resolvedDoc && (
                                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 shrink-0 truncate max-w-[120px]">
                                      {resolvedDoc}
                                    </span>
                                  )}
                                  {resolvedFac && (
                                    <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 shrink-0 truncate max-w-[120px]">
                                      {resolvedFac}
                                    </span>
                                  )}
                                </>
                              )
                            })()}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {dateWithLabel && <span className="text-[11px] text-slate-400">{dateWithLabel}</span>}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingSummary(s)
                                setSummaryForm({
                                  title: s.title,
                                  summary_text: s.summary_text,
                                  date: s.date || "",
                                  date_type: s.date_type || "Date written",
                                  doctor_id: s.doctor_id || "",
                                  doctor_name: resolveDoctorInfo(s.doctor_id, { name: s.doctor_name }, existingDoctors).name,
                                  facility_id: s.facility_id || "",
                                  facility_name: resolveFacilityInfo(s.facility_id, { name: s.facility_name }, existingFacilities).name,
                                  visit_id: s.visit_id || "",
                                })
                                setSummaryModalOpen(true)
                              }}
                              className="p-1 rounded-lg hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300"
                              title="Edit visit summary"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="p-4 pt-2 border-t border-slate-900 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                                <span>{dateWithLabel}</span>
                                {s.doctor_name && <span>&bull; Dr. {s.doctor_name}</span>}
                              </div>
                              <div className="flex items-center gap-1">
                                <HealthTooltip content="Copy visit summary as plain text">
                                  <button
                                    type="button"
                                    onClick={async (e) => {
                                      e.stopPropagation()
                                      try {
                                        await navigator.clipboard.writeText(`${s.title}\n${dateWithLabel}\n\n${s.summary_text}`)
                                        toast.success("Copied visit summary as text")
                                      } catch {
                                        toast.error("Failed to copy text")
                                      }
                                    }}
                                    aria-label="Copy summary as text"
                                    className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </button>
                                </HealthTooltip>
                                <HealthTooltip content="Edit summary">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setEditingSummary(s)
                                      setSummaryForm({
                                        title: s.title,
                                        summary_text: s.summary_text,
                                        date: s.date || "",
                                        date_type: s.date_type || "Date written",
                                        doctor_id: s.doctor_id || "",
                                        doctor_name: resolveDoctorInfo(s.doctor_id, { name: s.doctor_name }, existingDoctors).name,
                                        facility_id: s.facility_id || "",
                                        facility_name: resolveFacilityInfo(s.facility_id, { name: s.facility_name }, existingFacilities).name,
                                        visit_id: s.visit_id || "",
                                      })
                                      setSummaryModalOpen(true)
                                    }}
                                    aria-label="Edit summary"
                                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                </HealthTooltip>
                                <HealthTooltip content="Delete summary">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteSummary(s.id)
                                    }}
                                    aria-label="Delete summary"
                                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </HealthTooltip>
                              </div>
                            </div>

                            {/* Given to Doctor Tracker */}
                            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={!!s.given_to_doctor}
                                  onChange={(e) =>
                                    handleUpdateGivenStatus(
                                      "health_visit_summaries",
                                      s.id,
                                      e.target.checked,
                                      s.given_method || "visit",
                                      s.given_date || getTodayDateString()
                                    )
                                  }
                                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                                />
                                <span>Given to doctor</span>
                              </label>
                              {s.given_to_doctor && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <select
                                    value={s.given_method || "visit"}
                                    onChange={(e) =>
                                      handleUpdateGivenStatus(
                                        "health_visit_summaries",
                                        s.id,
                                        true,
                                        parseGivenMethod(e.target.value),
                                        s.given_date || getTodayDateString()
                                      )
                                    }
                                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs"
                                  >
                                    <option value="visit">At visit</option>
                                    <option value="portal">Via portal</option>
                                  </select>
                                  <input
                                    type="date"
                                    value={s.given_date || getTodayDateString()}
                                    onChange={(e) =>
                                      handleUpdateGivenStatus(
                                        "health_visit_summaries",
                                        s.id,
                                        true,
                                        s.given_method || "visit",
                                        e.target.value
                                      )
                                    }
                                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs"
                                  />
                                </div>
                              )}
                            </div>

                            <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                              {s.summary_text}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Bottom Next Section Button */}
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleGoToNextSection("summary")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Next: Appointments</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </>
          )}
        </section>
          )}

          {/* ============================================================== */}
          {/* SECTION 8: VISITS                                              */}
          {/* ============================================================== */}
          {selectedSections.includes("visits") && (
            <section
              id="section-visits"
              className={`bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-4 md:p-6 shadow-xl transition-all ${
                isSectionOpen("visits") ? "space-y-4" : "space-y-0"
              }`}
            >
              <div className={`flex items-center justify-between ${isSectionOpen("visits") ? "border-b border-slate-800 pb-3" : ""} flex-wrap gap-2`}>
                <div
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => toggleSection("visits")}
                >
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-white">Appointments</h2>
                    <p className="text-xs text-slate-400">Past consultations with linked notes, letters & referrals</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSection("visits")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title={isSectionOpen("visits") ? "Collapse Appointments" : "Expand Appointments"}
                    aria-label={isSectionOpen("visits") ? "Collapse Appointments" : "Expand Appointments"}
                  >
                    {isSectionOpen("visits") ? (
                      <ChevronsDownUp className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateToFullTab("appointments")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                    title="Schedule a new medical visit"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Schedule Visit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateToFullTab("appointments")}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    <span>Go to full Appointments tab</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {isSectionOpen("visits") && (
                <>
                  {/* Toolbar: Search, Doctor Filter, Sort */}
              <SectionToolbar
                search={visitsSearch}
                onSearchChange={setVisitsSearch}
                doctorFilter={visitsDoctorFilter}
                onDoctorFilterChange={setVisitsDoctorFilter}
                sort={visitsSort}
                onSortChange={(val) => handleSortChange("visits", val)}
                existingDoctors={existingDoctors}
                searchPlaceholder="Search visits..."
              />

              {/* Visits List */}
              <div className="space-y-3">
                {filteredVisits.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    {existingVisits.length === 0
                      ? "No visits found in Health Hub."
                      : "No visits match your filter."}
                  </p>
                ) : (
                  filteredVisits.map((v) => {
                    const isExpanded = expandedVisits[v.id] === true
                    const counts = visitItemCounts[v.id] || { notes: 0, letters: 0, referrals: 0 }
                    const dateStr = formatDateOnly(v.date) || "No date"
                    return (
                      <div
                        key={v.id}
                        className="rounded-2xl bg-slate-950 border border-slate-800 transition-all overflow-hidden"
                      >
                        {/* Compact bar */}
                        <div
                          onClick={() => toggleExpand("visits", v.id)}
                          className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] select-none"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-xs md:text-sm font-bold text-white truncate">
                              {v.doctor || v.title || "Visit"}
                            </span>
                            {(() => {
                              const resolvedFac = resolveFacilityInfo(v.facility_id, { name: v.facility_name }, existingFacilities).name
                              return resolvedFac ? (
                                <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 shrink-0 truncate max-w-[130px]">
                                  {resolvedFac}
                                </span>
                              ) : null
                            })()}
                            {v.location && (
                              <span className="hidden sm:inline-flex text-xs text-slate-400 truncate max-w-[120px]">
                                &bull; {v.location}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-slate-400">{dateStr}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleNavigateToFullTab("appointments")
                              }}
                              className="p-1 rounded-lg hover:bg-blue-500/20 text-slate-400 hover:text-blue-300"
                              title="Edit in Appointments"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="p-4 pt-2 border-t border-slate-900 space-y-3">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div className="space-y-1 text-xs">
                                {v.location && (
                                  <div className="text-slate-400 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{v.location}</span>
                                  </div>
                                )}
                                {v.notes && <p className="text-slate-300 leading-relaxed pt-1">{v.notes}</p>}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleNavigateToFullTab("appointments")
                                }}
                                className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-400 text-xs font-semibold border border-slate-800 transition-colors shrink-0"
                              >
                                View in Appointments
                              </button>
                            </div>
                            {/* Linked Counts */}
                            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 flex-wrap">
                              <span className="font-semibold text-slate-300">Linked items:</span>
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-teal-300">
                                {counts.notes} notes
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300">
                                {counts.letters} letters
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-rose-300">
                                {counts.referrals} referrals
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Bottom Next Section Button */}
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleGoToNextSection("visits")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Next: Next Appointment</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </>
          )}
        </section>
          )}
        </div>
      </main>

      {/* ============================================================== */}
      {/* MODAL: HEALTH NOTE FORM                                        */}
      {/* ============================================================== */}
      {noteModalOpen && (
        <div
          className="fixed inset-0 z-[100060] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setNoteModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingNote ? "Edit Health Note" : "New Health Note"}
              </h3>
              <button
                type="button"
                onClick={() => setNoteModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNoteSubmit} className="space-y-3 text-xs">
              <FieldSuggestionInput
                compact
                name="note-title"
                label="Title"
                required
                value={noteForm.title}
                onChange={(val) => setNoteForm({ ...noteForm, title: val })}
                suggestions={hubSuggestions.reasons}
                placeholder="e.g. Cardiology follow-up summary"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-semibold">Date (Optional)</label>
                    {noteForm.date && (
                      <button
                        type="button"
                        onClick={() => setNoteForm({ ...noteForm, date: "" })}
                        className="text-[10px] text-slate-400 hover:text-rose-300 font-semibold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={noteForm.date}
                    onChange={(e) => setNoteForm({ ...noteForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <FieldSuggestionInput
                  compact
                  fieldKey="date_type"
                  name="note-date-type"
                  label="Date Type"
                  value={noteForm.date_type}
                  onChange={(val) => setNoteForm({ ...noteForm, date_type: val })}
                  suggestions={hubSuggestions.dateTypes}
                  placeholder="Date written"
                />
                <DoctorCombobox
                  compact
                  label="Related Doctor"
                  value={noteForm.doctor_name}
                  doctorId={noteForm.doctor_id || null}
                  doctors={existingDoctors}
                  placeholder="Select or type doctor..."
                  onSelectDoctor={(doc) => {
                    const linked = findSingleLinkedFacility(doc, existingFacilities)
                    setNoteForm((prev) => ({
                      ...prev,
                      doctor_id: doc.id || "",
                      doctor_name: doc.name,
                      facility_id: prev.facility_name?.trim() ? prev.facility_id : (linked?.id || prev.facility_id),
                      facility_name: prev.facility_name?.trim() ? prev.facility_name : (linked?.name || prev.facility_name),
                    }))
                  }}
                  onClear={() =>
                    setNoteForm((prev) => ({
                      ...prev,
                      doctor_id: "",
                      doctor_name: "",
                    }))
                  }
                />
              </div>

              <FacilityCombobox
                compact
                label="Facility"
                value={noteForm.facility_name}
                facilityId={noteForm.facility_id || null}
                facilities={existingFacilities}
                placeholder="Select or type facility..."
                onSelectFacility={(fac) =>
                  setNoteForm((prev) => ({
                    ...prev,
                    facility_id: fac.id || "",
                    facility_name: fac.name,
                  }))
                }
                onClear={() =>
                  setNoteForm((prev) => ({
                    ...prev,
                    facility_id: "",
                    facility_name: "",
                  }))
                }
              />

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Linked Visit (Optional)</label>
                <select
                  value={noteForm.visit_id}
                  onChange={(e) => setNoteForm({ ...noteForm, visit_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">None</option>
                  {existingVisits.map((v) => (
                    <option key={v.id} value={v.id}>
                      {formatDateOnly(v.date)} - {v.doctor || v.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Note Content *</label>
                <textarea
                  required
                  rows={5}
                  value={noteForm.text}
                  onChange={(e) => setNoteForm({ ...noteForm, text: e.target.value })}
                  placeholder="Record symptoms, physician remarks, or action plan..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white leading-relaxed custom-scrollbar"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: VISIT SUMMARY FORM                                      */}
      {/* ============================================================== */}
      {summaryModalOpen && (
        <div
          className="fixed inset-0 z-[100060] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSummaryModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingSummary ? "Edit Visit Summary" : "New Visit Summary"}
              </h3>
              <button
                type="button"
                onClick={() => setSummaryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSummarySubmit} className="space-y-3 text-xs">
              <FieldSuggestionInput
                compact
                name="summary-title"
                label="Title"
                required
                value={summaryForm.title}
                onChange={(val) => setSummaryForm({ ...summaryForm, title: val })}
                suggestions={hubSuggestions.reasons}
                placeholder="e.g. Annual physical exam summary, Consultation recap"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-semibold">Date (Optional)</label>
                    {summaryForm.date && (
                      <button
                        type="button"
                        onClick={() => setSummaryForm({ ...summaryForm, date: "" })}
                        className="text-[10px] text-slate-400 hover:text-rose-300 font-semibold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={summaryForm.date}
                    onChange={(e) => setSummaryForm({ ...summaryForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <FieldSuggestionInput
                  compact
                  fieldKey="date_type"
                  name="summary-date-type"
                  label="Date Type"
                  value={summaryForm.date_type}
                  onChange={(val) => setSummaryForm({ ...summaryForm, date_type: val })}
                  suggestions={hubSuggestions.dateTypes}
                  placeholder="Date written"
                />
                <DoctorCombobox
                  compact
                  label="Related Doctor"
                  value={summaryForm.doctor_name}
                  doctorId={summaryForm.doctor_id || null}
                  doctors={existingDoctors}
                  placeholder="Select or type doctor..."
                  onSelectDoctor={(doc) => {
                    const linked = findSingleLinkedFacility(doc, existingFacilities)
                    setSummaryForm((prev) => ({
                      ...prev,
                      doctor_id: doc.id || "",
                      doctor_name: doc.name,
                      facility_id: prev.facility_name?.trim() ? prev.facility_id : (linked?.id || prev.facility_id),
                      facility_name: prev.facility_name?.trim() ? prev.facility_name : (linked?.name || prev.facility_name),
                    }))
                  }}
                  onClear={() =>
                    setSummaryForm((prev) => ({
                      ...prev,
                      doctor_id: "",
                      doctor_name: "",
                    }))
                  }
                />
              </div>

              <FacilityCombobox
                compact
                label="Facility"
                value={summaryForm.facility_name}
                facilityId={summaryForm.facility_id || null}
                facilities={existingFacilities}
                placeholder="Select or type facility..."
                onSelectFacility={(fac) =>
                  setSummaryForm((prev) => ({
                    ...prev,
                    facility_id: fac.id || "",
                    facility_name: fac.name,
                  }))
                }
                onClear={() =>
                  setSummaryForm((prev) => ({
                    ...prev,
                    facility_id: "",
                    facility_name: "",
                  }))
                }
              />

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Linked Visit (Optional)</label>
                <select
                  value={summaryForm.visit_id}
                  onChange={(e) => setSummaryForm({ ...summaryForm, visit_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">None</option>
                  {existingVisits.map((v) => (
                    <option key={v.id} value={v.id}>
                      {formatDateOnly(v.date)} - {v.doctor || v.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  What happened at the visit? (Clinical paste box) *
                </label>
                <textarea
                  required
                  rows={7}
                  value={summaryForm.summary_text}
                  onChange={(e) => setSummaryForm({ ...summaryForm, summary_text: e.target.value })}
                  placeholder="Paste doctor visit instructions, encounter recap, changes in therapy, test results discussed, or what happened at the visit..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white leading-relaxed custom-scrollbar font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSummaryModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Save Summary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: HEALTH LETTER FORM                                      */}
      {/* ============================================================== */}
      {letterModalOpen && (
        <div
          className="fixed inset-0 z-[100060] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setLetterModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingLetter ? "Edit Doctor Letter" : "Log Doctor Letter"}
              </h3>
              <button
                type="button"
                onClick={() => setLetterModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLetterSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <DoctorCombobox
                  compact
                  label="Doctor / Provider"
                  value={letterForm.doctor_name}
                  doctorId={letterForm.doctor_id || null}
                  doctors={existingDoctors}
                  placeholder="Select doctor or type clinic name..."
                  onSelectDoctor={(doc) => {
                    const linked = findSingleLinkedFacility(doc, existingFacilities)
                    setLetterForm((prev) => ({
                      ...prev,
                      doctor_id: doc.id || "",
                      doctor_name: doc.name,
                      facility_id: prev.facility_name?.trim() ? prev.facility_id : (linked?.id || prev.facility_id),
                      facility_name: prev.facility_name?.trim() ? prev.facility_name : (linked?.name || prev.facility_name),
                    }))
                  }}
                  onClear={() =>
                    setLetterForm((prev) => ({
                      ...prev,
                      doctor_id: "",
                      doctor_name: "",
                    }))
                  }
                />
                <FacilityCombobox
                  compact
                  label="Facility"
                  value={letterForm.facility_name}
                  facilityId={letterForm.facility_id || null}
                  facilities={existingFacilities}
                  placeholder="Select or type facility..."
                  onSelectFacility={(fac) =>
                    setLetterForm((prev) => ({
                      ...prev,
                      facility_id: fac.id || "",
                      facility_name: fac.name,
                    }))
                  }
                  onClear={() =>
                    setLetterForm((prev) => ({
                      ...prev,
                      facility_id: "",
                      facility_name: "",
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-semibold">Date (Optional)</label>
                    {letterForm.date && (
                      <button
                        type="button"
                        onClick={() => setLetterForm({ ...letterForm, date: "" })}
                        className="text-[10px] text-slate-400 hover:text-rose-300 font-semibold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={letterForm.date}
                    onChange={(e) => setLetterForm({ ...letterForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <FieldSuggestionInput
                  compact
                  fieldKey="date_type"
                  name="letter-date-type"
                  label="Date Type"
                  value={letterForm.date_type}
                  onChange={(val) => setLetterForm({ ...letterForm, date_type: val })}
                  suggestions={hubSuggestions.dateTypes}
                  placeholder="Date written"
                />
                <SmartSelect
                  compact
                  fieldKey="letter_direction"
                  label="Direction"
                  value={letterForm.direction}
                  onChange={(val) => setLetterForm({ ...letterForm, direction: val })}
                  previousValues={letters.map((l) => l.direction)}
                  placeholder="Direction..."
                />
                <SmartSelect
                  compact
                  fieldKey="letter_status"
                  label="Status"
                  value={letterForm.status}
                  onChange={(val) => setLetterForm({ ...letterForm, status: val })}
                  previousValues={letters.map((l) => l.status)}
                  placeholder="Status..."
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Notes / Description</label>
                <textarea
                  rows={3}
                  value={letterForm.notes}
                  onChange={(e) => setLetterForm({ ...letterForm, notes: e.target.value })}
                  placeholder="e.g. Clearance letter for physical therapy or records release request..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white custom-scrollbar"
                />
              </div>

              {/* Photo / File Attachment */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-slate-400 font-semibold block">Attachment (Photo / Document)</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer font-bold transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>{uploadingFile ? "Compressing & Uploading..." : "Choose File"}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="hidden"
                    />
                  </label>
                  {letterForm.attachment_name && (
                    <span className="text-slate-300 truncate max-w-[200px]">
                      {letterForm.attachment_name}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Images are automatically compressed before secure storage.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setLetterModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingFile}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Save Letter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: VISIT SUMMARY FORM                                      */}
      {/* ============================================================== */}
      {summaryModalOpen && (
        <div
          className="fixed inset-0 z-[100060] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSummaryModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingSummary ? "Edit Visit Summary" : "New Visit Summary"}
              </h3>
              <button
                type="button"
                onClick={() => setSummaryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSummarySubmit} className="space-y-3 text-xs">
              <FieldSuggestionInput
                compact
                name="summary-title"
                label="Title"
                required
                value={summaryForm.title}
                onChange={(val) => setSummaryForm({ ...summaryForm, title: val })}
                suggestions={hubSuggestions.reasons}
                placeholder="e.g. Annual physical exam summary, Consultation recap"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-semibold">Date (Optional)</label>
                    {summaryForm.date && (
                      <button
                        type="button"
                        onClick={() => setSummaryForm({ ...summaryForm, date: "" })}
                        className="text-[10px] text-slate-400 hover:text-rose-300 font-semibold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={summaryForm.date}
                    onChange={(e) => setSummaryForm({ ...summaryForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <FieldSuggestionInput
                  compact
                  fieldKey="date_type"
                  name="summary-date-type"
                  label="Date Type"
                  value={summaryForm.date_type}
                  onChange={(val) => setSummaryForm({ ...summaryForm, date_type: val })}
                  suggestions={hubSuggestions.dateTypes}
                  placeholder="Date written"
                />
                <DoctorCombobox
                  compact
                  label="Related Doctor"
                  value={summaryForm.doctor_name}
                  doctorId={summaryForm.doctor_id || null}
                  doctors={existingDoctors}
                  placeholder="Select or type doctor..."
                  onSelectDoctor={(doc) => {
                    const linked = findSingleLinkedFacility(doc, existingFacilities)
                    setSummaryForm((prev) => ({
                      ...prev,
                      doctor_id: doc.id || "",
                      doctor_name: doc.name,
                      facility_id: prev.facility_name?.trim() ? prev.facility_id : (linked?.id || prev.facility_id),
                      facility_name: prev.facility_name?.trim() ? prev.facility_name : (linked?.name || prev.facility_name),
                    }))
                  }}
                  onClear={() =>
                    setSummaryForm((prev) => ({
                      ...prev,
                      doctor_id: "",
                      doctor_name: "",
                    }))
                  }
                />
              </div>

              <FacilityCombobox
                compact
                label="Facility"
                value={summaryForm.facility_name}
                facilityId={summaryForm.facility_id || null}
                facilities={existingFacilities}
                placeholder="Select or type facility..."
                onSelectFacility={(fac) =>
                  setSummaryForm((prev) => ({
                    ...prev,
                    facility_id: fac.id || "",
                    facility_name: fac.name,
                  }))
                }
                onClear={() =>
                  setSummaryForm((prev) => ({
                    ...prev,
                    facility_id: "",
                    facility_name: "",
                  }))
                }
              />

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Linked Visit (Optional)</label>
                <select
                  value={summaryForm.visit_id}
                  onChange={(e) => setSummaryForm({ ...summaryForm, visit_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">None</option>
                  {existingVisits.map((v) => (
                    <option key={v.id} value={v.id}>
                      {formatDateOnly(v.date)} - {v.doctor || v.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  What happened at the visit? (Clinical paste box) *
                </label>
                <textarea
                  required
                  rows={7}
                  value={summaryForm.summary_text}
                  onChange={(e) => setSummaryForm({ ...summaryForm, summary_text: e.target.value })}
                  placeholder="Paste doctor visit instructions, encounter recap, changes in therapy, test results discussed, or what happened at the visit..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white leading-relaxed custom-scrollbar font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSummaryModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Save Summary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: HEALTH REFERRAL FORM                                    */}
      {/* ============================================================== */}
      {referralModalOpen && (
        <div
          className="fixed inset-0 z-[100060] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setReferralModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingReferral ? "Edit Referral" : "New Specialist Referral"}
              </h3>
              <button
                type="button"
                onClick={() => setReferralModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReferralSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <DoctorCombobox
                  compact
                  required
                  label="Specialist / Doctor"
                  value={referralForm.specialist_name}
                  doctorId={referralForm.doctor_id || null}
                  doctors={existingDoctors}
                  placeholder="Select from My Doctors or type specialist name..."
                  onSelectDoctor={(doc) => {
                    const linked = findSingleLinkedFacility(doc, existingFacilities)
                    setReferralForm((prev) => ({
                      ...prev,
                      doctor_id: doc.id || "",
                      specialist_name: doc.name,
                      specialty: prev.specialty?.trim() ? prev.specialty : (doc.specialty || ""),
                      phone: prev.phone?.trim() ? prev.phone : (doc.phone || ""),
                      notes: prev.notes?.trim() ? prev.notes : (doc.facility || doc.address || ""),
                      facility_id: prev.facility_name?.trim() ? prev.facility_id : (linked?.id || prev.facility_id),
                      facility_name: prev.facility_name?.trim() ? prev.facility_name : (linked?.name || prev.facility_name),
                    }))
                  }}
                  onClear={() =>
                    setReferralForm((prev) => ({
                      ...prev,
                      doctor_id: "",
                      specialist_name: "",
                    }))
                  }
                />
                <FacilityCombobox
                  compact
                  label="Facility"
                  value={referralForm.facility_name}
                  facilityId={referralForm.facility_id || null}
                  facilities={existingFacilities}
                  placeholder="Select or type facility..."
                  onSelectFacility={(fac) =>
                    setReferralForm((prev) => ({
                      ...prev,
                      facility_id: fac.id || "",
                      facility_name: fac.name,
                      phone: prev.phone?.trim() ? prev.phone : (fac.phone || ""),
                      notes: prev.notes?.trim() ? prev.notes : (fac.address || ""),
                    }))
                  }
                  onClear={() =>
                    setReferralForm((prev) => ({
                      ...prev,
                      facility_id: "",
                      facility_name: "",
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <FieldSuggestionInput
                  compact
                  name="referral-specialty"
                  label="Specialty"
                  value={referralForm.specialty}
                  onChange={(val) => setReferralForm({ ...referralForm, specialty: val })}
                  suggestions={hubSuggestions.specialties}
                  placeholder="e.g. Dermatology, Neurology"
                />
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Phone</label>
                  <input
                    type="text"
                    value={referralForm.phone}
                    onChange={(e) => setReferralForm({ ...referralForm, phone: e.target.value })}
                    placeholder="e.g. 555-0144"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <DoctorCombobox
                  compact
                  label="Referred By"
                  value={referralForm.referred_by_name}
                  doctorId={referralForm.referred_by_doctor_id || null}
                  doctors={existingDoctors}
                  placeholder="Select doctor..."
                  onSelectDoctor={(doc) =>
                    setReferralForm((prev) => ({
                      ...prev,
                      referred_by_doctor_id: doc.id || "",
                      referred_by_name: doc.name,
                    }))
                  }
                  onClear={() =>
                    setReferralForm((prev) => ({
                      ...prev,
                      referred_by_doctor_id: "",
                      referred_by_name: "",
                    }))
                  }
                />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-semibold">Date (Optional)</label>
                    {referralForm.date && (
                      <button
                        type="button"
                        onClick={() => setReferralForm({ ...referralForm, date: "" })}
                        className="text-[10px] text-slate-400 hover:text-rose-300 font-semibold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={referralForm.date}
                    onChange={(e) => setReferralForm({ ...referralForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <FieldSuggestionInput
                  compact
                  fieldKey="date_type"
                  name="referral-date-type"
                  label="Date Type"
                  value={referralForm.date_type}
                  onChange={(val) => setReferralForm({ ...referralForm, date_type: val })}
                  suggestions={hubSuggestions.dateTypes}
                  placeholder="Date written"
                />
                <SmartSelect
                  compact
                  fieldKey="referral_status"
                  label="Status"
                  value={referralForm.status}
                  onChange={(val) => setReferralForm({ ...referralForm, status: val })}
                  previousValues={referrals.map((r) => r.status)}
                  placeholder="Status..."
                />
              </div>

              <FieldSuggestionInput
                compact
                name="referral-reason"
                label="Reason for Referral"
                value={referralForm.reason}
                onChange={(val) => setReferralForm({ ...referralForm, reason: val })}
                suggestions={hubSuggestions.reasons}
                placeholder="e.g. Annual skin check, MRI evaluation..."
              />

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={referralForm.notes}
                  onChange={(e) => setReferralForm({ ...referralForm, notes: e.target.value })}
                  placeholder="Authorization number, clinic location, instructions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white custom-scrollbar"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReferralModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Save Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: VISIT SUMMARY FORM                                      */}
      {/* ============================================================== */}
      {summaryModalOpen && (
        <div
          className="fixed inset-0 z-[100060] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSummaryModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingSummary ? "Edit Visit Summary" : "New Visit Summary"}
              </h3>
              <button
                type="button"
                onClick={() => setSummaryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSummarySubmit} className="space-y-3 text-xs">
              <FieldSuggestionInput
                compact
                name="summary-title"
                label="Title"
                required
                value={summaryForm.title}
                onChange={(val) => setSummaryForm({ ...summaryForm, title: val })}
                suggestions={hubSuggestions.reasons}
                placeholder="e.g. Annual physical exam summary, Consultation recap"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-semibold">Date (Optional)</label>
                    {summaryForm.date && (
                      <button
                        type="button"
                        onClick={() => setSummaryForm({ ...summaryForm, date: "" })}
                        className="text-[10px] text-slate-400 hover:text-rose-300 font-semibold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={summaryForm.date}
                    onChange={(e) => setSummaryForm({ ...summaryForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <FieldSuggestionInput
                  compact
                  fieldKey="date_type"
                  name="summary-date-type"
                  label="Date Type"
                  value={summaryForm.date_type}
                  onChange={(val) => setSummaryForm({ ...summaryForm, date_type: val })}
                  suggestions={hubSuggestions.dateTypes}
                  placeholder="Date written"
                />
                <DoctorCombobox
                  compact
                  label="Related Doctor"
                  value={summaryForm.doctor_name}
                  doctorId={summaryForm.doctor_id || null}
                  doctors={existingDoctors}
                  placeholder="Select or type doctor..."
                  onSelectDoctor={(doc) => {
                    const linked = findSingleLinkedFacility(doc, existingFacilities)
                    setSummaryForm((prev) => ({
                      ...prev,
                      doctor_id: doc.id || "",
                      doctor_name: doc.name,
                      facility_id: prev.facility_name?.trim() ? prev.facility_id : (linked?.id || prev.facility_id),
                      facility_name: prev.facility_name?.trim() ? prev.facility_name : (linked?.name || prev.facility_name),
                    }))
                  }}
                  onClear={() =>
                    setSummaryForm((prev) => ({
                      ...prev,
                      doctor_id: "",
                      doctor_name: "",
                    }))
                  }
                />
              </div>

              <FacilityCombobox
                compact
                label="Facility"
                value={summaryForm.facility_name}
                facilityId={summaryForm.facility_id || null}
                facilities={existingFacilities}
                placeholder="Select or type facility..."
                onSelectFacility={(fac) =>
                  setSummaryForm((prev) => ({
                    ...prev,
                    facility_id: fac.id || "",
                    facility_name: fac.name,
                  }))
                }
                onClear={() =>
                  setSummaryForm((prev) => ({
                    ...prev,
                    facility_id: "",
                    facility_name: "",
                  }))
                }
              />

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Linked Visit (Optional)</label>
                <select
                  value={summaryForm.visit_id}
                  onChange={(e) => setSummaryForm({ ...summaryForm, visit_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="">None</option>
                  {existingVisits.map((v) => (
                    <option key={v.id} value={v.id}>
                      {formatDateOnly(v.date)} - {v.doctor || v.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  What happened at the visit? (Clinical paste box) *
                </label>
                <textarea
                  required
                  rows={7}
                  value={summaryForm.summary_text}
                  onChange={(e) => setSummaryForm({ ...summaryForm, summary_text: e.target.value })}
                  placeholder="Paste doctor visit instructions, encounter recap, changes in therapy, test results discussed, or what happened at the visit..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white leading-relaxed custom-scrollbar font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSummaryModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Save Summary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT QUESTION FORM                                      */}
      {/* ============================================================== */}
      {editingQuestion && (
        <div
          className="fixed inset-0 z-[100060] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setEditingQuestion(null)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Edit Question</h3>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveQuestionEdit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Question *</label>
                <input
                  type="text"
                  required
                  value={questionEditForm.question}
                  onChange={(e) => setQuestionEditForm({ ...questionEditForm, question: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <DoctorCombobox
                  compact
                  label="Related Doctor"
                  value={questionEditForm.doctor_name}
                  doctorId={questionEditForm.doctor_id || null}
                  doctors={existingDoctors}
                  placeholder="Select or type doctor..."
                  onSelectDoctor={(doc) => {
                    const linked = findSingleLinkedFacility(doc, existingFacilities)
                    setQuestionEditForm((prev) => ({
                      ...prev,
                      doctor_id: doc.id || "",
                      doctor_name: doc.name,
                      facility_id: prev.facility_name?.trim() ? prev.facility_id : (linked?.id || prev.facility_id),
                      facility_name: prev.facility_name?.trim() ? prev.facility_name : (linked?.name || prev.facility_name),
                    }))
                  }}
                  onClear={() =>
                    setQuestionEditForm((prev) => ({
                      ...prev,
                      doctor_id: "",
                      doctor_name: "",
                    }))
                  }
                />
                <FacilityCombobox
                  compact
                  label="Facility"
                  value={questionEditForm.facility_name}
                  facilityId={questionEditForm.facility_id || null}
                  facilities={existingFacilities}
                  placeholder="Select or type facility..."
                  onSelectFacility={(fac) =>
                    setQuestionEditForm((prev) => ({
                      ...prev,
                      facility_id: fac.id || "",
                      facility_name: fac.name,
                    }))
                  }
                  onClear={() =>
                    setQuestionEditForm((prev) => ({
                      ...prev,
                      facility_id: "",
                      facility_name: "",
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Doctor Answer / Notes</label>
                <textarea
                  rows={3}
                  value={questionEditForm.answer_notes}
                  onChange={(e) => setQuestionEditForm({ ...questionEditForm, answer_notes: e.target.value })}
                  placeholder="Record the doctor's answer..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white custom-scrollbar"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL-SIZE ATTACHMENT PREVIEW LIGHTBOX */}
      {attachmentPreview && (
        <div
          className="fixed inset-0 z-[100080] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setAttachmentPreview(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between gap-4 text-white">
              <span className="text-sm font-bold truncate">{attachmentPreview.name}</span>
              <button
                type="button"
                onClick={() => setAttachmentPreview(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
                title="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <img
              src={attachmentPreview.url}
              alt={attachmentPreview.name}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain border border-slate-700 bg-black"
            />
          </div>
        </div>
      )}

    </div>
  )
}
