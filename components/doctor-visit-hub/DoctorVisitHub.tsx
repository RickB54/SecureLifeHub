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
  Lock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import {
  VisitHubSectionId,
  VISIT_HUB_SECTIONS,
  HealthProfile,
  HealthPrepItem,
  HealthQuestion,
  HealthNote,
  HealthLetter,
  HealthReferral,
  DoctorOption,
  VisitOption,
  MedicationSummary,
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
  fetchExistingDoctors,
  fetchExistingVisits,
  fetchExistingMedications,
  getSelectedSectionsFromStorage,
  saveSelectedSectionsToStorage,
  getSavedPinHash,
  getLastCacheUpdated,
  compressAndUploadAttachment,
} from "./doctor-visit-api"
import DoctorVisitMode from "./DoctorVisitMode"
import DoctorVisitPinModal from "./DoctorVisitPinModal"

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
      <div className="flex items-center gap-2">
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

  // 1. PIN Lock State
  const [pinModalOpen, setPinModalOpen] = useState(false)
  const [pinModalMode, setPinModalMode] = useState<"auth" | "manage">("auth")
  const [isUnlocked, setIsUnlocked] = useState(() => !getSavedPinHash())

  // 2. Visit Mode State
  const [visitModeActive, setVisitModeActive] = useState(false)

  // 3. Online/Offline State
  const [isOnline, setIsOnline] = useState(() => (typeof window !== "undefined" ? navigator.onLine : true))
  const [lastCacheDate, setLastCacheDate] = useState<string | null>(null)

  useEffect(() => {
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

  // 4. Section Chips Multi-Select State
  const [selectedSections, setSelectedSections] = useState<VisitHubSectionId[]>(() => {
    if (initialSection && VISIT_HUB_SECTIONS.some((s) => s.id === initialSection)) {
      return [initialSection]
    }
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const secParam = urlParams.get("section") as VisitHubSectionId
      if (secParam && VISIT_HUB_SECTIONS.some((s) => s.id === secParam)) {
        return [secParam]
      }
      const pendingSection = localStorage.getItem("slh-pending-visit-hub-section") as VisitHubSectionId
      if (pendingSection && VISIT_HUB_SECTIONS.some((s) => s.id === pendingSection)) {
        localStorage.removeItem("slh-pending-visit-hub-section")
        return [pendingSection]
      }
    }
    const saved = getSelectedSectionsFromStorage()
    return saved.length > 0 ? (saved as VisitHubSectionId[]) : ["nextAppt"]
  })

  // Sync if initialSection changes
  useEffect(() => {
    if (initialSection && VISIT_HUB_SECTIONS.some((s) => s.id === initialSection)) {
      setSelectedSections([initialSection])
      return
    }
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const secParam = urlParams.get("section") as VisitHubSectionId
      if (secParam && VISIT_HUB_SECTIONS.some((s) => s.id === secParam)) {
        setSelectedSections([secParam])
      }
    }
  }, [initialSection])

  const handleToggleChip = (sectionId: VisitHubSectionId) => {
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
  const [existingVisits, setExistingVisits] = useState<VisitOption[]>([])
  const [medications, setMedications] = useState<MedicationSummary[]>([])

  const [prepItems, setPrepItems] = useState<HealthPrepItem[]>([])
  const [newPrepText, setNewPrepText] = useState("")

  const [questions, setQuestions] = useState<HealthQuestion[]>([])
  const [questionInput, setQuestionInput] = useState("")
  const [questionDoctorId, setQuestionDoctorId] = useState("")

  const [notes, setNotes] = useState<HealthNote[]>([])
  const [noteDoctorFilter, setNoteDoctorFilter] = useState("all")
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<HealthNote | null>(null)
  const [noteForm, setNoteForm] = useState({ title: "", text: "", date: new Date().toISOString().slice(0, 10), doctor_id: "", doctor_name: "", visit_id: "" })

  const [letters, setLetters] = useState<HealthLetter[]>([])
  const [letterModalOpen, setLetterModalOpen] = useState(false)
  const [editingLetter, setEditingLetter] = useState<HealthLetter | null>(null)
  const [letterForm, setLetterForm] = useState({
    doctor_name: "",
    doctor_id: "",
    visit_id: "",
    date: new Date().toISOString().slice(0, 10),
    direction: "received" as "sent" | "received",
    status: "needed" as "needed" | "requested" | "received" | "sent",
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
    visit_id: "",
    reason: "",
    date: new Date().toISOString().slice(0, 10),
    status: "needed" as "needed" | "requested" | "scheduled" | "seen",
    phone: "",
    notes: "",
  })

  // List Sections: Toolbar, Filters, Sorts, and Expanded States
  const [questionsSort, setQuestionsSort] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("slh_vh_sort_questions") || "newest"
    }
    return "newest"
  })
  const [questionsSearch, setQuestionsSearch] = useState("")
  const [questionsDoctorFilter, setQuestionsDoctorFilter] = useState("all")
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({})

  const [notesSort, setNotesSort] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("slh_vh_sort_notes") || "newest"
    }
    return "newest"
  })
  const [notesSearch, setNotesSearch] = useState("")
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({})

  const [lettersSort, setLettersSort] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("slh_vh_sort_letters") || "newest"
    }
    return "newest"
  })
  const [lettersSearch, setLettersSearch] = useState("")
  const [lettersDoctorFilter, setLettersDoctorFilter] = useState("all")
  const [expandedLetters, setExpandedLetters] = useState<Record<string, boolean>>({})

  const [referralsSort, setReferralsSort] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("slh_vh_sort_referrals") || "newest"
    }
    return "newest"
  })
  const [referralsSearch, setReferralsSearch] = useState("")
  const [referralsDoctorFilter, setReferralsDoctorFilter] = useState("all")
  const [expandedReferrals, setExpandedReferrals] = useState<Record<string, boolean>>({})

  const [visitsSort, setVisitsSort] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("slh_vh_sort_visits") || "newest"
    }
    return "newest"
  })
  const [visitsSearch, setVisitsSearch] = useState("")
  const [visitsDoctorFilter, setVisitsDoctorFilter] = useState("all")
  const [expandedVisits, setExpandedVisits] = useState<Record<string, boolean>>({})

  const handleSortChange = (
    section: "questions" | "notes" | "letters" | "referrals" | "visits",
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
    }
  }

  const toggleExpand = (
    section: "questions" | "notes" | "letters" | "referrals" | "visits",
    id: string
  ) => {
    if (section === "questions") {
      setExpandedQuestions((prev) => ({ ...prev, [id]: !prev[id] }))
    } else if (section === "notes") {
      setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }))
    } else if (section === "letters") {
      setExpandedLetters((prev) => ({ ...prev, [id]: !prev[id] }))
    } else if (section === "referrals") {
      setExpandedReferrals((prev) => ({ ...prev, [id]: !prev[id] }))
    } else if (section === "visits") {
      setExpandedVisits((prev) => ({ ...prev, [id]: !prev[id] }))
    }
  }

  const toggleExpandAll = (
    section: "questions" | "notes" | "letters" | "referrals" | "visits",
    ids: string[]
  ) => {
    if (ids.length === 0) return
    if (section === "questions") {
      const allExpanded = ids.every((id) => expandedQuestions[id])
      const next: Record<string, boolean> = {}
      if (!allExpanded) ids.forEach((id) => { next[id] = true })
      setExpandedQuestions(next)
    } else if (section === "notes") {
      const allExpanded = ids.every((id) => expandedNotes[id])
      const next: Record<string, boolean> = {}
      if (!allExpanded) ids.forEach((id) => { next[id] = true })
      setExpandedNotes(next)
    } else if (section === "letters") {
      const allExpanded = ids.every((id) => expandedLetters[id])
      const next: Record<string, boolean> = {}
      if (!allExpanded) ids.forEach((id) => { next[id] = true })
      setExpandedLetters(next)
    } else if (section === "referrals") {
      const allExpanded = ids.every((id) => expandedReferrals[id])
      const next: Record<string, boolean> = {}
      if (!allExpanded) ids.forEach((id) => { next[id] = true })
      setExpandedReferrals(next)
    } else if (section === "visits") {
      const allExpanded = ids.every((id) => expandedVisits[id])
      const next: Record<string, boolean> = {}
      if (!allExpanded) ids.forEach((id) => { next[id] = true })
      setExpandedVisits(next)
    }
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
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (questionsSort === "doctor_asc") {
        return (a.doctor_name || "").localeCompare(b.doctor_name || "")
      } else if (questionsSort === "title_asc") {
        return a.question.localeCompare(b.question)
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
    if (notesSearch.trim()) {
      const qLower = notesSearch.toLowerCase()
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(qLower) ||
          n.text.toLowerCase().includes(qLower) ||
          (n.doctor_name && n.doctor_name.toLowerCase().includes(qLower))
      )
    }
    list.sort((a, b) => {
      if (notesSort === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (notesSort === "doctor_asc") {
        return (a.doctor_name || "").localeCompare(b.doctor_name || "")
      } else if (notesSort === "title_asc") {
        return a.title.localeCompare(b.title)
      } else {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })
    return list
  }, [notes, noteDoctorFilter, notesSearch, notesSort, existingDoctors])

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
    if (lettersSearch.trim()) {
      const qLower = lettersSearch.toLowerCase()
      list = list.filter(
        (l) =>
          (l.doctor_name && l.doctor_name.toLowerCase().includes(qLower)) ||
          (l.notes && l.notes.toLowerCase().includes(qLower)) ||
          (l.status && l.status.toLowerCase().includes(qLower)) ||
          (l.attachment_name && l.attachment_name.toLowerCase().includes(qLower))
      )
    }
    list.sort((a, b) => {
      if (lettersSort === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (lettersSort === "doctor_asc") {
        return (a.doctor_name || "").localeCompare(b.doctor_name || "")
      } else if (lettersSort === "title_asc") {
        return (a.doctor_name || "").localeCompare(b.doctor_name || "")
      } else if (lettersSort === "status_asc") {
        return (a.status || "").localeCompare(b.status || "")
      } else {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })
    return list
  }, [letters, lettersDoctorFilter, lettersSearch, lettersSort, existingDoctors])

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
    if (referralsSearch.trim()) {
      const qLower = referralsSearch.toLowerCase()
      list = list.filter(
        (r) =>
          r.specialist_name.toLowerCase().includes(qLower) ||
          r.specialty.toLowerCase().includes(qLower) ||
          (r.referred_by_name && r.referred_by_name.toLowerCase().includes(qLower)) ||
          (r.reason && r.reason.toLowerCase().includes(qLower)) ||
          (r.notes && r.notes.toLowerCase().includes(qLower)) ||
          (r.status && r.status.toLowerCase().includes(qLower))
      )
    }
    list.sort((a, b) => {
      if (referralsSort === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (referralsSort === "doctor_asc") {
        return (a.specialist_name || a.referred_by_name || "").localeCompare(
          b.specialist_name || b.referred_by_name || ""
        )
      } else if (referralsSort === "title_asc") {
        return a.specialist_name.localeCompare(b.specialist_name)
      } else if (referralsSort === "status_asc") {
        return (a.status || "").localeCompare(b.status || "")
      } else {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })
    return list
  }, [referrals, referralsDoctorFilter, referralsSearch, referralsSort, existingDoctors])

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
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (visitsSort === "doctor_asc") {
        return (a.doctor || a.title || "").localeCompare(b.doctor || b.title || "")
      } else if (visitsSort === "title_asc") {
        return (a.title || a.doctor || "").localeCompare(b.title || b.doctor || "")
      } else {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })
    return list
  }, [existingVisits, visitsDoctorFilter, visitsSearch, visitsSort, existingDoctors])

  // 6. Summary Initial Fetch (Low Egress: only 1 consolidated initial fetch)
  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
      try {
        const [prof, docs, vsts, meds] = await Promise.all([
          fetchHealthProfile(userId),
          fetchExistingDoctors(userId),
          fetchExistingVisits(userId),
          fetchExistingMedications(userId),
        ])
        if (isMounted) {
          setProfile(prof)
          setProfileForm(prof)
          setExistingDoctors(docs)
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

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const saved = await saveHealthProfile(profileForm, userId)
    setProfile(saved)
    setIsEditingProfile(false)
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

  // Questions Handlers
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionInput.trim()) return
    const doctorObj = existingDoctors.find((d) => d.id === questionDoctorId)
    const newQ = await saveQuestion(
      {
        question: questionInput.trim(),
        answered: false,
        doctor_id: questionDoctorId || null,
        doctor_name: doctorObj?.name || "",
        visit_id: nextAppt?.id || null,
      },
      userId
    )
    setQuestions((prev) => [newQ, ...prev])
    setQuestionInput("")
  }

  const handleToggleQuestion = async (q: HealthQuestion) => {
    const updated = { ...q, answered: !q.answered }
    setQuestions((prev) => prev.map((item) => (item.id === q.id ? updated : item)))
    await saveQuestion(updated, userId)
  }

  const handleDeleteQuestion = async (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
    await deleteQuestion(id, userId)
  }

  // Health Notes Handlers
  const handleSaveNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteForm.title.trim()) return
    const doctorObj = existingDoctors.find((d) => d.id === noteForm.doctor_id)
    const payload = {
      ...(editingNote ? { id: editingNote.id } : {}),
      title: noteForm.title.trim(),
      text: noteForm.text.trim(),
      date: noteForm.date || new Date().toISOString().slice(0, 10),
      doctor_id: noteForm.doctor_id || null,
      doctor_name: doctorObj?.name || noteForm.doctor_name || "",
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
  }

  // Health Letters Handlers
  const handleSaveLetterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const doctorObj = existingDoctors.find((d) => d.id === letterForm.doctor_id)
    const payload = {
      ...(editingLetter ? { id: editingLetter.id } : {}),
      doctor_name: doctorObj?.name || letterForm.doctor_name || "Doctor Letter",
      doctor_id: letterForm.doctor_id || null,
      visit_id: letterForm.visit_id || null,
      date: letterForm.date || new Date().toISOString().slice(0, 10),
      direction: letterForm.direction,
      status: letterForm.status,
      notes: letterForm.notes.trim(),
      attachment_url: letterForm.attachment_url || null,
      attachment_name: letterForm.attachment_name || null,
    }
    const saved = await saveHealthLetter(payload, userId)
    if (editingLetter) {
      setLetters((prev) => prev.map((l) => (l.id === saved.id ? saved : l)))
    } else {
      setLetters((prev) => [saved, ...prev])
    }
    setLetterModalOpen(false)
    setEditingLetter(null)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFile(true)
    try {
      const res = await compressAndUploadAttachment(file, userId)
      setLetterForm((prev) => ({
        ...prev,
        attachment_url: res.url,
        attachment_name: res.name,
      }))
    } catch (err) {
      console.warn("Upload failed:", err)
    } finally {
      setUploadingFile(false)
    }
  }

  // Health Referrals Handlers
  const handleSaveReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!referralForm.specialist_name.trim()) return
    const refDoctorObj = existingDoctors.find((d) => d.id === referralForm.referred_by_doctor_id)
    const specDoctorObj = existingDoctors.find((d) => d.id === referralForm.doctor_id)
    const payload = {
      ...(editingReferral ? { id: editingReferral.id } : {}),
      specialist_name: specDoctorObj?.name || referralForm.specialist_name.trim(),
      specialty: specDoctorObj?.specialty || referralForm.specialty.trim(),
      doctor_id: referralForm.doctor_id || null,
      referred_by_doctor_id: referralForm.referred_by_doctor_id || null,
      referred_by_name: refDoctorObj?.name || referralForm.referred_by_name.trim(),
      visit_id: referralForm.visit_id || null,
      reason: referralForm.reason.trim(),
      date: referralForm.date || new Date().toISOString().slice(0, 10),
      status: referralForm.status,
      phone: specDoctorObj?.phone || referralForm.phone.trim(),
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

  // If locked, show PIN lock
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-[100030] bg-slate-950 flex items-center justify-center p-4">
        <DoctorVisitPinModal
          isOpen={true}
          mode="auth"
          onSuccess={() => setIsUnlocked(true)}
          onClose={onClose}
          theme={theme}
        />
      </div>
    )
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
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white text-xs md:text-sm font-semibold transition-all cursor-pointer border border-slate-700/60"
            title="Return to Health Hub"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Health Hub</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Stethoscope className="h-5 w-5" />
            </div>
            <h1 className="text-base md:text-lg font-black tracking-tight text-white truncate">
              Doctor Visit Hub
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* PIN Lock Management Button */}
          <button
            type="button"
            onClick={() => {
              setPinModalMode("manage")
              setPinModalOpen(true)
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer"
            title="PIN Lock Settings"
          >
            <Lock className="h-4 w-4" />
          </button>

          {/* Visit Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setVisitModeActive(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            title="Open large text, high contrast Visit Mode for doctors"
          >
            <Eye className="h-4 w-4" />
            <span>Visit Mode</span>
          </button>
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

      {/* 2. STICKY ROW OF SECTION CHIPS (The Key Layout Requirement) */}
      <nav className="flex-shrink-0 bg-slate-900 border-b border-slate-800 px-3 py-2.5 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {VISIT_HUB_SECTIONS.map((sec) => {
            const isSelected = selectedSections.includes(sec.id)
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => handleToggleChip(sec.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/40"
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50"
                }`}
                title={`Toggle ${sec.label} section`}
              >
                {isSelected && <Check className="h-3.5 w-3.5 text-blue-200" />}
                <span>{sec.shortLabel}</span>
              </button>
            )
          })}

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* ALL CHIP */}
          <button
            type="button"
            onClick={handleToggleAll}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer select-none ${
              isAllSelected
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/40"
                : "bg-slate-800/80 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30"
            }`}
            title={isAllSelected ? "Collapse all back to one section" : "Show all sections in order"}
          >
            All {isAllSelected ? "(Active)" : ""}
          </button>
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
              className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-white">Next Appointment</h2>
                    <p className="text-xs text-slate-400">Upcoming visit and visit preparation checklist</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigateToFullTab("appointments")}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  <span>Go to full tab (Visits)</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>

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

                  <div className="text-lg md:text-xl font-bold text-white">
                    {nextAppt.doctor || nextAppt.title}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                    <Clock className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>
                      {new Date(nextAppt.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
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
                    <span>Schedule in Visits</span>
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
            </section>
          )}

          {/* ============================================================== */}
          {/* SECTION 2: SNAPSHOT                                            */}
          {/* ============================================================== */}
          {selectedSections.includes("snapshot") && (
            <section
              id="section-snapshot"
              className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-white">Snapshot & Profile</h2>
                    <p className="text-xs text-slate-400">Current medications, doctors, and health profile</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
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
            </section>
          )}

          {/* ============================================================== */}
          {/* SECTION 3: QUESTIONS FOR DOCTOR                                */}
          {/* ============================================================== */}
          {selectedSections.includes("questions") && (
            <section
              id="section-questions"
              className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-white">Questions for Doctor</h2>
                    <p className="text-xs text-slate-400">Running list to ask during consultation</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      toggleExpandAll(
                        "questions",
                        filteredQuestions.map((q) => q.id)
                      )
                    }
                    className="text-xs text-slate-400 hover:text-slate-200 font-semibold px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {filteredQuestions.length > 0 &&
                    filteredQuestions.every((q) => expandedQuestions[q.id])
                      ? "Collapse all"
                      : "Expand all"}
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
                  <select
                    value={questionDoctorId}
                    onChange={(e) => setQuestionDoctorId(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="">Any Doctor</option>
                    {existingDoctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
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
                    const isExpanded = !!expandedQuestions[q.id]
                    const dateStr = q.created_at
                      ? new Date(q.created_at).toLocaleDateString()
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
                              className={`text-xs md:text-sm font-semibold truncate ${
                                q.answered ? "line-through text-slate-500" : "text-white"
                              }`}
                            >
                              {q.question}
                            </span>
                            {q.doctor_name && (
                              <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 shrink-0 truncate max-w-[120px]">
                                Dr. {q.doctor_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {dateStr && <span className="text-[11px] text-slate-500">{dateStr}</span>}
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
            </section>
          )}

          {/* ============================================================== */}
          {/* SECTION 4: HEALTH NOTES                                        */}
          {/* ============================================================== */}
          {selectedSections.includes("notes") && (
            <section
              id="section-notes"
              className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
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
                    onClick={() =>
                      toggleExpandAll(
                        "notes",
                        filteredNotes.map((n) => n.id)
                      )
                    }
                    className="text-xs text-slate-400 hover:text-slate-200 font-semibold px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {filteredNotes.length > 0 &&
                    filteredNotes.every((n) => expandedNotes[n.id])
                      ? "Collapse all"
                      : "Expand all"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNote(null)
                      setNoteForm({ title: "", text: "", date: new Date().toISOString().slice(0, 10), doctor_id: "", doctor_name: "", visit_id: "" })
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

              {/* Toolbar: Search, Doctor Filter, Sort */}
              <SectionToolbar
                search={notesSearch}
                onSearchChange={setNotesSearch}
                doctorFilter={noteDoctorFilter}
                onDoctorFilterChange={setNoteDoctorFilter}
                sort={notesSort}
                onSortChange={(val) => handleSortChange("notes", val)}
                existingDoctors={existingDoctors}
                searchPlaceholder="Search notes..."
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
                    const isExpanded = !!expandedNotes[n.id]
                    const dateStr = n.date
                      ? new Date(n.date).toLocaleDateString()
                      : ""
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
                            <span className="text-xs md:text-sm font-bold text-white truncate">
                              {n.title}
                            </span>
                            {n.doctor_name && (
                              <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-400 shrink-0 truncate max-w-[120px]">
                                Dr. {n.doctor_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {dateStr && <span className="text-[11px] text-slate-400">{dateStr}</span>}
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
                                <span>{dateStr}</span>
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
                                      date: n.date,
                                      doctor_id: n.doctor_id || "",
                                      doctor_name: n.doctor_name || "",
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
            </section>
          )}

          {/* ============================================================== */}
          {/* SECTION 5: LETTERS                                             */}
          {/* ============================================================== */}
          {selectedSections.includes("letters") && (
            <section
              id="section-letters"
              className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
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
                    onClick={() =>
                      toggleExpandAll(
                        "letters",
                        filteredLetters.map((l) => l.id)
                      )
                    }
                    className="text-xs text-slate-400 hover:text-slate-200 font-semibold px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {filteredLetters.length > 0 &&
                    filteredLetters.every((l) => expandedLetters[l.id])
                      ? "Collapse all"
                      : "Expand all"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLetter(null)
                      setLetterForm({
                        doctor_name: "",
                        doctor_id: "",
                        visit_id: "",
                        date: new Date().toISOString().slice(0, 10),
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

              {/* Toolbar: Search, Doctor Filter, Sort */}
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
                    const isExpanded = !!expandedLetters[l.id]
                    const dateStr = l.date
                      ? new Date(l.date).toLocaleDateString()
                      : ""
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
                            <span className="text-xs md:text-sm font-bold text-white truncate">
                              {l.doctor_name || "Doctor Letter"}
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
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {dateStr && <span className="text-[11px] text-slate-400">{dateStr}</span>}
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
                                <span>Date: {dateStr}</span>
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
                                      doctor_name: l.doctor_name || "",
                                      doctor_id: l.doctor_id || "",
                                      visit_id: l.visit_id || "",
                                      date: l.date,
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

                            {l.notes && <p className="text-xs text-slate-300 leading-relaxed">{l.notes}</p>}

                            {l.attachment_url && (
                              <div className="pt-1">
                                <a
                                  href={l.attachment_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-blue-300 text-xs font-medium border border-slate-800"
                                >
                                  <Paperclip className="h-3.5 w-3.5" />
                                  <span>{l.attachment_name || "View Attachment"}</span>
                                </a>
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
            </section>
          )}

          {/* ============================================================== */}
          {/* SECTION 6: REFERRALS & SPECIALISTS                             */}
          {/* ============================================================== */}
          {selectedSections.includes("referrals") && (
            <section
              id="section-referrals"
              className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
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
                    onClick={() =>
                      toggleExpandAll(
                        "referrals",
                        filteredReferrals.map((r) => r.id)
                      )
                    }
                    className="text-xs text-slate-400 hover:text-slate-200 font-semibold px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {filteredReferrals.length > 0 &&
                    filteredReferrals.every((r) => expandedReferrals[r.id])
                      ? "Collapse all"
                      : "Expand all"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReferral(null)
                      setReferralForm({
                        specialist_name: "",
                        specialty: "",
                        doctor_id: "",
                        referred_by_name: "",
                        referred_by_doctor_id: "",
                        visit_id: "",
                        reason: "",
                        date: new Date().toISOString().slice(0, 10),
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

              {/* Toolbar: Search, Doctor Filter, Sort */}
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
                    const isExpanded = !!expandedReferrals[r.id]
                    const dateStr = r.date
                      ? new Date(r.date).toLocaleDateString()
                      : ""
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
                            <span className="text-xs md:text-sm font-bold text-white truncate">
                              {r.specialist_name}
                            </span>
                            {r.specialty && (
                              <span className="hidden sm:inline-flex text-xs text-rose-300 font-medium truncate max-w-[120px]">
                                &bull; {r.specialty}
                              </span>
                            )}
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
                            {dateStr && <span className="text-[11px] text-slate-400">{dateStr}</span>}
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
                                <span>Date: {dateStr}</span>
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
                                      referred_by_name: r.referred_by_name || "",
                                      referred_by_doctor_id: r.referred_by_doctor_id || "",
                                      visit_id: r.visit_id || "",
                                      reason: r.reason,
                                      date: r.date,
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
                  <span>Next: Recent Visits</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </section>
          )}

          {/* ============================================================== */}
          {/* SECTION 7: VISITS                                              */}
          {/* ============================================================== */}
          {selectedSections.includes("visits") && (
            <section
              id="section-visits"
              className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-bold text-white">Recent Visits</h2>
                    <p className="text-xs text-slate-400">Past consultations with linked notes, letters & referrals</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      toggleExpandAll(
                        "visits",
                        filteredVisits.map((v) => v.id)
                      )
                    }
                    className="text-xs text-slate-400 hover:text-slate-200 font-semibold px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {filteredVisits.length > 0 &&
                    filteredVisits.every((v) => expandedVisits[v.id])
                      ? "Collapse all"
                      : "Expand all"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateToFullTab("appointments")}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                  >
                    <span>Go to full Visits tab</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

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
                    const isExpanded = !!expandedVisits[v.id]
                    const counts = visitItemCounts[v.id] || { notes: 0, letters: 0, referrals: 0 }
                    const dateStr = v.date
                      ? new Date(v.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "No date"
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
                            {v.location && (
                              <span className="hidden sm:inline-flex text-xs text-slate-400 truncate max-w-[120px]">
                                &bull; {v.location}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-slate-400">{dateStr}</span>
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
                                View in Visits
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
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  placeholder="e.g. Cardiology follow-up summary"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Date</label>
                  <input
                    type="date"
                    value={noteForm.date}
                    onChange={(e) => setNoteForm({ ...noteForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Related Doctor</label>
                  <select
                    value={noteForm.doctor_id}
                    onChange={(e) => setNoteForm({ ...noteForm, doctor_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">None / General</option>
                    {existingDoctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                      {v.date ? new Date(v.date).toLocaleDateString() : ""} - {v.doctor || v.title}
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
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Select Doctor</label>
                  <select
                    value={letterForm.doctor_id}
                    onChange={(e) => setLetterForm({ ...letterForm, doctor_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">Other / Enter manually</option>
                    {existingDoctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Doctor / Clinic Name</label>
                  <input
                    type="text"
                    value={letterForm.doctor_name}
                    onChange={(e) => setLetterForm({ ...letterForm, doctor_name: e.target.value })}
                    placeholder="e.g. Dr. Adams or General Hospital"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Date</label>
                  <input
                    type="date"
                    value={letterForm.date}
                    onChange={(e) => setLetterForm({ ...letterForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Direction</label>
                  <select
                    value={letterForm.direction}
                    onChange={(e) => setLetterForm({ ...letterForm, direction: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="received">Received</option>
                    <option value="sent">Sent</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Status</label>
                  <select
                    value={letterForm.status}
                    onChange={(e) => setLetterForm({ ...letterForm, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="needed">Needed</option>
                    <option value="requested">Requested</option>
                    <option value="received">Received</option>
                    <option value="sent">Sent</option>
                  </select>
                </div>
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
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Link to My Doctors (Optional)
                  </label>
                  <select
                    value={referralForm.doctor_id}
                    onChange={(e) => {
                      const docId = e.target.value
                      const doc = existingDoctors.find((d) => d.id === docId)
                      setReferralForm({
                        ...referralForm,
                        doctor_id: docId,
                        specialist_name: doc?.name || referralForm.specialist_name,
                        specialty: doc?.specialty || referralForm.specialty,
                        phone: doc?.phone || referralForm.phone,
                      })
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">Not in My Doctors</option>
                    {existingDoctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialty || "Specialist"})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Specialist Name *</label>
                  <input
                    type="text"
                    required
                    value={referralForm.specialist_name}
                    onChange={(e) => setReferralForm({ ...referralForm, specialist_name: e.target.value })}
                    placeholder="e.g. Dr. Robert Chen"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Specialty</label>
                  <input
                    type="text"
                    value={referralForm.specialty}
                    onChange={(e) => setReferralForm({ ...referralForm, specialty: e.target.value })}
                    placeholder="e.g. Dermatology, Neurology"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
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

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Referred By</label>
                  <select
                    value={referralForm.referred_by_doctor_id}
                    onChange={(e) => setReferralForm({ ...referralForm, referred_by_doctor_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">Select Doctor</option>
                    {existingDoctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Date</label>
                  <input
                    type="date"
                    value={referralForm.date}
                    onChange={(e) => setReferralForm({ ...referralForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Status</label>
                  <select
                    value={referralForm.status}
                    onChange={(e) => setReferralForm({ ...referralForm, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="needed">Needed</option>
                    <option value="requested">Requested</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="seen">Seen</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Reason for Referral</label>
                <input
                  type="text"
                  value={referralForm.reason}
                  onChange={(e) => setReferralForm({ ...referralForm, reason: e.target.value })}
                  placeholder="e.g. Annual skin check, MRI evaluation..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

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
      {/* MODAL: PIN LOCK SETTINGS                                       */}
      {/* ============================================================== */}
      {pinModalOpen && (
        <DoctorVisitPinModal
          isOpen={pinModalOpen}
          mode={pinModalMode}
          onSuccess={() => {
            setPinModalOpen(false)
            setIsUnlocked(true)
          }}
          onClose={() => setPinModalOpen(false)}
          theme={theme}
        />
      )}
    </div>
  )
}
