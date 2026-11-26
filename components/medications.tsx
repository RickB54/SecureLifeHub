"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Plus, Edit, Trash, Download, Search, Bell, Calendar as CalendarIcon, Clock, Activity, Pill, AlertCircle, Check, X, MessageSquare, Send, ChevronLeft, ChevronRight, ChevronDown, Sparkles, Circle, Droplets, Square, Hexagon, Package, Loader2, FileText, MapPin, Triangle, Wind, Thermometer, Shield, Heart, Printer, FileDown, HelpCircle, Minimize, Info, RotateCcw, FolderCog, Tag, ExternalLink, RefreshCw } from "lucide-react"
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, startOfDay, endOfDay, eachHourOfInterval, addWeeks, subWeeks, addMonths, subMonths, parse, addHours } from "date-fns"
import { toast } from 'sonner'
import { fetchOfficialDrugLabels, trimLabelPreview, type OfficialDrugLabel } from '@/lib/drug-database'
import {
    DoctorCombobox,
    FacilityCombobox,
    FieldSuggestionInput,
    extractDoctorsFromRecords,
    extractFacilitiesFromRecords,
    extractHealthSuggestions,
    findSingleLinkedFacility,
} from './health-ui/health-field-helpers'
import { SmartSelect } from './health-ui/smart-select'
import { upsertSharedHealthRecord, removeSharedHealthRecord, resolveDoctorInfo } from '@/lib/health-store'
import MedicationDetailView from './health-ui/medication-detail-view'
import { MedicationAiAssistantPanel } from './health-ui/medication-ai-assistant'
import { HealthTooltip, FieldHelpPopover } from './health-ui/health-tooltip'
import {
    MedicationCategorySelect,
    ManageCategoriesModal,
    MedicationExportModal,
} from './health-ui/medication-export-modal'
import {
    UNCATEGORIZED_MED_CATEGORY,
    formatMedDateOnly,
    parseMedLocalDate,
    getAllMedicationCategories,
    getMedCategory,
    loadSavedCustomMedCategories,
    saveCustomMedCategories,
} from '@/lib/medication-export'
import {
    isMedTracked,
    isMedAsNeeded,
    calculatePillCountEstimate,
    getCountBaselineDateForOption,
    getDefaultReminderForFrequency,
    getEffectiveReminderTimes,
    getScheduledNextDose,
    formatReminderTime12h,
    isMedLowStockCalculated as isMedLowStock,
    type CountStartOption,
} from '@/lib/pill-count'

