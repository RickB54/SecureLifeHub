"use client"

import { useState, useRef, useMemo, useEffect } from "react"
import { Search, Plus, Filter, Calendar as CalendarIcon, FileText, Upload, MoreHorizontal, X, User, MapPin, Clock, Activity, Heart, Droplets, Utensils, LayoutDashboard, TrendingUp, Loader2, Baby, Weight, ChevronDown, Image, Pill, Edit, Sparkles, Mic, HelpCircle, Archive, Trash2, Moon, Flame, GlassWater, Stethoscope, Hospital, AlertTriangle, Mail, Share2, FileCheck2 } from "lucide-react"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isAfter, subDays } from "date-fns"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { toast } from "sonner"
import Lightbox from "./media/lightbox"
import Medications, { PillLibraryModal } from "./medications"
import HealthAI from "./health-ai"
import GoogleCalendarIntegration from "./google-calendar-integration"
import { MOCKED_HEALTH } from "../lib/mock-data"
import MockDataBanner from "./ui/mock-data-banner"
import { supabase } from "@/lib/supabase"
import Doctors from "./doctors"
import {
    DoctorCombobox,
    FieldSuggestionInput,
    formatForDateTimeInput,
    extractDoctorsFromRecords,
    extractHealthSuggestions,
} from "./health-ui/health-field-helpers"
import {
    getCachedHealthRecords,
    loadSharedHealthRecords,
    subscribeHealthStore,
    upsertSharedHealthRecord,
    removeSharedHealthRecord,
    resolveDoctorInfo,
} from "@/lib/health-store"

// Helper to format date safely
const safeFormat = (date: any, formatStr: string) => {
    if (!date) return "";
    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return "Invalid Date";
        return format(d, formatStr);
    } catch (e) {
        return "Invalid Date";
    }
};

