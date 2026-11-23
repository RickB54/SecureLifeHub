"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Plus, Edit, Trash, Download, Search, Bell, Calendar as CalendarIcon, Clock, Activity, Pill, AlertCircle, Check, X, MessageSquare, Send, ChevronLeft, ChevronRight, ChevronDown, Sparkles, Circle, Droplets, Square, Hexagon, Package, Loader2, FileText, MapPin, Triangle, Wind, Thermometer, Shield, Heart, Printer, FileDown, HelpCircle, Minimize, Info, RotateCcw } from "lucide-react"
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, startOfDay, endOfDay, eachHourOfInterval, addWeeks, subWeeks, addMonths, subMonths, parse, addHours } from "date-fns"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'sonner'
import { lookupDrugInfo, type DrugInfo } from '@/lib/drug-database'
import {
    DoctorCombobox,
    FacilityCombobox,
    FieldSuggestionInput,
    extractDoctorsFromRecords,
    extractFacilitiesFromRecords,
    extractHealthSuggestions,
    findSingleLinkedFacility,
} from './health-ui/health-field-helpers'
import { upsertSharedHealthRecord, removeSharedHealthRecord, resolveDoctorInfo } from '@/lib/health-store'
import MedicationDetailView from './health-ui/medication-detail-view'
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
    const [drugInfo, setDrugInfo] = useState<any>(null)
    const [drugLookupTarget, setDrugLookupTarget] = useState("")
    const [prefillTarget, setPrefillTarget] = useState<any>(null)
    const [loadingDrugInfo, setLoadingDrugInfo] = useState(false)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<"list" | "timeline">("list")
    const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("day")
    const [showFullTimeline, setShowFullTimeline] = useState(false) // NEW: Toggle full timeline view

    // Global handler for triggering Import Rx from child modals
    useEffect(() => {
        (window as any).showMockDrugModalFromAddMed = () => {
            setShowAddModal(false);
            setShowEditModal(false);
            setShowMockDrugs(true);
        }
    }, [])

    // AI Drug Lookup Function
    const handleDrugLookup = async (medName: string) => {
        if (!medName || !medName.trim()) {
            toast.error("Please enter a medication name to look up.")
            return
        }
        setDrugLookupTarget(medName.trim())
        setShowDrugInfo(true)
        setLoadingDrugInfo(true)
        setDrugInfo(null)

        try {
            await new Promise(resolve => setTimeout(resolve, 500)) // smooth UI transition
            const info = lookupDrugInfo(medName.trim())
            if (info) {
                setDrugInfo(info)
            } else {
                setDrugInfo({ unavailable: true, name: medName.trim() })
            }
        } catch (error) {
            console.error("Drug lookup error:", error)
            setDrugInfo({ unavailable: true, name: medName.trim() })
        } finally {
            setLoadingDrugInfo(false)
        }
    }

    const handleFillFields = (info: any) => {
        if (!info || info.unavailable) return

        const sideEffectsStr = Array.isArray(info.sideEffects?.common)
            ? info.sideEffects.common.join(", ")
            : (typeof info.sideEffects === 'string' ? info.sideEffects : "")

        const usesStr = Array.isArray(info.uses)
            ? info.uses.join("; ")
            : (info.uses || "")

        const prefill = {
            name: info.name,
            genericName: info.genericName,
            drugClass: info.drugClass,
            purpose: usesStr,
            sideEffects: sideEffectsStr,
            verificationNote: "Verify with your pharmacist or doctor"
        }

        setPrefillTarget(prefill)
        setShowDrugInfo(false)

        // If neither modal is open, open Add (or Edit if a med was selected)
        if (!showAddModal && !showEditModal) {
            if (selectedMed) {
                setShowEditModal(true)
            } else {
                setShowAddModal(true)
            }
        }
        toast.success("Medication details filled! Please enter your prescribed dosage and schedule.")
    }

    // Filter medications - MUST use useMemo to re-run when records change!
    const medRecords = useMemo(() => {
        console.log("🔄 Re-filtering medications, records count:", records.length)

        const filtered = records.filter(r => {
            // Expanded logic to ensure imported precriptions are found
            const specificNames = ["Hydroxyzine", "Prednisone", "Loratadine", "Famotidine"];
            const isSpecificMed = specificNames.some(name => r.title?.includes(name));

            const isMed = (r.category && r.category.toLowerCase() === "medications") ||
                (r.type && r.type.toLowerCase() === "medication") ||
                (r.type === "note" && r.category === "Medications") ||
                // Catch imported prescriptions explicitly
                (r.item_metadata?.notes === "Imported Prescription") ||
                isSpecificMed

            return isMed
        })

        console.log("📊 Total medRecords found:", filtered.length)
        console.log("📊 Total all records:", records.length)
        console.log("📋 First 3 records sample:", records.slice(0, 3).map(r => ({ title: r.title, type: r.type, category: r.category })))
        console.log("📋 First 3 med records:", filtered.slice(0, 3).map(m => ({ title: m.title, dosage: m.item_metadata?.dosage })))

        return filtered
    }, [records]) // Re-run whenever records changes!

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
            const start = startOfDay(new Date(startDateStr))
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
            const start = startOfDay(new Date(startDateStr))
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

    // Filter by search
    const filteredMeds = medRecords.filter(med =>
        med.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.item_metadata?.dosage?.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
            const res = await addItem({
                type: "note", // Changed from "medication" to comply with database constraint
                category: "Medications",
                title: formData.name || "Untitled Medication",
                item_metadata: {
                    dosage: formData.dosage || "As directed",
                    frequency: formData.frequency || "",
                    prescribedBy: formData.prescribedBy || "",
                    doctor_id: formData.doctor_id || null,
                    facility_id: formData.facility_id || null,
                    facility_name: formData.facility_name || "",
                    pharmacy: formData.pharmacy || "",
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
            dosage: formData.dosage || "As directed",
            frequency: formData.frequency || "",
            prescribedBy: formData.prescribedBy || "",
            doctor_id: formData.doctor_id || null,
            facility_id: formData.facility_id || null,
            facility_name: formData.facility_name || "",
            pharmacy: formData.pharmacy || "",
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

    const handlePrintAll = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const content = `
            <html>
                <head>
                    <title>Complete Medication Profile - SecureLifeHub</title>
                    <style>
                        body { font-family: -apple-system, sans-serif; padding: 50px; color: #1a1a1a; line-height: 1.4; }
                        .header { border-bottom: 4px solid #9333ea; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
                        h1 { margin: 0; color: #000; font-size: 32px; letter-spacing: -0.02em; }
                        .summary-box { background: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 40px; border: 1px solid #eee; }
                        .med-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 25px; page-break-inside: avoid; }
                        .med-name { font-size: 20px; font-weight: 800; color: #000; margin-bottom: 5px; text-transform: uppercase; }
                        .med-meta { color: #6b7280; font-size: 14px; font-weight: 600; margin-bottom: 15px; }
                        .grid { display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 20px; margin-bottom: 15px; }
                        .item { border-left: 2px solid #ddd; padding-left: 10px; }
                        .label { font-size: 10px; color: #9ca3af; font-weight: 800; text-transform: uppercase; margin-bottom: 2px; }
                        .value { font-size: 13px; font-weight: 600; }
                        .notes { margin-top: 15px; padding-top: 15px; border-top: 1px dashed #eee; font-style: italic; color: #4b5563; font-size: 13px; }
                        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #eee; padding-top: 20px; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <h1>Medical Profile</h1>
                            <div style="color: #9333ea; font-weight: 700;">CONFIDENTIAL HEALTH RECORD</div>
                        </div>
                        <div style="text-align: right; font-size: 12px; color: #666;">Generated: ${format(new Date(), 'PPP')}</div>
                    </div>

                    <div class="summary-box">
                        <strong>Patient:</strong> ${user?.email || 'Vault User'}<br>
                        <strong>Total Active Medications:</strong> ${medRecords.length}<br>
                        <strong>Report Purpose:</strong> Clinical Review / Doctor Visit
                    </div>

                    ${medRecords.map(med => `
                        <div class="med-card">
                            <div class="med-name">${med.title}</div>
                            <div class="med-meta">${med.item_metadata?.dosage || 'No dosage set'} • ${med.item_metadata?.frequency || 'As directed'}</div>
                            
                            <div class="grid">
                                <div class="item">
                                    <div class="label">Prescribed By</div>
                                    <div class="value">${med.item_metadata?.prescribedBy || 'N/A'}</div>
                                </div>
                                <div class="item">
                                    <div class="label">Duration</div>
                                    <div class="value">${med.item_metadata?.startDate || 'N/A'} to ${med.item_metadata?.endDate || 'Ongoing'}</div>
                                </div>
                                <div class="item">
                                    <div class="label">Inventory</div>
                                    <div class="value">${med.item_metadata?.quantity || 0} pills left</div>
                                </div>
                            </div>

                            <div class="item" style="margin-bottom: 15px; border-left: 2px solid #9333ea;">
                                <div class="label">Instructions</div>
                                <div class="value">${med.item_metadata?.rxInstructions || 'None provided'}</div>
                            </div>

                            ${med.item_metadata?.notes ? `
                                <div class="notes">
                                    <strong>Doctor/Patient Notes:</strong> ${med.item_metadata.notes}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}

                    <div class="footer">
                        This clinical summary was securely exported from SecureLifeHub. Please verify all dosages with your primary care physician.
                    </div>

                    <script>window.print(); setTimeout(() => window.close(), 500);</script>
                </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
    }

    const handleExportAllPDF = () => {
        const doc = new jsPDF()

        // Header
        doc.setFillColor(147, 51, 234)
        doc.rect(0, 0, 210, 45, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(28)
        doc.setFont('helvetica', 'bold')
        doc.text("Medication Profile", 15, 20)

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(`Patient: ${user?.email || 'N/A'}`, 15, 32)
        doc.text(`Report Date: ${format(new Date(), 'PPP')}`, 15, 38)

        // Summary Statistics
        doc.setTextColor(30, 41, 59)
        doc.setFontSize(12)
        doc.text(`Total Medications: ${medRecords.length}`, 15, 60)

        // Main Table
        autoTable(doc, {
            startY: 70,
            head: [['Medication', 'Dosage & Frequency', 'Dates', 'Doctor', 'Notes']],
            body: medRecords.map(med => [
                med.title.toUpperCase(),
                `${med.item_metadata?.dosage || 'N/A'}\n${med.item_metadata?.frequency || 'N/A'}`,
                `${med.item_metadata?.startDate || 'N/A'}\nto ${med.item_metadata?.endDate || 'Ongoing'}`,
                med.item_metadata?.prescribedBy || 'N/A',
                med.item_metadata?.notes ? (med.item_metadata.notes.substring(0, 50) + (med.item_metadata.notes.length > 50 ? '...' : '')) : 'N/A'
            ]),
            headStyles: { fillColor: [147, 51, 234], fontSize: 10, fontStyle: 'bold' },
            bodyStyles: { fontSize: 9, cellPadding: 6 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 40 },
                4: { fontStyle: 'italic', fontSize: 8 }
            },
            alternateRowStyles: { fillColor: [249, 250, 251] }
        })

        // Detailed blocks for each med if requested (appending to same PDF)
        let finalY = (doc as any).lastAutoTable.finalY + 20
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text("Instructional Details", 15, finalY)
        doc.setDrawColor(226, 232, 240)
        doc.line(15, finalY + 2, 195, finalY + 2)

        finalY += 15
        medRecords.forEach((med, index) => {
            if (finalY > 260) {
                doc.addPage()
                finalY = 20
            }
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text(`${index + 1}. ${med.title.toUpperCase()}`, 15, finalY)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            const instructions = doc.splitTextToSize(`Instructions: ${med.item_metadata?.rxInstructions || 'N/A'}`, 170)
            doc.text(instructions, 20, finalY + 5)
            finalY += (instructions.length * 5) + 8
        })

        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.setTextColor(150)
            doc.text(`Page ${i} of ${pageCount} | SecureLifeHub Clinical Export`, 105, 285, { align: 'center' })
        }

        doc.save(`Complete_Medication_Profile_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
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
    const getPillIcon = (med: any) => {
        const shapeId = normalizePillShape(med.item_metadata?.pillShape)
        const colorHex = med.item_metadata?.pillColor || '#FFFFFF'
        const PillIcon = PILL_SHAPES.find(s => s.id === shapeId)?.icon || Circle

        return (
            <div className="relative" style={{ color: colorHex }}>
                <PillIcon className="h-8 w-8" fill="currentColor" stroke={theme === 'dark' ? '#333' : '#ccc'} strokeWidth={1} />
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
            {/* Header with AI Button */}
            <div className="p-4 md:p-8 pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                                Medications
                            </h1>
                        </div>
                        <p className="text-sm md:text-base text-gray-400">Track medications, set reminders, and maintain your health</p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 mr-2">
                            <button
                                onClick={handlePrintAll}
                                className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                title="Print Master List"
                            >
                                <Printer className="h-5 w-5" />
                            </button>
                            <button
                                onClick={handleExportAllPDF}
                                className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                title="Export Master PDF"
                            >
                                <FileDown className="h-5 w-5" />
                            </button>
                        </div>
                        <button
                            onClick={() => setShowMedSummary(true)}
                            className="flex-1 md:flex-none bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white px-3 md:px-4 py-3 rounded-xl shadow-lg transition-all font-medium flex items-center justify-center gap-2 text-xs md:text-base"
                        >
                            <FileText className="h-4 md:h-5 w-4 md:w-5" /> Med Summary
                        </button>
                        <button
                            onClick={() => setShowQuickAI(!showQuickAI)}
                            className="flex-1 md:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-3 md:px-4 py-3 rounded-xl shadow-lg transition-all font-medium flex items-center justify-center gap-2 text-xs md:text-base"
                        >
                            <Sparkles className="h-4 md:h-5 w-4 md:w-5" /> AI Assistant
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex-1 md:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-3 md:px-6 py-3 rounded-xl shadow-lg transition-all font-medium flex items-center justify-center gap-2 text-xs md:text-base"
                        >
                            <Plus className="h-4 md:h-5 w-4 md:w-5" /> Add Med
                        </button>
                    </div>
                </div>

                {/* Quick AI Panel */}
                {showQuickAI && (
                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30">
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                placeholder="Ask about drug interactions, side effects, dosage..."
                                value={aiQuestion}
                                onChange={(e) => setAiQuestion(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAIQuestion()}
                                className="flex-1 px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            />
                            <button onClick={handleAIQuestion} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl"><Send className="h-5 w-5" /></button>
                        </div>
                        {aiResponse && (
                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 max-h-48 overflow-y-auto custom-scrollbar">
                                <div className="text-sm whitespace-pre-wrap">{aiResponse}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                    <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30">
                        <div className="text-xl md:text-2xl font-bold text-purple-400">{medRecords.length}</div>
                        <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Total Meds</div>
                    </div>
                    <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30">
                        <div className="text-xl md:text-2xl font-bold text-pink-400">{upcomingReminders.length}</div>
                        <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Due Today</div>
                    </div>
                    <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
                        <div className="text-xl md:text-2xl font-bold text-blue-400">{medRecords.filter(m => isMedLowStock(m.item_metadata)).length}</div>
                        <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Low Stock</div>
                    </div>
                    <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
                        <div className="text-xl md:text-2xl font-bold text-green-400">{medRecords.reduce((sum, m) => sum + (m.item_metadata?.takenLog?.length || 0), 0)}</div>
                        <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Doses Taken</div>
                    </div>
                </div>

                {/* Search and Views */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
                    <div className="flex-1 w-full md:w-auto relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search medications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <button onClick={() => setShowPillLibrary(true)} className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                            <Package className="h-4 w-4" /> Pill Library
                        </button>
                        <button onClick={() => setShowMockDrugs(true)} className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                            <Activity className="h-4 w-4" /> Import Rx
                        </button>
                    </div>
                    <div className="flex gap-2 bg-[#2a2a2a] rounded-xl p-1 w-full md:w-auto">
                        <button onClick={() => setViewMode("list")} className={`flex-1 md:flex-none px-4 py-2 rounded-lg transition-all ${viewMode === "list" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>List</button>
                        <button onClick={() => setViewMode("timeline")} className={`flex-1 md:flex-none px-4 py-2 rounded-lg transition-all ${viewMode === "timeline" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>Timeline</button>
                    </div>
                </div>

                {/* Calendar Views */}
                {viewMode === "timeline" && (
                    <div className="flex gap-2 bg-[#2a2a2a] rounded-xl p-1 w-fit">
                        <button onClick={() => setCalendarView("day")} className={`px-4 py-2 rounded-lg text-sm ${calendarView === "day" ? "bg-purple-600 text-white" : "text-gray-400"}`}>Day</button>
                        <button onClick={() => setCalendarView("week")} className={`px-4 py-2 rounded-lg text-sm ${calendarView === "week" ? "bg-purple-600 text-white" : "text-gray-400"}`}>Week</button>
                        <button onClick={() => setCalendarView("month")} className={`px-4 py-2 rounded-lg text-sm ${calendarView === "month" ? "bg-purple-600 text-white" : "text-gray-400"}`}>Month</button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="px-8 pb-8">
                {viewMode === "list" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMeds.length === 0 ? (
                            <div className="text-center text-gray-500 py-12">
                                <Pill className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                <p>No medications found. Add your first medication to get started.</p>
                            </div>
                        ) : (
                            filteredMeds.map(med => {
                                const estimate = calculatePillCountEstimate(med.item_metadata)
                                const tracked = Boolean(estimate?.tracked)
                                const lowStock = Boolean(estimate?.isLowStock)
                                return (
                                <div
                                    key={med.id}
                                    className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 hover:border-purple-500/40 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                                {getPillIcon(med)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-col min-w-0">
                                                    <h3 className="text-lg font-bold break-words leading-tight">
                                                        {med.title}
                                                    </h3>
                                                    <span className="text-xs text-gray-400">{med.item_metadata?.dosage}</span>
                                                </div>
                                                <div className="text-sm text-gray-400 mt-1 flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span>
                                                            {med.item_metadata?.frequency || "As needed"}
                                                            {tracked && estimate ? ` • Est. ${estimate.remaining} left` : ""}
                                                        </span>
                                                        {lowStock && (
                                                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 flex items-center gap-1 font-bold animate-pulse">
                                                                <AlertCircle className="h-3 w-3" /> LOW STOCK
                                                            </span>
                                                        )}
                                                    </div>
                                                    {tracked && estimate?.runOutDateStr && (
                                                        <div className="text-xs text-amber-300/90">
                                                            Runs out about {estimate.runOutDateStr}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-purple-300 font-bold mt-1">
                                                        <Activity className="h-3.5 w-3.5" />
                                                        Today's Dose: {getCurrentDose(med)}
                                                    </div>
                                                </div>

                                                {/* Next Scheduled Time (derived from Reminder Times + Frequency) */}
                                                {(() => {
                                                    const liveNextDose = getScheduledNextDose(med.item_metadata) || med.item_metadata?.nextDose
                                                    if (!liveNextDose) return null
                                                    return (
                                                        <div className="flex items-center gap-2 text-sm text-purple-400 mt-2">
                                                            <Clock className="h-4 w-4" />
                                                            Next: {format(new Date(liveNextDose), 'MMM d, h:mm a')}
                                                        </div>
                                                    )
                                                })()}

                                                {/* Status Badges */}
                                                {(() => {
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
                                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                            {isDueMed && !hasTodayLog && (
                                                                <span className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded-full border border-white/10 flex items-center gap-1">
                                                                    Not taken
                                                                </span>
                                                            )}
                                                            {skippedLog.length > 0 && (
                                                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30 flex items-center gap-1">
                                                                    <X className="h-3 w-3" /> Skipped {skippedLog.length}x
                                                                </span>
                                                            )}
                                                            {takenLog.length > 0 && (
                                                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 flex items-center gap-1">
                                                                    <Check className="h-3 w-3" /> Taken {takenLog.length}x
                                                                </span>
                                                            )}
                                                            {hasLogs && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleResetDoseStatus(med)}
                                                                    className="px-2 py-0.5 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white text-xs rounded-full border border-white/10 flex items-center gap-1 transition-colors cursor-pointer"
                                                                    title="Undo / Reset dose status"
                                                                >
                                                                    <RotateCcw className="h-3 w-3" /> Reset
                                                                </button>
                                                            )}
                                                        </div>
                                                    )
                                                })()}
                                                {/* RX Instructions Display */}
                                                {med.item_metadata?.rxInstructions && (
                                                    <div className="mt-2 text-xs text-blue-300 bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                                                        <span className="font-bold">RX:</span> {med.item_metadata.rxInstructions}
                                                    </div>
                                                )}
                                                {/* Interactions Display */}
                                                {med.item_metadata?.interactions && (
                                                    <div className="mt-2 text-xs text-red-300 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                                                        <span className="font-bold">Interactions:</span> {med.item_metadata.interactions}
                                                    </div>
                                                )}
                                                {med.item_metadata?.lastTaken && (
                                                    <div className="flex items-center gap-2 text-sm text-green-400 mt-2">
                                                        <Check className="h-4 w-4" />
                                                        Last taken: {format(new Date(med.item_metadata.lastTaken), 'PPp')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medisafe-style Action Buttons */}
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleSkipMed(med) }}
                                            className="flex-1 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <X className="h-5 w-5" /> SKIP
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleTakeMed(med) }}
                                            className="flex-1 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check className="h-5 w-5" /> TAKE
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); openRescheduleModal(med) }}
                                            className="flex-1 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <Clock className="h-5 w-5" /> RESCHEDULE
                                        </button>
                                    </div>

                                    {/* Additional Actions */}
                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => router.push(`/?page=type-health-records&tab=meds&medId=${med.id}`, { scroll: false })}
                                            className="p-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 cursor-pointer"
                                            title="Details"
                                            aria-label="Details"
                                        >
                                            <Info className="h-5 w-5" />
                                        </button>
                                        <button type="button" onClick={() => handleDrugLookup(med.title)} className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 cursor-pointer" title="AI Drug Info">
                                            <Sparkles className="h-5 w-5" />
                                        </button>
                                        <button type="button" onClick={() => { setSelectedMed(med); setShowEditModal(true) }} className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 cursor-pointer" title="Edit">
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button type="button" onClick={async () => { if (confirm(`Delete ${med.title}?`)) { await deleteItem(med.id); removeSharedHealthRecord(med.id); toast.success("Medication deleted") } }} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 cursor-pointer" title="Delete">
                                            <Trash className="h-5 w-5" />
                                        </button>
                                        {tracked && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRefillMed(med)
                                                    setRefillCount(String(med.item_metadata?.totalQuantity || 30))
                                                }}
                                                className="ml-auto px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                                                title="Record refill & reset pill count baseline"
                                            >
                                                Refill
                                            </button>
                                        )}
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

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    handleTakeMed(activeReminder)
                                    setActiveReminder(null)
                                }}
                                className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-900/20 transition-all transform hover:scale-105"
                            >
                                TAKE NOW
                            </button>
                            <button
                                onClick={() => setActiveReminder(null)} // Snooze just closes for now (will re-trigger in 1 min if logic isn't smart, but we check lastReminderTime so it won't until next day)
                                className="px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold text-lg transition-all"
                            >
                                Snooze
                            </button>
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
                />
            )}

            {/* Mock Drugs Modal */}
            {showMockDrugs && (
                <MockDrugsModal
                    isOpen={showMockDrugs}
                    onClose={() => setShowMockDrugs(false)}
                    onAddMockDrug={handleAddMed}
                    theme={theme}
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
                        onLookupDrug={handleDrugLookup}
                        onOpenDoctors={() => router.push("/?page=type-health-records&tab=doctors", { scroll: false })}
                        onDeleteLogEntry={(logType, idx) => handleDeleteAdherenceLog(detailMed, logType, idx)}
                    />
                )
            })()}

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
                    isOpen={showAddModal || showEditModal}
                    onClose={() => { setShowAddModal(false); setShowEditModal(false); setSelectedMed(null); setPrefillTarget(null) }}
                    onSave={showAddModal ? handleAddMed : handleEditMed}
                    medication={selectedMed}
                    theme={theme}
                    prefillData={prefillTarget}
                    onLookupDrug={handleDrugLookup}
                    doctors={savedDoctors}
                    facilities={savedFacilities}
                    suggestions={extractHealthSuggestions(records)}
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
                <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
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
                                                <span className="ml-2 font-medium">{med.item_metadata?.refillDate ? format(new Date(med.item_metadata.refillDate), 'PP') : 'N/A'}</span>
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
                                onClick={() => window.print()}
                                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                <Download className="h-5 w-5" /> Print/Save PDF
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

            {/* AI Drug Info Modal */}
            {showDrugInfo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1e1e1e] border border-blue-500/30 rounded-3xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <Sparkles className="h-8 w-8 text-blue-400" />
                                AI Drug Information
                            </h2>
                            <button onClick={() => setShowDrugInfo(false)} className="p-2 hover:bg-white/10 rounded-lg">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {loadingDrugInfo ? (
                            <div className="text-center py-12">
                                <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
                                <p className="text-gray-400">Looking up clinical drug information...</p>
                            </div>
                        ) : drugInfo?.unavailable ? (
                            <div className="text-center py-12 px-4 space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
                                    <AlertCircle className="h-8 w-8 text-amber-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Information unavailable</h3>
                                <p className="text-gray-400 max-w-md mx-auto text-sm">
                                    Accurate clinical drug information for &ldquo;{drugLookupTarget || drugInfo.name}&rdquo; is not available in our verified drug directory.
                                </p>
                                <div className="inline-flex items-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
                                    <Shield className="h-4 w-4 shrink-0" />
                                    <span>Verify with your pharmacist or doctor.</span>
                                </div>
                            </div>
                        ) : drugInfo?.error ? (
                            <div className="text-center py-12 text-red-400">
                                {drugInfo.error}
                            </div>
                        ) : drugInfo && (
                            <div className="space-y-6">
                                {/* Verification Alert Banner */}
                                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-purple-400 shrink-0" />
                                        <span><strong>Clinical Note:</strong> Verify with your pharmacist or doctor.</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleFillFields(drugInfo)}
                                        className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-md"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Fill fields
                                    </button>
                                </div>

                                {/* Drug Header */}
                                <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl p-6 border border-blue-500/20">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                        <h3 className="text-3xl font-bold text-white">{drugInfo.name}</h3>
                                        <button
                                            type="button"
                                            onClick={() => handleFillFields(drugInfo)}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-900/30 self-start sm:self-auto"
                                        >
                                            <Sparkles className="h-4 w-4" />
                                            Fill fields
                                        </button>
                                    </div>
                                    <div className="text-gray-300 space-y-1 text-sm">
                                        <div><strong className="text-white">Generic Name:</strong> {drugInfo.genericName}</div>
                                        <div><strong className="text-white">Drug Class:</strong> {drugInfo.drugClass}</div>
                                        <div><strong className="text-white">Brand Names:</strong> {Array.isArray(drugInfo.brandNames) ? drugInfo.brandNames.join(", ") : drugInfo.brandNames}</div>
                                    </div>
                                </div>

                                {/* Uses */}
                                <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                                    <h4 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
                                        <Check className="h-5 w-5" /> Uses & Indications
                                    </h4>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        {drugInfo.uses?.map((use: string, idx: number) => (
                                            <li key={idx}>{use}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Mechanism of Action */}
                                <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                                    <h4 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
                                        <Activity className="h-5 w-5" /> How It Works
                                    </h4>
                                    <p className="text-gray-300">{drugInfo.mechanism}</p>
                                </div>

                                {/* Side Effects */}
                                <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                                    <h4 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" /> Side Effects
                                    </h4>
                                    <div className="space-y-3">
                                        {drugInfo.sideEffects?.common?.length > 0 && (
                                            <div>
                                                <div className="font-bold text-gray-400 mb-2">Common:</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {drugInfo.sideEffects.common.map((effect: string, idx: number) => (
                                                        <span key={idx} className="px-3 py-1 bg-yellow-500/10 text-yellow-300 rounded-full text-sm border border-yellow-500/20">
                                                            {effect}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {drugInfo.sideEffects?.serious?.length > 0 && (
                                            <div>
                                                <div className="font-bold text-red-400 mb-2">Serious (Seek Medical Help):</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {drugInfo.sideEffects.serious.map((effect: string, idx: number) => (
                                                        <span key={idx} className="px-3 py-1 bg-red-500/10 text-red-300 rounded-full text-sm border border-red-500/20">
                                                            {effect}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Drug Interactions */}
                                {drugInfo.interactions?.length > 0 && (
                                    <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                                        <h4 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5" /> Drug Interactions
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {drugInfo.interactions.map((interaction: string, idx: number) => (
                                                <span key={idx} className="px-3 py-1 bg-red-500/10 text-red-300 rounded-lg text-sm border border-red-500/20">
                                                    {interaction}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Warnings */}
                                {drugInfo.warnings?.length > 0 && (
                                    <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-xl p-6 border border-orange-500/30">
                                        <h4 className="text-xl font-bold text-orange-400 mb-3 flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5" /> Important Warnings
                                        </h4>
                                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                                            {drugInfo.warnings.map((warning: string, idx: number) => (
                                                <li key={idx}>{warning}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Pregnancy */}
                                {drugInfo.pregnancy && (
                                    <div className="bg-black/20 rounded-xl p-4 border border-white/5 text-sm text-gray-400">
                                        <strong>Pregnancy & Breastfeeding:</strong> {drugInfo.pregnancy}
                                    </div>
                                )}

                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-sm text-blue-300 flex items-start gap-2">
                                    <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span><strong>Note:</strong> Verify with your pharmacist or doctor. This clinical overview is for informational support only. Dosing, quantity, and administration schedules must always follow your actual prescription.</span>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4">
                            <div className="text-xs text-gray-400 flex items-center gap-1.5">
                                <Shield className="h-4 w-4 text-purple-400" />
                                <span>Verify with your pharmacist or doctor</span>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                {drugInfo && !drugInfo.unavailable && (
                                    <button
                                        type="button"
                                        onClick={() => handleFillFields(drugInfo)}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Fill fields
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowDrugInfo(false)}
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all"
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
function MedicationModal({ isOpen, onClose, onSave, medication, theme, prefillData, onLookupDrug, doctors = [], facilities = [], suggestions }: any) {
    const initialEstimate = medication ? calculatePillCountEstimate(medication.item_metadata) : null
    const [formData, setFormData] = useState({
        name: medication?.title || "",
        genericName: medication?.item_metadata?.genericName || "",
        drugClass: medication?.item_metadata?.drugClass || "",
        dosage: medication?.item_metadata?.dosage || "",
        frequency: medication?.item_metadata?.frequency || "",
        prescribedBy: medication?.item_metadata?.prescribedBy || "",
        doctor_id: medication?.item_metadata?.doctor_id || null as string | null,
        facility_id: medication?.item_metadata?.facility_id || null as string | null,
        facility_name: medication?.item_metadata?.facility_name || "",
        pharmacy: medication?.item_metadata?.pharmacy || "",
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

    // Prefill fields from AI Drug Lookup when user taps "Fill fields"
    // NEVER prefill dosage, quantity, or schedule
    useEffect(() => {
        if (prefillData) {
            setFormData(prev => {
                const noteText = prefillData.verificationNote || "Verify with your pharmacist or doctor"
                let newNotes = prev.notes
                if (!newNotes || !newNotes.includes(noteText)) {
                    newNotes = newNotes ? `${newNotes}\n\nNote: ${noteText}` : `Note: ${noteText}`
                }
                return {
                    ...prev,
                    name: prev.name ? prev.name : (prefillData.name || ""),
                    genericName: prefillData.genericName || prev.genericName,
                    drugClass: prefillData.drugClass || prev.drugClass,
                    purpose: prefillData.purpose || prev.purpose,
                    sideEffects: prefillData.sideEffects || prev.sideEffects,
                    notes: newNotes
                    // DO NOT TOUCH: dosage, quantity, totalQuantity, frequency, reminders, doseSchedule
                }
            })
        }
    }, [prefillData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
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
            // NEVER clear formData and NEVER close on error
        } finally {
            setIsSaving(false)
        }
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

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const content = `
            <html>
                <head>
                    <title>Medication Report: ${formData.name}</title>
                    <style>
                        body { font-family: -apple-system, blinkmacsystemfont, "Segoe UI", roboto, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.5; }
                        .header { border-bottom: 3px solid #9333ea; padding-bottom: 20px; margin-bottom: 30px; }
                        h1 { margin: 0; color: #000; font-size: 28px; }
                        .subtitle { color: #666; font-size: 18px; margin-top: 5px; }
                        .section { margin-bottom: 30px; }
                        .section-header { font-weight: 900; text-transform: uppercase; font-size: 11px; color: #9333ea; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; letter-spacing: 0.1em; }
                        .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; }
                        .label { font-weight: 700; font-size: 12px; color: #666; margin-bottom: 2px; }
                        .value { font-size: 15px; color: #000; margin-bottom: 15px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th, td { border: 1px solid #eee; padding: 12px; text-align: left; font-size: 13px; }
                        th { background: #f9fafb; font-weight: 700; color: #374151; }
                        .notes-block { background: #f3f4f6; padding: 20px; border-radius: 8px; font-style: italic; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${formData.name}</h1>
                        <div class="subtitle">${formData.dosage} • ${formData.frequency}</div>
                    </div>
                    
                    <div class="grid">
                        <div class="section">
                            <div class="section-header">Prescription Details</div>
                            <div class="label">Prescribed By</div><div class="value">${formData.prescribedBy || 'N/A'}</div>
                            <div class="label">Purpose</div><div class="value">${formData.purpose || 'N/A'}</div>
                            <div class="label">RX Instructions</div><div class="value">${formData.rxInstructions || 'N/A'}</div>
                        </div>
                        <div class="section">
                            <div class="section-header">Treatment Overview</div>
                            <div class="label">Inventory</div><div class="value">${formData.quantity} pills left (Bottle of ${formData.totalQuantity})</div>
                            <div class="label">Duration</div><div class="value">${formData.startDate} to ${formData.endDate || 'Ongoing'}</div>
                            <div class="label">Next Dose</div><div class="value">${formData.nextDose ? format(new Date(formData.nextDose), 'PPp') : 'Not scheduled'}</div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-header">History & Intake Logs</div>
                        ${medication?.item_metadata?.takenLog?.length > 0 ? `
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Dose Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${medication.item_metadata.takenLog.map((log: any) => `
                                        <tr>
                                            <td>${format(new Date(log.timestamp), 'MMM d, yyyy')}</td>
                                            <td>${format(new Date(log.timestamp), 'h:mm a')}</td>
                                            <td>${log.dosage || formData.dosage}</td>
                                            <td style="color: #059669; font-weight: bold;">✓ Taken</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<p>No history records found in clinical vault.</p>'}
                    </div>

                    <div class="section">
                        <div class="section-header">Safety & Notes</div>
                        <div class="label">Interactions</div><div class="value">${formData.interactions || 'None reported'}</div>
                        <div class="label">Private Notes</div>
                        <div class="notes-block">${formData.notes || 'No private notes attached.'}</div>
                    </div>

                    <footer style="margin-top: 60px; border-top: 1px solid #eee; pt: 20px; font-size: 11px; text-align: center; color: #9ca3af;">
                        This document was generated securely from SecureLifeHub on ${format(new Date(), 'PPpp')}.
                    </footer>

                    <script>window.print(); setTimeout(() => window.close(), 500);</script>
                </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
    }

    const handleExportPDF = () => {
        const doc = new jsPDF()

        // Header
        doc.setFillColor(147, 51, 234) // Purple
        doc.rect(0, 0, 210, 40, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.setFont('helvetica', 'bold')
        doc.text(formData.name, 15, 20)

        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text(`${formData.dosage} | ${formData.frequency}`, 15, 30)

        // Information Grid
        doc.setTextColor(100, 116, 139)
        doc.setFontSize(10)
        doc.text("PRESCRIPTION DETAILS", 15, 50)
        doc.setDrawColor(226, 232, 240)
        doc.line(15, 52, 195, 52)

        doc.setTextColor(30, 41, 59)
        doc.setFont('helvetica', 'bold')
        doc.text("Prescribed By:", 15, 60); doc.setFont('helvetica', 'normal'); doc.text(formData.prescribedBy || 'N/A', 50, 60)
        doc.setFont('helvetica', 'bold')
        doc.text("Purpose:", 15, 67); doc.setFont('helvetica', 'normal'); doc.text(formData.purpose || 'N/A', 50, 67)
        doc.setFont('helvetica', 'bold')
        doc.text("Start Date:", 15, 74); doc.setFont('helvetica', 'normal'); doc.text(formData.startDate || 'N/A', 50, 74)
        doc.setFont('helvetica', 'bold')
        doc.text("End Date:", 15, 81); doc.setFont('helvetica', 'normal'); doc.text(formData.endDate || 'Ongoing', 50, 81)

        // Instructions
        doc.setTextColor(100, 116, 139)
        doc.text("INSTRUCTIONS", 15, 95)
        doc.line(15, 97, 195, 97)
        doc.setTextColor(30, 41, 59)
        const instructions = doc.splitTextToSize(formData.rxInstructions || 'No instructions provided.', 170)
        doc.text(instructions, 15, 105)

        // Logs Table
        const logs = medication?.item_metadata?.takenLog || []
        if (logs.length > 0) {
            autoTable(doc, {
                startY: 125,
                head: [['Date', 'Time', 'Dose', 'Status']],
                body: logs.map((log: any) => [
                    format(new Date(log.timestamp), 'MMM d, yyyy'),
                    format(new Date(log.timestamp), 'h:mm a'),
                    log.dosage || formData.dosage,
                    'Taken'
                ]),
                headStyles: { fillColor: [147, 51, 234], fontStyle: 'bold' },
                bodyStyles: { fontSize: 8, cellPadding: 2 },
                alternateRowStyles: { fillColor: [249, 250, 251] },
                margin: { left: 15, right: 15 }
            })
        }

        // Footer
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(`Generated by SecureLifeHub Vault on ${format(new Date(), 'PPP')}`, 105, 285, { align: 'center' })

        doc.save(`${formData.name}_Clinical_Report.pdf`)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl my-8 ${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'}`}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold">{medication ? 'Edit' : 'Add'} Medication</h2>
                        {medication && (
                            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
                                    title="Print Medical Report"
                                >
                                    <Printer className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExportPDF}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all"
                                    title="Export Clinical PDF"
                                >
                                    <FileDown className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button>
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
                            <button
                                type="button"
                                onClick={() => (window as any).showMockDrugModalFromAddMed()}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-900/20"
                            >
                                <Download className="h-4 w-4" /> Import Rx
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowQRScanner(!showQRScanner)}
                                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition-all"
                            >
                                {showQRScanner ? 'Hide Scanner' : 'Open Scanner'}
                            </button>
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
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!formData.name.trim()) {
                                                toast.error("Please enter a name first to look up clinical details.")
                                                return
                                            }
                                            onLookupDrug(formData.name.trim())
                                        }}
                                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition-colors"
                                    >
                                        <Sparkles className="h-3 w-3" /> Look up Drug Info
                                    </button>
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

                        {formData.trackInventory && (
                            <div className="space-y-3 pt-2 border-t border-white/10">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 block">Pills per Dose</label>
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
                                        <label className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 block">Low-Stock Alert</label>
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
                                    <label className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 block">Count Starts</label>
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
                            <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Frequency / Doses</label>
                            <div className="flex gap-2">
                                <select
                                    value={(() => {
                                        const freq = formData.frequency?.toLowerCase().trim() || ""
                                        if (freq === "once daily - morning") return "once_morning"
                                        if (freq === "once daily - afternoon") return "once_afternoon"
                                        if (freq === "once daily - evening") return "once_evening"
                                        if (freq === "once daily - bedtime") return "once_bedtime"
                                        if (freq === "every other day") return "every_other_day"
                                        if (freq === "weekly") return "weekly"
                                        if (freq.includes("once")) return "once"
                                        if (freq.includes("twice")) return "twice"
                                        if (freq.includes("three")) return "three"
                                        if (freq.includes("four")) return "four"
                                        if (freq === "as needed") return "as_needed"
                                        return "custom"
                                    })()}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        let freq = ""
                                        let doses = "1"

                                        if (val === "once") { freq = "Once Daily"; doses = "1"; }
                                        else if (val === "once_morning") { freq = "Once Daily - Morning"; doses = "1"; }
                                        else if (val === "once_afternoon") { freq = "Once Daily - Afternoon"; doses = "1"; }
                                        else if (val === "once_evening") { freq = "Once Daily - Evening"; doses = "1"; }
                                        else if (val === "once_bedtime") { freq = "Once Daily - Bedtime"; doses = "1"; }
                                        else if (val === "twice") { freq = "Twice Daily"; doses = "2"; }
                                        else if (val === "three") { freq = "Three Times Daily"; doses = "3"; }
                                        else if (val === "four") { freq = "Four Times Daily"; doses = "4"; }
                                        else if (val === "every_other_day") { freq = "Every Other Day"; doses = "1"; }
                                        else if (val === "weekly") { freq = "Weekly"; doses = "1"; }
                                        else if (val === "as_needed") { freq = "As needed"; doses = "1"; }
                                        else { freq = formData.frequency; doses = "1"; }

                                        const defaultRem = getDefaultReminderForFrequency(freq)
                                        const nextReminders = defaultRem
                                            ? [defaultRem]
                                            : formData.reminders

                                        setFormData({ ...formData, frequency: freq, dosesPerDay: doses, reminders: nextReminders })
                                    }}
                                    className="px-3 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                >
                                    <option value="once">Once Daily</option>
                                    <option value="once_morning">Once Daily - Morning</option>
                                    <option value="once_afternoon">Once Daily - Afternoon</option>
                                    <option value="once_evening">Once Daily - Evening</option>
                                    <option value="once_bedtime">Once Daily - Bedtime</option>
                                    <option value="twice">Twice Daily</option>
                                    <option value="three">3x Daily</option>
                                    <option value="four">4x Daily</option>
                                    <option value="every_other_day">Every Other Day</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="as_needed">As Needed</option>
                                    <option value="custom">Custom Text...</option>
                                </select>
                                <input
                                    placeholder="e.g., Every 2 days"
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                    className="flex-1 px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
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
                                                {formData.scheduleStartDate ? format(addDays(new Date(formData.scheduleStartDate), entry.dayIndex - 1), 'MMM d') : ''}
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
export function PillLibraryModal({ isOpen, onClose, theme, addItem }: any) {
    const [selectedShape, setSelectedShape] = useState<string | null>(null)
    const [selectedColor, setSelectedColor] = useState<string | null>(null)
    const [quickAddName, setQuickAddName] = useState("")
    const [quickAddDosage, setQuickAddDosage] = useState("")
    const [isSaving, setIsSaving] = useState(false)

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

                                <button
                                    onClick={async () => {
                                        if (!quickAddName || !quickAddDosage) return alert("Please enter name and dosage")
                                        setIsSaving(true)
                                        try {
                                            await addItem({
                                                type: "note",
                                                category: "Medications",
                                                title: quickAddName,
                                                item_metadata: {
                                                    dosage: quickAddDosage,
                                                    pillShape: selectedShape,
                                                    pillColor: selectedColor,
                                                    notes: "Quick added from Pill Library"
                                                }
                                            })
                                            alert(`${quickAddName} added to your list!`)
                                            setQuickAddName("")
                                            setQuickAddDosage("")
                                        } catch (e) {
                                            console.error(e)
                                            alert("Failed to add medication")
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

// Rx Import Modal - Add specific prescriptions
function MockDrugsModal({ isOpen, onClose, onAddMockDrug, theme }: any) {
    // Categories and Presets
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
    const [isImporting, setIsImporting] = useState(false)

    const currentCat = MED_CATEGORIES.find(c => c.id === activeCategory) || MED_CATEGORIES[0]

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

    const handleImportSelected = async () => {
        if (selectedMeds.length === 0) return alert("Select at least one medication to import")

        setIsImporting(true)
        try {
            let count = 0
            for (const cat of MED_CATEGORIES) {
                for (const drug of cat.meds) {
                    if (selectedMeds.includes(drug.name)) {
                        // Logic to calculate reminders based on frequency strings
                        let reminders: string[] = []
                        if (drug.frequency.includes("Once daily")) reminders = ["09:00"]
                        else if (drug.frequency.includes("Twice daily")) reminders = ["09:00", "20:00"]
                        else if (drug.frequency.includes("Every 4 hours")) reminders = ["08:00", "12:00", "16:00", "20:00"]
                        else if (drug.frequency.includes("Every 6 hours")) reminders = ["06:00", "12:00", "18:00", "00:00"]
                        else if (drug.frequency.includes("Every 12 hours")) reminders = ["08:00", "20:00"]

                        await onAddMockDrug({
                            name: drug.name,
                            dosage: drug.dosage,
                            frequency: drug.frequency,
                            prescribedBy: "Quick Import",
                            purpose: drug.purpose,
                            sideEffects: "",
                            refillDate: "",
                            nextDose: new Date(Date.now() + 3600000).toISOString(), // Start in 1 hour
                            pillShape: drug.shape || "round",
                            pillColor: drug.color || "#FFFFFF",
                            quantity: drug.quantity,
                            totalQuantity: drug.quantity,
                            reminders: reminders,
                            notes: "Imported from " + cat.label
                        })
                        count++
                    }
                }
            }
            alert(`✅ Successfully imported ${count} medications!`)
            onClose()
        } catch (e) {
            console.error(e)
            alert("Error importing medications")
        } finally {
            setIsImporting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
            <div className={`w-full max-w-6xl rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#121212] border-white/10'}`}>
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
                            <Download className="h-10 w-10 text-purple-500" />
                            Rx Quick Import
                        </h2>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mt-2">Select category and import sets or individual meds</p>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-full transition-all group">
                        <X className="h-8 w-8 text-gray-500 group-hover:text-white transition-colors" />
                    </button>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar: Categories */}
                    <div className="lg:col-span-1 space-y-3">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-4 pl-2">Categories</div>
                        {MED_CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${activeCategory === cat.id
                                    ? 'bg-purple-600/10 border-purple-500 text-white shadow-lg'
                                    : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'}`}
                            >
                                <cat.icon className={`h-6 w-6 ${activeCategory === cat.id ? 'text-purple-400' : 'text-gray-600'}`} />
                                <span className={`font-black uppercase italic tracking-tighter text-lg`}>{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Right Panel: Med Selection */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentCat.id === 'rash' ? 'from-red-500/20 to-orange-500/20' : currentCat.id === 'cold' ? 'from-blue-500/20 to-cyan-500/20' : currentCat.id === 'pain' ? 'from-purple-500/20 to-pink-500/20' : 'from-teal-500/20 to-emerald-500/20'}`}>
                                    <currentCat.icon className={`h-8 w-8 ${currentCat.color}`} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">{currentCat.label}</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{currentCat.meds.length} Presets Available</p>
                                </div>
                            </div>
                            <button
                                onClick={handleSelectAll}
                                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-widest transition-all"
                            >
                                {currentCat.meds.every(m => selectedMeds.includes(m.name)) ? 'Deselect All' : 'Select All in Category'}
                            </button>
                        </div>

                        {/* Med Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar p-1">
                            {currentCat.meds.map((med, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleToggleMed(med.name)}
                                    className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer group relative ${selectedMeds.includes(med.name)
                                        ? 'bg-purple-600/10 border-purple-500/50 shadow-xl'
                                        : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-4 rounded-xl transition-all ${selectedMeds.includes(med.name) ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-500 group-hover:text-white'}`}>
                                            <Circle className="h-8 w-8" fill={med.color} stroke="white" strokeWidth={0.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-xl font-black uppercase italic tracking-tighter truncate pr-8">{med.name}</h4>
                                                <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedMeds.includes(med.name) ? 'bg-purple-500 border-purple-500' : 'border-gray-700'}`}>
                                                    {selectedMeds.includes(med.name) && <Check className="h-4 w-4 text-white" />}
                                                </div>
                                            </div>
                                            <div className="text-sm font-black text-gray-500 uppercase tracking-widest mt-1">{med.dosage}</div>
                                            <div className="flex flex-wrap gap-2 mt-4 text-[10px] font-black uppercase tracking-widest">
                                                <span className="px-2 py-1 bg-white/5 rounded-lg border border-white/5">{med.frequency}</span>
                                                <span className="px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-gray-500">{med.purpose}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-12 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="text-3xl font-black italic uppercase tracking-tighter text-purple-500">{selectedMeds.length}</div>
                        <div className="text-xs font-black uppercase tracking-widest text-gray-500 border-l border-white/10 pl-4 py-1">Medications Selected for Import</div>
                        {selectedMeds.length > 0 && (
                            <button onClick={() => setSelectedMeds([])} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 ml-4">Clear All</button>
                        )}
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 md:flex-none px-10 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase italic tracking-tighter transition-all"
                        >
                            Back To Hub
                        </button>
                        <button
                            onClick={handleImportSelected}
                            disabled={selectedMeds.length === 0 || isImporting}
                            className="flex-1 md:flex-none px-12 py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black uppercase italic tracking-tighter hover:from-purple-500 hover:to-pink-500 transition-all shadow-[0_10px_30px_rgba(147,51,234,0.3)] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                        >
                            {isImporting ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Plus className="h-6 w-6" /> Import Selected Now</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