// Horizontally stretched oval / ellipse icon (not capsule style)
export const OvalIcon = ({ className = "h-4 w-4", style, fill, stroke, strokeWidth }: any) => (
    <svg
        viewBox="0 0 24 24"
        fill={fill || "none"}
        stroke={stroke || "currentColor"}
        strokeWidth={strokeWidth ?? 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
    >
        <ellipse cx="12" cy="12" rx="10" ry="5.5" />
    </svg>
)

// Pill shapes and their icon components
export const PILL_SHAPES = [
    { id: 'round', label: 'Round Pill', icon: Circle },
    { id: 'capsule', label: 'Capsule', icon: Pill },
    { id: 'oval', label: 'Oval Tablet', icon: OvalIcon },
    { id: 'liquid', label: 'Liquid', icon: Droplets },
    { id: 'spray', label: 'Spray', icon: Droplets },
    { id: 'inhaler', label: 'Inhaler', icon: Package },
    { id: 'triangle', label: 'Triangle', icon: Triangle },
    { id: 'hexagon', label: 'Hexagon', icon: Hexagon },
    { id: 'star', label: 'Star', icon: Sparkles },
    { id: 'diamond', label: 'Diamond', icon: MapPin },
]

export const normalizePillShape = (shape?: string): string => {
    if (!shape) return 'round'
    if (shape === 'oblong') return 'oval'
    return shape
}

// Common pill colors
const PILL_COLORS = [
    { id: 'white', label: 'White', hex: '#FFFFFF' },
    { id: 'yellow', label: 'Yellow', hex: '#FFD700' },
    { id: 'orange', label: 'Orange', hex: '#FF8C00' },
    { id: 'pink', label: 'Pink', hex: '#FF69B4' },
    { id: 'red', label: 'Red', hex: '#FF4444' },
    { id: 'blue', label: 'Blue', hex: '#4169E1' },
    { id: 'green', label: 'Green', hex: '#32CD32' },
    { id: 'purple', label: 'Purple', hex: '#9370DB' },
    { id: 'brown', label: 'Brown', hex: '#A0522D' },
    { id: 'black', label: 'Black', hex: '#2F2F2F' },
]

interface MedicationsProps {
    records: any[]
    addItem: (item: any) => Promise<any>
    updateItem: (id: string, updates: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
    onOpenHelp?: (targetId?: string) => void
}

export default function Medications({ records, addItem, updateItem, deleteItem, theme, onOpenHelp }: MedicationsProps) {
    const { user } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const activeMedId = searchParams.get("medId")
    const savedDoctors = useMemo(() => extractDoctorsFromRecords(records), [records])
    const savedFacilities = useMemo(() => extractFacilitiesFromRecords(records), [records])
    const [refillMed, setRefillMed] = useState<any>(null)
    const [refillCount, setRefillCount] = useState<string>("")
    const [searchQuery, setSearchQuery] = useState("")
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedMed, setSelectedMed] = useState<any>(null)
    const [showQuickAI, setShowQuickAI] = useState(false)
    const [showPillLibrary, setShowPillLibrary] = useState(false)
    const [showMockDrugs, setShowMockDrugs] = useState(false)
    const [showMedSummary, setShowMedSummary] = useState(false) // NEW: Medication summary for doctor
    const [showRescheduleModal, setShowRescheduleModal] = useState(false) // NEW: Reschedule modal
    const [rescheduleDate, setRescheduleDate] = useState("")
    const [rescheduleTime, setRescheduleTime] = useState("")
    const [aiQuestion, setAiQuestion] = useState("")
    const [aiResponse, setAiResponse] = useState("")
    const [showDrugInfo, setShowDrugInfo] = useState(false)
    const [drugLabels, setDrugLabels] = useState<OfficialDrugLabel[]>([])
    const [selectedLabelIdx, setSelectedLabelIdx] = useState(0)
    const [drugLookupTarget, setDrugLookupTarget] = useState("")
    const [drugLookupGeneric, setDrugLookupGeneric] = useState("")
    const [drugLookupSourceMed, setDrugLookupSourceMed] = useState<any>(null)
    const [drugLookupError, setDrugLookupError] = useState<string | null>(null)
    const [expandedLabelSections, setExpandedLabelSections] = useState<Record<string, boolean>>({})
    const [showFillPreview, setShowFillPreview] = useState(false)
    const [fillChecked, setFillChecked] = useState<{
        genericName: boolean
        drugClass: boolean
        purpose: boolean
        sideEffects: boolean
        interactions: boolean
    }>({
        genericName: true,
        drugClass: true,
        purpose: true,
        sideEffects: true,
        interactions: true,
    })
    const [prefillTarget, setPrefillTarget] = useState<any>(null)
    const [loadingDrugInfo, setLoadingDrugInfo] = useState(false)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<"list" | "timeline">("list")
    const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("day")
    const [showFullTimeline, setShowFullTimeline] = useState(false) // NEW: Toggle full timeline view
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const [customCategories, setCustomCategories] = useState<string[]>([])
    const [showManageCategories, setShowManageCategories] = useState(false)
    const [exportModalState, setExportModalState] = useState<{ open: boolean; singleMed: any | null }>({
        open: false,
        singleMed: null,
    })

    useEffect(() => {
        setCustomCategories(loadSavedCustomMedCategories())
    }, [])

    // Global handler for triggering Import Rx from child modals
    useEffect(() => {
        (window as any).showMockDrugModalFromAddMed = () => {
            setShowAddModal(false);
            setShowEditModal(false);
            setShowMockDrugs(true);
        }
    }, [])

    // Official FDA / DailyMed Drug Label Lookup (runs ONLY when user taps button; 7-day browser localStorage cache)
    const runDrugLabelQuery = async (medName: string, genericName = "", bypassCache = false) => {
        const cleanName = (medName || "").trim()
        const cleanGen = (genericName || "").trim()
        if (!cleanName && !cleanGen) {
            toast.error("Please enter a medication name to look up.")
            return
        }
        setDrugLookupTarget(cleanName || cleanGen)
        setDrugLookupGeneric(cleanGen)
        setShowDrugInfo(true)
        setLoadingDrugInfo(true)
        setDrugLookupError(null)
        setExpandedLabelSections({})
        setShowFillPreview(false)
        setSelectedLabelIdx(0)

        try {
            const res = await fetchOfficialDrugLabels(cleanName, cleanGen, bypassCache)
            setDrugLabels(res.labels || [])
        } catch (error: any) {
            console.error("FDA label lookup error:", error)
            setDrugLabels([])
            setDrugLookupError(error?.message || "Unable to reach official FDA label directory.")
        } finally {
            setLoadingDrugInfo(false)
        }
    }

    const handleDrugLookup = async (medName: string, genericName = "", sourceMed: any = null) => {
        setDrugLookupSourceMed(sourceMed ?? (showEditModal ? selectedMed : null))
        await runDrugLabelQuery(medName, genericName, false)
    }

    const activeDrugLabel: OfficialDrugLabel | null = drugLabels[selectedLabelIdx] || null

    const getCondensedFieldSnippet = (text: string, maxLen = 450) => {
        const clean = (text || "").trim()
        if (!clean) return ""
        if (clean.length <= maxLen) return clean
        const slice = clean.slice(0, maxLen)
        const dotIdx = slice.lastIndexOf(". ")
        if (dotIdx > maxLen * 0.45) return slice.slice(0, dotIdx + 1).trim()
        const spaceIdx = slice.lastIndexOf(" ")
        return `${(spaceIdx > maxLen * 0.6 ? slice.slice(0, spaceIdx) : slice).trim()}…`
    }

    const openFillFieldsPreview = (label: OfficialDrugLabel) => {
        setFillChecked({
            genericName: Boolean(label.genericName),
            drugClass: Boolean(label.drugClass),
            purpose: Boolean(label.usesText),
            sideEffects: Boolean(label.sideEffectsText),
            interactions: Boolean(label.interactionsText),
        })
        setShowFillPreview(true)
    }

    const handleApproveFillFields = () => {
        if (!activeDrugLabel) return

        const approvedFields: Record<string, string> = {}
        if (fillChecked.genericName && activeDrugLabel.genericName) {
            approvedFields.genericName = activeDrugLabel.genericName
        }
        if (fillChecked.drugClass && activeDrugLabel.drugClass) {
            approvedFields.drugClass = activeDrugLabel.drugClass
        }
        if (fillChecked.purpose && activeDrugLabel.usesText) {
            approvedFields.purpose = getCondensedFieldSnippet(activeDrugLabel.usesText, 380)
        }
        if (fillChecked.sideEffects && activeDrugLabel.sideEffectsText) {
            approvedFields.sideEffects = getCondensedFieldSnippet(activeDrugLabel.sideEffectsText, 600)
        }
        if (fillChecked.interactions && activeDrugLabel.interactionsText) {
            approvedFields.interactions = getCondensedFieldSnippet(activeDrugLabel.interactionsText, 600)
        }

        if (Object.keys(approvedFields).length === 0) {
            toast.error("Select at least one field to fill.")
            return
        }

        // NEVER saves or creates a medication record by itself:
        // - If Add or Edit form is already open, fill only approved fields into that open form.
        // - If opened from an existing medication card or Detail screen, open EDIT for that exact medication (never Add!).
        if (!showAddModal && !showEditModal) {
            const targetExisting = drugLookupSourceMed || selectedMed
            if (targetExisting) {
                setSelectedMed(targetExisting)
                setShowEditModal(true)
            } else {
                setShowAddModal(true)
            }
        }

        setPrefillTarget({
            token: Date.now(),
            fields: approvedFields,
        })
        setShowFillPreview(false)
        setShowDrugInfo(false)
        toast.success("Selected label fields copied into form — click Update/Add Medication to save.")
    }

    // Filter medications - MUST use useMemo to re-run when records change!
    const medRecords = useMemo(() => {
        console.log("🔄 Re-filtering medications, records count:", records.length)

        const filtered = records.filter(r => {
            // Expanded logic to ensure imported precriptions are found
            const specificNames = ["Hydroxyzine", "Prednisone", "Loratadine", "Famotidine"];
            const isSpecificMed = specificNames.some(name => r.title?.includes(name));

            const isMed = Boolean(r.item_metadata?.is_medication) ||
                (r.category && r.category.toLowerCase() === "medications") ||
                (r.type && r.type.toLowerCase() === "medication") ||
                (r.type === "note" && r.category === "Medications") ||
                // Catch imported prescriptions explicitly
                (r.item_metadata?.notes === "Imported Prescription") ||
                (typeof r.item_metadata?.notes === "string" && (
                    r.item_metadata.notes.includes("Pill Library") ||
                    r.item_metadata.notes.startsWith("Imported from ")
                )) ||
                isSpecificMed

            return isMed
        })

        return filtered
    }, [records]) // Re-run whenever records changes!

    const allMedCategories = useMemo(
        () => getAllMedicationCategories(medRecords, customCategories),
        [medRecords, customCategories]
    )

    // Helper: Calculate next dose date based on reminders and frequency
    const calculateNextDose = (med: any, fromDate = new Date(), isTakeAction = false) => {
        const metadata = med.item_metadata || {}
        const scheduled = getScheduledNextDose(metadata, fromDate, isTakeAction)
        if (scheduled) return scheduled

        const frequency = (metadata.frequency || "").toLowerCase()
        if (!frequency || frequency.includes("as needed") || frequency === "prn") {
            return ""
        }
        if (frequency.includes("every other day")) return addDays(fromDate, 2).toISOString()
        if (frequency.includes("weekly")) return addDays(fromDate, 7).toISOString()
        if (frequency.includes("twice") || frequency === "bid") return addHours(fromDate, 12).toISOString()
        if (frequency.includes("three") || frequency === "tid") return addHours(fromDate, 8).toISOString()
        if (frequency.includes("four") || frequency === "qid") return addHours(fromDate, 6).toISOString()
        return addDays(fromDate, 1).toISOString()
    }

    // Helper: Get dose for current day based on schedule + reminder times
    const getCurrentDose = (med: any) => {
        const schedule = med.item_metadata?.doseSchedule || []
        const startDateStr = med.item_metadata?.scheduleStartDate || med.created_at || med.item_metadata?.createdAt
        const reminderTimes = getEffectiveReminderTimes(med.item_metadata)
        const timeSuffix = reminderTimes.length > 0
            ? ` at ${reminderTimes.map(r => formatReminderTime12h(r.hh, r.mm)).join(", ")}`
            : ""

        if (schedule.length === 0 || !startDateStr) {
            return `${med.item_metadata?.dosage || "As directed"}${timeSuffix}`
        }

        try {
            const parsedStart = parseMedLocalDate(startDateStr) || new Date(startDateStr)
            const start = startOfDay(parsedStart)
            const today = startOfDay(new Date())

            const diffInMs = today.getTime() - start.getTime()
            const dayIndex = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
            const entry = schedule.find((s: any) => s.dayIndex === dayIndex + 1)

            if (entry) {
                return `${entry.quantity} pill(s)${timeSuffix}`
            }

            return `${med.item_metadata?.dosage || "As directed"}${timeSuffix}`
        } catch (e) {
            return `${med.item_metadata?.dosage || "As directed"}${timeSuffix}`
        }
    }

    // Helper: Get numeric dose quantity for inventory subtraction
    const getCurrentDoseQuantity = (med: any) => {
        const schedule = med.item_metadata?.doseSchedule || []
        const startDateStr = med.item_metadata?.scheduleStartDate || med.created_at || med.item_metadata?.createdAt

        if (schedule.length === 0 || !startDateStr) return 1

        try {
            const parsedStart = parseMedLocalDate(startDateStr) || new Date(startDateStr)
            const start = startOfDay(parsedStart)
            const today = startOfDay(new Date())
            const diffInMs = today.getTime() - start.getTime()
            const dayIndex = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
            const entry = schedule.find((s: any) => s.dayIndex === dayIndex + 1)
            return entry ? parseFloat(entry.quantity) || 1 : 1
        } catch (e) {
            return 1
        }
    }

    // Reminder Logic
    const [activeReminder, setActiveReminder] = useState<any>(null)
    const [lastReminderTime, setLastReminderTime] = useState<string>("")

    useEffect(() => {
        const checkReminders = () => {
            const now = new Date()
            const currentTime = format(now, "HH:mm")

            // Avoid multiple triggers in the same minute
            if (currentTime === lastReminderTime) return

            medRecords.forEach(med => {
                if (med.item_metadata?.reminders?.includes(currentTime)) {
                    setActiveReminder(med)
                    setLastReminderTime(currentTime)

                    // Play 3 LOUD beeps using Web Audio API (no external files!)
                    try {
                        const playBeeps = () => {
                            // Create audio context
                            const AudioContext = window.AudioContext || (window as any).webkitAudioContext
                            const audioContext = new AudioContext()

                            let currentBeep = 0

                            const playBeep = () => {
                                if (currentBeep >= 3) {
                                    audioContext.close()
                                    return
                                }

                                // Create oscillator (tone generator)
                                const oscillator = audioContext.createOscillator()
                                const gainNode = audioContext.createGain()

                                oscillator.connect(gainNode)
                                gainNode.connect(audioContext.destination)

                                // Set beep properties
                                oscillator.frequency.value = 800 // 800 Hz - high pitched beep
                                oscillator.type = 'sine'

                                // Set volume
                                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
                                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

                                // Play beep for 0.5 seconds
                                oscillator.start(audioContext.currentTime)
                                oscillator.stop(audioContext.currentTime + 0.5)

                                currentBeep++

                                // Schedule next beep
                                if (currentBeep < 3) {
                                    setTimeout(playBeep, 700) // Wait 700ms between beeps
                                }
                            }

                            playBeep()
                        }

                        playBeeps()
                    } catch (e) {
                        console.error("Audio play failed", e)
                        // Fallback: Browser notification
                        if ("Notification" in window && Notification.permission === "granted") {
                            new Notification(`💊 Medication Reminder`, {
                                body: `Time to take ${med.title}`,
                                icon: "/pill-icon.png"
                            })
                        }
                    }
                }
            })
        }

        const interval = setInterval(checkReminders, 5000) // Check every 5 sec
        return () => clearInterval(interval)
    }, [medRecords, lastReminderTime])

    const handleCreateCustomCategory = (rawName: string) => {
        const clean = rawName.trim()
        if (!clean || clean.toLowerCase() === UNCATEGORIZED_MED_CATEGORY.toLowerCase()) return
        setCustomCategories((prev) => {
            if (prev.some((p) => p.toLowerCase() === clean.toLowerCase())) return prev
            const next = [...prev, clean]
            saveCustomMedCategories(next)
            return next
        })
    }

    const handleRenameCategory = async (oldName: string, newName: string) => {
        const cleanNew = newName.trim()
        if (!cleanNew || cleanNew === oldName) return

        // Persist new custom category name & replace old custom entry if present
        setCustomCategories((prev) => {
            const filtered = prev.filter((c) => c.toLowerCase() !== oldName.toLowerCase() && c.toLowerCase() !== cleanNew.toLowerCase())
            const next = [...filtered, cleanNew]
            saveCustomMedCategories(next)
            return next
        })

        // Update every medication currently using oldName
        const matching = medRecords.filter((m) => getMedCategory(m).toLowerCase() === oldName.toLowerCase())
        await Promise.all(
            matching.map(async (m) => {
                const updatedMeta = {
                    ...m.item_metadata,
                    category: cleanNew,
                    lastModified: new Date().toISOString(),
                }
                await updateItem(m.id, { item_metadata: updatedMeta })
                upsertSharedHealthRecord({ ...m, item_metadata: updatedMeta })
            })
        )

        if (categoryFilter.toLowerCase() === oldName.toLowerCase()) {
            setCategoryFilter(cleanNew)
        }
        toast.success(`Renamed "${oldName}" to "${cleanNew}" (${matching.length} medication${matching.length === 1 ? "" : "s"} updated)`)
    }

    const handleDeleteCategory = async (catName: string) => {
        setCustomCategories((prev) => {
            const next = prev.filter((c) => c.toLowerCase() !== catName.toLowerCase())
            saveCustomMedCategories(next)
            return next
        })

        const matching = medRecords.filter((m) => getMedCategory(m).toLowerCase() === catName.toLowerCase())
        await Promise.all(
            matching.map(async (m) => {
                const updatedMeta = {
                    ...m.item_metadata,
                    category: "",
                    lastModified: new Date().toISOString(),
                }
                await updateItem(m.id, { item_metadata: updatedMeta })
                upsertSharedHealthRecord({ ...m, item_metadata: updatedMeta })
            })
        )

        if (categoryFilter.toLowerCase() === catName.toLowerCase()) {
            setCategoryFilter("all")
        }
        toast.success(`Removed "${catName}" — ${matching.length} medication${matching.length === 1 ? "" : "s"} moved to Uncategorized`)
    }

    const handleUpdateExistingMedCategory = async (med: any, newCategory: string) => {
        const cleanCat = (newCategory || "").trim()
        if (cleanCat) handleCreateCustomCategory(cleanCat)
        const updatedMeta = {
            ...med.item_metadata,
            is_medication: true,
            category: cleanCat,
            lastModified: new Date().toISOString(),
        }
        await updateItem(med.id, { item_metadata: updatedMeta })
        upsertSharedHealthRecord({ ...med, item_metadata: updatedMeta })
    }

    // Filter by search + category
    const filteredMeds = medRecords.filter(med => {
        const q = searchQuery.toLowerCase().trim()
        const matchesSearch = !q ||
            med.title?.toLowerCase().includes(q) ||
            med.item_metadata?.dosage?.toLowerCase().includes(q) ||
            med.item_metadata?.genericName?.toLowerCase().includes(q) ||
            med.item_metadata?.purpose?.toLowerCase().includes(q) ||
            getMedCategory(med).toLowerCase().includes(q)

        if (!matchesSearch) return false
        if (categoryFilter === "all") return true
        return getMedCategory(med) === categoryFilter
    })

    // Get upcoming reminders (meds due today)
    const upcomingReminders = medRecords.filter(med => {
        const liveNext = getScheduledNextDose(med.item_metadata) || med.item_metadata?.nextDose
        if (!liveNext) return false
        const nextDose = new Date(liveNext)
        const today = new Date()
        return isSameDay(nextDose, today)
    })

    const handleAddMed = async (formData: any) => {
        try {
            if (formData.category && formData.category.trim()) {
                handleCreateCustomCategory(formData.category.trim())
            }
            const res = await addItem({
                type: "note", // Changed from "medication" to comply with database constraint
                category: "Medications",
                title: formData.name || "Untitled Medication",
                item_metadata: {
                    is_medication: true,
                    category: formData.category?.trim() || "",
                    dosage: formData.dosage || "As directed",
                    dosageForm: formData.dosageForm?.trim() || "",
                    frequency: formData.frequency || "",
                    prescribedBy: formData.prescribedBy || "",
                    doctor_id: formData.doctor_id || null,
                    facility_id: formData.facility_id || null,
                    facility_name: formData.facility_name || "",
                    pharmacy: formData.pharmacy || "",
                    pharmacyPhone: formData.pharmacyPhone?.trim() || "",
                    pharmacyAddress: formData.pharmacyAddress?.trim() || "",
                    rxNumber: formData.rxNumber?.trim() || "",
                    refillsRemaining: formData.refillsRemaining !== undefined && formData.refillsRemaining !== null ? String(formData.refillsRemaining).trim() : "",
                    lastFilledDate: formData.lastFilledDate || "",
                    purpose: formData.purpose || "",
                    genericName: formData.genericName || "",
                    drugClass: formData.drugClass || "",
                    sideEffects: formData.sideEffects || "",
                    interactions: formData.interactions || "",
                    rxInstructions: formData.rxInstructions || "",
                    refillDate: formData.refillDate || "",
                    nextDose: calculateNextDose({ item_metadata: formData }),
                    pillShape: normalizePillShape(formData.pillShape),
                    pillColor: formData.pillColor || "#FFFFFF",
                    trackInventory: Boolean(formData.trackInventory),
                    pillsPerDose: parseFloat(formData.pillsPerDose) || 1,
                    lowStockThreshold: isNaN(parseInt(String(formData.lowStockThreshold), 10)) ? 5 : parseInt(String(formData.lowStockThreshold), 10),
                    quantity: formData.trackInventory ? (parseFloat(String(formData.quantity)) || 0) : 0,
                    totalQuantity: formData.trackInventory ? (parseFloat(String(formData.totalQuantity)) || 0) : 0,
                    countStartOption: (formData.countStartOption || "now") as CountStartOption,
                    countBaseline: formData.trackInventory ? (parseFloat(String(formData.quantity)) || 0) : 0,
                    countBaselineDate: formData.trackInventory
                        ? getCountBaselineDateForOption((formData.countStartOption || "now") as CountStartOption)
                        : null,
                    reminders: (formData.reminders || []).filter((r: any) => r && typeof r === 'string' && r.trim() !== ""),
                    takenLog: [],
                    skippedLog: [],
                    notes: formData.notes || "",
                    doseSchedule: formData.doseSchedule || [],
                    startDate: formData.startDate || format(new Date(), 'yyyy-MM-dd'),
                    endDate: formData.endDate || "",
                    scheduleStartDate: formData.scheduleStartDate || format(new Date(), 'yyyy-MM-dd'),
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString()
                }
            })
            if (!res) {
                throw new Error("Unable to save medication to your vault. Please verify your connection.")
            }
            upsertSharedHealthRecord(res)
            setShowAddModal(false)
            setPrefillTarget(null)
            return true
        } catch (error: any) {
            console.error("handleAddMed error:", error)
            throw error
        }
    }

    const handleEditMed = async (formData: any) => {
        if (!selectedMed) throw new Error("No medication selected to update.")
        if (formData.category && formData.category.trim()) {
            handleCreateCustomCategory(formData.category.trim())
        }
        const shouldResetBaseline =
            Boolean(formData.quantityChanged) ||
            Boolean(formData.countStartChanged) ||
            !selectedMed?.item_metadata?.countBaselineDate
        const nextBaseline = formData.trackInventory
            ? (shouldResetBaseline
                ? (parseFloat(String(formData.quantity)) || 0)
                : (parseFloat(selectedMed?.item_metadata?.countBaseline) || parseFloat(String(formData.quantity)) || 0))
            : 0
        const nextBaselineDate = formData.trackInventory
            ? (shouldResetBaseline
                ? getCountBaselineDateForOption((formData.countStartOption || "now") as CountStartOption)
                : selectedMed?.item_metadata?.countBaselineDate)
            : null
        const parsedLowStock = parseInt(String(formData.lowStockThreshold), 10)
        const updatedMeta = {
            ...selectedMed.item_metadata,
            is_medication: true,
            category: formData.category?.trim() || "",
            dosage: formData.dosage || "As directed",
            dosageForm: formData.dosageForm?.trim() || "",
            frequency: formData.frequency || "",
            prescribedBy: formData.prescribedBy || "",
            doctor_id: formData.doctor_id || null,
            facility_id: formData.facility_id || null,
            facility_name: formData.facility_name || "",
            pharmacy: formData.pharmacy || "",
            pharmacyPhone: formData.pharmacyPhone?.trim() || "",
            pharmacyAddress: formData.pharmacyAddress?.trim() || "",
            rxNumber: formData.rxNumber?.trim() || "",
            refillsRemaining: formData.refillsRemaining !== undefined && formData.refillsRemaining !== null ? String(formData.refillsRemaining).trim() : "",
            lastFilledDate: formData.lastFilledDate || "",
            purpose: formData.purpose || "",
            genericName: formData.genericName || "",
            drugClass: formData.drugClass || "",
            sideEffects: formData.sideEffects || "",
            interactions: formData.interactions || "",
            rxInstructions: formData.rxInstructions || "",
            refillDate: formData.refillDate || "",
            nextDose: calculateNextDose({ item_metadata: formData }),
            pillShape: normalizePillShape(formData.pillShape),
            pillColor: formData.pillColor || "#FFFFFF",
            trackInventory: Boolean(formData.trackInventory),
            pillsPerDose: parseFloat(String(formData.pillsPerDose)) || 1,
            lowStockThreshold: isNaN(parsedLowStock) ? 5 : parsedLowStock,
            quantity: formData.trackInventory ? (parseFloat(String(formData.quantity)) || 0) : 0,
            totalQuantity: formData.trackInventory ? (parseFloat(String(formData.totalQuantity)) || 0) : 0,
            countStartOption: (formData.countStartOption || "now") as CountStartOption,
            countBaseline: nextBaseline,
            countBaselineDate: nextBaselineDate,
            reminders: (formData.reminders || []).filter((r: any) => r && typeof r === 'string' && r.trim() !== ""),
            doseSchedule: formData.doseSchedule || [],
            startDate: formData.startDate || format(new Date(), 'yyyy-MM-dd'),
            endDate: formData.endDate || "",
            scheduleStartDate: formData.scheduleStartDate || format(new Date(), 'yyyy-MM-dd'),
            notes: formData.notes || "",
            lastModified: new Date().toISOString()
        }
        try {
            const res = await updateItem(selectedMed.id, {
                title: formData.name || selectedMed.title,
                item_metadata: updatedMeta
            })
            if (res === false) {
                throw new Error("Unable to update medication in your vault. Please verify your connection.")
            }
            upsertSharedHealthRecord({
                ...selectedMed,
                title: formData.name || selectedMed.title,
                item_metadata: updatedMeta
            })
            setShowEditModal(false)
            setSelectedMed(null)
            setPrefillTarget(null)
            return true
        } catch (error: any) {
            console.error("handleEditMed error:", error)
            throw error
        }
    }

    const handleTakeMed = async (med: any, overrideTime?: string) => {
        const takenLog = med.item_metadata?.takenLog || []
        const tracked = isMedTracked(med.item_metadata)
        const asNeeded = isMedAsNeeded(med.item_metadata)
        const quantity = parseFloat(med.item_metadata?.quantity || "0")
        const timestamp = overrideTime || new Date().toISOString()
        const doseQty = getCurrentDoseQuantity(med)

        // Calculate next dose based on the time we took it
        const nextDoseTime = calculateNextDose(med, new Date(timestamp), true)

        const updatedMeta: any = {
            ...med.item_metadata,
            takenLog: [...takenLog, { timestamp, dosage: med.item_metadata?.dosage, doseQty }],
            lastTaken: timestamp,
            nextDose: nextDoseTime
        }
        // Only decrement stored quantity on Take for "as needed" meds;
        // scheduled meds already count each scheduled dose once via calculatePillCountEstimate.
        if (tracked && asNeeded) {
            const pillsStep = parseFloat(med.item_metadata?.pillsPerDose ?? doseQty ?? "1") || 1
            updatedMeta.quantity = Math.max(0, Math.round((quantity - pillsStep) * 100) / 100)
        }

        await updateItem(med.id, { item_metadata: updatedMeta })
        upsertSharedHealthRecord({ ...med, item_metadata: updatedMeta })
    }

    const handleConfirmRefill = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!refillMed) return
        const newCount = parseFloat(refillCount)
        if (isNaN(newCount) || newCount < 0) {
            toast.error("Please enter a valid pill count")
            return
        }
        try {
            const nowIso = new Date().toISOString()
            const updatedMeta = {
                ...refillMed.item_metadata,
                trackInventory: true,
                quantity: newCount,
                totalQuantity: Math.max(newCount, parseFloat(refillMed.item_metadata?.totalQuantity || "0") || 0),
                countBaseline: newCount,
                countBaselineDate: nowIso,
                lastModified: nowIso,
            }
            const res = await updateItem(refillMed.id, { item_metadata: updatedMeta })
            if (res === false) throw new Error("Failed to save refill")
            upsertSharedHealthRecord({ ...refillMed, item_metadata: updatedMeta })
            toast.success(`Refill saved — baseline reset to ${newCount}`)
            setRefillMed(null)
            setRefillCount("")
        } catch (err: any) {
            toast.error(err?.message || "Failed to save refill")
        }
    }


    const handleSkipMed = async (med: any) => {
        const skippedLog = med.item_metadata?.skippedLog || []
        const updatedMeta = {
            ...med.item_metadata,
            skippedLog: [...skippedLog, { timestamp: new Date().toISOString(), reason: "Skipped" }]
        }

        await updateItem(med.id, { item_metadata: updatedMeta })
        upsertSharedHealthRecord({ ...med, item_metadata: updatedMeta })

        // Visual feedback
        toast.success(`✓ Skipped ${med.title}`)
    }

    const handleDeleteAdherenceLog = async (med: any, logType: "taken" | "skipped", index: number) => {
        if (!confirm(`Remove this ${logType === "taken" ? "Taken" : "Skipped"} log entry?`)) return
        const meta = med.item_metadata || {}
        const takenLog = Array.isArray(meta.takenLog) ? [...meta.takenLog] : []
        const skippedLog = Array.isArray(meta.skippedLog) ? [...meta.skippedLog] : []

        if (logType === "taken") {
            if (index < 0 || index >= takenLog.length) return
            takenLog.splice(index, 1)
        } else {
            if (index < 0 || index >= skippedLog.length) return
            skippedLog.splice(index, 1)
        }

        const latestTaken = takenLog.length > 0
            ? takenLog
                .map((e: any) => e?.timestamp || e)
                .filter(Boolean)
                .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime())[0] || null
            : null

        const updatedMeta: any = {
            ...meta,
            takenLog,
            skippedLog,
            lastTaken: latestTaken,
        }

        // For as-needed tracked meds only, restore pill count when undoing a Taken entry
        if (logType === "taken" && isMedTracked(meta) && isMedAsNeeded(meta)) {
            const pillsStep = parseFloat(meta.pillsPerDose ?? "1") || 1
            const currentQty = parseFloat(meta.quantity ?? "0") || 0
            updatedMeta.quantity = Math.round((currentQty + pillsStep) * 100) / 100
        }

        updatedMeta.nextDose = calculateNextDose({ item_metadata: updatedMeta })

        await updateItem(med.id, { item_metadata: updatedMeta })
        upsertSharedHealthRecord({ ...med, item_metadata: updatedMeta })
        toast.success("Dose log entry removed")
    }

    const handleResetDoseStatus = async (med: any) => {
        const meta = med.item_metadata || {}
        const takenLog = Array.isArray(meta.takenLog) ? [...meta.takenLog] : []
        const skippedLog = Array.isArray(meta.skippedLog) ? [...meta.skippedLog] : []
        if (takenLog.length === 0 && skippedLog.length === 0) return

        if (!confirm(`Reset dose status for ${med.title} back to "Not taken"?`)) return

        const today = new Date()
        const isTodayEntry = (entry: any) => {
            const ts = entry?.timestamp || entry
            if (!ts) return false
            const d = new Date(ts)
            return !isNaN(d.getTime()) && isSameDay(d, today)
        }

        const todayTakenCount = takenLog.filter(isTodayEntry).length
        const todaySkippedCount = skippedLog.filter(isTodayEntry).length

        let nextTakenLog = takenLog
        let nextSkippedLog = skippedLog
        let removedTakenCount = 0

        if (todayTakenCount > 0 || todaySkippedCount > 0) {
            nextTakenLog = takenLog.filter((e) => !isTodayEntry(e))
            nextSkippedLog = skippedLog.filter((e) => !isTodayEntry(e))
            removedTakenCount = todayTakenCount
        } else {
            // No entries today — remove the single most recent entry across taken/skipped
            const lastTakenTs = takenLog.length > 0 ? new Date(takenLog[takenLog.length - 1]?.timestamp || takenLog[takenLog.length - 1] || 0).getTime() : -1
            const lastSkippedTs = skippedLog.length > 0 ? new Date(skippedLog[skippedLog.length - 1]?.timestamp || skippedLog[skippedLog.length - 1] || 0).getTime() : -1
            if (lastTakenTs >= lastSkippedTs && takenLog.length > 0) {
                nextTakenLog = takenLog.slice(0, -1)
                removedTakenCount = 1
            } else if (skippedLog.length > 0) {
                nextSkippedLog = skippedLog.slice(0, -1)
            }
        }

        const latestTaken = nextTakenLog.length > 0
            ? nextTakenLog
                .map((e: any) => e?.timestamp || e)
                .filter(Boolean)
                .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime())[0] || null
            : null

        const updatedMeta: any = {
            ...meta,
            takenLog: nextTakenLog,
            skippedLog: nextSkippedLog,
            lastTaken: latestTaken,
        }

        if (removedTakenCount > 0 && isMedTracked(meta) && isMedAsNeeded(meta)) {
            const pillsStep = parseFloat(meta.pillsPerDose ?? "1") || 1
            const currentQty = parseFloat(meta.quantity ?? "0") || 0
            updatedMeta.quantity = Math.round((currentQty + pillsStep * removedTakenCount) * 100) / 100
        }

        updatedMeta.nextDose = calculateNextDose({ item_metadata: updatedMeta })

        await updateItem(med.id, { item_metadata: updatedMeta })
        upsertSharedHealthRecord({ ...med, item_metadata: updatedMeta })
        toast.success(`Reset ${med.title} to Not taken`)
    }

    const openRescheduleModal = (med: any) => {
        setSelectedMed(med)
        const now = new Date()
        setRescheduleDate(format(now, 'yyyy-MM-dd'))
        setRescheduleTime(format(now, 'HH:mm'))
        setShowRescheduleModal(true)
    }

    const handleRescheduleMed = async () => {
        if (!selectedMed || !rescheduleDate || !rescheduleTime) return

        const newDateTime = new Date(`${rescheduleDate}T${rescheduleTime}`)
        const newTimeString = format(newDateTime, 'HH:mm') // e.g., "18:28"

        // Get existing reminders and add the new time
        const existingReminders = selectedMed.item_metadata?.reminders || []
        const updatedReminders = [...existingReminders, newTimeString]

        await updateItem(selectedMed.id, {
            item_metadata: {
                ...selectedMed.item_metadata,
                nextDose: newDateTime.toISOString(),
                reminders: updatedReminders // Add to reminders array so alarm will trigger
            }
        })

        setShowRescheduleModal(false)
        toast.success(`✓ ${selectedMed.title} rescheduled to ${format(newDateTime, 'PPp')}`)
    }

    const handleAIQuestion = async () => {
        if (!aiQuestion.trim()) return

        const medContext = selectedMed ? `\n\nContext: You are viewing ${selectedMed.title} (${selectedMed.item_metadata?.dosage})` : ""
        const response = `**AI Medical Assistant**

**Question:** ${aiQuestion}${medContext}

**Answer:** [AI Response - In production, this connects to medical AI API]

${selectedMed ? `
**${selectedMed.title} Information:**
- **Purpose:** ${selectedMed.item_metadata?.purpose || "Not specified"}
- **Dosage:** ${selectedMed.item_metadata?.dosage}
- **Common Side Effects:** ${selectedMed.item_metadata?.sideEffects || "Consult your doctor"}
- **Warnings:** Always follow prescribed dosage. Do not exceed.
- **Storage:** Store at room temperature away from moisture and heat.
` : ""}

**Medical Guidance:**
- Consult your healthcare provider for personalized advice
- Report severe side effects immediately
- Never mix medications without professional guidance`

        setAiResponse(response)
        setAiQuestion("")
    }

    // Get pill icon and color
    const getPillIcon = (med: any, sizeClass = "h-7 w-7") => {
        const shapeId = normalizePillShape(med.item_metadata?.pillShape)
        const colorHex = med.item_metadata?.pillColor || '#FFFFFF'
        const PillIcon = PILL_SHAPES.find(s => s.id === shapeId)?.icon || Circle

        return (
            <div className="relative shrink-0" style={{ color: colorHex }}>
                <PillIcon className={sizeClass} fill="currentColor" stroke={theme === 'dark' ? '#333' : '#ccc'} strokeWidth={1} />
            </div>
        )
    }

    // Timeline Helper: Get all events (taken, skipped, scheduled) for a specific day
    const getEventsForDay = (day: Date) => {
        const dayStart = startOfDay(day)

        // 1. Get Taken Logs
        const takenMeds = medRecords.flatMap(med => {
            const startDate = med.item_metadata?.startDate ? startOfDay(new Date(med.item_metadata.startDate)) : null
            const endDate = med.item_metadata?.endDate ? startOfDay(new Date(med.item_metadata.endDate)) : null

            if (startDate && dayStart < startDate) return []
            if (endDate && dayStart > endDate) return []

            const takenLog = med.item_metadata?.takenLog || []
            return takenLog.filter((log: any) => isSameDay(new Date(log.timestamp), day))
                .map((log: any) => ({ ...med, eventType: 'taken', eventTime: new Date(log.timestamp) }))
        })

        // 2. Get Skipped Logs
        const skippedMeds = medRecords.flatMap(med => {
            const startDate = med.item_metadata?.startDate ? startOfDay(new Date(med.item_metadata.startDate)) : null
            const endDate = med.item_metadata?.endDate ? startOfDay(new Date(med.item_metadata.endDate)) : null

            if (startDate && dayStart < startDate) return []
            if (endDate && dayStart > endDate) return []

            const skippedLog = med.item_metadata?.skippedLog || []
            return skippedLog.filter((log: any) => isSameDay(new Date(log.timestamp), day))
                .map((log: any) => ({ ...med, eventType: 'skipped', eventTime: new Date(log.timestamp) }))
        })

        // 3. Get Scheduled Reminders
        const scheduledMeds = medRecords.flatMap(med => {
            const startDate = med.item_metadata?.startDate ? startOfDay(new Date(med.item_metadata.startDate)) : null
            const endDate = med.item_metadata?.endDate ? startOfDay(new Date(med.item_metadata.endDate)) : null

            if (startDate && dayStart < startDate) return []
            if (endDate && dayStart > endDate) return []

            const reminders = med.item_metadata?.reminders || []
            return reminders.map((timeStr: string) => {
                const [h, m] = timeStr.split(':').map(Number)
                const date = new Date(day)
                date.setHours(h, m, 0, 0)

                // Check if this scheduled med was already taken or skipped to avoid duplicate entries
                const isTaken = takenMeds.some(t => t.id === med.id && t.eventTime.getHours() === h && Math.abs(t.eventTime.getMinutes() - m) < 15)
                const isSkipped = skippedMeds.some(s => s.id === med.id && s.eventTime.getHours() === h && Math.abs(s.eventTime.getMinutes() - m) < 15)

                if (isTaken || isSkipped) return null

                // Determine if it's missed (in the past) or upcoming
                const now = new Date()
                const type = isSameDay(day, now) && date < now ? 'missed' : 'scheduled'

                return { ...med, eventType: type, eventTime: date }
            }).filter(Boolean)
        })

        return [...takenMeds, ...skippedMeds, ...scheduledMeds].sort((a: any, b: any) => a.eventTime.getTime() - b.eventTime.getTime())
    }

    // Timeline Calendar Rendering
    const renderTimeline = () => {
        if (calendarView === "day") return renderDayView()
        else if (calendarView === "week") return renderWeekView()
        else return renderMonthView()
    }

    const renderDayView = () => {
        const hours = eachHourOfInterval({ start: startOfDay(currentDate), end: endOfDay(currentDate) })
        const allEvents = getEventsForDay(currentDate)

        // Filter hours to only show those with medications (accordion mode)
        const hoursWithMeds = hours.filter(hour => {
            const hourEvents = allEvents.filter(e => e.eventTime.getHours() === hour.getHours())
            return hourEvents.length > 0
        })

        // Use filtered or full list based on toggle
        const displayHours = showFullTimeline ? hours : hoursWithMeds

        return (
            <div className={`rounded-2xl p-6 border w-full ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1e1e1e] border-white/10'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentDate(addDays(currentDate, -1))} className="p-2 hover:bg-white/10 rounded-lg">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white font-bold">Today</button>
                        <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 hover:bg-white/10 rounded-lg">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Toggle Full Timeline Button */}
                <div className="mb-4 flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                        {showFullTimeline
                            ? `Showing all ${hours.length} hours`
                            : `Showing ${hoursWithMeds.length} hour${hoursWithMeds.length !== 1 ? 's' : ''} with medications`
                        }
                    </div>
                    <button
                        onClick={() => setShowFullTimeline(!showFullTimeline)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${showFullTimeline
                            ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                            : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                            }`}
                    >
                        {showFullTimeline ? 'Show Only Med Hours' : 'Expand Full Timeline'}
                    </button>
                </div>

                <div className="space-y-2">
                    {displayHours.map((hour, i) => {
                        const hourEvents = allEvents.filter(e => e.eventTime.getHours() === hour.getHours())
                        return (
                            <div key={i} className="flex gap-4 border-b border-white/5 pb-2 min-h-[50px]">
                                <div className="w-20 text-sm text-gray-400 pt-1 font-mono">{format(hour, 'h:mm a')}</div>
                                <div className="flex-1 space-y-2">
                                    {hourEvents.map((med, idx) => {
                                        // Determine colors and labels based on event type
                                        const statusConfig = {
                                            taken: {
                                                bg: 'bg-green-500/10',
                                                border: 'border-green-500/20',
                                                badge: 'bg-green-500 text-white',
                                                label: 'Taken',
                                                icon: Check
                                            },
                                            skipped: {
                                                bg: 'bg-orange-500/10',
                                                border: 'border-orange-500/20',
                                                badge: 'bg-orange-500 text-white',
                                                label: 'Skipped',
                                                icon: X
                                            },
                                            missed: {
                                                bg: 'bg-red-500/10',
                                                border: 'border-red-500/20',
                                                badge: 'bg-red-500 text-white',
                                                label: 'Missed',
                                                icon: AlertCircle
                                            },
                                            scheduled: {
                                                bg: 'bg-blue-500/5',
                                                border: 'border-blue-500/20',
                                                badge: 'bg-blue-500 text-white',
                                                label: 'Upcoming',
                                                icon: Bell
                                            }
                                        }

                                        const config = statusConfig[med.eventType as keyof typeof statusConfig] || statusConfig.scheduled
                                        const StatusIcon = config.icon

                                        return (
                                            <div key={idx} className={`p-3 rounded-lg border flex items-center gap-3 ${config.bg} ${config.border}`}>
                                                {getPillIcon(med)}
                                                <div className="flex-1">
                                                    <div className="font-bold flex items-center gap-2">
                                                        {med.title}
                                                        <span className={`text-[10px] ${config.badge} px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1`}>
                                                            <StatusIcon className="h-2.5 w-2.5" />
                                                            {config.label}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-400">{med.item_metadata?.dosage}</div>
                                                    {med.eventType === 'scheduled' && med.item_metadata?.rxInstructions && (
                                                        <div className="text-xs text-gray-500 italic mt-1">{med.item_metadata.rxInstructions}</div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 ml-auto">
                                                    {med.eventType === 'missed' && (
                                                        <button
                                                            onClick={() => {
                                                                handleTakeMed(med, med.eventTime.toISOString())
                                                                alert(`✓ Taken missed dose: ${med.title}`)
                                                            }}
                                                            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-tighter rounded-lg shadow-lg shadow-red-900/20 transition-all flex items-center gap-1"
                                                        >
                                                            <Check className="h-3 w-3" /> Take Now
                                                        </button>
                                                    )}
                                                    <span className={`text-xs font-mono font-bold ${med.eventType === 'taken' ? 'text-green-400' : med.eventType === 'missed' ? 'text-red-400' : 'text-purple-400'}`}>
                                                        {format(med.eventTime, 'h:mm a')}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderWeekView = () => {
        const weekDays = eachDayOfInterval({ start: startOfWeek(currentDate), end: endOfWeek(currentDate) })

        return (
            <div className="bg-[#1e1e1e] rounded-2xl p-4 md:p-6 border border-white/10 w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h2 className="text-xl md:text-2xl font-bold">Week of {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d')}</h2>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="flex-1 md:flex-none p-2 hover:bg-white/10 rounded-lg flex justify-center"><ChevronLeft className="h-5 w-5" /></button>
                        <button onClick={() => setCurrentDate(new Date())} className="flex-1 md:flex-none px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs md:text-sm font-bold">This Week</button>
                        <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="flex-1 md:flex-none p-2 hover:bg-white/10 rounded-lg flex justify-center"><ChevronRight className="h-5 w-5" /></button>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3">
                    {weekDays.map((day, i) => {
                        const dayEvents = getEventsForDay(day)
                        const isToday = isSameDay(day, new Date())

                        return (
                            <div key={i} className={`p-2 rounded-xl border flex flex-col ${isToday ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_15px_-5px_rgba(168,85,247,0.2)]' : 'border-white/5 bg-black/20'} min-h-[140px] md:min-h-[220px]`}>
                                <div className={`text-center mb-2 pb-1 border-b border-white/5 ${isToday ? 'text-purple-400 font-extrabold' : 'text-gray-400'}`}>
                                    <div className="text-[8px] uppercase tracking-widest opacity-60">{format(day, 'EEE')}</div>
                                    <div className="text-lg font-bold">{format(day, 'd')}</div>
                                </div>
                                <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[180px]">
                                    {dayEvents.length === 0 ? (
                                        <div className="text-center text-[9px] text-gray-600 mt-4 italic">No meds</div>
                                    ) : (
                                        dayEvents.map((med: any, idx) => {
                                            const statusColor =
                                                med.eventType === 'taken' ? 'border-green-500/20' :
                                                    med.eventType === 'skipped' ? 'border-orange-500/20' :
                                                        med.eventType === 'missed' ? 'border-red-500/20' : 'border-blue-500/10'

                                            const bgColor =
                                                med.eventType === 'taken' ? 'bg-green-500/5' :
                                                    med.eventType === 'skipped' ? 'bg-orange-500/5' :
                                                        med.eventType === 'missed' ? 'bg-red-500/5' : 'bg-blue-500/5'

                                            return (
                                                <div key={idx} className={`text-[9px] p-1.5 rounded-lg border ${statusColor} ${bgColor} hover:scale-[1.02] transition-all`}>
                                                    <div className="flex items-center justify-between gap-1 mb-0.5">
                                                        <div className="flex items-center gap-1 font-bold truncate">
                                                            {med.eventType === 'taken' && <Check className="h-2.5 w-2.5 text-green-400" />}
                                                            {med.eventType === 'skipped' && <X className="h-2.5 w-2.5 text-orange-400" />}
                                                            {med.eventType === 'missed' && <AlertCircle className="h-2.5 w-2.5 text-red-400" />}
                                                            {med.eventType === 'scheduled' && <Clock className="h-2.5 w-2.5 text-blue-400" />}
                                                            <span className="truncate">{med.title}</span>
                                                        </div>
                                                        <div className="font-mono text-[8px] opacity-40 shrink-0">{format(med.eventTime, 'H:mm')}</div>
                                                    </div>
                                                    <div className="text-[8px] opacity-60 truncate">{med.item_metadata?.dosage}</div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderMonthView = () => {
        const calendarDays = eachDayOfInterval({ start: startOfWeek(startOfMonth(currentDate)), end: endOfWeek(endOfMonth(currentDate)) })

        return (
            <div className="bg-[#1e1e1e] rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-white/10 rounded-lg"><ChevronLeft className="h-5 w-5" /></button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-bold">This Month</button>
                        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white/10 rounded-lg"><ChevronRight className="h-5 w-5" /></button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center text-[8px] md:text-[10px] font-bold text-gray-500 mb-1 md:mb-2 uppercase tracking-tight md:tracking-widest">{d}</div>)}
                    {calendarDays.map((day, i) => {
                        const dayEvents = getEventsForDay(day)
                        const isToday = isSameDay(day, new Date())
                        const isCurrent = isSameMonth(day, currentDate)

                        return (
                            <div key={i} className={`min-h-[80px] md:min-h-[120px] border p-1 md:p-2 rounded-lg transition-all ${!isCurrent ? 'opacity-10' : ''} ${isToday ? 'border-purple-500 bg-purple-500/5' : 'border-white/5 bg-black/20 hover:bg-black/40'}`}>
                                <div className={`text-right text-[10px] mb-1 ${isToday ? 'text-purple-400 font-extrabold' : 'opacity-30'}`}>{format(day, 'd')}</div>
                                <div className="space-y-0.5 md:space-y-1 max-h-[60px] md:max-h-[85px] overflow-hidden">
                                    {dayEvents.slice(0, 4).map((med: any, idx) => {
                                        const colorClass =
                                            med.eventType === 'taken' ? 'text-green-400' :
                                                med.eventType === 'skipped' ? 'text-orange-400' :
                                                    med.eventType === 'missed' ? 'text-red-400' : 'text-blue-400'

                                        return (
                                            <div key={idx} className={`text-[8px] md:text-[9px] p-0.5 md:p-1 rounded flex items-center gap-0.5 md:gap-1 bg-white/5 truncate`}>
                                                {med.eventType === 'taken' && <Check className={`h-2 w-2 md:h-2.5 md:w-2.5 ${colorClass} shrink-0`} />}
                                                {med.eventType === 'skipped' && <X className={`h-2 w-2 md:h-2.5 md:w-2.5 ${colorClass} shrink-0`} />}
                                                {med.eventType === 'missed' && <AlertCircle className={`h-2 w-2 md:h-2.5 md:w-2.5 ${colorClass} shrink-0`} />}
                                                {med.eventType === 'scheduled' && <Clock className={`h-2 w-2 md:h-2.5 md:w-2.5 ${colorClass} shrink-0`} />}
                                                <span className={`truncate ${med.eventType === 'taken' ? 'opacity-40' : 'font-medium'}`}>{med.title}</span>
                                            </div>
                                        )
                                    })}
                                    {dayEvents.length > 4 && <div className="text-[7px] md:text-[8px] text-center text-gray-600 font-bold">+{dayEvents.length - 4}</div>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50' : 'bg-[#121212]'} text-white overflow-y-auto`}>
            {/* Compact Header & Toolbar */}
            <div className="px-2 md:px-4 pt-2 pb-3">
                {/* Row 1: Title + Primary Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 mb-3">
                    <div className="min-w-0">
                        <h1 className="text-xl md:text-2xl font-bold text-purple-300 leading-tight">
                            Medications
                        </h1>
                        <p className="text-xs text-gray-400">Track medications, set reminders, and maintain your health</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <HealthTooltip content="Print medications (Quick Reference or Full Details)">
                            <button
                                type="button"
                                onClick={() => setExportModalState({ open: true, singleMed: null })}
                                className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                                aria-label="Print Medications"
                            >
                                <Printer className="h-4 w-4" />
                            </button>
                        </HealthTooltip>
                        <HealthTooltip content="Download PDF or copy plain-text medication list">
                            <button
                                type="button"
                                onClick={() => setExportModalState({ open: true, singleMed: null })}
                                className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                                aria-label="Export Medications PDF"
                            >
                                <FileDown className="h-4 w-4" />
                            </button>
                        </HealthTooltip>
                        <HealthTooltip content="Open a quick read-only medication summary for doctor visits">
                            <button
                                type="button"
                                onClick={() => setShowMedSummary(true)}
                                className="h-8 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-sm font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <FileText className="h-4 w-4 shrink-0" />
                                <span>Med Summary</span>
                            </button>
                        </HealthTooltip>
                        <HealthTooltip content="Ask AI questions about your medications, side effects, or interactions">
                            <button
                                type="button"
                                onClick={() => setShowQuickAI(!showQuickAI)}
                                className="h-8 px-3 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-sm font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <Sparkles className="h-4 w-4 shrink-0" />
                                <span>AI Assistant</span>
                            </button>
                        </HealthTooltip>
                        <HealthTooltip content="Add a new medication or supplement">
                            <button
                                type="button"
                                onClick={() => setShowAddModal(true)}
                                className="h-8 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <Plus className="h-4 w-4 shrink-0" />
                                <span>Add Med</span>
                            </button>
                        </HealthTooltip>
                    </div>
                </div>

                {/* Official DailyMed Medication Q&A & Interaction Panel */}
                {showQuickAI && (
                    <MedicationAiAssistantPanel
                        medRecords={medRecords}
                        onClose={() => setShowQuickAI(false)}
                        onAddToMedications={(prefill) => {
                            setSelectedMed(null)
                            setShowEditModal(false)
                            setShowAddModal(true)
                            setPrefillTarget({
                                token: Date.now(),
                                fields: prefill,
                            })
                        }}
                    />
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3">
                    <div className="px-3 py-2.5 rounded-lg bg-purple-500/10 border border-purple-500/25">
                        <div className="text-lg md:text-xl font-bold text-purple-400 leading-tight">{medRecords.length}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Total Meds</div>
                    </div>
                    <div className="px-3 py-2.5 rounded-lg bg-pink-500/10 border border-pink-500/25">
                        <div className="text-lg md:text-xl font-bold text-pink-400 leading-tight">{upcomingReminders.length}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Due Today</div>
                    </div>
                    <div className="px-3 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/25">
                        <div className="text-lg md:text-xl font-bold text-blue-400 leading-tight">{medRecords.filter(m => isMedLowStock(m.item_metadata)).length}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Low Stock</div>
                    </div>
                    <div className="px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                        <div className="text-lg md:text-xl font-bold text-emerald-400 leading-tight">{medRecords.reduce((sum, m) => sum + (m.item_metadata?.takenLog?.length || 0), 0)}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Doses Taken</div>
                    </div>
                </div>

                {/* Row 2: Search, Category Filter, Manage Categories, Pill Library, Import Rx, List / Timeline */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search medications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-9 pl-9 pr-3 bg-[#1e1e1e] border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <HealthTooltip content="Filter displayed medications by category">
                            <select
                                aria-label="Filter by category"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="h-9 px-2.5 bg-[#1e1e1e] border border-white/10 rounded-lg text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                            >
                                <option value="all">All Categories</option>
                                {allMedCategories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                                <option value={UNCATEGORIZED_MED_CATEGORY}>{UNCATEGORIZED_MED_CATEGORY}</option>
                            </select>
                        </HealthTooltip>
                        <HealthTooltip content="Create, rename, or delete medication categories">
                            <button
                                type="button"
                                onClick={() => setShowManageCategories(true)}
                                className="h-9 px-2.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <FolderCog className="h-3.5 w-3.5 shrink-0" />
                                <span>Manage categories</span>
                            </button>
                        </HealthTooltip>
                        <HealthTooltip content="Preview pill shapes & colors and quick-add a medication">
                            <button
                                type="button"
                                onClick={() => setShowPillLibrary(true)}
                                className="h-9 px-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <Package className="h-4 w-4 shrink-0" />
                                <span>Pill Library</span>
                            </button>
                        </HealthTooltip>
                        <HealthTooltip content="Quick-import medication templates from common preset groups">
                            <button
                                type="button"
                                onClick={() => setShowMockDrugs(true)}
                                className="h-9 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <Activity className="h-4 w-4 shrink-0" />
                                <span>Import Rx</span>
                            </button>
                        </HealthTooltip>
                        <div className="h-8 p-0.5 bg-[#1e1e1e] border border-white/10 rounded-lg inline-flex items-center">
                            <HealthTooltip content="Show medications as cards in a 3-column grid">
                                <button
                                    type="button"
                                    onClick={() => setViewMode("list")}
                                    className={`h-full px-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${viewMode === "list" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
                                >
                                    List
                                </button>
                            </HealthTooltip>
                            <HealthTooltip content="Show scheduled doses on a Day, Week, or Month calendar">
                                <button
                                    type="button"
                                    onClick={() => setViewMode("timeline")}
                                    className={`h-full px-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${viewMode === "timeline" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
                                >
                                    Timeline
                                </button>
                            </HealthTooltip>
                        </div>
                    </div>
                </div>

                {/* Calendar Views */}
                {viewMode === "timeline" && (
                    <div className="flex gap-1 bg-[#1e1e1e] border border-white/10 rounded-lg p-0.5 w-fit mt-2">
                        <button onClick={() => setCalendarView("day")} className={`h-7 px-3 rounded-md text-xs font-medium ${calendarView === "day" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>Day</button>
                        <button onClick={() => setCalendarView("week")} className={`h-7 px-3 rounded-md text-xs font-medium ${calendarView === "week" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>Week</button>
                        <button onClick={() => setCalendarView("month")} className={`h-7 px-3 rounded-md text-xs font-medium ${calendarView === "month" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>Month</button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="px-2 md:px-4 pb-6">
                {viewMode === "list" ? (
                    <div
                        className="grid gap-3"
                        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
                    >
                        {filteredMeds.length === 0 ? (
                            <div className="col-span-full text-center text-gray-500 py-12">
                                <Pill className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                <p>No medications found. Add your first medication to get started.</p>
                            </div>
                        ) : (
                            filteredMeds.map(med => {
                                const estimate = calculatePillCountEstimate(med.item_metadata)
                                const tracked = Boolean(estimate?.tracked)
                                const lowStock = Boolean(estimate?.isLowStock)
                                const liveNextDose = getScheduledNextDose(med.item_metadata) || med.item_metadata?.nextDose
                                const reminderTimes = getEffectiveReminderTimes(med.item_metadata)
                                const todayTimesStr = reminderTimes.length > 0
                                    ? reminderTimes.map(r => formatReminderTime12h(r.hh, r.mm)).join(", ")
                                    : null
                                const skippedLog = Array.isArray(med.item_metadata?.skippedLog) ? med.item_metadata.skippedLog : []
                                const takenLog = Array.isArray(med.item_metadata?.takenLog) ? med.item_metadata.takenLog : []
                                const hasLogs = skippedLog.length > 0 || takenLog.length > 0
                                const today = new Date()
                                const hasTodayLog = [...takenLog, ...skippedLog].some((e: any) => {
                                    const ts = e?.timestamp || e
                                    if (!ts) return false
                                    const d = new Date(ts)
                                    return !isNaN(d.getTime()) && isSameDay(d, today)
                                })
                                const isDueMed = !isMedAsNeeded(med.item_metadata)

                                return (
                                <div
                                    key={med.id}
                                    className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 hover:border-purple-500/35 transition-colors space-y-1.5"
                                >
                                    {/* Line 1: [icon] Name + Dosage + Category badge */}
                                    <div className="flex items-center justify-between gap-2 min-w-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {getPillIcon(med, "h-7 w-7")}
                                            <div className="flex items-baseline gap-1.5 min-w-0 flex-wrap">
                                                <h3 className="text-sm font-bold text-white leading-tight truncate">
                                                    {med.title}
                                                </h3>
                                                {med.item_metadata?.dosage && (
                                                    <span className="text-xs text-gray-400 font-medium shrink-0">
                                                        {med.item_metadata.dosage}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-200 text-[10px] font-semibold shrink-0 max-w-[130px] truncate" title={getMedCategory(med)}>
                                            {getMedCategory(med)}
                                        </span>
                                    </div>

                                    {/* Line 2: Frequency + Est. left + Status chips inline */}
                                    <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-300">
                                        <span>
                                            {med.item_metadata?.frequency || "As needed"}
                                            {tracked && estimate ? ` • Est. ${estimate.remaining} left` : ""}
                                        </span>
                                        {lowStock && (
                                            <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded-md border border-red-500/30 inline-flex items-center gap-1 font-bold animate-pulse">
                                                <AlertCircle className="h-3 w-3" /> LOW STOCK
                                            </span>
                                        )}
                                        {isDueMed && !hasTodayLog && (
                                            <span className="px-1.5 py-0.5 bg-white/5 text-gray-400 text-[10px] rounded-md border border-white/10 inline-flex items-center">
                                                Not taken
                                            </span>
                                        )}
                                        {skippedLog.length > 0 && (
                                            <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] rounded-md border border-yellow-500/30 inline-flex items-center gap-0.5">
                                                <X className="h-3 w-3" /> Skipped {skippedLog.length}x
                                            </span>
                                        )}
                                        {takenLog.length > 0 && (
                                            <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-md border border-green-500/30 inline-flex items-center gap-0.5">
                                                <Check className="h-3 w-3" /> Taken {takenLog.length}x
                                            </span>
                                        )}
                                        {hasLogs && (
                                            <HealthTooltip content="Undo today's logged dose status back to Not taken">
                                                <button
                                                    type="button"
                                                    onClick={() => handleResetDoseStatus(med)}
                                                    className="px-1.5 py-0.5 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white text-[10px] rounded-md border border-white/10 inline-flex items-center gap-0.5 transition-colors cursor-pointer"
                                                >
                                                    <RotateCcw className="h-2.5 w-2.5" /> Reset
                                                </button>
                                            </HealthTooltip>
                                        )}
                                    </div>

                                    {/* Line 3: Today <time> - Next <date, time> */}
                                    {(todayTimesStr || liveNextDose) && (
                                        <div className="flex items-center gap-1.5 flex-wrap text-xs text-purple-300">
                                            <Clock className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                                            <span>
                                                {todayTimesStr ? `Today ${todayTimesStr}` : ""}
                                                {todayTimesStr && liveNextDose ? " - " : ""}
                                                {liveNextDose ? `Next ${format(new Date(liveNextDose), 'MMM d, h:mm a')}` : ""}
                                            </span>
                                        </div>
                                    )}

                                    {/* Line 4: Runs out about <date> (muted) */}
                                    {tracked && estimate?.runOutDateStr && (
                                        <div className="text-xs text-gray-400">
                                            Runs out about {estimate.runOutDateStr}
                                        </div>
                                    )}

                                    {/* RX instructions: one truncated line */}
                                    {med.item_metadata?.rxInstructions && (
                                        <div className="text-xs text-blue-300/90 truncate" title={med.item_metadata.rxInstructions}>
                                            <span className="font-semibold text-blue-300">RX:</span> {med.item_metadata.rxInstructions}
                                        </div>
                                    )}

                                    {/* One compact bottom row: Skip/Take/Reschedule left, Info/AI/Edit/Delete/Refill right */}
                                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 mt-1 border-t border-white/10">
                                        <div className="flex items-center gap-1.5">
                                            <HealthTooltip content="Skip this dose (skipped doses are not subtracted from pill count)">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSkipMed(med)}
                                                    className="h-8 px-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    <X className="h-3.5 w-3.5" /> Skip
                                                </button>
                                            </HealthTooltip>
                                            <HealthTooltip content="Mark dose as taken right now">
                                                <button
                                                    type="button"
                                                    onClick={() => handleTakeMed(med)}
                                                    className="h-8 px-2.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Check className="h-3.5 w-3.5" /> Take
                                                </button>
                                            </HealthTooltip>
                                            <HealthTooltip content="Reschedule next dose date and reminder time">
                                                <button
                                                    type="button"
                                                    onClick={() => openRescheduleModal(med)}
                                                    className="h-8 px-2.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Clock className="h-3.5 w-3.5" /> Reschedule
                                                </button>
                                            </HealthTooltip>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <HealthTooltip content="Open full medication detail sheet">
                                                <button
                                                    type="button"
                                                    onClick={() => router.push(`/?page=type-health-records&tab=meds&medId=${med.id}`, { scroll: false })}
                                                    className="h-8 w-8 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 inline-flex items-center justify-center transition-colors cursor-pointer"
                                                    aria-label="Medication details"
                                                >
                                                    <Info className="h-4 w-4" />
                                                </button>
                                            </HealthTooltip>
                                            <HealthTooltip content="Look up official FDA & DailyMed drug label (uses, side effects, warnings, and interactions)">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDrugLookup(med.title, med.item_metadata?.genericName || "", med)}
                                                    className="h-8 w-8 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 inline-flex items-center justify-center transition-colors cursor-pointer"
                                                    aria-label="Official FDA Drug Info lookup"
                                                >
                                                    <Sparkles className="h-4 w-4" />
                                                </button>
                                            </HealthTooltip>
                                            <HealthTooltip content="Edit medication details, schedule, or category">
                                                <button
                                                    type="button"
                                                    onClick={() => { setSelectedMed(med); setShowEditModal(true) }}
                                                    className="h-8 w-8 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 inline-flex items-center justify-center transition-colors cursor-pointer"
                                                    aria-label="Edit medication"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            </HealthTooltip>
                                            <HealthTooltip content="Delete medication">
                                                <button
                                                    type="button"
                                                    onClick={async () => { if (confirm(`Delete ${med.title}?`)) { await deleteItem(med.id); removeSharedHealthRecord(med.id); toast.success("Medication deleted") } }}
                                                    className="h-8 w-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 inline-flex items-center justify-center transition-colors cursor-pointer"
                                                    aria-label="Delete medication"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </button>
                                            </HealthTooltip>
                                            {tracked && (
                                                <HealthTooltip content="Record a refill and reset the remaining pill count baseline to today">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setRefillMed(med)
                                                            setRefillCount(String(med.item_metadata?.totalQuantity || 30))
                                                        }}
                                                        className="h-8 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
                                                    >
                                                        Refill
                                                    </button>
                                                </HealthTooltip>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                )
                            })
                        )}
                    </div>
                ) : (
                    renderTimeline()
                )}
            </div>

            {/* Reminder Modal */}
            {activeReminder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-[#1e1e1e] border-2 border-purple-500 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-pulse"></div>

                        <div className="mx-auto w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                            <Bell className="h-12 w-12 text-purple-400" />
                        </div>

                        <h2 className="text-3xl font-bold mb-2">Time to Take Meds</h2>
                        <p className="text-gray-400 mb-8">It's time to take your scheduled medication.</p>

                        <div className="bg-black/30 rounded-2xl p-6 mb-8 border border-purple-500/20 shadow-inner">
                            <h3 className="text-3xl font-extrabold text-white mb-2">{activeReminder.title}</h3>
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2 text-purple-400 font-black text-3xl">
                                    <Activity className="h-8 w-8" />
                                    {getCurrentDose(activeReminder)}
                                </div>
                                <div className="text-[10px] text-purple-500/80 uppercase font-black tracking-[0.2em]">Today's Required Dosage</div>
                            </div>
                            {activeReminder.item_metadata?.rxInstructions && (
                                <div className="text-sm text-gray-500 mt-4 italic p-3 bg-white/5 rounded-lg">"{activeReminder.item_metadata.rxInstructions}"</div>
                            )}
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap items-stretch gap-3">
                            <HealthTooltip content="Log this scheduled dose as taken right now">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleTakeMed(activeReminder)
                                        setActiveReminder(null)
                                    }}
                                    className="flex-1 min-w-[130px] py-3.5 px-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-base shadow-lg shadow-green-900/20 transition-all transform hover:scale-[1.02] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Check className="h-5 w-5 shrink-0" />
                                    <span>TAKE NOW</span>
                                </button>
                            </HealthTooltip>
                            <HealthTooltip content="Record this scheduled dose as skipped (not subtracted from pill count)">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSkipMed(activeReminder)
                                        setActiveReminder(null)
                                    }}
                                    className="py-3.5 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/35 text-red-300 hover:text-red-200 rounded-xl font-bold text-base transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <X className="h-5 w-5 shrink-0" />
                                    <span>Skip</span>
                                </button>
                            </HealthTooltip>
                            <HealthTooltip content="Dismiss reminder notice without logging Take or Skip">
                                <button
                                    type="button"
                                    onClick={() => setActiveReminder(null)}
                                    className="py-3.5 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold text-base transition-all inline-flex items-center justify-center cursor-pointer"
                                >
                                    Snooze
                                </button>
                            </HealthTooltip>
                        </div>
                    </div>
                </div>
            )}

            {/* Pill Library Modal */}
            {showPillLibrary && (
                <PillLibraryModal
                    isOpen={showPillLibrary}
                    onClose={() => setShowPillLibrary(false)}
                    theme={theme}
                    addItem={addItem}
                    categories={allMedCategories}
                    onCreateCategory={handleCreateCustomCategory}
                />
            )}

            {/* Mock Drugs Modal */}
            {showMockDrugs && (
                <MockDrugsModal
                    isOpen={showMockDrugs}
                    onClose={() => setShowMockDrugs(false)}
                    onAddMockDrug={handleAddMed}
                    onUpdateExistingCategory={handleUpdateExistingMedCategory}
                    existingMedications={medRecords}
                    theme={theme}
                    categories={allMedCategories}
                    onCreateCategory={handleCreateCustomCategory}
                    onOpenManageCategories={() => setShowManageCategories(true)}
                />
            )}

            {/* Full-Screen Medication Detail View (Zero extra queries, real browser history via ?medId=) */}
            {activeMedId && (() => {
                const detailMed = medRecords.find((m) => m.id === activeMedId)
                if (!detailMed) return null
                const est = calculatePillCountEstimate(detailMed.item_metadata)
                return (
                    <MedicationDetailView
                        medication={detailMed}
                        doctors={savedDoctors}
                        facilities={savedFacilities}
                        pillIcon={getPillIcon(detailMed)}
                        isTracked={Boolean(est?.tracked)}
                        isLowStock={Boolean(est?.isLowStock)}
                        pillEstimate={est}
                        currentDose={getCurrentDose(detailMed)}
                        onBack={() => {
                            if (typeof window !== "undefined" && window.history.length > 1) {
                                router.back()
                            } else {
                                router.replace("/?page=type-health-records&tab=meds", { scroll: false })
                            }
                        }}
                        onEdit={() => {
                            setSelectedMed(detailMed)
                            setShowEditModal(true)
                        }}
                        onRefill={() => {
                            setRefillMed(detailMed)
                            setRefillCount(String(detailMed.item_metadata?.totalQuantity || 30))
                        }}
                        onLookupDrug={(name, gen) => handleDrugLookup(name, gen || detailMed.item_metadata?.genericName || "", detailMed)}
                        onOpenDoctors={() => router.push("/?page=type-health-records&tab=doctors", { scroll: false })}
                        onDeleteLogEntry={(logType, idx) => handleDeleteAdherenceLog(detailMed, logType, idx)}
                        onExport={() => setExportModalState({ open: true, singleMed: detailMed })}
                    />
                )
            })()}

            {/* Manage Categories Modal */}
            {showManageCategories && (
                <ManageCategoriesModal
                    isOpen={showManageCategories}
                    onClose={() => setShowManageCategories(false)}
                    categories={allMedCategories}
                    medications={medRecords}
                    onAddCategory={handleCreateCustomCategory}
                    onRenameCategory={handleRenameCategory}
                    onDeleteCategory={handleDeleteCategory}
                />
            )}

            {/* Unified Medication Export Dialog (PDF / Print / Plain Text) */}
            {exportModalState.open && (
                <MedicationExportModal
                    isOpen={exportModalState.open}
                    onClose={() => setExportModalState({ open: false, singleMed: null })}
                    allMedications={medRecords}
                    singleMedication={exportModalState.singleMed}
                    categories={allMedCategories}
                    doctors={savedDoctors}
                    facilities={savedFacilities}
                />
            )}

            {/* Refill Modal */}
            {refillMed && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setRefillMed(null)}>
                    <div className="w-full max-w-sm bg-[#1e1e1e] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white">Refill {refillMed.title}</h3>
                        <p className="text-xs text-gray-400">Enter your new pill count to reset the automatic estimate baseline to today.</p>
                        <form onSubmit={handleConfirmRefill} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">New Pill Count</label>
                                <input
                                    type="number"
                                    step="0.25"
                                    min="0"
                                    required
                                    autoFocus
                                    value={refillCount}
                                    onChange={(e) => setRefillCount(e.target.value.replace(/^0+(?=\d)/, ""))}
                                    className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setRefillMed(null)} className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold">Save Refill</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modals */}
            {(showAddModal || showEditModal) && (
                <MedicationModal
                    key={selectedMed?.id || "new-medication"}
                    isOpen={showAddModal || showEditModal}
                    onClose={() => { setShowAddModal(false); setShowEditModal(false); setSelectedMed(null); setPrefillTarget(null) }}
                    onSave={showAddModal ? handleAddMed : handleEditMed}
                    medication={selectedMed}
                    existingMedications={medRecords}
                    onOpenExisting={(existingMed: any) => {
                        setShowAddModal(false)
                        setSelectedMed(existingMed)
                        setShowEditModal(true)
                    }}
                    theme={theme}
                    prefillData={prefillTarget}
                    onLookupDrug={(name: string, gen?: string) => handleDrugLookup(name, gen || "", selectedMed)}
                    doctors={savedDoctors}
                    facilities={savedFacilities}
                    suggestions={extractHealthSuggestions(records)}
                    categories={allMedCategories}
                    onCreateCategory={handleCreateCustomCategory}
                    onOpenManageCategories={() => setShowManageCategories(true)}
                    onOpenExport={(med: any) => setExportModalState({ open: true, singleMed: med })}
                />
            )}

            {/* Reschedule Modal */}
            {showRescheduleModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="w-full max-w-md bg-[#1e1e1e] border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">Reschedule Medication</h2>
                        <div className="mb-4">
                            <p className="text-gray-400 mb-4">
                                {selectedMed?.title} - {selectedMed?.item_metadata?.dosage}
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Date</label>
                                <input
                                    type="date"
                                    value={rescheduleDate}
                                    onChange={(e) => setRescheduleDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Time</label>
                                <input
                                    type="time"
                                    value={rescheduleTime}
                                    onChange={(e) => setRescheduleTime(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowRescheduleModal(false)}
                                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRescheduleMed}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Medication Summary Modal - For Doctor */}
            {showMedSummary && (
                <div className="fixed inset-0 z-[110] flex items-start justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="w-full max-w-4xl bg-[#1e1e1e] border border-white/10 rounded-3xl p-8 shadow-2xl my-auto md:my-8 relative">
                        <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#1e1e1e]/90 backdrop-blur-sm z-10 py-2">
                            <h2 className="text-3xl font-bold">Medication Summary</h2>
                            <button onClick={() => setShowMedSummary(false)} className="p-2 hover:bg-white/10 rounded-lg">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <p className="text-gray-400 mb-6">Complete medication list for healthcare providers</p>

                        <div className="space-y-4">
                            {medRecords.length === 0 ? (
                                <div className="text-center text-gray-500 py-12">No medications on record</div>
                            ) : (
                                medRecords.map((med, idx) => (
                                    <div key={med.id} className="bg-black/20 border border-white/10 rounded-xl p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl font-bold text-purple-400">#{idx + 1}</div>
                                                <div>
                                                    <h3 className="text-2xl font-bold">{med.title}</h3>
                                                    <p className="text-gray-400">{med.item_metadata?.dosage}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-500">Stock</div>
                                                <div className="text-xl font-bold">{med.item_metadata?.quantity || 'N/A'}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Frequency:</span>
                                                <span className="ml-2 font-medium">{med.item_metadata?.frequency || 'As needed'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Prescribed By:</span>
                                                <span className="ml-2 font-medium">{med.item_metadata?.prescribedBy || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Purpose:</span>
                                                <span className="ml-2 font-medium">{med.item_metadata?.purpose || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Refill Date:</span>
                                                <span className="ml-2 font-medium">{med.item_metadata?.refillDate ? formatMedDateOnly(med.item_metadata.refillDate) : 'N/A'}</span>
                                            </div>
                                        </div>

                                        {med.item_metadata?.rxInstructions && (
                                            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                                <div className="text-xs font-bold text-blue-400 mb-1">RX INSTRUCTIONS</div>
                                                <div className="text-sm">{med.item_metadata.rxInstructions}</div>
                                            </div>
                                        )}

                                        {med.item_metadata?.interactions && (
                                            <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                                <div className="text-xs font-bold text-red-400 mb-1">DRUG INTERACTIONS</div>
                                                <div className="text-sm">{med.item_metadata.interactions}</div>
                                            </div>
                                        )}

                                        {med.item_metadata?.sideEffects && (
                                            <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                                <div className="text-xs font-bold text-yellow-400 mb-1">SIDE EFFECTS</div>
                                                <div className="text-sm">{med.item_metadata.sideEffects}</div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={() => {
                                    setShowMedSummary(false)
                                    setExportModalState({ open: true, singleMed: null })
                                }}
                                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Download className="h-5 w-5" /> Print / Export PDF
                            </button>
                            <button
                                onClick={() => setShowMedSummary(false)}
                                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Official FDA / DailyMed Drug Label Modal */}
            {showDrugInfo && (
                <div
                    className="fixed inset-0 z-[125] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                    onClick={() => { setShowDrugInfo(false); setShowFillPreview(false) }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#1e1e1e] border border-blue-500/30 rounded-3xl p-6 md:p-8 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2.5 text-white">
                                <Sparkles className="h-6 w-6 text-blue-400 shrink-0" />
                                <span>Official FDA Drug Label</span>
                            </h2>
                            <HealthTooltip content="Close drug label viewer">
                                <button
                                    type="button"
                                    onClick={() => { setShowDrugInfo(false); setShowFillPreview(false) }}
                                    aria-label="Close drug label viewer"
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white cursor-pointer"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </HealthTooltip>
                        </div>

                        {loadingDrugInfo ? (
                            <div className="text-center py-12">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-300">Querying official FDA &amp; DailyMed drug labels for &ldquo;{drugLookupTarget}&rdquo;...</p>
                            </div>
                        ) : !activeDrugLabel ? (
                            <div className="text-center py-12 px-4 space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
                                    <AlertCircle className="h-7 w-7 text-amber-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    No official label found for {drugLookupTarget || "this medication"}
                                </h3>
                                {drugLookupError && (
                                    <p className="text-xs text-red-300 max-w-md mx-auto">{drugLookupError}</p>
                                )}
                                <div className="flex items-center justify-center gap-3 pt-1">
                                    <HealthTooltip content="Query openFDA and DailyMed again without using cache">
                                        <button
                                            type="button"
                                            onClick={() => runDrugLabelQuery(drugLookupTarget, drugLookupGeneric, true)}
                                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <RefreshCw className="h-3.5 w-3.5" />
                                            <span>Retry</span>
                                        </button>
                                    </HealthTooltip>
                                </div>
                                <div className="inline-flex items-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
                                    <Shield className="h-4 w-4 shrink-0" />
                                    <span>Verify with your pharmacist or doctor.</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {/* Multi-label Chooser when several official labels match */}
                                {drugLabels.length > 1 && (
                                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                                        <div className="text-xs font-bold uppercase tracking-wider text-blue-300">
                                            Matching Official Labels ({drugLabels.length}) — Choose Label
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                            {drugLabels.map((lbl, idx) => {
                                                const active = idx === selectedLabelIdx
                                                return (
                                                    <HealthTooltip
                                                        key={lbl.id}
                                                        content={`${lbl.title} — ${lbl.manufacturer}${lbl.effectiveDate ? ` (${lbl.effectiveDate})` : ""}`}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedLabelIdx(idx)
                                                                setExpandedLabelSections({})
                                                                setShowFillPreview(false)
                                                            }}
                                                            className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                                                                active
                                                                    ? "bg-blue-600/20 border-blue-500 text-white"
                                                                    : "bg-black/25 border-white/10 text-gray-300 hover:bg-white/[0.05]"
                                                            }`}
                                                        >
                                                            <div className="text-xs font-bold truncate">{lbl.title}</div>
                                                            <div className="text-[11px] text-gray-400 truncate mt-0.5">
                                                                {lbl.manufacturer}
                                                                {lbl.effectiveDate ? ` • ${lbl.effectiveDate}` : ""}
                                                            </div>
                                                        </button>
                                                    </HealthTooltip>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Verification Alert Banner */}
                                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs flex items-center justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-purple-400 shrink-0" />
                                        <span><strong>Clinical Note:</strong> Verify with your pharmacist or doctor.</span>
                                    </div>
                                    <HealthTooltip content="Preview and choose which label fields to copy into the form (never touches dose or schedule, and does not auto-save)">
                                        <button
                                            type="button"
                                            onClick={() => openFillFieldsPreview(activeDrugLabel)}
                                            className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-md cursor-pointer"
                                        >
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Fill fields
                                        </button>
                                    </HealthTooltip>
                                </div>

                                {/* Safe Fill Fields Checkbox Preview */}
                                {showFillPreview && (
                                    <div className="p-4 rounded-2xl bg-purple-950/35 border border-purple-500/40 space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <div>
                                                <h4 className="text-sm font-bold text-white">Approve Fields to Copy into Form</h4>
                                                <p className="text-[11px] text-gray-300">
                                                    Only checked values are copied into the open form. Dosage, quantity, schedule, and reminder times are never changed, and nothing is saved until you click Update/Add Medication.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowFillPreview(false)}
                                                className="p-1 text-gray-400 hover:text-white cursor-pointer"
                                                aria-label="Close fill preview"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                            {[
                                                { key: "genericName" as const, label: "Generic name", val: activeDrugLabel.genericName },
                                                { key: "drugClass" as const, label: "Drug class", val: activeDrugLabel.drugClass },
                                                { key: "purpose" as const, label: "Purpose (from Indications)", val: getCondensedFieldSnippet(activeDrugLabel.usesText, 380) },
                                                { key: "sideEffects" as const, label: "Common side effects", val: getCondensedFieldSnippet(activeDrugLabel.sideEffectsText, 600) },
                                                { key: "interactions" as const, label: "Drug interactions", val: getCondensedFieldSnippet(activeDrugLabel.interactionsText, 600) },
                                            ]
                                                .filter((item) => Boolean(item.val))
                                                .map((item) => (
                                                    <label
                                                        key={item.key}
                                                        className="flex items-start gap-2.5 p-2.5 rounded-xl bg-black/30 border border-white/10 hover:border-purple-500/40 cursor-pointer text-xs"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={fillChecked[item.key]}
                                                            onChange={(e) =>
                                                                setFillChecked((prev) => ({
                                                                    ...prev,
                                                                    [item.key]: e.target.checked,
                                                                }))
                                                            }
                                                            className="mt-0.5 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-bold text-purple-200">{item.label}</div>
                                                            <div className="text-gray-300 line-clamp-2 mt-0.5 whitespace-pre-wrap">{item.val}</div>
                                                        </div>
                                                    </label>
                                                ))}
                                        </div>

                                        <div className="flex items-center justify-end gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => setShowFillPreview(false)}
                                                className="px-3.5 py-1.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <HealthTooltip content="Copy only the checked fields into the medication form without saving">
                                                <button
                                                    type="button"
                                                    onClick={handleApproveFillFields}
                                                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                    <span>Fill approved fields</span>
                                                </button>
                                            </HealthTooltip>
                                        </div>
                                    </div>
                                )}

                                {/* Drug Header */}
                                <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl p-5 md:p-6 border border-blue-500/20 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">{activeDrugLabel.title}</h3>
                                        <HealthTooltip content="Preview and choose which label fields to copy into the form">
                                            <button
                                                type="button"
                                                onClick={() => openFillFieldsPreview(activeDrugLabel)}
                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-900/30 self-start sm:self-auto shrink-0 cursor-pointer"
                                            >
                                                <Sparkles className="h-4 w-4" />
                                                Fill fields
                                            </button>
                                        </HealthTooltip>
                                    </div>
                                    <div className="text-gray-300 space-y-1 text-sm">
                                        {activeDrugLabel.genericName && (
                                            <div><strong className="text-white">Generic Name:</strong> {activeDrugLabel.genericName}</div>
                                        )}
                                        {activeDrugLabel.drugClass && (
                                            <div><strong className="text-white">Drug Class:</strong> {activeDrugLabel.drugClass}</div>
                                        )}
                                        {activeDrugLabel.brandNames.length > 0 && (
                                            <div><strong className="text-white">Brand Names:</strong> {activeDrugLabel.brandNames.join(", ")}</div>
                                        )}
                                    </div>
                                    <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-200">
                                        <span>
                                            Source: FDA label, {activeDrugLabel.manufacturer}
                                            {activeDrugLabel.effectiveDate ? `, ${activeDrugLabel.effectiveDate}` : ""}
                                        </span>
                                        <HealthTooltip content="Open official full package insert on DailyMed (NIH)">
                                            <a
                                                href={activeDrugLabel.dailyMedUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-blue-300 hover:text-white font-semibold underline underline-offset-2"
                                            >
                                                <span>View on DailyMed</span>
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        </HealthTooltip>
                                    </div>
                                </div>

                                {/* Helper for 600-char trimmed verbatim FDA label sections */}
                                {[
                                    {
                                        key: "uses",
                                        title: "Uses & Indications",
                                        icon: Check,
                                        colorCls: "text-green-400",
                                        boxCls: "bg-black/20 border-white/5",
                                        text: activeDrugLabel.usesText,
                                    },
                                    {
                                        key: "mechanism",
                                        title: "How It Works",
                                        icon: Activity,
                                        colorCls: "text-cyan-400",
                                        boxCls: "bg-black/20 border-white/5",
                                        text: activeDrugLabel.mechanismText,
                                    },
                                    {
                                        key: "sideEffects",
                                        title: "Side Effects",
                                        icon: AlertCircle,
                                        colorCls: "text-yellow-400",
                                        boxCls: "bg-black/20 border-white/5",
                                        text: activeDrugLabel.sideEffectsText,
                                    },
                                    {
                                        key: "interactions",
                                        title: "Drug Interactions",
                                        icon: AlertCircle,
                                        colorCls: "text-red-400",
                                        boxCls: "bg-black/20 border-white/5",
                                        text: activeDrugLabel.interactionsText,
                                    },
                                ]
                                    .filter((sec) => Boolean(sec.text))
                                    .map((sec) => {
                                        const isExpanded = Boolean(expandedLabelSections[sec.key])
                                        const { preview, isTrimmed } = trimLabelPreview(sec.text, 600)
                                        const IconComp = sec.icon
                                        return (
                                            <div key={sec.key} className={`rounded-xl p-5 border ${sec.boxCls}`}>
                                                <h4 className={`text-lg font-bold ${sec.colorCls} mb-2.5 flex items-center gap-2`}>
                                                    <IconComp className="h-5 w-5 shrink-0" /> {sec.title}
                                                </h4>
                                                <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                                                    {isExpanded ? sec.text : preview}
                                                </p>
                                                {isTrimmed && (
                                                    <HealthTooltip content={isExpanded ? "Collapse section back to summary length" : "Expand full verbatim FDA label section"}>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setExpandedLabelSections((prev) => ({
                                                                    ...prev,
                                                                    [sec.key]: !prev[sec.key],
                                                                }))
                                                            }
                                                            className="mt-2 text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                                                        >
                                                            {isExpanded ? "Show less" : "Show more"}
                                                        </button>
                                                    </HealthTooltip>
                                                )}
                                            </div>
                                        )
                                    })}

                                {/* Important Warnings (Boxed Warning FIRST, then Warnings & Precautions) */}
                                {(activeDrugLabel.boxedWarningText || activeDrugLabel.warningsText) && (
                                    <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-xl p-5 border border-orange-500/30 space-y-4">
                                        <h4 className="text-lg font-bold text-orange-400 flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5 shrink-0" /> Important Warnings
                                        </h4>

                                        {activeDrugLabel.boxedWarningText && (() => {
                                            const isExpanded = Boolean(expandedLabelSections["boxedWarning"])
                                            const { preview, isTrimmed } = trimLabelPreview(activeDrugLabel.boxedWarningText, 600)
                                            return (
                                                <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 space-y-1.5">
                                                    <div className="text-xs font-black uppercase tracking-wider text-red-300">
                                                        Boxed Warning
                                                    </div>
                                                    <p className="text-sm text-red-100 whitespace-pre-wrap leading-relaxed">
                                                        {isExpanded ? activeDrugLabel.boxedWarningText : preview}
                                                    </p>
                                                    {isTrimmed && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setExpandedLabelSections((prev) => ({
                                                                    ...prev,
                                                                    boxedWarning: !prev.boxedWarning,
                                                                }))
                                                            }
                                                            className="text-xs font-semibold text-red-300 hover:text-white cursor-pointer"
                                                        >
                                                            {isExpanded ? "Show less" : "Show more"}
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        })()}

                                        {activeDrugLabel.warningsText && (() => {
                                            const isExpanded = Boolean(expandedLabelSections["warnings"])
                                            const { preview, isTrimmed } = trimLabelPreview(activeDrugLabel.warningsText, 600)
                                            return (
                                                <div>
                                                    <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                                                        {isExpanded ? activeDrugLabel.warningsText : preview}
                                                    </p>
                                                    {isTrimmed && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setExpandedLabelSections((prev) => ({
                                                                    ...prev,
                                                                    warnings: !prev.warnings,
                                                                }))
                                                            }
                                                            className="mt-2 text-xs font-semibold text-orange-300 hover:text-orange-200 cursor-pointer"
                                                        >
                                                            {isExpanded ? "Show less" : "Show more"}
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        })()}
                                    </div>
                                )}

                                {/* Pregnancy & Breastfeeding */}
                                {activeDrugLabel.pregnancyText && (() => {
                                    const isExpanded = Boolean(expandedLabelSections["pregnancy"])
                                    const { preview, isTrimmed } = trimLabelPreview(activeDrugLabel.pregnancyText, 600)
                                    return (
                                        <div className="bg-black/20 rounded-xl p-4 border border-white/5 text-sm text-gray-300 space-y-1.5">
                                            <strong className="text-white block">Pregnancy &amp; Breastfeeding:</strong>
                                            <p className="whitespace-pre-wrap leading-relaxed">
                                                {isExpanded ? activeDrugLabel.pregnancyText : preview}
                                            </p>
                                            {isTrimmed && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setExpandedLabelSections((prev) => ({
                                                            ...prev,
                                                            pregnancy: !prev.pregnancy,
                                                        }))
                                                    }
                                                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                                                >
                                                    {isExpanded ? "Show less" : "Show more"}
                                                </button>
                                            )}
                                        </div>
                                    )
                                })()}

                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-sm text-blue-300 flex items-start gap-2">
                                    <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span><strong>Note:</strong> Verify with your pharmacist or doctor. Official FDA label excerpts are provided verbatim for reference; dosing, quantity, and schedules must follow your actual prescription.</span>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4">
                            <div className="text-xs text-gray-400 flex items-center gap-1.5">
                                <Shield className="h-4 w-4 text-purple-400" />
                                <span>Verify with your pharmacist or doctor</span>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                {activeDrugLabel && (
                                    <HealthTooltip content="Preview and choose which label fields to copy into the form">
                                        <button
                                            type="button"
                                            onClick={() => openFillFieldsPreview(activeDrugLabel)}
                                            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
                                        >
                                            <Sparkles className="h-4 w-4" />
                                            Fill fields
                                        </button>
                                    </HealthTooltip>
                                )}
                                <button
                                    type="button"
                                    onClick={() => { setShowDrugInfo(false); setShowFillPreview(false) }}
                                    className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold text-sm transition-all cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}



// Medication Modal with Pill Shape/Color Selection
function MedicationModal({
    isOpen,
    onClose,
    onSave,
    medication,
    existingMedications = [],
    onOpenExisting,
    theme,
    prefillData,
    onLookupDrug,
    doctors = [],
    facilities = [],
    suggestions,
    categories = [],
    onCreateCategory,
    onOpenManageCategories,
    onOpenExport,
}: any) {
    const initialEstimate = medication ? calculatePillCountEstimate(medication.item_metadata) : null
    const [formData, setFormData] = useState({
        name: medication?.title || "",
        category: medication?.item_metadata?.category || "",
        genericName: medication?.item_metadata?.genericName || "",
        drugClass: medication?.item_metadata?.drugClass || "",
        dosage: medication?.item_metadata?.dosage || "",
        dosageForm: medication?.item_metadata?.dosageForm || "",
        frequency: medication?.item_metadata?.frequency || "",
        prescribedBy: medication?.item_metadata?.prescribedBy || "",
        doctor_id: medication?.item_metadata?.doctor_id || null as string | null,
        facility_id: medication?.item_metadata?.facility_id || null as string | null,
        facility_name: medication?.item_metadata?.facility_name || "",
        pharmacy: medication?.item_metadata?.pharmacy || "",
        pharmacyPhone: medication?.item_metadata?.pharmacyPhone || "",
        pharmacyAddress: medication?.item_metadata?.pharmacyAddress || "",
        rxNumber: medication?.item_metadata?.rxNumber || "",
        refillsRemaining: medication?.item_metadata?.refillsRemaining !== undefined && medication?.item_metadata?.refillsRemaining !== null ? String(medication.item_metadata.refillsRemaining) : "",
        lastFilledDate: medication?.item_metadata?.lastFilledDate || "",
        purpose: medication?.item_metadata?.purpose || "",
        sideEffects: medication?.item_metadata?.sideEffects || "",
        interactions: medication?.item_metadata?.interactions || "",
        rxInstructions: medication?.item_metadata?.rxInstructions || "",
        refillDate: medication?.item_metadata?.refillDate || "",
        nextDose: medication?.item_metadata?.nextDose || "",
        pillShape: normalizePillShape(medication?.item_metadata?.pillShape),
        pillColor: medication?.item_metadata?.pillColor || "#FFFFFF",
        trackInventory: medication ? isMedTracked(medication.item_metadata) : false,
        pillsPerDose: String(Number(medication?.item_metadata?.pillsPerDose ?? 1) || 1),
        lowStockThreshold: String(isNaN(Number(medication?.item_metadata?.lowStockThreshold)) ? 5 : Number(medication?.item_metadata?.lowStockThreshold)),
        quantity: String(Number(initialEstimate ? initialEstimate.remaining : (medication?.item_metadata?.quantity ?? 0)) || 0),
        totalQuantity: String(Number(medication?.item_metadata?.totalQuantity ?? 0) || 0),
        countStartOption: ((medication?.item_metadata?.countStartOption as CountStartOption) || "now") as CountStartOption,
        quantityChanged: false,
        countStartChanged: false,
        notes: medication?.item_metadata?.notes || "",
        reminders: medication?.item_metadata?.reminders || [],
        doseSchedule: medication?.item_metadata?.doseSchedule || [], // Array of { dayIndex: number, quantity: number }
        startDate: medication?.item_metadata?.startDate || medication?.item_metadata?.scheduleStartDate || format(new Date(), 'yyyy-MM-dd'),
        endDate: medication?.item_metadata?.endDate || "",
        scheduleStartDate: medication?.item_metadata?.scheduleStartDate || format(new Date(), 'yyyy-MM-dd'),
        dosesPerDay: medication?.item_metadata?.dosesPerDay || "1"
    })

    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [isStyleExpanded, setIsStyleExpanded] = useState(false)
    const [showQRScanner, setShowQRScanner] = useState(false)
    const [scanningQR, setScanningQR] = useState(false)
    const [confirmedDuplicateKey, setConfirmedDuplicateKey] = useState<string | null>(null)

    // Duplicate check when adding a NEW medication (not editing)
    const normalizedInputName = formData.name.trim().toLowerCase()
    const normalizedInputDose = (formData.dosage.trim() || "as directed").toLowerCase()
    const currentDuplicateKey = `${normalizedInputName}__${normalizedInputDose}`

    const duplicateExistingMed = useMemo(() => {
        if (medication || !normalizedInputName) return null
        return existingMedications.find((m: any) => {
            const mName = (m.title || "").trim().toLowerCase()
            if (mName !== normalizedInputName) return false
            const mDose = ((m.item_metadata?.dosage || "").trim() || "as directed").toLowerCase()
            return mDose === normalizedInputDose || (formData.dosage.trim() === "" && (m.item_metadata?.dosage || "").trim() === "")
        }) || null
    }, [medication, existingMedications, normalizedInputName, normalizedInputDose, formData.dosage])

    // Apply ONLY user-approved fields from Official FDA Label Lookup
    // NEVER touch dosage, quantity, schedule, reminder times, or notes, and NEVER auto-save
    useEffect(() => {
        if (prefillData?.fields) {
            const f = prefillData.fields
            setFormData(prev => ({
                ...prev,
                ...(f.name !== undefined && !prev.name ? { name: f.name } : {}),
                ...(f.genericName !== undefined ? { genericName: f.genericName } : {}),
                ...(f.drugClass !== undefined ? { drugClass: f.drugClass } : {}),
                ...(f.purpose !== undefined ? { purpose: f.purpose } : {}),
                ...(f.sideEffects !== undefined ? { sideEffects: f.sideEffects } : {}),
                ...(f.interactions !== undefined ? { interactions: f.interactions } : {}),
            }))
        }
    }, [prefillData])

    const performSave = async () => {
        setSaveError(null)
        if (!formData.name.trim()) {
            const err = "Medication name is required."
            setSaveError(err)
            toast.error(err)
            return
        }

        setIsSaving(true)
        try {
            const success = await onSave({
                ...formData,
                name: formData.name.trim(),
                dosage: formData.dosage.trim() || "As directed",
                pillShape: normalizePillShape(formData.pillShape)
            })
            if (success === false) {
                throw new Error("Unable to save medication to your vault. Please verify your connection.")
            }
            toast.success(medication ? "Medication updated successfully!" : "Medication saved successfully!")
            onClose()
        } catch (err: any) {
            console.error("Save error:", err)
            const msg = err?.message || "Failed to save medication. Please check your connection and try again."
            setSaveError(msg)
            toast.error(msg)
        } finally {
            setIsSaving(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!medication && duplicateExistingMed && confirmedDuplicateKey !== currentDuplicateKey) {
            toast.warning(`"${duplicateExistingMed.title}" (${duplicateExistingMed.item_metadata?.dosage || "As directed"}) is already in your list. Choose "Open existing" or "Add anyway".`)
            return
        }
        await performSave()
    }

    const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setScanningQR(true)
        // Simulate high-fidelity QR code processing
        setTimeout(() => {
            // Mock data based on common meds or AI-like detection
            const mockData = {
                name: "Prednisone",
                dosage: "10mg",
                rxInstructions: "Take tablets by mouth daily as directed for tapering",
                prescribedBy: "Dr. Roberts",
                quantity: "21",
                totalQuantity: "21",
                frequency: "Once daily"
            }
            // Merge with existing form but prioritize scanned data
            setFormData(prev => ({ ...prev, ...mockData }))
            setScanningQR(false)
            setShowQRScanner(false)
            alert("QR Code / Barcode scanned! Prednisone details have been auto-filled.")
        }, 2000)
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl my-8 ${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'}`}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold">{medication ? 'Edit' : 'Add'} Medication</h2>
                        {medication && onOpenExport && (
                            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                                <HealthTooltip content="Print this medication">
                                    <button
                                        type="button"
                                        onClick={() => onOpenExport(medication)}
                                        aria-label="Print Medication"
                                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all cursor-pointer"
                                    >
                                        <Printer className="h-5 w-5" />
                                    </button>
                                </HealthTooltip>
                                <HealthTooltip content="Download PDF or copy plain text for this medication">
                                    <button
                                        type="button"
                                        onClick={() => onOpenExport(medication)}
                                        aria-label="Export Medication PDF"
                                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all cursor-pointer"
                                    >
                                        <FileDown className="h-5 w-5" />
                                    </button>
                                </HealthTooltip>
                            </div>
                        )}
                    </div>
                    <HealthTooltip content="Close medication form">
                        <button type="button" onClick={onClose} aria-label="Close medication form" className="text-gray-400 hover:text-white cursor-pointer"><X className="h-6 w-6" /></button>
                    </HealthTooltip>
                </div>

                {/* QR Code Scanner Section */}
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h3 className="font-bold text-cyan-400 flex items-center gap-2">
                                <Activity className="h-5 w-5" /> QR Code Scanner
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">Scan medication barcode to auto-fill fields</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <HealthTooltip content="Open Rx Quick Import preset templates">
                                <button
                                    type="button"
                                    onClick={() => (window as any).showMockDrugModalFromAddMed()}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-900/20 cursor-pointer"
                                >
                                    <Download className="h-4 w-4" /> Import Rx
                                </button>
                            </HealthTooltip>
                            <HealthTooltip content="Scan or upload a prescription bottle barcode image">
                                <button
                                    type="button"
                                    onClick={() => setShowQRScanner(!showQRScanner)}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition-all cursor-pointer"
                                >
                                    {showQRScanner ? 'Hide Scanner' : 'Open Scanner'}
                                </button>
                            </HealthTooltip>
                        </div>
                    </div>

                    {showQRScanner && (
                        <div className="mt-4 p-4 rounded-xl bg-black/20 border border-cyan-500/20">
                            <div className="text-center">
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleQRUpload}
                                        className="hidden"
                                        disabled={scanningQR}
                                    />
                                    <div className={`p-8 rounded-2xl border-2 border-dashed transition-all ${scanningQR ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-600 hover:border-cyan-500 hover:bg-cyan-500/5'}`}>
                                        {scanningQR ? (
                                            <>
                                                <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-cyan-400" />
                                                <div className="font-bold text-cyan-400">Scanning QR Code...</div>
                                            </>
                                        ) : (
                                            <>
                                                <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                                <div className="font-bold mb-2">Take Photo of QR Code</div>
                                                <div className="text-sm text-gray-400">Click to open camera or upload image</div>
                                            </>
                                        )}
                                    </div>
                                </label>
                                <div className="mt-3 text-xs text-gray-500">
                                    Supported: Prescription bottle barcodes, NDC codes, medication QR codes
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-bold text-gray-400 uppercase block">Medication Name *</label>
                                {onLookupDrug && (
                                    <HealthTooltip content="Look up official FDA & DailyMed drug label without overwriting your dose or schedule">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!formData.name.trim() && !formData.genericName.trim()) {
                                                    toast.error("Please enter a medication or generic name first.")
                                                    return
                                                }
                                                onLookupDrug(formData.name.trim(), formData.genericName.trim())
                                            }}
                                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                                        >
                                            <Sparkles className="h-3 w-3" /> Look up Drug Info
                                        </button>
                                    </HealthTooltip>
                                )}
                            </div>
                            <FieldSuggestionInput
                                name="medication-name"
                                placeholder="e.g., Zolpidem"
                                value={formData.name}
                                onChange={(val) => setFormData({ ...formData, name: val })}
                                suggestions={suggestions?.medicationNames || []}
                                inputClassName="w-full px-4 py-3 pr-10 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Dosage</label>
                            <input
                                placeholder="e.g., 10mg (or as directed)"
                                value={formData.dosage}
                                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {/* Duplicate Warning Banner when adding a new medication */}
                    {!medication && duplicateExistingMed && confirmedDuplicateKey !== currentDuplicateKey && (
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-start gap-2.5 text-amber-200">
                                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold text-amber-300">Already in your list: </span>
                                    <span>
                                        <strong>{duplicateExistingMed.title}</strong> ({duplicateExistingMed.item_metadata?.dosage || "As directed"}) already exists in your medications.
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                {onOpenExisting && (
                                    <HealthTooltip content="Switch to editing the existing medication record instead of creating a duplicate">
                                        <button
                                            type="button"
                                            onClick={() => onOpenExisting(duplicateExistingMed)}
                                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors cursor-pointer"
                                        >
                                            Open existing
                                        </button>
                                    </HealthTooltip>
                                )}
                                <HealthTooltip content="Create a separate medication entry anyway">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            setConfirmedDuplicateKey(currentDuplicateKey)
                                            await performSave()
                                        }}
                                        disabled={isSaving}
                                        className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 font-semibold transition-colors cursor-pointer"
                                    >
                                        Add anyway
                                    </button>
                                </HealthTooltip>
                            </div>
                        </div>
                    )}

                    {/* Category & Dosage Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                    <label className="text-sm font-bold text-gray-400 uppercase">Category</label>
                                    <FieldHelpPopover
                                        title="Medication Category"
                                        content="Group your medications (Every Day Usage, As Needed, Surgery, Supplements, or create your own) for filtering and grouped PDF exports."
                                    />
                                </div>
                                {onOpenManageCategories && (
                                    <HealthTooltip content="Create, rename, or delete medication categories">
                                        <button
                                            type="button"
                                            onClick={onOpenManageCategories}
                                            className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors cursor-pointer"
                                        >
                                            Manage categories
                                        </button>
                                    </HealthTooltip>
                                )}
                            </div>
                            <MedicationCategorySelect
                                label=""
                                value={formData.category}
                                onChange={(cat) => setFormData({ ...formData, category: cat })}
                                categories={categories}
                                onCreateCategory={onCreateCategory}
                            />
                        </div>
                        <div>
                            <SmartSelect
                                fieldKey="medication_form"
                                label="Form (Optional)"
                                value={formData.dosageForm}
                                onChange={(val) => setFormData({ ...formData, dosageForm: val })}
                                placeholder="e.g., Tablet, Capsule, Liquid, Inhaler..."
                                triggerClassName="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-white flex items-center justify-between gap-2 text-left"
                            />
                        </div>
                    </div>

                    {/* Generic Name & Drug Class */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Generic Name</label>
                            <input
                                placeholder="e.g., Zolpidem tartrate"
                                value={formData.genericName}
                                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Drug Class</label>
                            <input
                                placeholder="e.g., Sedative-hypnotic"
                                value={formData.drugClass}
                                onChange={(e) => setFormData({ ...formData, drugClass: e.target.value })}
                                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Pill Style Accordion */}
                    <div className={`rounded-2xl border transition-all ${isStyleExpanded ? 'p-6 bg-purple-500/5 border-purple-500/30' : 'p-4 bg-[#2a2a2a] border-gray-700 hover:border-gray-600'}`}>
                        <button
                            type="button"
                            onClick={() => setIsStyleExpanded(!isStyleExpanded)}
                            className="w-full flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gray-800 border border-gray-700">
                                    {(() => {
                                        const ShapeIcon = PILL_SHAPES.find(s => s.id === normalizePillShape(formData.pillShape))?.icon || Circle
                                        return <ShapeIcon className="h-5 w-5" style={{ color: formData.pillColor }} />
                                    })()}
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-white">Pill Design</div>
                                    {!isStyleExpanded && (
                                        <div className="text-xs text-gray-400 capitalize">
                                            {PILL_COLORS.find(c => c.hex === formData.pillColor)?.label || 'Selected'} {PILL_SHAPES.find(s => s.id === normalizePillShape(formData.pillShape))?.label || 'Oval Tablet'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${isStyleExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {isStyleExpanded && (
                            <div className="mt-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                                {/* Pill Shape Selection */}
                                <div>
                                    <label className="text-[10px] font-black text-purple-400 uppercase mb-3 block tracking-widest">Select Pill Shape</label>
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                        {PILL_SHAPES.map(shape => {
                                            const Icon = shape.icon
                                            return (
                                                <button
                                                    key={shape.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, pillShape: shape.id })}
                                                    className={`p-4 rounded-xl border-2 transition-all ${normalizePillShape(formData.pillShape) === shape.id ? 'border-purple-500 bg-purple-500/20' : 'border-gray-700 hover:border-gray-600'}`}
                                                >
                                                    <Icon className="h-6 w-6 mx-auto mb-2" />
                                                    <div className="text-[10px] text-center font-bold uppercase tracking-tighter">{shape.label}</div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Pill Color Selection */}
                                <div>
                                    <label className="text-[10px] font-black text-purple-400 uppercase mb-3 block tracking-widest">Select Pill Color</label>
                                    <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                                        {PILL_COLORS.map(color => (
                                            <button
                                                key={color.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, pillColor: color.hex })}
                                                className={`p-2 rounded-xl border-2 transition-all ${formData.pillColor === color.hex ? 'border-purple-500 bg-white/5' : 'border-gray-700 hover:border-gray-600'}`}
                                            >
                                                <div className="w-6 h-6 rounded-full mx-auto shadow-inner" style={{ backgroundColor: color.hex, border: '1px solid #333' }}></div>
                                                <div className="text-[9px] text-center mt-1 font-bold">{color.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Optional Pill Count Tracking */}
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
                        <div className="flex items-start justify-between gap-2">
                            <HealthTooltip content="Enable client-side remaining pill estimate and low-stock warning">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(formData.trackInventory)}
                                        onChange={(e) => setFormData({ ...formData, trackInventory: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                    />
                                    <div>
                                        <span className="text-sm font-bold text-white">Track pill count</span>
                                        <p className="text-xs text-gray-400">Optional — enable to count remaining pills and show low-stock alerts</p>
                                    </div>
                                </label>
                            </HealthTooltip>
                            <FieldHelpPopover
                                title="Track Pill Count"
                                content="Estimates your remaining pills automatically at each scheduled reminder time (or when you tap Take for As-Needed meds) with zero daily background database writes."
                            />
                        </div>

                        {formData.trackInventory && (
                            <div className="space-y-3 pt-2 border-t border-white/10">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <div className="flex items-center gap-1 mb-1.5">
                                            <label className="text-[11px] font-bold text-gray-400 uppercase">Pills per Dose</label>
                                            <FieldHelpPopover
                                                title="Pills per Dose"
                                                content="How many tablets, capsules, or units are subtracted each time one scheduled dose occurs (e.g. 1, 0.5, or 2)."
                                            />
                                        </div>
                                        <input
                                            type="number"
                                            step="0.25"
                                            min="0.25"
                                            value={formData.pillsPerDose}
                                            onChange={(e) => {
                                                const clean = e.target.value.replace(/^0+(?=\d)/, "");
                                                setFormData({ ...formData, pillsPerDose: clean });
                                            }}
                                            className="w-full px-3 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 block">Current Quantity</label>
                                        <input
                                            type="number"
                                            step="0.25"
                                            min="0"
                                            value={formData.quantity}
                                            onChange={(e) => {
                                                const clean = e.target.value.replace(/^0+(?=\d)/, "");
                                                setFormData({ ...formData, quantity: clean, quantityChanged: true });
                                            }}
                                            className="w-full px-3 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 block">Total (Bottle)</label>
                                        <input
                                            type="number"
                                            step="0.25"
                                            min="0"
                                            value={formData.totalQuantity}
                                            onChange={(e) => {
                                                const clean = e.target.value.replace(/^0+(?=\d)/, "");
                                                setFormData({ ...formData, totalQuantity: clean });
                                            }}
                                            className="w-full px-3 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 mb-1.5">
                                            <label className="text-[11px] font-bold text-gray-400 uppercase">Low-Stock Alert</label>
                                            <FieldHelpPopover
                                                title="Low-Stock Alert"
                                                content="Shows a red LOW STOCK badge on the medication card when your estimated remaining pills reach or drop below this number."
                                            />
                                        </div>
                                        <input
                                            type="number"
                                            step="1"
                                            min="0"
                                            value={formData.lowStockThreshold}
                                            onChange={(e) => {
                                                const clean = e.target.value.replace(/^0+(?=\d)/, "");
                                                setFormData({ ...formData, lowStockThreshold: clean });
                                            }}
                                            className="w-full px-3 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase">Count Starts</label>
                                        <FieldHelpPopover
                                            title="Count Starts"
                                            content="Choose 'Now' if today's upcoming dose hasn't been taken yet; 'After today's dose' or 'Tomorrow' if your Current Quantity already reflects today's doses so today isn't subtracted twice."
                                        />
                                    </div>
                                    <select
                                        value={formData.countStartOption}
                                        onChange={(e) => setFormData({ ...formData, countStartOption: e.target.value as CountStartOption, countStartChanged: true })}
                                        className="w-full px-3 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="now">Now (tonight&apos;s dose still to come)</option>
                                        <option value="after_today">After today&apos;s dose (already taken)</option>
                                        <option value="tomorrow">Tomorrow</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rest of form fields */}
                    {/* Treatment Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                        <div>
                            <label className="text-sm font-bold text-blue-400 uppercase mb-2 block">Treatment Start Date</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value, scheduleStartDate: e.target.value })}
                                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-blue-400 uppercase mb-2 block">Treatment End Date (Optional)</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                style={{ colorScheme: 'dark' }}
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Leave empty to continue indefinitely</p>
                        </div>
                    </div>

                    {/* Frequency & Prescriber */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <SmartSelect
                                fieldKey="medication_frequency"
                                label="Frequency / Doses"
                                value={formData.frequency}
                                onChange={(freq) => {
                                    const lower = freq.toLowerCase().trim()
                                    let doses = "1"
                                    if (lower.includes("twice") || lower.includes("2x")) doses = "2"
                                    else if (lower.includes("three") || lower.includes("3x")) doses = "3"
                                    else if (lower.includes("four") || lower.includes("4x")) doses = "4"
                                    const defaultRem = getDefaultReminderForFrequency(freq)
                                    const nextReminders = defaultRem ? [defaultRem] : formData.reminders
                                    setFormData({ ...formData, frequency: freq, dosesPerDay: doses, reminders: nextReminders })
                                }}
                                placeholder="Select frequency or + Custom..."
                                triggerClassName="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-white flex items-center justify-between gap-2 text-left"
                            />
                        </div>
                        <div>
                            <DoctorCombobox
                                label="Prescribed By"
                                value={formData.prescribedBy}
                                doctorId={formData.doctor_id}
                                doctors={doctors}
                                placeholder="Select doctor or type name..."
                                inputClassName="w-full px-4 py-3 pr-12 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm"
                                onSelectDoctor={(doc) => {
                                    const singleFac = findSingleLinkedFacility(doc, facilities)
                                    setFormData((prev) => ({
                                        ...prev,
                                        prescribedBy: doc.name,
                                        doctor_id: doc.id,
                                        ...(singleFac && !prev.facility_name?.trim()
                                            ? { facility_id: singleFac.id, facility_name: singleFac.name }
                                            : {}),
                                    }))
                                }}
                                onClear={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        prescribedBy: "",
                                        doctor_id: null,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FacilityCombobox
                            label="Facility"
                            value={formData.facility_name}
                            facilityId={formData.facility_id}
                            facilities={facilities}
                            placeholder="Select facility or type name..."
                            inputClassName="w-full px-4 py-3 pr-12 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm"
                            onSelectFacility={(fac) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    facility_id: fac.id,
                                    facility_name: fac.name,
                                }))
                            }
                            onClear={() =>
                                setFormData((prev) => ({
                                    ...prev,
                                    facility_id: null,
                                    facility_name: "",
                                }))
                            }
                        />
                        <div>
                            <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Pharmacy</label>
                            <FieldSuggestionInput
                                name="med-pharmacy"
                                placeholder="e.g., CVS Pharmacy, Walgreens..."
                                value={formData.pharmacy}
                                onChange={(val) => setFormData({ ...formData, pharmacy: val })}
                                suggestions={suggestions?.pharmacies || []}
                                inputClassName="w-full px-4 py-3 pr-10 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            />
                        </div>
                    </div>

                    {/* Optional Pharmacy & Refill Details */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
                        <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                            Pharmacy &amp; Refill Details (Optional)
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Pharmacy Phone</label>
                                <input
                                    type="tel"
                                    placeholder="e.g., (555) 123-4567"
                                    value={formData.pharmacyPhone}
                                    onChange={(e) => setFormData({ ...formData, pharmacyPhone: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Pharmacy Address</label>
                                <input
                                    placeholder="e.g., 123 Main St, Suite 100"
                                    value={formData.pharmacyAddress}
                                    onChange={(e) => setFormData({ ...formData, pharmacyAddress: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-white"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Rx Number</label>
                                <input
                                    placeholder="e.g., RX-849201"
                                    value={formData.rxNumber}
                                    onChange={(e) => setFormData({ ...formData, rxNumber: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Refills Remaining</label>
                                <input
                                    placeholder="e.g., 3"
                                    value={formData.refillsRemaining}
                                    onChange={(e) => setFormData({ ...formData, refillsRemaining: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Last Filled Date</label>
                                <input
                                    type="date"
                                    value={formData.lastFilledDate}
                                    onChange={(e) => setFormData({ ...formData, lastFilledDate: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-white"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Next Refill Date</label>
                                <input
                                    type="date"
                                    value={formData.refillDate}
                                    onChange={(e) => setFormData({ ...formData, refillDate: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-white"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reminder Times */}
                    <div>
                        <label className="text-sm font-bold text-gray-400 uppercase mb-2 block flex justify-between">
                            <span>Reminder Times</span>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, reminders: [...(formData.reminders || []), "09:00"] })}
                                className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1"
                            >
                                <Plus className="h-3 w-3" /> Add Time
                            </button>
                        </label>
                        <div className="space-y-2">
                            {(formData.reminders || []).map((time: string, index: number) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => {
                                            const newReminders = [...(formData.reminders || [])]
                                            newReminders[index] = e.target.value
                                            setFormData({ ...formData, reminders: newReminders })
                                        }}
                                        className="flex-1 px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newReminders = (formData.reminders || []).filter((_: any, i: number) => i !== index)
                                            setFormData({ ...formData, reminders: newReminders })
                                        }}
                                        className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-xl"
                                    >
                                        <Trash className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                            {(formData.reminders || []).length === 0 && (
                                <div className="text-sm text-gray-500 italic p-2 border border-dashed border-gray-700 rounded-xl text-center">
                                    No reminders set. Click "Add Time" to get notifications.
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Purpose</label>
                        <input placeholder="What is this medication for?" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Common Side Effects</label>
                        <textarea
                            placeholder="e.g., Drowsiness, dizziness, headache..."
                            value={formData.sideEffects}
                            onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Drug Interactions</label>
                        <textarea
                            placeholder="List any known interactions with other medications..."
                            value={formData.interactions}
                            onChange={(e) => setFormData({ ...formData, interactions: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">RX Label Instructions</label>
                        <textarea
                            placeholder="Prescription label instructions (e.g., 'Take 1 tablet by mouth daily before bedtime')..."
                            value={formData.rxInstructions}
                            onChange={(e) => setFormData({ ...formData, rxInstructions: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold text-gray-400 uppercase block">Private Notes</label>
                            <span className="text-[11px] text-purple-400 font-medium">Verify with your pharmacist or doctor</span>
                        </div>
                        <textarea
                            placeholder="Private instructions, doctor/pharmacist recommendations..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>

                    {/* Dose Schedule (Dynamic Tapering/Increase) */}
                    <div className="p-5 rounded-2xl bg-purple-900/10 border border-purple-500/20">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-bold text-purple-400 flex items-center gap-2">
                                    <Activity className="h-5 w-5" /> Periodic Dose Schedule
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">Specify quantity for each day relative to the start date below</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const nextDay = (formData.doseSchedule || []).length + 1;
                                    setFormData({
                                        ...formData,
                                        doseSchedule: [...(formData.doseSchedule || []), { dayIndex: nextDay, quantity: 1 }]
                                    })
                                }}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                            >
                                <Plus className="h-3 w-3" /> Add Day
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Schedule Start Date</label>
                            <input
                                type="date"
                                value={formData.scheduleStartDate}
                                onChange={(e) => setFormData({ ...formData, scheduleStartDate: e.target.value })}
                                className="w-full md:w-1/2 px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            />
                        </div>

                        {formData.doseSchedule && formData.doseSchedule.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                                {formData.doseSchedule.map((entry: any, index: number) => (
                                    <div key={index} className="flex flex-col gap-1 p-3 bg-black/40 rounded-xl border border-white/5 relative group hover:border-purple-500/30 transition-all">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase flex justify-between">
                                            <span>Day {entry.dayIndex}</span>
                                            <span className="text-[9px] opacity-70">
                                                {(() => {
                                                    const base = parseMedLocalDate(formData.scheduleStartDate)
                                                    return base ? format(addDays(base, entry.dayIndex - 1), 'MMM d') : ''
                                                })()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.25"
                                                value={isNaN(entry.quantity) ? '' : entry.quantity}
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                                    const newSched = [...(formData.doseSchedule || [])];
                                                    newSched[index].quantity = isNaN(val) ? 0 : val;
                                                    setFormData({ ...formData, doseSchedule: newSched });
                                                }}
                                                className="w-full bg-[#333] border border-gray-600 rounded px-2 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-purple-500"
                                            />
                                            <div className="text-[10px] text-gray-400">pills</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newSched = (formData.doseSchedule || []).filter((_: any, i: number) => i !== index);
                                                // Re-index days
                                                const reIndexed = newSched.map((item: any, i: number) => ({ ...item, dayIndex: i + 1 }));
                                                setFormData({ ...formData, doseSchedule: reIndexed });
                                            }}
                                            className="absolute -top-1.5 -right-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <Trash className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-xs text-gray-500 border border-dashed border-gray-700 rounded-2xl bg-black/10">
                                No specific daily schedule set. Uses 'Dosage' field above.
                            </div>
                        )}
                    </div>

                    {/* Save Error Alert */}
                    {saveError && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                            <div className="flex-1">
                                <strong className="block font-bold">Failed to Save Medication:</strong>
                                <span>{saveError}</span>
                                <p className="text-xs text-gray-400 mt-1">Your form values have been preserved. Please verify and submit again.</p>
                            </div>
                        </div>
                    )}

                    {/* Verification Note Banner */}
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
                        <Shield className="h-4 w-4 shrink-0 text-blue-400" />
                        <span><strong>Clinical Reminder:</strong> Verify with your pharmacist or doctor.</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Saving Medication...
                                </>
                            ) : (
                                `${medication ? 'Update' : 'Add'} Medication`
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-6 py-4 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Pill Library Modal - View all available icons
export function PillLibraryModal({ isOpen, onClose, theme, addItem, categories, onCreateCategory }: any) {
    const [selectedShape, setSelectedShape] = useState<string | null>(null)
    const [selectedColor, setSelectedColor] = useState<string | null>(null)
    const [quickAddName, setQuickAddName] = useState("")
    const [quickAddDosage, setQuickAddDosage] = useState("")
    const [quickAddCategory, setQuickAddCategory] = useState("")
    const [localCustomCats, setLocalCustomCats] = useState<string[]>(() => loadSavedCustomMedCategories())
    const [isSaving, setIsSaving] = useState(false)

    const effectiveCategories = useMemo(
        () => (Array.isArray(categories) && categories.length > 0 ? categories : getAllMedicationCategories([], localCustomCats)),
        [categories, localCustomCats]
    )

    const handleCreateCat = (cat: string) => {
        if (onCreateCategory) {
            onCreateCategory(cat)
            return
        }
        const clean = cat.trim()
        if (!clean) return
        setLocalCustomCats((prev) => {
            if (prev.some((p) => p.toLowerCase() === clean.toLowerCase())) return prev
            const next = [...prev, clean]
            saveCustomMedCategories(next)
            return next
        })
    }

    const mgSizes = ["5mg", "10mg", "20mg", "25mg", "50mg", "75mg", "100mg", "150mg", "200mg", "250mg", "300mg", "500mg", "1000mg"]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className={`w-full max-w-6xl rounded-2xl p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto ${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Pill Icon Library</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button>
                </div>

                {/* Pill Shapes */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold mb-4 text-purple-400">Pill Shapes</h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {PILL_SHAPES.map(shape => {
                            const Icon = shape.icon
                            return (
                                <div key={shape.id} className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${selectedShape === shape.id ? 'border-purple-500 bg-purple-500/20' : 'border-gray-700 hover:border-gray-600'}`} onClick={() => setSelectedShape(shape.id)}>
                                    <Icon className="h-12 w-12 mx-auto mb-3" />
                                    <div className="text-sm text-center font-bold">{shape.label}</div>
                                    {selectedShape === shape.id && <div className="text-xs text-center text-green-400 mt-2">✓ Selected</div>}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Pill Colors */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold mb-4 text-pink-400">Pill Colors</h3>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
                        {PILL_COLORS.map(color => (
                            <div key={color.id} className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedColor === color.hex ? 'border-pink-500' : 'border-gray-700 hover:border-gray-600'}`} onClick={() => setSelectedColor(color.hex)}>
                                <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{ backgroundColor: color.hex, border: '2px solid #333' }}></div>
                                <div className="text-xs text-center font-bold">{color.label}</div>
                                {selectedColor === color.hex && <div className="text-xs text-center text-green-400 mt-1">✓</div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* MG Sizes */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4 text-blue-400">Common Dosage Sizes (MG)</h3>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                        {mgSizes.map(size => (
                            <div key={size} className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-center">
                                <div className="font-bold text-blue-300">{size}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview & Quick Add */}
                {selectedShape && selectedColor && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-3xl bg-gradient-to-br from-purple-900/40 via-blue-900/20 to-pink-900/40 border border-white/10 shadow-inner">
                        <div className="flex flex-col items-center justify-center p-6 bg-black/40 rounded-3xl border border-white/5">
                            <h3 className="text-sm font-black uppercase tracking-widest text-purple-400 mb-6">Pill Visualizer</h3>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-white blur-3xl opacity-10 group-hover:opacity-20 transition-opacity rounded-full"></div>
                                {(() => {
                                    const Icon = PILL_SHAPES.find(s => s.id === normalizePillShape(selectedShape))?.icon || Circle
                                    return <Icon className="h-40 w-40 relative z-10 transition-transform duration-700" fill={selectedColor} stroke="white" strokeWidth={0.5} />
                                })()}
                            </div>
                            <div className="mt-8 text-center">
                                <div className="text-2xl font-black italic tracking-tighter uppercase">{PILL_SHAPES.find(s => s.id === normalizePillShape(selectedShape))?.label || 'Oval Tablet'}</div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{PILL_COLORS.find(c => c.hex === selectedColor)?.label} Finish</div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center">
                            <h3 className="text-xl font-black italic uppercase tracking-tight mb-2">Fast Import</h3>
                            <p className="text-sm text-gray-400 mb-6">Add this medication to your list instantly with these visuals.</p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Medication Name</label>
                                    <input
                                        placeholder="e.g. Advil"
                                        value={quickAddName}
                                        onChange={e => setQuickAddName(e.target.value)}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-purple-500/50 transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Dosage</label>
                                    <input
                                        placeholder="e.g. 200mg"
                                        value={quickAddDosage}
                                        onChange={e => setQuickAddDosage(e.target.value)}
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-purple-500/50 transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Category</label>
                                    <MedicationCategorySelect
                                        value={quickAddCategory}
                                        onChange={setQuickAddCategory}
                                        categories={effectiveCategories}
                                        onCreateCategory={handleCreateCat}
                                    />
                                </div>

                                <button
                                    onClick={async () => {
                                        if (!quickAddName || !quickAddDosage) {
                                            toast.error("Please enter medication name and dosage")
                                            return
                                        }
                                        if (!addItem) {
                                            toast.error("Unable to save medication right now")
                                            return
                                        }
                                        setIsSaving(true)
                                        try {
                                            if (quickAddCategory.trim()) handleCreateCat(quickAddCategory.trim())
                                            const created = await addItem({
                                                type: "note",
                                                category: "Medications",
                                                title: quickAddName.trim(),
                                                item_metadata: {
                                                    is_medication: true,
                                                    category: quickAddCategory.trim() || "",
                                                    dosage: quickAddDosage.trim(),
                                                    pillShape: selectedShape,
                                                    pillColor: selectedColor,
                                                    startDate: format(new Date(), 'yyyy-MM-dd'),
                                                    notes: "Quick added from Pill Library",
                                                    createdAt: new Date().toISOString(),
                                                    lastModified: new Date().toISOString(),
                                                }
                                            })
                                            if (created) upsertSharedHealthRecord(created)
                                            toast.success(`${quickAddName.trim()} added to your medications!`)
                                            setQuickAddName("")
                                            setQuickAddDosage("")
                                        } catch (e) {
                                            console.error(e)
                                            toast.error("Failed to add medication")
                                        } finally {
                                            setIsSaving(false)
                                        }
                                    }}
                                    disabled={isSaving}
                                    className="w-full py-5 rounded-3xl bg-white text-black font-black uppercase italic tracking-tighter hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plus className="h-5 w-5" /> Add to My List</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 text-center text-sm text-gray-400">
                    Select shapes and colors to preview how they'll appear in your medication list
                </div>
            </div>
        </div>
    )
}

// Rx Import Modal - Full-viewport fit, compact 3-across cards, group-default category, Manage categories, and Safe Import
function MockDrugsModal({
    isOpen,
    onClose,
    onAddMockDrug,
    onUpdateExistingCategory,
    existingMedications = [],
    theme,
    categories = [],
    onCreateCategory,
    onOpenManageCategories,
}: any) {
    // Preset Groups (unchanged)
    const MED_CATEGORIES = [
        {
            id: "rash",
            label: "Severe Rash",
            icon: Shield,
            color: "text-red-400",
            meds: [
                { name: "Prednisone", dosage: "10mg", frequency: "As directed", shape: "round", color: "#FFFFFF", quantity: 21, purpose: "Severe Rash" },
                { name: "Famotidine", dosage: "20mg", frequency: "Twice daily", shape: "round", color: "#FFFFFF", quantity: 60, purpose: "Stomach Protection (with Rash Meds)" },
                { name: "Loratadine", dosage: "10mg", frequency: "Once daily", shape: "round", color: "#FFFFFF", quantity: 30, purpose: "Allergy/Rash" },
                { name: "Hydroxyzine", dosage: "25mg", frequency: "Every 6 hours", shape: "round", color: "#FFFFFF", quantity: 30, purpose: "Itching/Rash" },
            ]
        },
        {
            id: "cold",
            label: "Cold Medicine",
            icon: Thermometer,
            color: "text-blue-400",
            meds: [
                { name: "Tylenol Cold & Flu", dosage: "500-325mg", frequency: "Every 4-6 hours", shape: "capsule", color: "#FF4444", quantity: 24, purpose: "Cold & Flu Symptoms" },
                { name: "NyQuil / DayQuil", dosage: "30ml", frequency: "Every 6 hours", shape: "liquid", color: "#4169E1", quantity: 2, purpose: "Multi-symptom Cold" },
                { name: "Theraflu", dosage: "1 packet", frequency: "Every 4 hours", shape: "powder", color: "#FFD700", quantity: 6, purpose: "Flu Relief" },
                { name: "Robitussin", dosage: "10ml", frequency: "Every 4-6 hours", shape: "liquid", color: "#FF4444", quantity: 1, purpose: "Cough Relief" },
                { name: "Mucinex", dosage: "600mg", frequency: "Every 12 hours", shape: "oval", color: "#32CD32", quantity: 20, purpose: "Chest Congestion" },
                { name: "Sudafed", dosage: "30mg", frequency: "Every 4-6 hours", shape: "round", color: "#FF4444", quantity: 24, purpose: "Nasal Congestion" },
                { name: "Alka-Seltzer Plus", dosage: "2 tablets", frequency: "Every 4 hours", shape: "round", color: "#FFFFFF", quantity: 20, purpose: "Severe Cold" },
            ]
        },
        {
            id: "pain",
            label: "Pain Relief",
            icon: Heart,
            color: "text-purple-400",
            meds: [
                { name: "Tylenol", dosage: "500mg", frequency: "Every 4-6 hours", shape: "round", color: "#FFFFFF", quantity: 50, purpose: "Pain/Fever" },
                { name: "Bufferin", dosage: "325mg", frequency: "Every 4 hours", shape: "round", color: "#FFFFFF", quantity: 30, purpose: "Pain/Inflammation" },
                { name: "Aspirin", dosage: "81mg", frequency: "Once daily", shape: "round", color: "#FFFFFF", quantity: 100, purpose: "Pain/Heart" },
                { name: "Acetaminophen", dosage: "500mg", frequency: "Every 6 hours", shape: "round", color: "#FFFFFF", quantity: 50, purpose: "Pain Relief" },
                { name: "Codeine", dosage: "30mg", frequency: "Every 4-6 hours", shape: "round", color: "#FFFFFF", quantity: 20, purpose: "Moderate to Severe Pain" },
                { name: "Ibuprofen (Advil, Motrin)", dosage: "200-400mg", frequency: "Every 4-6 hours", shape: "round", color: "#FFFFFF", quantity: 50, purpose: "Inflammation/Pain" },
            ]
        },
        {
            id: "antihistamine",
            label: "Antihistamines (Runny Nose & Sneezing)",
            icon: Wind,
            color: "text-teal-400",
            meds: [
                { name: "Diphenhydramine (Benadryl)", dosage: "25mg", frequency: "Every 4-6 hours", shape: "round", color: "#FF69B4", quantity: 24, purpose: "Allergy/Runny Nose" },
                { name: "Loratadine (Claritin)", dosage: "10mg", frequency: "Once daily", shape: "round", color: "#FFFFFF", quantity: 30, purpose: "Allergy Relief" },
                { name: "Cetirizine (Zyrtec)", dosage: "10mg", frequency: "Once daily", shape: "round", color: "#FFFFFF", quantity: 30, purpose: "Allergy Relief" },
                { name: "Fexofenadine (Allegra)", dosage: "180mg", frequency: "Once daily", shape: "oval", color: "#FFD700", quantity: 30, purpose: "Allergy Relief" },
                { name: "Chlorpheniramine", dosage: "4mg", frequency: "Every 4-6 hours", shape: "round", color: "#FFFF00", quantity: 100, purpose: "Allergy/Cold" },
            ]
        }
    ]

    const [activeCategory, setActiveCategory] = useState(MED_CATEGORIES[0].id)
    const [selectedMeds, setSelectedMeds] = useState<string[]>([])
    const [importCategory, setImportCategory] = useState<string>(MED_CATEGORIES[0].label)
    const [hasManuallyPickedCategory, setHasManuallyPickedCategory] = useState(false)
    const [duplicateAction, setDuplicateAction] = useState<"skip" | "update_category">("skip")
    const [isImporting, setIsImporting] = useState(false)

    const currentCat = MED_CATEGORIES.find(c => c.id === activeCategory) || MED_CATEGORIES[0]

    // Combine user categories + defaults + current group name so dropdown updates live after Manage Categories
    const dropdownCategories = useMemo(() => {
        const set = new Set<string>(categories)
        if (currentCat?.label) set.add(currentCat.label)
        return Array.from(set)
    }, [categories, currentCat])

    // If a manually picked custom category was deleted in Manage Categories, sync immediately
    useEffect(() => {
        if (!importCategory) return
        const groupLabels = MED_CATEGORIES.map(g => g.label.toLowerCase())
        const existsInCategories = categories.some((c: string) => c.toLowerCase() === importCategory.toLowerCase())
        const isPresetGroupLabel = groupLabels.includes(importCategory.toLowerCase())
        if (!existsInCategories && !isPresetGroupLabel) {
            setImportCategory("")
        }
    }, [categories])

    const handleSwitchGroup = (catId: string) => {
        setActiveCategory(catId)
        const target = MED_CATEGORIES.find(c => c.id === catId)
        if (target && !hasManuallyPickedCategory) {
            setImportCategory(target.label)
        }
    }

    const handleManualCategoryChange = (newCat: string) => {
        setHasManuallyPickedCategory(true)
        setImportCategory(newCat)
    }

    const findExistingMatch = (drug: { name: string; dosage: string }) => {
        const n = drug.name.trim().toLowerCase()
        const d = (drug.dosage || "").trim().toLowerCase()
        return existingMedications.find((m: any) => {
            const mName = (m.title || "").trim().toLowerCase()
            const mDose = (m.item_metadata?.dosage || "").trim().toLowerCase()
            return mName === n && mDose === d
        })
    }

    const handleToggleMed = (medName: string) => {
        setSelectedMeds(prev =>
            prev.includes(medName) ? prev.filter(n => n !== medName) : [...prev, medName]
        )
    }

    const handleSelectAll = () => {
        const catMeds = currentCat.meds.map(m => m.name)
        const allAlreadySelected = catMeds.every(name => selectedMeds.includes(name))

        if (allAlreadySelected) {
            setSelectedMeds(prev => prev.filter(name => !catMeds.includes(name)))
        } else {
            setSelectedMeds(prev => Array.from(new Set([...prev, ...catMeds])))
        }
    }

    // Count how many selected presets already exist in user's medication list
    const selectedDuplicateCount = useMemo(() => {
        let dupes = 0
        const seen = new Set<string>()
        for (const cat of MED_CATEGORIES) {
            for (const drug of cat.meds) {
                const key = `${drug.name}__${drug.dosage}`
                if (selectedMeds.includes(drug.name) && !seen.has(key)) {
                    seen.add(key)
                    if (findExistingMatch(drug)) dupes++
                }
            }
        }
        return dupes
    }, [selectedMeds, existingMedications])

    const handleImportSelected = async () => {
        if (selectedMeds.length === 0) {
            toast.error("Select at least one medication to import")
            return
        }

        setIsImporting(true)
        try {
            let addedCount = 0
            let skippedCount = 0
            let updatedCatCount = 0
            const processedKeys = new Set<string>()

            for (const cat of MED_CATEGORIES) {
                for (const drug of cat.meds) {
                    if (!selectedMeds.includes(drug.name)) continue
                    const dedupeKey = `${drug.name.toLowerCase()}__${(drug.dosage || "").toLowerCase()}`
                    if (processedKeys.has(dedupeKey)) continue
                    processedKeys.add(dedupeKey)

                    const existing = findExistingMatch(drug)
                    if (existing) {
                        if (duplicateAction === "update_category" && onUpdateExistingCategory) {
                            await onUpdateExistingCategory(existing, importCategory)
                            updatedCatCount++
                        } else {
                            skippedCount++
                        }
                        continue
                    }

                    // Safe Import: Track pill count OFF and no reminder times unless the preset explicitly defines them
                    const presetReminders = Array.isArray((drug as any).reminders) ? (drug as any).reminders : []

                    await onAddMockDrug({
                        name: drug.name,
                        category: importCategory,
                        dosage: drug.dosage,
                        frequency: drug.frequency,
                        prescribedBy: "Quick Import",
                        purpose: drug.purpose,
                        sideEffects: "",
                        refillDate: "",
                        nextDose: "",
                        pillShape: drug.shape || "round",
                        pillColor: drug.color || "#FFFFFF",
                        trackInventory: false,
                        quantity: 0,
                        totalQuantity: 0,
                        reminders: presetReminders,
                        notes: "Imported from " + cat.label
                    })
                    addedCount++
                }
            }

            const parts: string[] = []
            if (addedCount > 0) parts.push(`Imported ${addedCount} medication${addedCount === 1 ? "" : "s"}`)
            if (updatedCatCount > 0) parts.push(`updated category on ${updatedCatCount} existing`)
            if (skippedCount > 0) parts.push(`skipped ${skippedCount} already in your list`)

            toast.success(parts.length > 0 ? parts.join(", ") : "No changes needed")
            onClose()
        } catch (e) {
            console.error(e)
            toast.error("Error importing medications")
        } finally {
            setIsImporting(false)
        }
    }

    if (!isOpen) return null

    const getPresetShapeIcon = (shape?: string) => {
        const norm = normalizePillShape(shape)
        return PILL_SHAPES.find(s => s.id === norm)?.icon || Circle
    }

    return (
        <div
            className="fixed inset-0 z-[115] h-[100dvh] w-full bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-3 overflow-hidden"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    paddingTop: "max(0.5rem, env(safe-area-inset-top))",
                    paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
                }}
                className={`w-full max-w-6xl h-[100dvh] sm:h-[min(92dvh,860px)] max-h-[100dvh] flex flex-col overflow-hidden sm:rounded-2xl shadow-2xl border ${
                    theme === 'light' ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#121212] border-white/10 text-white'
                }`}
            >
                {/* 1. STICKY HEADER */}
                <header className="shrink-0 px-4 sm:px-5 py-2.5 border-b border-white/10 flex items-center justify-between gap-3 bg-[#151515]">
                    <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 leading-tight">
                            <Download className="h-5 w-5 text-purple-400 shrink-0" />
                            <span className="truncate">Rx Quick Import</span>
                        </h2>
                        <p className="text-xs text-gray-400 truncate">
                            Select a preset group and pick individual templates or whole sets to import
                        </p>
                    </div>
                    <HealthTooltip content="Close Rx Quick Import">
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close Rx Quick Import"
                            className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-gray-200 hover:text-white transition-colors shrink-0 cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </HealthTooltip>
                </header>

                {/* 2. MIDDLE AREA (ONLY THIS SCROLLS) */}
                <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
                    {/* Mobile Group Selector (compact wrapping chips, zero horizontal scroll) */}
                    <div className="md:hidden shrink-0 px-3 py-2 border-b border-white/10 bg-[#161616]">
                        <div className="flex flex-wrap gap-1.5">
                            {MED_CATEGORIES.map(cat => {
                                const active = activeCategory === cat.id
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleSwitchGroup(cat.id)}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 border transition-colors cursor-pointer ${
                                            active
                                                ? 'bg-purple-600/25 border-purple-500 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        <cat.icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-purple-300' : 'text-gray-500'}`} />
                                        <span className="leading-tight text-left">{cat.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Desktop/Tablet Narrow Left Group List */}
                    <aside className="hidden md:flex md:w-48 lg:w-56 shrink-0 flex-col border-r border-white/10 p-3 space-y-1.5 overflow-y-auto custom-scrollbar bg-[#141414]">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-1.5 pb-1">
                            Preset Groups
                        </div>
                        {MED_CATEGORIES.map(cat => {
                            const active = activeCategory === cat.id
                            return (
                                <HealthTooltip key={cat.id} content={`View ${cat.label} templates (${cat.meds.length} presets)`} side="right">
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchGroup(cat.id)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                            active
                                                ? 'bg-purple-600/20 border-purple-500 text-white shadow-sm'
                                                : 'bg-white/[0.03] border-transparent text-gray-400 hover:bg-white/[0.07] hover:text-gray-200'
                                        }`}
                                    >
                                        <cat.icon className={`h-4 w-4 shrink-0 ${active ? 'text-purple-400' : 'text-gray-500'}`} />
                                        <span className="text-xs font-semibold leading-snug line-clamp-2">{cat.label}</span>
                                    </button>
                                </HealthTooltip>
                            )
                        })}
                    </aside>

                    {/* Scrollable Right Panel: Group Header + Compact 3-Across Medication Cards */}
                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-3 custom-scrollbar">
                        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`p-2 rounded-lg shrink-0 bg-gradient-to-br ${
                                    currentCat.id === 'rash'
                                        ? 'from-red-500/20 to-orange-500/20'
                                        : currentCat.id === 'cold'
                                        ? 'from-blue-500/20 to-cyan-500/20'
                                        : currentCat.id === 'pain'
                                        ? 'from-purple-500/20 to-pink-500/20'
                                        : 'from-teal-500/20 to-emerald-500/20'
                                }`}>
                                    <currentCat.icon className={`h-5 w-5 ${currentCat.color}`} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm sm:text-base font-bold text-white leading-tight">{currentCat.label}</h3>
                                    <p className="text-[11px] text-gray-400">{currentCat.meds.length} preset templates</p>
                                </div>
                            </div>
                            <HealthTooltip content={currentCat.meds.every(m => selectedMeds.includes(m.name)) ? "Uncheck all templates in this group" : "Select all templates in this group"}>
                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    className="h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 transition-colors cursor-pointer shrink-0"
                                >
                                    {currentCat.meds.every(m => selectedMeds.includes(m.name)) ? 'Deselect All' : 'Select All in Group'}
                                </button>
                            </HealthTooltip>
                        </div>

                        {/* Compact Medication Cards Grid: 1 on phones, 2 on tablets, 3+ on desktop */}
                        <div className="grid grid-cols-1 sm:[grid-template-columns:repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
                            {currentCat.meds.map((med, idx) => {
                                const isSelected = selectedMeds.includes(med.name)
                                const existingMatch = findExistingMatch(med)
                                const ShapeIcon = getPresetShapeIcon(med.shape)
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleToggleMed(med.name)}
                                        role="checkbox"
                                        aria-checked={isSelected}
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault()
                                                handleToggleMed(med.name)
                                            }
                                        }}
                                        className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between gap-2 ${
                                            isSelected
                                                ? 'bg-purple-600/15 border-purple-500 shadow-md'
                                                : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                                isSelected ? 'bg-purple-500/25 border-purple-400/40' : 'bg-white/5 border-white/10'
                                            }`}>
                                                <ShapeIcon
                                                    className="h-4 w-4"
                                                    fill={med.color}
                                                    stroke="white"
                                                    strokeWidth={1}
                                                    style={{ color: med.color }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-1.5">
                                                    <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 break-words">
                                                        {med.name}
                                                    </h4>
                                                    <div className={`h-4 w-4 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                                        isSelected ? 'bg-purple-600 border-purple-500' : 'border-gray-600 bg-black/30'
                                                    }`}>
                                                        {isSelected && <Check className="h-3 w-3 text-white" />}
                                                    </div>
                                                </div>
                                                <div className="text-xs font-semibold text-purple-300 mt-0.5">
                                                    {med.dosage}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1 pt-0.5 text-[10px]">
                                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300 font-medium">
                                                {med.frequency}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 truncate max-w-full">
                                                {med.purpose}
                                            </span>
                                            {existingMatch && (
                                                <HealthTooltip content="A medication with this exact name and strength is already in your list. Skipped on import unless you choose 'Update category' below.">
                                                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/35 text-amber-300 font-semibold">
                                                        Already in your list
                                                    </span>
                                                </HealthTooltip>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* 3. STICKY FOOTER */}
                <footer className="shrink-0 px-3 sm:px-5 py-2.5 border-t border-white/10 bg-[#151515] space-y-2.5">
                    {/* Row A: Category Dropdown + Manage Categories + Duplicate Handling */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                                    Assign medication category
                                </span>
                                <FieldHelpPopover
                                    title="Assign Medication Category"
                                    content="Defaults to the current preset group name until you pick another category. Imported drugs start safe with Track pill count OFF and no reminder alarms."
                                />
                                {onOpenManageCategories && (
                                    <HealthTooltip content="Create, rename, or delete medication categories">
                                        <button
                                            type="button"
                                            onClick={onOpenManageCategories}
                                            className="ml-1 text-xs text-purple-400 hover:text-purple-300 underline underline-offset-2 font-semibold cursor-pointer"
                                        >
                                            Manage categories
                                        </button>
                                    </HealthTooltip>
                                )}
                            </div>
                            <div className="w-full sm:w-64">
                                <MedicationCategorySelect
                                    compact
                                    label=""
                                    value={importCategory}
                                    onChange={handleManualCategoryChange}
                                    categories={dropdownCategories}
                                    onCreateCategory={(newCat) => {
                                        onCreateCategory?.(newCat)
                                        setHasManuallyPickedCategory(true)
                                    }}
                                />
                            </div>
                        </div>

                        {selectedDuplicateCount > 0 && (
                            <div className="flex items-center gap-2 text-xs bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1.5">
                                <span className="text-amber-300 font-medium">
                                    {selectedDuplicateCount} already in list:
                                </span>
                                <div className="inline-flex rounded-md bg-black/40 p-0.5 border border-white/10">
                                    <HealthTooltip content="Skip medications that are already in your list">
                                        <button
                                            type="button"
                                            onClick={() => setDuplicateAction("skip")}
                                            className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                                                duplicateAction === "skip" ? "bg-amber-600 text-white" : "text-gray-300 hover:text-white"
                                            }`}
                                        >
                                            Skip
                                        </button>
                                    </HealthTooltip>
                                    <HealthTooltip content="Keep existing medication details and only update its category to the one chosen here">
                                        <button
                                            type="button"
                                            onClick={() => setDuplicateAction("update_category")}
                                            className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                                                duplicateAction === "update_category" ? "bg-purple-600 text-white" : "text-gray-300 hover:text-white"
                                            }`}
                                        >
                                            Update category
                                        </button>
                                    </HealthTooltip>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Row B: Selected Counter + Clear All + Disclaimer + Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-white/5">
                        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                            <div className="inline-flex items-center gap-1.5 text-xs">
                                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold">
                                    {selectedMeds.length}
                                </span>
                                <span className="text-gray-300 font-medium">selected</span>
                                {selectedMeds.length > 0 && (
                                    <HealthTooltip content="Uncheck all selected templates">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedMeds([])}
                                            className="text-xs font-semibold text-red-400 hover:text-red-300 ml-1 cursor-pointer"
                                        >
                                            Clear all
                                        </button>
                                    </HealthTooltip>
                                )}
                            </div>
                            <span className="text-[11px] text-gray-400">
                                Preset doses are templates. Check them against your prescription.
                            </span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                            <HealthTooltip content="Close without importing">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="h-9 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    Back to hub
                                </button>
                            </HealthTooltip>
                            <HealthTooltip content="Import selected medications with Track pill count OFF">
                                <button
                                    type="button"
                                    onClick={handleImportSelected}
                                    disabled={selectedMeds.length === 0 || isImporting}
                                    className="h-9 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    {isImporting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" />
                                            <span>Import selected now</span>
                                        </>
                                    )}
                                </button>
                            </HealthTooltip>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}