interface HealthDashboardProps {
    records: any[]
    addItem: (item: any) => Promise<any>
    updateItem: (id: string, updates: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
    setRecords?: any
    onOpenHelp?: (targetId?: string) => void
    setActivePage?: (page: string) => void
    initialTab?: "dashboard" | "records" | "meds" | "vitals" | "calendar" | "appointments" | "ai" | "checkin" | "doctors"
    mockSettings?: Record<string, boolean>
}

// Helper to normalize and match Health Hub tab IDs and common aliases
export const normalizeHealthTab = (tabStr?: string | null): any => {
    if (!tabStr) return null
    const lower = tabStr.toLowerCase().trim()
    const map: Record<string, string> = {
        "dr-ai": "ai",
        "dr_ai": "ai",
        "ai": "ai",
        "medical-history": "records",
        "medical_history": "records",
        "history": "records",
        "records": "records",
        "my-doctors": "doctors",
        "my_doctors": "doctors",
        "doctor": "doctors",
        "doctors": "doctors",
        "visits": "appointments",
        "appointments": "appointments",
        "meds": "meds",
        "medications": "meds",
        "vitals": "vitals",
        "timeline": "calendar",
        "calendar": "calendar",
        "checkin": "checkin",
        "check-in": "checkin",
        "dashboard": "dashboard",
        "overview": "dashboard",
    }
    const target = map[lower] || lower
    const valid = ["dashboard", "records", "meds", "vitals", "calendar", "appointments", "ai", "checkin", "doctors"]
    return valid.includes(target) ? target : null
}

const getLocalDateTimeString = () => {
    const d = new Date()
    const offset = d.getTimezoneOffset()
    const local = new Date(d.getTime() - offset * 60 * 1000)
    return local.toISOString().slice(0, 16)
}

export default function HealthDashboard({ records, addItem, updateItem, deleteItem, theme, onOpenHelp, initialTab = "dashboard", mockSettings, setActivePage }: HealthDashboardProps) {
    const [activeTab, setActiveTab] = useState<"dashboard" | "records" | "meds" | "vitals" | "calendar" | "appointments" | "ai" | "checkin" | "doctors">(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search)
            const fromUrl = normalizeHealthTab(urlParams.get("tab"))
            if (fromUrl) {
                const cleanUrl = new URL(window.location.href)
                cleanUrl.searchParams.delete("tab")
                window.history.replaceState({}, "", cleanUrl.toString())
                return fromUrl
            }
            const target = normalizeHealthTab(localStorage.getItem("slh-health-target-tab"))
            if (target) {
                localStorage.removeItem("slh-health-target-tab")
                return target
            }
        }
        return (normalizeHealthTab(initialTab) || "dashboard") as any
    })
    const [showAddModal, setShowAddModal] = useState(false)
    const [addModalType, setAddModalType] = useState<"record" | "vital" | "appointment">("record")
    const [editingVital, setEditingVital] = useState<any>(null)
    const [historicalLogDateFilter, setHistoricalLogDateFilter] = useState<'all' | '7d' | '30d' | '1y'>('all')
    const [historicalLogStatusFilter, setHistoricalLogStatusFilter] = useState<'active' | 'archived'>('active')
    const [showPillLibrary, setShowPillLibrary] = useState(false)

    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    // Upload & Lightbox State
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxItems, setLightboxItems] = useState<any[]>([])
    const [lightboxIndex, setLightboxIndex] = useState(0)
    const [isListening, setIsListening] = useState(false)
    const [activeField, setActiveField] = useState<string | null>(null)
    const [apptFormData, setApptFormData] = useState({
        title: "",
        notes: "",
        doctor: "",
        doctor_id: "" as string | null,
        location: "",
        specialty: "",
        date: formatForDateTimeInput(new Date())
    })
    const [manualRecordForm, setManualRecordForm] = useState({
        title: "",
        doctor: "",
        doctor_id: "" as string | null,
        date: formatForDateTimeInput(new Date()),
        notes: ""
    })

    // Google Calendar State
    const [googleCalendarEvents, setGoogleCalendarEvents] = useState<any[]>([])
    const [isGCalConnected, setIsGCalConnected] = useState(false)
    const [addToGoogleCalendar, setAddToGoogleCalendar] = useState(true)

    // Check for scheduling conflict with Google Calendar events
    const schedulingConflict = useMemo(() => {
        if (!isGCalConnected || !apptFormData.date || googleCalendarEvents.length === 0) return null
        const apptStart = new Date(apptFormData.date).getTime()
        if (isNaN(apptStart)) return null
        const apptEnd = apptStart + 60 * 60 * 1000 // 1 hour duration

        for (const ev of googleCalendarEvents) {
            const evStartStr = ev.start?.dateTime || ev.start?.date
            const evEndStr = ev.end?.dateTime || ev.end?.date
            if (!evStartStr) continue

            const evStart = new Date(evStartStr).getTime()
            const evEnd = evEndStr ? new Date(evEndStr).getTime() : evStart + 60 * 60 * 1000

            if (apptStart < evEnd && apptEnd > evStart) {
                return {
                    eventTitle: ev.summary || "(No Title)",
                    calendarName: ev.calendarName || "Google Calendar",
                    timeStr: ev.start.dateTime
                        ? new Date(ev.start.dateTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                        : 'All day',
                }
            }
        }
        return null
    }, [isGCalConnected, apptFormData.date, googleCalendarEvents])

    // Mock data state
    const [showMockData, setShowMockData] = useState(false)
    const [isForcedMock, setIsForcedMock] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search)
            const fromUrl = normalizeHealthTab(urlParams.get("tab"))
            if (fromUrl) {
                const cleanUrl = new URL(window.location.href)
                cleanUrl.searchParams.delete("tab")
                window.history.replaceState({}, "", cleanUrl.toString())
                setActiveTab(fromUrl)
                return
            }
            const target = normalizeHealthTab(localStorage.getItem("slh-health-target-tab"))
            if (target) {
                localStorage.removeItem("slh-health-target-tab")
                setActiveTab(target)
                return
            }
        }
        if (initialTab) {
            const normalized = normalizeHealthTab(initialTab)
            if (normalized) setActiveTab(normalized)
        }
    }, [initialTab])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const dismissed = localStorage.getItem('health_mock_dismissed') === 'true'
            const localMock = mockSettings?.['type-health-records'] || false
            const realRecordsCount = records.filter(r => 
                r.type === 'health-record' || r.category === 'Health Records' || r.category === 'Vitals' || r.type === 'medication' || r.category === 'Medications'
            ).length
            
            setIsForcedMock(localMock)
            
            // RULE: If there are ANY real records, NEVER show mock data
            if (realRecordsCount > 0) {
                setShowMockData(false)
            } else if (localMock) {
                setShowMockData(true)
            } else if (realRecordsCount === 0 && !dismissed) {
                setShowMockData(true)
            } else {
                setShowMockData(false)
            }
        }
    }, [records, mockSettings])

    const handleClearMockData = () => {
        setShowMockData(false)
        if (typeof window !== 'undefined') {
            // Update global settings
            const saved = localStorage.getItem("hub_mock_settings")
            let mocks = saved ? JSON.parse(saved) : {}
            mocks['type-health-records'] = false
            localStorage.setItem("hub_mock_settings", JSON.stringify(mocks))
            
            // Legacy fallbacks
            localStorage.setItem('health_mock_dismissed', 'true')
            localStorage.setItem('health_mock_enabled', 'false')
            
            // Notify other components
            window.dispatchEvent(new Event('storage'))
        }
    }

    // Speech Recognition Setup
    const startSpeechToText = (field: keyof typeof apptFormData) => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
            toast.error("Speech recognition is not supported in this browser.")
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onstart = () => {
            setIsListening(true)
            setActiveField(field)
            toast.info(`Listening for ${field}...`)
        }

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            setApptFormData(prev => ({
                ...prev,
                [field]: prev[field] ? prev[field] + " " + transcript : transcript
            }))
            setIsListening(false)
            setActiveField(null)
        }

        recognition.onerror = (event: any) => {
            console.error(event.error)
            setIsListening(false)
            setActiveField(null)
            toast.error("Error recognizing speech.")
        }

        recognition.onend = () => {
            setIsListening(false)
            setActiveField(null)
        }

        recognition.start()
    }

    // Shared cached Health Hub store (single fetch reused across all tabs, zero refetch after save)
    const [isolatedHealthRecords, setIsolatedHealthRecords] = useState<any[] | null>(() => getCachedHealthRecords())
    const [editingRecord, setEditingRecord] = useState<any>(null)

    useEffect(() => {
        const unsub = subscribeHealthStore((data) => setIsolatedHealthRecords(data))
        loadSharedHealthRecords()
        return unsub
    }, [])

    // Consolidated records for use in ALL tabs
    const effectiveRecords = isolatedHealthRecords && isolatedHealthRecords.length > 0 ? isolatedHealthRecords : records
    const consolidatedRecords = useMemo(() => {
        return showMockData ? MOCKED_HEALTH : effectiveRecords;
    }, [showMockData, effectiveRecords])

    // Shared zero-egress doctors & field suggestions built from already-loaded records
    const savedDoctors = useMemo(() => extractDoctorsFromRecords(effectiveRecords), [effectiveRecords])
    const healthSuggestions = useMemo(() => extractHealthSuggestions(effectiveRecords), [effectiveRecords])

    const healthRecords = useMemo(() => {
        return consolidatedRecords.filter(r => 
            (r.type === "health-record" || r.category === "Health Records" || r.item_metadata?.is_health_record)
        ).sort((a, b) => new Date(b.item_metadata?.date || b.created_at || 0).getTime() - new Date(a.item_metadata?.date || a.created_at || 0).getTime())
    }, [consolidatedRecords])

    const vitalRecords = useMemo(() => {
        return consolidatedRecords.filter(r => r.category === "Vitals" || r.item_metadata?.is_vital)
            .sort((a, b) => new Date(a.item_metadata?.date || 0).getTime() - new Date(b.item_metadata?.date || 0).getTime())
    }, [consolidatedRecords])

    const activeVitalRecords = useMemo(() => {
        return vitalRecords.filter(r => !r.item_metadata?.is_archived)
    }, [vitalRecords])

    const diaryEntries = useMemo(() => {
        return consolidatedRecords.filter(r => r.category === "Health Diary" || r.item_metadata?.is_diary || r.type === "health-checkin")
            .sort((a, b) => new Date(b.item_metadata?.date || 0).getTime() - new Date(a.item_metadata?.date || 0).getTime())
    }, [consolidatedRecords])

    const checkinHistory = useMemo(() => {
        return consolidatedRecords.filter(r => r.type === "health-checkin")
            .sort((a, b) => new Date(a.item_metadata?.date || 0).getTime() - new Date(b.item_metadata?.date || 0).getTime())
    }, [consolidatedRecords])

    const medRecords = useMemo(() => {
        return consolidatedRecords.filter(r => {
            const specificNames = ["Hydroxyzine", "Prednisone", "Loratadine", "Famotidine"];
            const isSpecificMed = specificNames.some(name => r.title?.includes(name));

            return (r.category && r.category.toLowerCase() === "medications") ||
                (r.type && r.type.toLowerCase() === "medication") ||
                (r.type === "note" && r.category === "Medications") ||
                (r.item_metadata?.notes === "Imported Prescription") ||
                isSpecificMed
        })
    }, [consolidatedRecords])

    const upcomingAppts = useMemo(() => {
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        return healthRecords.filter(r => {
            const isAppt =
                r.item_metadata?.type === "Appointment" ||
                r.category === "Appointments" ||
                r.type === "appointment" ||
                (r.title && r.title.toLowerCase().includes("appointment"))
            if (!isAppt) return false
            const d = r.item_metadata?.date ? new Date(r.item_metadata.date) : null
            return d && d >= todayStart
        }).sort((a, b) => new Date(a.item_metadata?.date || 0).getTime() - new Date(b.item_metadata?.date || 0).getTime())
    }, [healthRecords])

    // --- ANALYTICS ---
    // Calculate Streak
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if there's an entry for today or yesterday to keep streak alive
    const hasEntryToday = diaryEntries.some(r => isSameDay(new Date(r.item_metadata.date), today))
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const hasEntryYesterday = diaryEntries.some(r => isSameDay(new Date(r.item_metadata.date), yesterday))

    if (hasEntryToday || hasEntryYesterday) {
        // Calculate streak
        let checkDate = hasEntryToday ? today : yesterday
        let streak = 0
        while (true) {
            const hasEntry = diaryEntries.some(r => isSameDay(new Date(r.item_metadata.date), checkDate))
            if (hasEntry) {
                streak++
                checkDate.setDate(checkDate.getDate() - 1)
            } else {
                break
            }
        }
        currentStreak = streak
    }

    const weightData = activeVitalRecords.filter(r => r.title === "Weight").map(r => ({
        date: r.item_metadata?.date ? format(new Date(r.item_metadata.date), 'MMM d') : 'N/A',
        value: parseFloat(r.item_metadata?.value ?? '0') || 0
    }))

    const bpData = activeVitalRecords.filter(r => r.title === "Blood Pressure").map(r => {
        const parts = (r.item_metadata?.value || "0/0").split('/')
        const sys = parseInt(parts[0]) || 0
        const dia = parseInt(parts[1]) || 0
        return {
            date: r.item_metadata?.date ? format(new Date(r.item_metadata.date), 'MMM d') : 'N/A',
            systolic: sys,
            diastolic: dia
        }
    })

    // --- HELPERS ---
    const getVitalIcon = (type: string) => {
        switch (type) {
            case 'Blood Pressure': return <Activity className="h-5 w-5 text-red-500" />
            case 'Blood Oxygen': return <Activity className="h-5 w-5 text-blue-500" />
            case 'Cholesterol': return <Droplets className="h-5 w-5 text-yellow-500" />
            case 'Vitamin': return <Utensils className="h-5 w-5 text-green-500" />
            case 'Weight': return <Weight className="h-5 w-5 text-orange-500" />
            default: return <Heart className="h-5 w-5 text-pink-500" />
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 5000000) { alert("File too large (< 5MB)"); return }

        setUploading(true)
        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64 = reader.result as string
            // Create a new Health Record for this file
            await addItem({
                type: "health-record",
                title: file.name,
                category: "Health Records",
                item_metadata: {
                    is_health_record: true,
                    date: new Date().toISOString(),
                    type: "document",
                    url: base64
                }
            })
            setUploading(false)
        }
        reader.readAsDataURL(file)
    }

    const openLightbox = (item: any) => {
        if (!item.item_metadata?.url) return

        const recordImages = records
            .filter(r => r.item_metadata?.url)
            .map(r => ({
                id: r.id,
                title: r.title,
                url: r.item_metadata.url,
                description: r.item_metadata.notes || format(new Date(r.item_metadata.date || r.created_at), 'PPP')
            }))

        const index = recordImages.findIndex(img => img.id === item.id)
        setLightboxItems(recordImages)
        setLightboxIndex(index >= 0 ? index : 0)
        setLightboxOpen(true)
    }



    // Shared edit openers so Overview, Visits, Medical History, and Timeline all open the same form
    const openEditAppointment = (apt: any) => {
        setEditingVital(apt)
        setApptFormData({
            title: apt.title || "",
            notes: apt.item_metadata?.notes || "",
            doctor: resolveDoctorInfo(apt.item_metadata?.doctor_id, { name: apt.item_metadata?.doctor }, savedDoctors).name,
            doctor_id: apt.item_metadata?.doctor_id || null,
            location: apt.item_metadata?.location || "",
            specialty: apt.item_metadata?.specialty || "",
            date: formatForDateTimeInput(apt.item_metadata?.date)
        })
        setAddModalType('appointment')
        setShowAddModal(true)
    }

    const openEditRecord = (item: any) => {
        if (item.item_metadata?.type === "Appointment" || item.type === "appointment" || item.category === "Appointments") {
            openEditAppointment(item)
            return
        }
        setEditingRecord(item)
        setManualRecordForm({
            title: item.title || "",
            doctor: resolveDoctorInfo(item.item_metadata?.doctor_id, { name: item.item_metadata?.doctor }, savedDoctors).name,
            doctor_id: item.item_metadata?.doctor_id || null,
            date: formatForDateTimeInput(item.item_metadata?.date || item.created_at),
            notes: item.item_metadata?.notes || ""
        })
        setAddModalType('record')
        setShowAddModal(true)
    }

    // --- VIEWS ---
    const renderDashboard = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center px-1">
                <h2 className="text-xl font-bold opacity-50 uppercase tracking-widest text-xs">Overview Dashboard</h2>
            </div>
            {/* Quick Stats - ALWAYS AT TOP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-white/20'} border flex flex-col items-center justify-center text-center shadow-xl`}>
                    <div className="text-4xl font-black text-blue-500 mb-1">{upcomingAppts.length}</div>
                    <div className="text-xs uppercase font-bold text-gray-400 tracking-widest">Appointments</div>
                </div>
                <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-white/20'} border flex flex-col items-center justify-center text-center shadow-xl`}>
                    <div className="text-4xl font-black text-emerald-500 mb-1">{currentStreak}</div>
                    <div className="text-xs uppercase font-bold text-gray-400 tracking-widest">Day Streak</div>
                </div>
                <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-white/20'} border flex flex-col items-center justify-center text-center shadow-xl`}>
                    <div className="text-4xl font-black text-amber-500 mb-1">{medRecords.length}</div>
                    <div className="text-xs uppercase font-bold text-gray-400 tracking-widest">Medications</div>
                </div>
                <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-white/20'} border flex flex-col items-center justify-center text-center shadow-xl`}>
                    <div className="text-4xl font-black text-rose-500 mb-1">{healthRecords.length}</div>
                    <div className="text-xs uppercase font-bold text-gray-400 tracking-widest">Records</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Appointments */}
                <div className={`lg:col-span-1 p-6 rounded-2xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-white/20 shadow-2xl'}`}>
                    <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-blue-500" /> Upcoming
                            <button onClick={() => onOpenHelp?.('type-health-records')} className="p-1 hover:text-blue-400 opacity-50"><HelpCircle className="h-3 w-3" /></button>
                        </span>
                        <span className="text-xs font-normal text-gray-500">{upcomingAppts.length} found</span>
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {upcomingAppts.length === 0 ? (
                            <div className="text-center py-12">
                                <CalendarIcon className="h-12 w-12 text-gray-700 mx-auto mb-3 opacity-20" />
                                <p className="text-gray-500 text-sm">No upcoming appointments scheduled.</p>
                            </div>
                        ) : (
                            upcomingAppts.map(apt => {
                                const docInfo = resolveDoctorInfo(apt.item_metadata?.doctor_id, { name: apt.item_metadata?.doctor }, savedDoctors)
                                return (
                                <div key={apt.id} className={`flex items-start gap-4 p-4 rounded-xl border ${theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-white/5 border-white/5'} hover:border-blue-500/30 transition-all`}>
                                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl cursor-pointer" onClick={() => openEditAppointment(apt)}>
                                        <CalendarIcon className="h-6 w-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4
                                            onClick={() => openEditAppointment(apt)}
                                            className="font-bold text-sm truncate cursor-pointer hover:text-blue-400 transition-colors"
                                            title="Tap to edit appointment"
                                        >
                                            {apt.title}
                                        </h4>
                                        <p className="text-xs text-blue-400 font-medium mb-1">{safeFormat(apt.item_metadata.date, 'MMM d, h:mm a')}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase font-black">
                                            <User className="h-3 w-3" /> {docInfo.name || "Medical Provider"}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => openEditAppointment(apt)}
                                        className="p-2 rounded-lg hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 shrink-0"
                                        title="Edit appointment"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Vitals Summary Chart */}
                <div className={`lg:col-span-2 p-6 rounded-2xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-white/20 shadow-2xl'}`}>
                    <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-rose-500" /> Vital Statistics
                        </span>
                        <button onClick={() => setActiveTab('vitals')} className="text-xs text-blue-400 hover:underline">View All Trends</button>
                    </h3>
                    <div className="h-[300px] w-full">
                        {weightData.length > 1 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weightData}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="date" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                                        labelStyle={{ color: '#888', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                <TrendingUp className="h-12 w-12 mb-3 opacity-20" />
                                <p className="text-sm italic">Not enough data to generate trends yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )



    const renderRecords = () => (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-[10px] md:text-sm opacity-50 flex items-center gap-2">
                    Medical History Accordion
                    <button onClick={() => onOpenHelp?.('type-health-records')} className="p-1 hover:text-blue-400"><HelpCircle className="h-4 w-4" /></button>
                </h2>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">

                    <button
                        onClick={() => {
                            setEditingRecord(null)
                            setManualRecordForm({
                                title: "",
                                doctor: "",
                                doctor_id: null,
                                date: formatForDateTimeInput(new Date()),
                                notes: ""
                            })
                            setAddModalType('record')
                            setShowAddModal(true)
                        }}
                        className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl shadow-lg transition-all font-bold text-xs flex items-center justify-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add Record
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg transition-all font-bold text-xs flex items-center justify-center gap-2"
                    >
                        <Upload className="h-4 w-4" /> Upload
                    </button>
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
                {healthRecords.length === 0 ? (
                    <div className="text-center py-20 bg-black/20 rounded-3xl border border-dashed border-white/10">
                        <FileText className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 italic">No medical records uploaded yet.</p>
                    </div>
                ) : (
                    healthRecords.map(item => {
                        const docInfo = resolveDoctorInfo(item.item_metadata?.doctor_id, { name: item.item_metadata?.doctor }, savedDoctors)
                        return (
                        <details key={item.id} className={`group rounded-2xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-white/10 hover:border-white/20 shadow-lg'} transition-all overflow-hidden`}>
                            <summary className="p-5 flex items-center gap-4 cursor-pointer list-none">
                                <div className={`p-3 rounded-xl ${item.item_metadata?.url ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    {item.item_metadata?.url ? <Image className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditRecord(item) }}
                                        className="text-lg font-bold break-words group-hover:text-blue-400 transition-colors uppercase tracking-tight cursor-pointer"
                                        title="Tap to edit record"
                                    >
                                        {item.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-bold uppercase tracking-wider">
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {safeFormat(item.item_metadata?.date || item.created_at, 'PPP p')}</span>
                                        {docInfo.name && <span className="flex items-center gap-1 border-l border-white/10 pl-3"><User className="h-3 w-3" /> {docInfo.name}</span>}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditRecord(item) }}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-colors shrink-0"
                                    title="Edit record"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-300 group-open:rotate-180" />
                            </summary>

                            <div className="p-6 border-t border-white/5 bg-white/[0.02] space-y-6">
                                {item.item_metadata?.url && (
                                    <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group/img cursor-zoom-in" onClick={() => openLightbox(item)}>
                                        <img src={item.item_metadata.url} alt={item.title} loading="lazy" className="w-full h-auto object-contain bg-black" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full font-bold text-sm">Click to Expand</span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase text-blue-400 mb-2">Record Summary</h4>
                                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                {item.item_metadata?.notes || "No detailed notes provided for this record."}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase text-emerald-400 mb-2">Metadata Details</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                                    <div className="text-[8px] uppercase text-gray-500 font-black">Initial Date</div>
                                                    <div className="text-xs font-bold">{safeFormat(item.item_metadata?.date || item.created_at, 'PP')}</div>
                                                </div>
                                                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                                                    <div className="text-[8px] uppercase text-gray-500 font-black">Logged At</div>
                                                    <div className="text-xs font-bold">{safeFormat(item.created_at, 'PP')}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 justify-end pt-4">
                                            <button type="button" onClick={() => openEditRecord(item)} className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest">
                                                Edit Record
                                            </button>
                                            <button type="button" onClick={async () => { if (confirm("Delete this record permanently?")) { await deleteItem(item.id); removeSharedHealthRecord(item.id); toast.success("Record deleted") } }} className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest">
                                                Delete Record
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </details>
                        )
                    })
                )}
            </div>
        </div>
    )

    const renderVitals = () => {
        const vitalGroups = [
            { id: 'bp', title: 'Blood Pressure', icon: Activity, color: 'rose', data: bpData, multi: true },
            { id: 'weight', title: 'Weight', icon: Weight, color: 'orange', data: weightData },
            { id: 'temp', title: 'Temperature', icon: Activity, color: 'yellow', data: activeVitalRecords.filter(v => v.title === "Temperature").map(r => ({ date: safeFormat(r.item_metadata?.date, 'MMM d'), value: parseFloat(r.item_metadata?.value ?? '0') })) },
            { id: 'ox', title: 'Blood Oxygen', icon: Droplets, color: 'cyan', data: activeVitalRecords.filter(v => v.title === "Blood Oxygen").map(r => ({ date: safeFormat(r.item_metadata?.date, 'MMM d'), value: parseFloat(r.item_metadata?.value ?? '0') })) },
            { id: 'hr', title: 'Heart Rate', icon: Heart, color: 'red', data: activeVitalRecords.filter(v => v.title === "Heart Rate").map(r => ({ date: safeFormat(r.item_metadata?.date, 'MMM d'), value: parseFloat(r.item_metadata?.value ?? '0') })) },
            { id: 'gluc', title: 'Glucose', icon: Utensils, color: 'emerald', data: activeVitalRecords.filter(v => v.title === "Glucose").map(r => ({ date: safeFormat(r.item_metadata?.date, 'MMM d'), value: parseFloat(r.item_metadata?.value ?? '0') })) },
            { id: 'sleep', title: 'Sleep Duration', icon: Moon, color: 'violet', data: activeVitalRecords.filter(v => v.title === "Sleep Duration").map(r => ({ date: safeFormat(r.item_metadata?.date, 'MMM d'), value: parseFloat(r.item_metadata?.value ?? '0') })) },
            { id: 'sleep_score', title: 'Sleep Score', icon: Sparkles, color: 'indigo', data: activeVitalRecords.filter(v => v.title === "Sleep Score").map(r => ({ date: safeFormat(r.item_metadata?.date, 'MMM d'), value: parseFloat(r.item_metadata?.value ?? '0') })) },
            { id: 'water', title: 'Water Intake', icon: GlassWater, color: 'blue', data: activeVitalRecords.filter(v => v.title === "Water Intake").map(r => ({ date: safeFormat(r.item_metadata?.date, 'MMM d'), value: parseFloat(r.item_metadata?.value ?? '0') })) },
            { id: 'cal', title: 'Calorie Intake', icon: Flame, color: 'orange', data: activeVitalRecords.filter(v => v.title === "Calorie Intake").map(r => ({ date: safeFormat(r.item_metadata?.date, 'MMM d'), value: parseFloat(r.item_metadata?.value ?? '0') })) },
            { id: 'steps', title: 'Steps', icon: TrendingUp, color: 'emerald', data: activeVitalRecords.filter(v => v.title === "Steps").map(r => ({ date: safeFormat(r.item_metadata?.date, 'MMM d'), value: parseFloat(r.item_metadata?.value ?? '0') })) },
            { id: 'activity', title: 'Activity (Mins)', icon: Activity, color: 'blue', data: activeVitalRecords.filter(v => v.title === "Activity (Mins)").map(r => ({ date: safeFormat(r.item_metadata?.date, 'MMM d'), value: parseFloat(r.item_metadata?.value ?? '0') })) },
        ]

        const filteredHistoricalLog = vitalRecords.filter(vital => {
            const isArchived = Boolean(vital.item_metadata?.is_archived)
            if (historicalLogStatusFilter === 'active' && isArchived) return false
            if (historicalLogStatusFilter === 'archived' && !isArchived) return false
            
            if (historicalLogDateFilter !== 'all' && vital.item_metadata?.date) {
                const date = new Date(vital.item_metadata.date)
                const now = new Date()
                if (historicalLogDateFilter === '7d' && date < subDays(now, 7)) return false
                if (historicalLogDateFilter === '30d' && date < subDays(now, 30)) return false
                if (historicalLogDateFilter === '1y' && date.getFullYear() !== now.getFullYear()) return false
            }
            return true
        }).sort((a, b) => new Date(b.item_metadata.date).getTime() - new Date(a.item_metadata.date).getTime())

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Vital Sign Trends</h2>
                    <div className="flex gap-2">

                        <button
                            onClick={() => { setAddModalType('vital'); setShowAddModal(true) }}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl shadow-lg transition-all font-bold flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" /> Log Vital
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    {vitalGroups.map((group) => {
                        const activeFilter = activeVitalRecords.filter(v => v.title === group.title)
                        const latest = activeFilter[activeFilter.length - 1]
                        const colorMap: any = { rose: '#f43f5e', orange: '#f97316', yellow: '#eab308', cyan: '#06b6d4', red: '#ef4444', emerald: '#10b981', violet: '#8b5cf6', blue: '#3b82f6' }
                        const color = colorMap[group.color]

                        return (
                            <div key={group.id} className={`p-6 rounded-2xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-white/10 hover:border-white/20'} transition-all shadow-xl group overflow-hidden relative`}>
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-${group.color}-500 opacity-[0.03] rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-500`}></div>

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className={`p-3 rounded-2xl bg-${group.color}-500/10 text-${group.color}-500`}>
                                        <group.icon className="h-6 w-6" />
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="text-xs font-black uppercase text-gray-500">{group.title}</div>
                                            {latest ? (
                                                <button
                                                    onClick={() => {
                                                        setEditingVital(latest)
                                                        setAddModalType('vital')
                                                        setShowAddModal(true)
                                                    }}
                                                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-all"
                                                    title="Edit vital"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingVital({ title: group.title, _isDummy: true })
                                                        setAddModalType('vital')
                                                        setShowAddModal(true)
                                                    }}
                                                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-all"
                                                    title="Log vital"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-2xl font-black font-mono">
                                            {latest ? latest.item_metadata.value : '--'}
                                            <span className="text-xs text-gray-500 ml-1 font-normal uppercase">{latest?.item_metadata.unit || ""}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Graph Section */}
                                <div className="h-32 w-full mb-6 mt-4">
                                    {group.data.length > 1 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            {group.multi ? (
                                                <LineChart data={group.data}>
                                                    <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={3} dot={false} />
                                                    <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={3} dot={false} />
                                                </LineChart>
                                            ) : (
                                                <AreaChart data={group.data}>
                                                    <defs>
                                                        <linearGradient id={`color-${group.id}`} x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <Area type="monotone" dataKey="value" stroke={color} strokeWidth={3} fillOpacity={1} fill={`url(#color-${group.id})`} />
                                                </AreaChart>
                                            )}
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-xs text-gray-600 italic">Logging required for trend...</div>
                                    )}
                                </div>

                                {/* Notes Section in Card */}
                                <div className="pt-4 border-t border-white/5 space-y-2">
                                    <h4 className="text-[10px] font-black uppercase text-gray-400">Notes & Observations</h4>
                                    <p className="text-xs text-gray-300 line-clamp-2 italic">
                                        {latest?.item_metadata?.notes || "No additional data recorded for latest entry."}
                                    </p>
                                    {latest?.item_metadata?.date && (
                                        <div className="text-[10px] text-blue-400 font-bold uppercase mt-2">
                                            Recorded {safeFormat(latest.item_metadata.date, 'LLL d, yyyy')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-12 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-gray-500" /> Historical Log
                        </h3>
                        <div className="flex gap-2 text-sm">
                            <select 
                                value={historicalLogDateFilter} 
                                onChange={e => setHistoricalLogDateFilter(e.target.value as any)} 
                                className={`px-2 py-1 rounded-lg outline-none cursor-pointer text-xs font-bold ${theme === 'light' ? 'bg-gray-100 text-gray-800' : 'bg-white/5 text-gray-300'}`}
                            >
                                <option value="all" className={theme === 'light' ? 'bg-white' : 'bg-[#1a1a1a]'}>All Time</option>
                                <option value="7d" className={theme === 'light' ? 'bg-white' : 'bg-[#1a1a1a]'}>Last 7 Days</option>
                                <option value="30d" className={theme === 'light' ? 'bg-white' : 'bg-[#1a1a1a]'}>Last 30 Days</option>
                                <option value="1y" className={theme === 'light' ? 'bg-white' : 'bg-[#1a1a1a]'}>This Year</option>
                            </select>
                            <select 
                                value={historicalLogStatusFilter} 
                                onChange={e => setHistoricalLogStatusFilter(e.target.value as any)} 
                                className={`px-2 py-1 rounded-lg outline-none cursor-pointer text-xs font-bold ${theme === 'light' ? 'bg-gray-100 text-gray-800' : 'bg-white/5 text-gray-300'}`}
                            >
                                <option value="active" className={theme === 'light' ? 'bg-white' : 'bg-[#1a1a1a]'}>Active Logs</option>
                                <option value="archived" className={theme === 'light' ? 'bg-white' : 'bg-[#1a1a1a]'}>Archived</option>
                            </select>
                        </div>
                    </div>
                    <div className={`p-1 rounded-2xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-white/10'}`}>
                        {filteredHistoricalLog.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 italic text-sm">No historical vitals found.</div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {filteredHistoricalLog.map(vital => (
                                    <div key={vital.id} className="p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-all flex justify-between items-center group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-xl bg-gray-500/10 text-gray-400">
                                                <Activity className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div
                                                    onClick={() => {
                                                        setEditingVital(vital)
                                                        setAddModalType('vital')
                                                        setShowAddModal(true)
                                                    }}
                                                    className="font-bold text-sm cursor-pointer hover:text-blue-400 transition-colors"
                                                    title="Tap to edit vital"
                                                >
                                                    {vital.title}
                                                </div>
                                                <div className="text-xs text-gray-400 flex items-center gap-2">
                                                    <span>{safeFormat(vital.item_metadata.date, 'PP')}</span>
                                                    {vital.item_metadata.context && <span className="opacity-50 border-l border-gray-500/50 pl-2">{vital.item_metadata.context}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="font-mono font-black text-blue-400">{vital.item_metadata.value} <span className="text-[10px] text-gray-500 font-normal uppercase">{vital.item_metadata.unit}</span></div>
                                            </div>
                                            <div className="flex gap-2 p-1 bg-black/20 rounded-lg">
                                                <button
                                                    onClick={() => {
                                                        setEditingVital(vital)
                                                        setAddModalType('vital')
                                                        setShowAddModal(true)
                                                    }}
                                                    className="p-1.5 hover:bg-white/10 hover:text-blue-400 rounded-md transition-all text-gray-500"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const confirmMsg = vital.item_metadata?.is_archived ? "Restore this entry to active trends?" : "Archive this entry from trends?"
                                                        if (confirm(confirmMsg)) {
                                                            updateItem(vital.id, {
                                                                item_metadata: { ...vital.item_metadata, is_archived: !vital.item_metadata?.is_archived }
                                                            })
                                                        }
                                                    }}
                                                    className="p-1.5 hover:bg-white/10 hover:text-yellow-400 rounded-md transition-all text-gray-500"
                                                    title={vital.item_metadata?.is_archived ? "Restore" : "Archive"}
                                                >
                                                    <Archive className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() => { if (confirm("Delete this vital entry?")) deleteItem(vital.id) }}
                                                    className="p-1.5 hover:bg-white/10 hover:text-red-400 rounded-md transition-all text-gray-500"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    const renderMeds = () => {
        return (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                {medRecords.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No medications found.</div>
                ) : (
                    medRecords.map(med => (
                        <div key={med.id} className={`p-4 rounded-xl border flex justify-between items-center ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1e1e1e] border-white/10'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5'}`}>
                                    <Activity className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold">{med.title}</h3>
                                    {med.item_metadata?.dosage && <div className="text-sm text-gray-400">Dosage: {med.item_metadata.dosage}</div>}
                                    {med.item_metadata?.frequency && <div className="text-sm text-gray-400">Frequency: {med.item_metadata.frequency}</div>}
                                </div>
                            </div>
                            <div className="text-right">
                                {med.item_metadata?.refillDate && (
                                    <div className="text-xs text-gray-500 mb-1">Refill: {safeFormat(med.item_metadata.refillDate, 'PP')}</div>
                                )}
                                <button onClick={() => { if (confirm("Delete medication?")) deleteItem(med.id) }} className="text-xs text-red-500 hover:text-red-400">Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )
    }

    // Calendar logic same as before but wrapped
    const renderCalendarView = () => {
        // ... reuse existing calendar logic simplified for brevity in this replace ...
        // For now, let's keep it simple or copy the logic if essential.
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(monthStart)
        const startDate = startOfWeek(monthStart)
        const endDate = endOfWeek(monthEnd)
        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

        return (
            <div className={`rounded-xl p-6 border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1e1e1e] border-white/10'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{safeFormat(currentMonth, 'MMMM yyyy')}</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded-lg">&lt;</button>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded-lg">&gt;</button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center text-xs font-bold text-gray-500 mb-2 uppercase">{d}</div>)}
                    {calendarDays.map((day, i) => {
                        const dayEvents = [...healthRecords, ...vitalRecords].filter(r => {
                            const d = new Date(r.item_metadata.date)
                            return !isNaN(d.getTime()) && isSameDay(d, day)
                        })
                        const isCurrent = isSameMonth(day, monthStart)
                        return (
                            <div key={i} className={`min-h-[100px] border p-2 rounded-lg ${!isCurrent ? 'opacity-30' : ''} ${theme === 'light' ? 'border-gray-200' : 'border-white/10 bg-black/20'}`}>
                                <div className="text-right text-xs mb-2 opacity-50">{safeFormat(day, 'd')}</div>
                                <div className="space-y-1">
                                    {dayEvents.slice(0, 3).map(ev => (
                                        <div key={ev.id} className="text-[10px] p-1 rounded bg-blue-500/20 text-blue-500 truncate">
                                            {ev.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderAppointments = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Google Calendar Integration */}
            <GoogleCalendarIntegration
                theme={theme}
                existingAppointments={upcomingAppts}
                onScheduleAppointment={() => {
                    setEditingVital(null)
                    setApptFormData({
                        title: "",
                        notes: "",
                        doctor: "",
                        doctor_id: null,
                        location: "",
                        specialty: "",
                        date: formatForDateTimeInput(new Date())
                    })
                    setAddModalType('appointment')
                    setShowAddModal(true)
                }}
                onEventsLoaded={setGoogleCalendarEvents}
                onConnectionChange={setIsGCalConnected}
            />

            {/* Divider */}
            <div className="border-t border-white/10 my-8"></div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Medical Appointments</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setEditingVital(null)
                            setApptFormData({
                                title: "",
                                notes: "",
                                doctor: "",
                                doctor_id: null,
                                location: "",
                                specialty: "",
                                date: formatForDateTimeInput(new Date())
                            })
                            setAddModalType('appointment')
                            setShowAddModal(true)
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl shadow-lg transition-all font-bold text-sm flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Schedule Visit
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingAppts.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-black/20 rounded-3xl border border-dashed border-white/10">
                        <CalendarIcon className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 italic">No upcoming appointments scheduled.</p>
                    </div>
                ) : (
                    upcomingAppts.map(apt => {
                        const docInfo = resolveDoctorInfo(apt.item_metadata?.doctor_id, { name: apt.item_metadata?.doctor }, savedDoctors)
                        return (
                        <div key={apt.id} className={`p-6 rounded-2xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-white/10 hover:border-white/20 shadow-lg'} transition-all group relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 p-4 opacity-50">
                                <CalendarIcon className="h-24 w-24 text-blue-500/10 -mr-6 -mt-6 transform rotate-12" />
                            </div>

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                                        <CalendarIcon className="h-6 w-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditAppointment(apt)}
                                            className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-full transition-colors"
                                            title="Edit appointment"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (confirm("Cancel this appointment?")) {
                                                    await deleteItem(apt.id)
                                                    removeSharedHealthRecord(apt.id)
                                                    toast.success("Appointment removed")
                                                }
                                            }}
                                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-full transition-colors"
                                            title="Delete appointment"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3
                                        onClick={() => openEditAppointment(apt)}
                                        className="text-lg font-bold mb-1 line-clamp-1 cursor-pointer hover:text-blue-400 transition-colors"
                                        title="Tap to edit appointment"
                                    >
                                        {apt.title}
                                    </h3>
                                    <p className="text-sm text-blue-400 font-bold uppercase tracking-wider">{safeFormat(apt.item_metadata.date, 'MMMM d, yyyy')}</p>
                                    <p className="text-xs text-gray-500 font-mono mt-1">{safeFormat(apt.item_metadata.date, 'h:mm a')}</p>
                                </div>

                                <div className="pt-4 border-t border-white/5 space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <User className="h-3 w-3" />
                                        <span>{docInfo.name || "No provider specified"}</span>
                                    </div>
                                    {apt.item_metadata.notes && (
                                        <div className="text-xs text-gray-500 italic line-clamp-2">
                                            "{apt.item_metadata.notes}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        )
                    })
                )}
            </div>
        </div>
    )

    const renderCheckin = () => {
        return (
            <CheckinTab 
                records={effectiveRecords} 
                addItem={addItem}
                updateItem={updateItem}
                theme={theme} 
                setActiveTab={setActiveTab} 
            />
        )
    }

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-[#121212] text-white'} overflow-hidden`}>
            
            {showMockData && (
                <div className="px-4 md:px-8 pt-8 -mb-4">
                    <MockDataBanner 
                        onClear={handleClearMockData} 
                        theme={theme} 
                        isForced={isForcedMock}
                        pageName="Health Hub"
                    />
                </div>
            )}

            {/* 1. MOBILE ONLY STICKY HEADER: Exact ONE-line layout with Dropdown + Doctor Visit Hub button */}
            <div className="md:hidden sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2">
                <div className="relative flex-1 min-w-0">
                    <select
                        value={activeTab}
                        onChange={(e) => {
                            const val = e.target.value
                            if (val === 'visit-hub') {
                                if (typeof window !== "undefined") window.location.href = "/doctor-visit-hub"
                                return
                            }
                            if (val.startsWith('section:')) {
                                const sec = val.replace('section:', '')
                                if (typeof window !== "undefined") window.location.href = `/doctor-visit-hub?section=${sec}`
                                return
                            }
                            setActiveTab(val as any)
                            if (typeof window !== "undefined") {
                                const cleanUrl = new URL(window.location.href)
                                cleanUrl.searchParams.delete("tab")
                                window.history.replaceState({}, "", cleanUrl.toString())
                            }
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer truncate shadow-sm"
                        style={{ colorScheme: 'dark' }}
                    >
                        <option value="dashboard">Overview</option>
                        <option value="visit-hub">Visit Hub (Full)</option>
                        <option value="section:notes">Notes (Visit Hub)</option>
                        <option value="section:letters">Letters (Visit Hub)</option>
                        <option value="section:referrals">Referrals (Visit Hub)</option>
                        <option value="section:questions">Questions (Visit Hub)</option>
                        <option value="section:summary">Visit Summary (Visit Hub)</option>
                        <option value="records">Medical History</option>
                        <option value="meds">Meds</option>
                        <option value="ai">Dr. AI</option>
                        <option value="vitals">Vitals</option>
                        <option value="doctors">My Doctors</option>
                        <option value="appointments">Visits</option>
                        <option value="calendar">Timeline</option>
                        <option value="checkin">Check-in</option>
                    </select>
                    <ChevronDown className="h-4 w-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <button
                    type="button"
                    onClick={() => {
                        if (typeof window !== "undefined") {
                            window.location.href = "/doctor-visit-hub"
                        }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider shrink-0 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
                    title="Open full-screen Doctor Visit Hub"
                >
                    <Stethoscope className="h-4 w-4" />
                    <span>Doctor Visit Hub</span>
                </button>
            </div>

            {/* 2. TABLET / DESKTOP HEADER: Full title and horizontal tabs */}
            <div className="hidden md:block p-4 md:p-8 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                        <Activity className="h-8 w-8 text-blue-400" /> Health Hub
                    </h1>
                    <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                        {activeTab !== 'dashboard' && (
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                                title="Back to Health Hub Overview"
                            >
                                <Hospital className="h-4 w-4 text-rose-400" />
                                Health Hub
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (typeof window !== "undefined") {
                                    window.location.href = "/doctor-visit-hub"
                                }
                            }}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
                            title="Open full-screen Doctor Visit Hub"
                        >
                            <Stethoscope className="h-4 w-4" /> Doctor Visit Hub
                        </button>
                    </div>
                </div>

                <div className={`flex flex-wrap gap-1.5 border-b ${theme === 'light' ? 'border-gray-200' : 'border-white/10'} pb-3`}>
                    {[
                        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                        { id: 'visit-hub', label: 'Visit Hub', icon: Stethoscope },
                        { id: 'visit-hub-notes', label: 'Notes', icon: FileText, section: 'notes' },
                        { id: 'visit-hub-letters', label: 'Letters', icon: Mail, section: 'letters' },
                        { id: 'visit-hub-referrals', label: 'Referrals', icon: Share2, section: 'referrals' },
                        { id: 'visit-hub-questions', label: 'Questions', icon: HelpCircle, section: 'questions' },
                        { id: 'visit-hub-summary', label: 'Visit Summary', icon: FileCheck2, section: 'summary' },
                        { id: 'records', label: 'Medical History', icon: FileText },
                        { id: 'meds', label: 'Meds', icon: Pill },
                        { id: 'ai', label: 'Dr. AI', icon: Sparkles },
                        { id: 'vitals', label: 'Vitals', icon: Activity },
                        { id: 'doctors', label: 'My Doctors', icon: User },
                        { id: 'appointments', label: 'Visits', icon: Clock },
                        { id: 'calendar', label: 'Timeline', icon: CalendarIcon },
                        { id: 'checkin', label: 'Check-in', icon: Activity }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if (tab.id === 'visit-hub') {
                                    if (typeof window !== "undefined") {
                                        window.location.href = "/doctor-visit-hub"
                                    }
                                    return
                                }
                                if ((tab as any).section) {
                                    const sec = (tab as any).section
                                    if (typeof window !== "undefined") {
                                        window.location.href = `/doctor-visit-hub?section=${sec}`
                                    }
                                    return
                                }
                                setActiveTab(tab.id as any)
                                if (typeof window !== "undefined") {
                                    const cleanUrl = new URL(window.location.href)
                                    cleanUrl.searchParams.delete("tab")
                                    window.history.replaceState({}, "", cleanUrl.toString())
                                }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 whitespace-nowrap ${tab.id === 'visit-hub'
                                ? "bg-teal-600/25 text-teal-300 hover:bg-teal-600/40 border border-teal-500/30"
                                : (tab as any).section
                                    ? "bg-teal-600/15 text-teal-300/90 hover:bg-teal-600/30 border border-teal-500/20"
                                    : activeTab === tab.id
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                        : theme === 'light' ? "bg-gray-100 text-gray-500 hover:bg-gray-200" : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'dashboard' && <div className="px-4 md:px-8 pb-8">{renderDashboard()}</div>}
                {activeTab === 'records' && <div className="px-4 md:px-8 pb-8">{renderRecords()}</div>}
                {activeTab === 'meds' && (
                    <div className="px-4 md:px-8 pb-8 space-y-4">
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowPillLibrary(true)}
                                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase flex items-center gap-2"
                            >
                                <Pill className="h-4 w-4" /> Pill Library
                            </button>

                        </div>
                        <Medications records={effectiveRecords} addItem={addItem} updateItem={updateItem} deleteItem={deleteItem} theme={theme} />
                        {showPillLibrary && <PillLibraryModal isOpen={showPillLibrary} onClose={() => setShowPillLibrary(false)} theme={theme} addItem={addItem} />}
                    </div>
                )}

                {activeTab === 'vitals' && <div className="px-4 md:px-8 pb-8">{renderVitals()}</div>}
                {activeTab === 'calendar' && <div className="px-4 md:px-8 pb-8">{renderCalendarView()}</div>}
                {activeTab === 'appointments' && <div className="px-4 md:px-8 pb-8">{renderAppointments()}</div>}
                {activeTab === 'checkin' && <div className="px-4 md:px-8 pb-8">{renderCheckin()}</div>}
                {activeTab === 'doctors' && (
                    <div className="pb-8">
                        <Doctors
                            records={effectiveRecords}
                            addItem={addItem}
                            updateItem={updateItem}
                            deleteItem={deleteItem}
                            theme={theme}
                            onOpenHelp={onOpenHelp}
                        />
                    </div>
                )}
                {activeTab === 'ai' && (
                    <div className="px-4 md:px-8 pb-8">
                        <HealthAI
                            theme={theme}
                            records={records}
                            onOpenHelp={onOpenHelp}
                            onScheduleAppointment={() => {
                                setAddModalType('appointment')
                                setShowAddModal(true)
                            }}
                        />
                    </div>
                )}
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                        <div className={`w-full max-w-2xl rounded-[2.5rem] p-10 shadow-3xl overflow-hidden relative ${theme === 'light' ? 'bg-white' : 'bg-black border border-white/20'}`}>
                            {/* Designer Background Gradient */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-rose-500"></div>

                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                                    {addModalType === 'vital' ? (
                                        <span className="flex items-center gap-3"><Activity className="h-8 w-8 text-rose-500" /> Log Vital</span>
                                    ) : addModalType === 'appointment' ? (
                                        <span className="flex items-center gap-3"><Clock className="h-8 w-8 text-blue-500" /> Schedule Visit</span>
                                    ) : (
                                        <span className="flex items-center gap-3"><FileText className="h-8 w-8 text-blue-500" /> Add Medical Record</span>
                                    )}
                                </h2>
                                <button onClick={() => { setShowAddModal(false); setEditingVital(null) }} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                                    <X className="h-8 w-8 text-gray-500" />
                                </button>
                            </div>

                            {addModalType === 'vital' ? (
                                <form key="vital-form" onSubmit={async (e: any) => {
                                    e.preventDefault()
                                    const fd = new FormData(e.target)
                                    const type = fd.get("type") as string
                                    const value = fd.get("value") as string

                                    const units: any = { 
                                        'Blood Pressure': 'mmHg', 
                                        'Weight': 'lbs', 
                                        'Temperature': '°F', 
                                        'Blood Oxygen': '%', 
                                        'Heart Rate': 'bpm', 
                                        'Glucose': 'mg/dL',
                                        'Sleep Duration': 'hrs',
                                        'Sleep Score': '/100',
                                        'Steps': 'steps',
                                        'Activity (Mins)': 'mins',
                                        'Water Intake': 'oz',
                                        'Calorie Intake': 'kcal'
                                    }

                                    const payload = {
                                        type: "note",
                                        category: "Vitals",
                                        title: type,
                                        item_metadata: {
                                            is_vital: true,
                                            value: value,
                                            unit: fd.get("unit") || units[type] || '',
                                            date: fd.get("date"),
                                            notes: fd.get("notes"),
                                            // AI Fields
                                            context: fd.get("context"),
                                            mood: fd.get("mood")
                                        }
                                    }

                                    try {
                                        if (editingVital && !editingVital._isDummy) {
                                            const res = await updateItem(editingVital.id, payload)
                                            if (res === false) throw new Error("Failed to update vital")
                                            upsertSharedHealthRecord({ ...editingVital, ...payload })
                                            toast.success("Vital updated")
                                        } else {
                                            const created = await addItem(payload)
                                            if (!created) throw new Error("Failed to save vital")
                                            upsertSharedHealthRecord(created)
                                            toast.success("Vital logged")
                                        }
                                        setShowAddModal(false)
                                        setEditingVital(null)
                                    } catch (err: any) {
                                        toast.error(err?.message || "Failed to save vital")
                                    }
                                }} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Vital Metric</label>
                                            <select name="type" defaultValue={editingVital?.title || "Blood Pressure"} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-rose-500/50 transition-all font-bold text-white" style={{ colorScheme: 'dark' }}>
                                                <option className="bg-[#1a1a1a]">Blood Pressure</option>
                                                <option className="bg-[#1a1a1a]">Weight</option>
                                                <option className="bg-[#1a1a1a]">Heart Rate</option>
                                                <option className="bg-[#1a1a1a]">Blood Oxygen</option>
                                                <option className="bg-[#1a1a1a]">Glucose</option>
                                                <option className="bg-[#1a1a1a]">Temperature</option>
                                                <option className="bg-[#1a1a1a]">Sleep Duration</option>
                                                <option className="bg-[#1a1a1a]">Sleep Score</option>
                                                <option className="bg-[#1a1a1a]">Steps</option>
                                                <option className="bg-[#1a1a1a]">Activity (Mins)</option>
                                                <option className="bg-[#1a1a1a]">Water Intake</option>
                                                <option className="bg-[#1a1a1a]">Calorie Intake</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Value</label>
                                                <input name="value" required defaultValue={editingVital?.item_metadata?.value || ""} placeholder="120/80" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-rose-500/50 transition-all font-mono font-bold text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Unit</label>
                                                <input name="unit" defaultValue={editingVital?.item_metadata?.unit || ""} placeholder="mmHg" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-rose-500/50 transition-all text-xs font-bold text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Timestamp</label>
                                            <input type="datetime-local" name="date" required defaultValue={formatForDateTimeInput(editingVital?.item_metadata?.date)} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-rose-500/50 transition-all font-bold text-white" style={{ colorScheme: 'dark' }} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">State/Context (AI Informed)</label>
                                            <select name="context" defaultValue={editingVital?.item_metadata?.context || "At Rest"} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-rose-500/50 transition-all font-bold text-white" style={{ colorScheme: 'dark' }}>
                                                <option className="bg-[#1a1a1a]">At Rest</option>
                                                <option className="bg-[#1a1a1a]">Post Workout</option>
                                                <option className="bg-[#1a1a1a]">Waking Up</option>
                                                <option className="bg-[#1a1a1a]">Feeling Stress</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Current Mood/Feeling</label>
                                        <div className="flex gap-4">
                                            {['😊', '🤒', '😴', '😰', '⚡'].map(mood => (
                                                <label key={mood} className="flex-1 cursor-pointer">
                                                    <input type="radio" name="mood" value={mood} defaultChecked={editingVital?.item_metadata?.mood === mood} className="hidden peer" />
                                                    <div className="p-4 text-2xl text-center rounded-2xl bg-white/5 border border-white/10 peer-checked:bg-rose-500/20 peer-checked:border-rose-500/50 transition-all">
                                                        {mood}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Detailed Observations</label>
                                        <textarea name="notes" defaultValue={editingVital?.item_metadata?.notes || ""} placeholder="How are you feeling? Any specific symptoms? (AI will use this for analysis later)" className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 outline-none focus:border-rose-500/50 transition-all h-32 text-sm italic" />
                                    </div>

                                    <button className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-rose-600 to-red-600 text-white font-black italic uppercase tracking-tighter hover:from-rose-500 hover:to-red-500 transition-all shadow-2xl shadow-rose-500/20 active:scale-95">
                                        {(editingVital && !editingVital._isDummy) ? 'Update Vital' : 'Finalize Entry'}
                                    </button>
                                </form>
                            ) : addModalType === 'appointment' ? (
                                <form key="appointment-form" onSubmit={async (e: any) => {
                                    e.preventDefault()
                                    if (!apptFormData.title.trim()) {
                                        toast.error("Please provide a reason for the visit")
                                        return
                                    }

                                    const payload = {
                                        type: "note",
                                        title: apptFormData.title.trim(),
                                        category: "Health Records",
                                        item_metadata: {
                                            is_health_record: true,
                                            type: "Appointment",
                                            date: apptFormData.date || formatForDateTimeInput(new Date()),
                                            doctor: apptFormData.doctor || "",
                                            doctor_id: apptFormData.doctor_id || null,
                                            location: apptFormData.location || "",
                                            specialty: apptFormData.specialty || "",
                                            notes: apptFormData.notes || "",
                                        }
                                    }

                                    try {
                                        if (editingVital && !editingVital._isDummy) {
                                            const res = await updateItem(editingVital.id, payload)
                                            if (res === false) throw new Error("Failed to update appointment")
                                            upsertSharedHealthRecord({ ...editingVital, ...payload })
                                            toast.success("Appointment updated successfully")
                                        } else {
                                            const created = await addItem(payload)
                                            if (!created) throw new Error("Failed to schedule appointment")
                                            upsertSharedHealthRecord(created)
                                            toast.success("Appointment scheduled successfully")

                                            // If user opted to add to Google Calendar and connected
                                            if (isGCalConnected && addToGoogleCalendar && apptFormData.date) {
                                                try {
                                                    const session = (await supabase.auth.getSession()).data.session
                                                    if (session?.access_token) {
                                                        const startIso = new Date(apptFormData.date).toISOString()
                                                        const endIso = new Date(new Date(apptFormData.date).getTime() + 60 * 60 * 1000).toISOString()
                                                        const gcalRes = await fetch("/api/google-calendar/create-event", {
                                                            method: "POST",
                                                            headers: {
                                                                Authorization: `Bearer ${session.access_token}`,
                                                                "Content-Type": "application/json",
                                                            },
                                                            body: JSON.stringify({ start: startIso, end: endIso }),
                                                        })
                                                        const gcalData = await gcalRes.json()
                                                        if (gcalData.success) {
                                                            toast.success("Added to Google Calendar as 'Doctor appointment'")
                                                        }
                                                    }
                                                } catch (err) {
                                                    console.warn("Failed to create Google Calendar event:", err)
                                                }
                                            }
                                        }

                                        setShowAddModal(false)
                                        setEditingVital(null)
                                    } catch (err: any) {
                                        console.error("Failed to schedule appointment:", err)
                                        toast.error(err?.message || "Failed to schedule appointment")
                                    }
                                }} className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Reason for Visit</label>
                                            <button
                                                type="button"
                                                onClick={() => startSpeechToText('title')}
                                                className={`p-1.5 rounded-full transition-all ${isListening && activeField === 'title' ? 'bg-red-500 text-white animate-pulse' : 'text-blue-500 hover:bg-blue-500/10'}`}
                                                title="Use Voice to Text"
                                            >
                                                <Mic className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <FieldSuggestionInput
                                            name="title"
                                            required
                                            value={apptFormData.title || ''}
                                            onChange={(val) => setApptFormData({ ...apptFormData, title: val })}
                                            suggestions={healthSuggestions.reasons}
                                            placeholder="e.g. Annual Checkup"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                name="date"
                                                required
                                                value={apptFormData.date || ''}
                                                onChange={(e) => setApptFormData({ ...apptFormData, date: e.target.value })}
                                                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-blue-500/50 transition-all font-bold"
                                                style={{ colorScheme: 'dark' }}
                                            />
                                        </div>
                                        <DoctorCombobox
                                            label="Doctor / Provider"
                                            value={apptFormData.doctor || ''}
                                            doctorId={apptFormData.doctor_id}
                                            doctors={savedDoctors}
                                            placeholder="Select doctor or type name..."
                                            onSelectDoctor={(doc) => {
                                                setApptFormData((prev) => ({
                                                    ...prev,
                                                    doctor: doc.name,
                                                    doctor_id: doc.id,
                                                    location: prev.location?.trim() ? prev.location : (doc.facility || doc.address || ""),
                                                    specialty: prev.specialty?.trim() ? prev.specialty : (doc.specialty || ""),
                                                }))
                                            }}
                                            onClear={() => setApptFormData((prev) => ({ ...prev, doctor: "", doctor_id: null }))}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FieldSuggestionInput
                                            name="location"
                                            label="Location"
                                            value={apptFormData.location || ''}
                                            onChange={(val) => setApptFormData({ ...apptFormData, location: val })}
                                            suggestions={healthSuggestions.locations}
                                            placeholder="123 Medic Lane"
                                            icon={<MapPin className="h-5 w-5" />}
                                        />
                                        <FieldSuggestionInput
                                            name="specialty"
                                            label="Specialty"
                                            value={apptFormData.specialty || ''}
                                            onChange={(val) => setApptFormData({ ...apptFormData, specialty: val })}
                                            suggestions={healthSuggestions.specialties}
                                            placeholder="Cardiology"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Notes & Instructions</label>
                                            <button
                                                type="button"
                                                onClick={() => startSpeechToText('notes')}
                                                className={`p-1.5 rounded-full transition-all ${isListening && activeField === 'notes' ? 'bg-red-500 text-white animate-pulse' : 'text-blue-500 hover:bg-blue-500/10'}`}
                                                title="Use Voice to Text"
                                            >
                                                <Mic className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <textarea
                                            name="notes"
                                            value={apptFormData.notes || ''}
                                            onChange={(e) => setApptFormData({ ...apptFormData, notes: e.target.value })}
                                            placeholder="Bring ID, insurance card, etc."
                                            className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 outline-none focus:border-blue-500/50 transition-all h-32 text-sm italic custom-scrollbar"
                                        />
                                    </div>

                                    {schedulingConflict && (
                                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300">
                                            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                            <div className="text-xs leading-relaxed">
                                                <span className="font-bold">⚠️ Scheduling Conflict:</span> You already have an event (<span className="font-semibold text-white">"{schedulingConflict.eventTitle}"</span> at {schedulingConflict.timeStr}) on this date in your <span className="font-semibold">{schedulingConflict.calendarName}</span> calendar.
                                            </div>
                                        </div>
                                    )}

                                    {isGCalConnected && (
                                        <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={addToGoogleCalendar}
                                                onChange={(e) => setAddToGoogleCalendar(e.target.checked)}
                                                className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-white flex items-center gap-2">
                                                    <CalendarIcon className="h-3.5 w-3.5 text-blue-400" />
                                                    Add to Google Calendar
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-0.5">
                                                    Generic title: "Doctor appointment" (no medical details in Google)
                                                </p>
                                            </div>
                                        </label>
                                    )}

                                    <button className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black italic uppercase tracking-tighter hover:from-blue-500 hover:to-indigo-500 transition-all shadow-2xl shadow-blue-500/20 active:scale-95">
                                        {editingVital ? 'Update Appointment' : 'Confirm Appointment'}
                                    </button>
                                </form>
                            ) : (
                                <form key="manual-form" onSubmit={async (e: any) => {
                                    e.preventDefault()
                                    if (!manualRecordForm.title.trim()) {
                                        toast.error("Record title is required")
                                        return
                                    }
                                    const payload = {
                                        type: "note",
                                        title: manualRecordForm.title.trim(),
                                        category: "Health Records",
                                        item_metadata: {
                                            ...(editingRecord?.item_metadata || {}),
                                            is_health_record: true,
                                            date: manualRecordForm.date || formatForDateTimeInput(new Date()),
                                            doctor: manualRecordForm.doctor || "",
                                            doctor_id: manualRecordForm.doctor_id || null,
                                            notes: manualRecordForm.notes || "",
                                            type: editingRecord?.item_metadata?.type || "Manual Entry"
                                        }
                                    }
                                    try {
                                        if (editingRecord) {
                                            const res = await updateItem(editingRecord.id, payload)
                                            if (res === false) throw new Error("Failed to update medical record")
                                            upsertSharedHealthRecord({ ...editingRecord, ...payload })
                                            toast.success("Medical record updated")
                                        } else {
                                            const created = await addItem(payload)
                                            if (!created) throw new Error("Failed to save medical record")
                                            upsertSharedHealthRecord(created)
                                            toast.success("Medical record saved")
                                        }
                                        setManualRecordForm({
                                            title: "",
                                            doctor: "",
                                            doctor_id: null,
                                            date: formatForDateTimeInput(new Date()),
                                            notes: ""
                                        })
                                        setEditingRecord(null)
                                        setShowAddModal(false)
                                    } catch (err: any) {
                                        toast.error(err?.message || "Failed to save medical record")
                                    }
                                }} className="space-y-6">
                                    <FieldSuggestionInput
                                        name="title"
                                        label="Record Title"
                                        required
                                        value={manualRecordForm.title}
                                        onChange={(val) => setManualRecordForm((prev) => ({ ...prev, title: val }))}
                                        suggestions={healthSuggestions.reasons}
                                        placeholder="e.g. Annual Cardiovascular Screening"
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <DoctorCombobox
                                            label="Doctor / Provider"
                                            value={manualRecordForm.doctor}
                                            doctorId={manualRecordForm.doctor_id}
                                            doctors={savedDoctors}
                                            placeholder="Select doctor or type name..."
                                            onSelectDoctor={(doc) =>
                                                setManualRecordForm((prev) => ({
                                                    ...prev,
                                                    doctor: doc.name,
                                                    doctor_id: doc.id,
                                                }))
                                            }
                                            onClear={() =>
                                                setManualRecordForm((prev) => ({ ...prev, doctor: "", doctor_id: null }))
                                            }
                                        />
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Record Date</label>
                                            <input
                                                type="datetime-local"
                                                name="date"
                                                required
                                                value={manualRecordForm.date}
                                                onChange={(e) => setManualRecordForm((prev) => ({ ...prev, date: e.target.value }))}
                                                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-blue-500/50 transition-all font-bold"
                                                style={{ colorScheme: 'dark' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Diagnostic Summarization</label>
                                        <textarea
                                            name="notes"
                                            value={manualRecordForm.notes}
                                            onChange={(e) => setManualRecordForm((prev) => ({ ...prev, notes: e.target.value }))}
                                            placeholder="Summarize findings, outcomes, and next steps..."
                                            className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 outline-none focus:border-blue-500/50 transition-all h-32 text-sm"
                                        />
                                    </div>

                                    <button className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black italic uppercase tracking-tighter hover:from-blue-500 hover:to-indigo-500 transition-all shadow-2xl shadow-blue-500/20 active:scale-95">
                                        {editingRecord ? 'Update Record' : 'Securely Store Record'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {
                    lightboxOpen && (
                        <Lightbox
                            items={lightboxItems}
                            currentIndex={lightboxIndex}
                            onClose={() => setLightboxOpen(false)}
                            onNext={() => setLightboxIndex((prev) => (prev + 1) % lightboxItems.length)}
                            onPrev={() => setLightboxIndex((prev) => (prev - 1 + lightboxItems.length) % lightboxItems.length)}
                            onSelect={() => {}}
                        />
                    )}
            </div>
        </div>
    )
}

// Separate component for CheckinTab to avoid Hook order issues
function CheckinTab({ records, addItem, updateItem, theme, setActiveTab }: { records: any[], addItem: (item: any) => Promise<any>, updateItem: (id: string, updates: any) => Promise<any>, theme: string, setActiveTab: (tab: any) => void }) {
    const [mood, setMood] = useState('😊')
    const [energy, setEnergy] = useState(5)
    const [capacity, setCapacity] = useState('Medium')
    const [notes, setNotes] = useState('')
    const [editingCheckin, setEditingCheckin] = useState<any>(null)

    const checkinHistory = records.filter(r => r.type === "health-checkin")
        .sort((a, b) => new Date(a.item_metadata?.date || 0).getTime() - new Date(b.item_metadata?.date || 0).getTime())

    const openEditCheckin = (log: any) => {
        setEditingCheckin(log)
        setMood(log.item_metadata?.mood || '😊')
        setEnergy(log.item_metadata?.energy ?? 5)
        setCapacity(log.item_metadata?.capacity || 'Medium')
        setNotes(log.item_metadata?.notes || '')
    }

    const handleSubmitCheckin = async (e: any) => {
        e.preventDefault()
        try {
            const payload = {
                type: "health-checkin",
                title: `Daily Check-in: ${mood}`,
                category: "Health Diary",
                item_metadata: {
                    ...(editingCheckin?.item_metadata || {}),
                    date: editingCheckin?.item_metadata?.date || new Date().toISOString(),
                    mood,
                    energy,
                    capacity,
                    notes,
                    is_diary: true
                }
            }
            if (editingCheckin) {
                const res = await updateItem(editingCheckin.id, payload)
                if (res === false) throw new Error("Failed to update check-in")
                upsertSharedHealthRecord({ ...editingCheckin, ...payload })
                toast.success("Check-in updated!")
                setEditingCheckin(null)
            } else {
                const created = await addItem(payload)
                if (!created) throw new Error("Failed to save check-in")
                upsertSharedHealthRecord(created)
                toast.success("Check-in logged!")
                setActiveTab('dashboard')
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to save check-in")
        }
    }

    const chartData = checkinHistory.slice(-14).map(c => ({
        date: safeFormat(c.item_metadata.date, 'MMM d'),
        energy: c.item_metadata.energy,
        moodScore: ['😭', '😔', '😐', '😊', '🤩'].indexOf(c.item_metadata.mood) + 1
    }))

    return (
        <div className="space-y-8 animate-in zoom-in-95 duration-500 px-4 md:px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Log Form */}
                <div className={`p-8 rounded-[2.5rem] border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-white/20 shadow-2xl relative overflow-hidden'}`}>
                    {/* Background Deco */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <h2 className="text-3xl font-black italic tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">DAILY VITALITY TUNE-IN</h2>
                    
                    <form onSubmit={handleSubmitCheckin} className="space-y-8 relative z-10">
                        {/* Mood Selection */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Current Mood State</label>
                            <div className="flex justify-between gap-2">
                                {['😭', '😔', '😐', '😊', '🤩'].map(m => (
                                    <button 
                                        key={m} 
                                        type="button" 
                                        onClick={() => setMood(m)}
                                        className={`flex-1 aspect-square rounded-3xl text-3xl flex items-center justify-center transition-all ${mood === m ? 'bg-blue-600 scale-110 shadow-xl shadow-blue-500/30' : 'bg-white/5 hover:bg-white/10 opacity-40 hover:opacity-100 grayscale hover:grayscale-0'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Energy Slider */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Energy Level (1-10)</label>
                                <span className="text-2xl font-black text-white">{energy}</span>
                            </div>
                            <input 
                                type="range" min="1" max="10" value={energy} 
                                onChange={e => setEnergy(parseInt(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                            />
                            <div className="flex justify-between text-[8px] font-black uppercase text-gray-500 opacity-50 px-1">
                                <span>Depleted</span>
                                <span>Peak Performance</span>
                            </div>
                        </div>

                        {/* Capacity Blocks */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Social/Task Capacity</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['Low', 'Medium', 'High'].map(c => (
                                    <button 
                                        key={c} 
                                        type="button" 
                                        onClick={() => setCapacity(c)}
                                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${capacity === c ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Observations */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Internal Dialogue / Notes</label>
                            <textarea 
                                value={notes} 
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Brief summary of mental focus, influences, or environment..."
                                className="w-full h-32 p-5 bg-white/5 border border-white/5 rounded-3xl text-sm italic outline-none focus:border-blue-500/30 transition-all custom-scrollbar"
                            />
                        </div>

                        <div className="flex gap-3">
                            {editingCheckin && (
                                <button
                                    type="button"
                                    onClick={() => { setEditingCheckin(null); setMood('😊'); setEnergy(5); setCapacity('Medium'); setNotes('') }}
                                    className="px-6 py-5 bg-white/10 hover:bg-white/15 text-gray-300 rounded-[2rem] font-black uppercase text-xs"
                                >
                                    Cancel
                                </button>
                            )}
                            <button className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black uppercase italic tracking-tighter shadow-2xl shadow-blue-500/20 active:scale-95 transition-all">
                                {editingCheckin ? "Update Check-in" : "Log Daily Pulse"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Trends */}
                <div className="space-y-6">
                    <div className={`p-8 rounded-[2.5rem] border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-white/20 shadow-2xl'}`}>
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-8">Vitality trends (Last 14 Logs)</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="date" hide />
                                    <YAxis domain={[1, 10]} hide />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#121212', borderRadius: '12px', border: '1px solid #333' }}
                                        itemStyle={{ fontSize: '12px' }}
                                    />
                                    <Line type="monotone" dataKey="energy" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <Activity className="h-4 w-4 text-blue-500" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Energy Volatility Tracking</span>
                        </div>
                    </div>

                    {/* Recent History */}
                    <div className={`p-8 rounded-[2.5rem] border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-black border-white/20 shadow-2xl overflow-hidden'}`}>
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6">Recent Check-ins</h3>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {checkinHistory.slice(-5).reverse().map((log: any) => (
                                <div key={log.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10">
                                    <div className="text-2xl">{log.item_metadata.mood}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span
                                                onClick={() => openEditCheckin(log)}
                                                className="text-xs font-bold text-white cursor-pointer hover:text-blue-400 transition-colors"
                                                title="Tap to edit check-in"
                                            >
                                                {safeFormat(log.item_metadata.date, 'MMM d, p')}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Idx: {log.item_metadata.energy}/10</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 italic truncate w-48">{log.item_metadata.notes || 'No notes'}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => openEditCheckin(log)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 shrink-0"
                                        title="Edit check-in"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
