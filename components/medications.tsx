"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Plus, Edit, Trash, Download, Search, Bell, Calendar as CalendarIcon, Clock, Activity, Pill, AlertCircle, Check, X, MessageSquare, Send, ChevronLeft, ChevronRight, Sparkles, Circle, Droplets, Square, Hexagon, Package, Loader2, FileText } from "lucide-react"
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, startOfDay, endOfDay, eachHourOfInterval, addWeeks, subWeeks, addMonths, subMonths } from "date-fns"

// Pill shapes and their icon components
const PILL_SHAPES = [
    { id: 'round', label: 'Round Pill', icon: Circle },
    { id: 'capsule', label: 'Capsule', icon: Pill },
    { id: 'oblong', label: 'Oblong Tablet', icon: Square },
    { id: 'liquid', label: 'Liquid', icon: Droplets },
    { id: 'spray', label: 'Spray', icon: Droplets },
    { id: 'inhaler', label: 'Inhaler', icon: Package },
]

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
}

export default function Medications({ records, addItem, updateItem, deleteItem, theme }: MedicationsProps) {
    const { user } = useAuth()
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
    const [loadingDrugInfo, setLoadingDrugInfo] = useState(false)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<"list" | "timeline">("list")
    const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("day")

    // AI Drug Lookup Function
    const handleDrugLookup = async (medName: string) => {
        setShowDrugInfo(true)
        setLoadingDrugInfo(true)
        setDrugInfo(null)

        try {
            // In a real app, this would call an AI API or drug database
            // For now, we'll create comprehensive mock data based on the drug name
            await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call

            const mockInfo = {
                name: medName,
                genericName: medName === "Aspirin" ? "Acetylsalicylic acid" : medName.toLowerCase(),
                brandNames: medName === "Lisinopril" ? ["Prinivil", "Zestril"] : ["Various"],
                drugClass: medName.includes("statin") ? "Statin" : medName === "Lisinopril" ? "ACE Inhibitor" : "Analgesic",
                uses: [
                    `Treatment of ${medName === "Lisinopril" ? "high blood pressure (hypertension)" : "pain and inflammation"}`,
                    medName === "Aspirin" ? "Prevention of heart attacks and strokes" : "Management of chronic conditions",
                    "Consult your doctor for specific indications"
                ],
                dosage: "As prescribed by your healthcare provider",
                sideEffects: {
                    common: ["Headache", "Dizziness", "Nausea", "Fatigue"],
                    serious: ["Severe allergic reaction", "Liver problems", "Kidney issues", "Severe stomach pain"]
                },
                interactions: [
                    "NSAIDs (ibuprofen, naproxen)",
                    "Blood thinners (warfarin)",
                    "Other blood pressure medications",
                    "Alcohol"
                ],
                warnings: [
                    "Do not stop taking this medication without consulting your doctor",
                    "Inform your doctor of all medications you are taking",
                    "May cause dizziness - do not drive until you know how this affects you",
                    "Store at room temperature away from moisture and heat"
                ],
                pregnancy: "Consult your doctor - Category C/D",
                mechanism: `${medName} works by affecting certain pathways in the body to provide therapeutic effects.`
            }

            setDrugInfo(mockInfo)
        } catch (error) {
            console.error("Drug lookup error:", error)
            setDrugInfo({ error: "Failed to fetch drug information" })
        } finally {
            setLoadingDrugInfo(false)
        }
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

                    // Play Sound
                    try {
                        const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg")
                        audio.play()
                    } catch (e) { console.error("Audio play failed", e) }
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
        if (!med.item_metadata?.nextDose) return false
        const nextDose = new Date(med.item_metadata.nextDose)
        const today = new Date()
        return isSameDay(nextDose, today)
    })

    const handleAddMed = async (formData: any) => {
        await addItem({
            type: "note", // Changed from "medication" to comply with database constraint
            category: "Medications",
            title: formData.name,
            item_metadata: {
                dosage: formData.dosage,
                frequency: formData.frequency,
                prescribedBy: formData.prescribedBy,
                purpose: formData.purpose,
                sideEffects: formData.sideEffects,
                interactions: formData.interactions,
                rxInstructions: formData.rxInstructions,
                refillDate: formData.refillDate,
                nextDose: formData.nextDose,
                pillShape: formData.pillShape,
                pillColor: formData.pillColor,
                quantity: formData.quantity,
                totalQuantity: formData.totalQuantity,
                reminders: (formData.reminders || []).filter((r: any) => r && typeof r === 'string' && r.trim() !== ""),
                takenLog: [],
                skippedLog: [],
                notes: formData.notes,
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            }
        })
        setShowAddModal(false)
    }

    const handleEditMed = async (formData: any) => {
        if (!selectedMed) return
        await updateItem(selectedMed.id, {
            title: formData.name,
            item_metadata: {
                ...selectedMed.item_metadata,
                dosage: formData.dosage,
                frequency: formData.frequency,
                prescribedBy: formData.prescribedBy,
                purpose: formData.purpose,
                sideEffects: formData.sideEffects,
                interactions: formData.interactions,
                rxInstructions: formData.rxInstructions,
                refillDate: formData.refillDate,
                nextDose: formData.nextDose,
                pillShape: formData.pillShape,
                pillColor: formData.pillColor,
                quantity: formData.quantity,
                totalQuantity: formData.totalQuantity,
                notes: formData.notes,
                lastModified: new Date().toISOString()
            }
        })
        setShowEditModal(false)
        setSelectedMed(null)
    }

    const handleTakeMed = async (med: any) => {
        const takenLog = med.item_metadata?.takenLog || []
        const quantity = med.item_metadata?.quantity || 0

        await updateItem(med.id, {
            item_metadata: {
                ...med.item_metadata,
                takenLog: [...takenLog, { timestamp: new Date().toISOString(), dosage: med.item_metadata?.dosage }],
                lastTaken: new Date().toISOString(),
                quantity: Math.max(0, quantity - 1) // Decrease quantity
            }
        })
    }


    const handleSkipMed = async (med: any) => {
        const skippedLog = med.item_metadata?.skippedLog || []

        await updateItem(med.id, {
            item_metadata: {
                ...med.item_metadata,
                skippedLog: [...skippedLog, { timestamp: new Date().toISOString(), reason: "Skipped" }]
            }
        })

        // Visual feedback
        alert(`✓ Skipped ${med.title}`)
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

        await updateItem(selectedMed.id, {
            item_metadata: {
                ...selectedMed.item_metadata,
                nextDose: newDateTime.toISOString()
            }
        })

        setShowRescheduleModal(false)
        alert(`✓ ${selectedMed.title} rescheduled to ${format(newDateTime, 'PPp')}`)
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
        const shapeId = med.item_metadata?.pillShape || 'round'
        const colorHex = med.item_metadata?.pillColor || '#FFFFFF'
        const PillIcon = PILL_SHAPES.find(s => s.id === shapeId)?.icon || Circle

        return (
            <div className="relative" style={{ color: colorHex }}>
                <PillIcon className="h-8 w-8" fill="currentColor" stroke={theme === 'dark' ? '#333' : '#ccc'} strokeWidth={1} />
            </div>
        )
    }

    // Timeline Calendar Rendering
    const renderTimeline = () => {
        if (calendarView === "day") return renderDayView()
        else if (calendarView === "week") return renderWeekView()
        else return renderMonthView()
    }

    const renderDayView = () => {
        const hours = eachHourOfInterval({ start: startOfDay(currentDate), end: endOfDay(currentDate) })

        // 1. Get Taken Logs
        const takenMeds = medRecords.flatMap(med => {
            const takenLog = med.item_metadata?.takenLog || []
            return takenLog.filter((log: any) => isSameDay(new Date(log.timestamp), currentDate))
                .map((log: any) => ({ ...med, eventType: 'taken', eventTime: new Date(log.timestamp) }))
        })

        // 2. Get Scheduled Reminders
        const scheduledMeds = medRecords.flatMap(med => {
            const reminders = med.item_metadata?.reminders || []
            return reminders.map((timeStr: string) => {
                const [h, m] = timeStr.split(':').map(Number)
                const date = new Date(currentDate)
                date.setHours(h, m, 0, 0)
                return { ...med, eventType: 'scheduled', eventTime: date }
            })
        })

        const allEvents = [...takenMeds, ...scheduledMeds]

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
                <div className="space-y-2">
                    {hours.map((hour, i) => {
                        const hourEvents = allEvents.filter(e => e.eventTime.getHours() === hour.getHours())
                        return (
                            <div key={i} className="flex gap-4 border-b border-white/5 pb-2 min-h-[50px]">
                                <div className="w-20 text-sm text-gray-400 pt-1 font-mono">{format(hour, 'h:mm a')}</div>
                                <div className="flex-1 space-y-2">
                                    {hourEvents.map((med, idx) => (
                                        <div key={idx} className={`p-3 rounded-lg border flex items-center gap-3 ${med.eventType === 'taken' ? 'bg-green-500/10 border-green-500/20' : 'bg-purple-500/10 border-purple-500/20'}`}>
                                            {getPillIcon(med)}
                                            <div className="flex-1">
                                                <div className="font-bold flex items-center gap-2">
                                                    {med.title}
                                                    {med.eventType === 'taken' ? (
                                                        <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Taken</span>
                                                    ) : (
                                                        <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Scheduled</span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-400">{med.item_metadata?.dosage}</div>
                                                {med.eventType === 'scheduled' && med.item_metadata?.rxInstructions && (
                                                    <div className="text-xs text-gray-500 italic mt-1">{med.item_metadata.rxInstructions}</div>
                                                )}
                                            </div>
                                            <span className={`ml-auto text-xs font-mono font-bold ${med.eventType === 'taken' ? 'text-green-400' : 'text-purple-400'}`}>
                                                {format(med.eventTime, 'h:mm a')}
                                            </span>
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

    const renderWeekView = () => {
        const weekDays = eachDayOfInterval({ start: startOfWeek(currentDate), end: endOfWeek(currentDate) })

        return (
            <div className="bg-[#1e1e1e] rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Week of {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d')}</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-2 hover:bg-white/10 rounded-lg"><ChevronLeft className="h-5 w-5" /></button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm">This Week</button>
                        <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-2 hover:bg-white/10 rounded-lg"><ChevronRight className="h-5 w-5" /></button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day, i) => {
                        const dayMeds = medRecords.flatMap(med => (med.item_metadata?.takenLog || [])
                            .filter((log: any) => isSameDay(new Date(log.timestamp), day))
                            .map((log: any) => ({ ...med, takenTime: new Date(log.timestamp) })))
                        const isToday = isSameDay(day, new Date())
                        return (
                            <div key={i} className={`p-4 rounded-xl border ${isToday ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-black/20'} min-h-[200px]`}>
                                <div className={`text-center mb-3 ${isToday ? 'text-purple-400 font-bold' : 'text-gray-400'}`}>
                                    <div className="text-xs uppercase">{format(day, 'EEE')}</div>
                                    <div className="text-2xl font-bold">{format(day, 'd')}</div>
                                </div>
                                <div className="space-y-2">
                                    {dayMeds.slice(0, 5).map((med, idx) => (
                                        <div key={idx} className="text-xs p-2 rounded bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center gap-2">
                                            {getPillIcon(med)}
                                            <div className="truncate flex-1">{med.title}</div>
                                        </div>
                                    ))}
                                    {dayMeds.length > 5 && <div className="text-xs text-center text-gray-500">+{dayMeds.length - 5}</div>}
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
                        <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm">This Month</button>
                        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white/10 rounded-lg"><ChevronRight className="h-5 w-5" /></button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center text-xs font-bold text-gray-500 mb-2 uppercase">{d}</div>)}
                    {calendarDays.map((day, i) => {
                        const dayMeds = medRecords.flatMap(med => (med.item_metadata?.takenLog || [])
                            .filter((log: any) => isSameDay(new Date(log.timestamp), day))
                            .map(() => med))
                        const isToday = isSameDay(day, new Date())
                        const isCurrent = isSameMonth(day, currentDate)
                        return (
                            <div key={i} className={`min-h-[120px] border p-2 rounded-lg ${!isCurrent ? 'opacity-30' : ''} ${isToday ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-black/20'}`}>
                                <div className={`text-right text-xs mb-2 ${isToday ? 'text-purple-400 font-bold' : 'opacity-50'}`}>{format(day, 'd')}</div>
                                <div className="space-y-1">
                                    {dayMeds.slice(0, 3).map((med, idx) => (
                                        <div key={idx} className="text-[10px] p-1 rounded bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center gap-1">
                                            <Check className="h-3 w-3" />
                                            <span className="truncate">{med.title}</span>
                                        </div>
                                    ))}
                                    {dayMeds.length > 3 && <div className="text-[10px] text-center text-gray-500">+{dayMeds.length - 3}</div>}
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
            <div className="p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                            <Pill className="h-8 w-8 text-purple-400" /> Medications & Reminders
                        </h1>
                        <p className="text-gray-400">Track medications, set reminders, and maintain your health</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowMedSummary(true)}
                            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white px-4 py-3 rounded-xl shadow-lg transition-all font-medium flex items-center gap-2"
                        >
                            <FileText className="h-5 w-5" /> Med Summary
                        </button>
                        <button
                            onClick={() => setShowQuickAI(!showQuickAI)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-3 rounded-xl shadow-lg transition-all font-medium flex items-center gap-2"
                        >
                            <Sparkles className="h-5 w-5" /> AI Assistant
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl shadow-lg transition-all font-medium flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" /> Add Med
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30">
                        <div className="text-2xl font-bold text-purple-400">{medRecords.length}</div>
                        <div className="text-xs text-gray-400">Total Meds</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30">
                        <div className="text-2xl font-bold text-pink-400">{upcomingReminders.length}</div>
                        <div className="text-xs text-gray-400">Due Today</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
                        <div className="text-2xl font-bold text-blue-400">{medRecords.filter(m => (m.item_metadata?.quantity || 0) < 10).length}</div>
                        <div className="text-xs text-gray-400">Low Stock</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
                        <div className="text-2xl font-bold text-green-400">{medRecords.reduce((sum, m) => sum + (m.item_metadata?.takenLog?.length || 0), 0)}</div>
                        <div className="text-xs text-gray-400">Doses Taken</div>
                    </div>
                </div>

                {/* Debug Panel - Temporary */}
                <div className="mb-6 p-4 bg-yellow-900/40 border border-yellow-500 rounded-xl font-mono text-xs">
                    <h3 className="text-yellow-400 font-bold mb-2">🔍 DIAGNOSTIC DATA</h3>
                    <div className="grid grid-cols-2 gap-4 text-gray-300">
                        <div>
                            <div>Raw Records: <span className="text-white font-bold">{records.length}</span></div>
                            <div>Filtered Meds: <span className="text-white font-bold">{medRecords.length}</span></div>
                            <div className="mt-2 mb-2 text-cyan-400">User ID: {user?.id || "NOT LOGGED IN"}</div>
                            <div className="text-xs text-gray-500 break-all">DB: {(supabase as any).supabaseUrl}</div>
                            <div className="mt-2 text-yellow-500/80">Filter Criteria:</div>
                            <ul className="list-disc pl-4">
                                <li>Category == "Medications"</li>
                                <li>Type == "medication"</li>
                                <li>Note (Metadata) == "Imported Prescription"</li>
                                <li>Titles: Hydroxyzine, Prednisone, Loratadine, Famotidine</li>
                            </ul>
                            <div className="mt-4">
                                <button
                                    onClick={async () => {
                                        try {
                                            const { data, error } = await supabase.from("vault_items").insert({
                                                user_id: user?.id,
                                                type: "note",
                                                title: "DEBUG_PROBE_" + Date.now(),
                                                category: "Medications",
                                                item_metadata: { notes: "Imported Prescription" }
                                            }).select().single()

                                            if (error) alert("❌ WRITE FAILED:\n" + JSON.stringify(error, null, 2))
                                            else alert("✅ WRITE SUCCESS!\nID: " + data.id + "\n(Refresh page to see if it appears)")
                                        } catch (e: any) {
                                            alert("❌ CRASH: " + e.message)
                                        }
                                    }}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-bold uppercase text-[10px]"
                                >
                                    Force Test Write
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="mb-1 text-white">Raw Item Dump (First 5):</div>
                            {records.slice(0, 5).map((r: any, i: number) => (
                                <div key={i} className="mb-1 border-b border-white/10 pb-1">
                                    [{i}] <span className="text-cyan-400">{r.title}</span> <span className="text-gray-500">({r.category}, {r.type})</span>
                                    <br />
                                    MetaNote: {r.item_metadata?.notes || "N/A"}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Search and Views */}
                <div className="flex gap-4 items-center mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search medications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowPillLibrary(true)} className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-sm font-medium flex items-center gap-2">
                            <Package className="h-4 w-4" /> Pill Library
                        </button>
                        <button onClick={() => setShowMockDrugs(true)} className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl text-sm font-medium flex items-center gap-2">
                            <Activity className="h-4 w-4" /> Import Rx
                        </button>
                    </div>
                    <div className="flex gap-2 bg-[#2a2a2a] rounded-xl p-1">
                        <button onClick={() => setViewMode("list")} className={`px-4 py-2 rounded-lg transition-all ${viewMode === "list" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>List</button>
                        <button onClick={() => setViewMode("timeline")} className={`px-4 py-2 rounded-lg transition-all ${viewMode === "timeline" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>Timeline</button>
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
                    <div className="space-y-4">
                        {filteredMeds.length === 0 ? (
                            <div className="text-center text-gray-500 py-12">
                                <Pill className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                <p>No medications found. Add your first medication to get started.</p>
                            </div>
                        ) : (
                            filteredMeds.map(med => (
                                <div key={med.id} className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                                {getPillIcon(med)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-bold">{med.title}</h3>
                                                    <span className="text-sm text-gray-400">{med.item_metadata?.dosage}</span>
                                                </div>
                                                <div className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                                                    <span>{med.item_metadata?.frequency || "As needed"} • {med.item_metadata?.quantity || 0} pills left</span>
                                                    {(med.item_metadata?.quantity || 0) <= 5 && (
                                                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 flex items-center gap-1 font-bold animate-pulse">
                                                            <AlertCircle className="h-3 w-3" /> LOW STOCK
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Next Scheduled Time */}
                                                {med.item_metadata?.nextDose && (
                                                    <div className="flex items-center gap-2 text-sm text-purple-400 mt-2">
                                                        <Clock className="h-4 w-4" />
                                                        Next: {format(new Date(med.item_metadata.nextDose), 'MMM d, h:mm a')}
                                                    </div>
                                                )}

                                                {/* Status Badges */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    {med.item_metadata?.skippedLog && med.item_metadata.skippedLog.length > 0 && (
                                                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30 flex items-center gap-1">
                                                            <X className="h-3 w-3" /> Skipped {med.item_metadata.skippedLog.length}x
                                                        </span>
                                                    )}
                                                    {med.item_metadata?.takenLog && med.item_metadata.takenLog.length > 0 && (
                                                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 flex items-center gap-1">
                                                            <Check className="h-3 w-3" /> Taken {med.item_metadata.takenLog.length}x
                                                        </span>
                                                    )}
                                                </div>
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
                                            onClick={() => handleSkipMed(med)}
                                            className="flex-1 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <X className="h-5 w-5" /> SKIP
                                        </button>
                                        <button
                                            onClick={() => handleTakeMed(med)}
                                            className="flex-1 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check className="h-5 w-5" /> TAKE
                                        </button>
                                        <button
                                            onClick={() => openRescheduleModal(med)}
                                            className="flex-1 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <Clock className="h-5 w-5" /> RESCHEDULE
                                        </button>
                                    </div>

                                    {/* Additional Actions */}
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                                        <button onClick={() => handleDrugLookup(med.title)} className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400" title="AI Drug Info">
                                            <Sparkles className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => { setSelectedMed(med); setShowEditModal(true) }} className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400" title="Edit">
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => { if (confirm(`Delete ${med.title}?`)) deleteItem(med.id) }} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400" title="Delete">
                                            <Trash className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
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

                        <div className="bg-black/20 rounded-2xl p-6 mb-8 border border-white/5">
                            <h3 className="text-2xl font-bold text-white mb-2">{activeReminder.title}</h3>
                            <div className="text-purple-400 font-medium text-lg">{activeReminder.item_metadata?.dosage}</div>
                            {activeReminder.item_metadata?.rxInstructions && (
                                <div className="text-sm text-gray-500 mt-2 italic">"{activeReminder.item_metadata.rxInstructions}"</div>
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

            {/* Modals */}
            {(showAddModal || showEditModal) && (
                <MedicationModal
                    isOpen={showAddModal || showEditModal}
                    onClose={() => { setShowAddModal(false); setShowEditModal(false); setSelectedMed(null) }}
                    onSave={showAddModal ? handleAddMed : handleEditMed}
                    medication={selectedMed}
                    theme={theme}
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="w-full max-w-4xl bg-[#1e1e1e] border border-white/10 rounded-3xl p-8 shadow-2xl my-8">
                        <div className="flex justify-between items-center mb-6">
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
                                <p className="text-gray-400">Looking up drug information...</p>
                            </div>
                        ) : drugInfo?.error ? (
                            <div className="text-center py-12 text-red-400">
                                {drugInfo.error}
                            </div>
                        ) : drugInfo && (
                            <div className="space-y-6">
                                {/* Drug Header */}
                                <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl p-6 border border-blue-500/20">
                                    <h3 className="text-3xl font-bold text-white mb-2">{drugInfo.name}</h3>
                                    <div className="text-gray-400">
                                        <div><strong>Generic Name:</strong> {drugInfo.genericName}</div>
                                        <div><strong>Drug Class:</strong> {drugInfo.drugClass}</div>
                                        <div><strong>Brand Names:</strong> {drugInfo.brandNames.join(", ")}</div>
                                    </div>
                                </div>

                                {/* Uses */}
                                <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                                    <h4 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
                                        <Check className="h-5 w-5" /> Uses & Indications
                                    </h4>
                                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                                        {drugInfo.uses.map((use: string, idx: number) => (
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
                                    </div>
                                </div>

                                {/* Drug Interactions */}
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

                                {/* Warnings */}
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

                                {/* Pregnancy */}
                                <div className="bg-black/20 rounded-xl p-4 border border-white/5 text-sm text-gray-400">
                                    <strong>Pregnancy & Breastfeeding:</strong> {drugInfo.pregnancy}
                                </div>

                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-sm text-blue-300">
                                    <strong>💡 Disclaimer:</strong> This information is for educational purposes only and is not a substitute for professional medical advice. Always consult your healthcare provider before starting, stopping, or changing any medication.
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowDrugInfo(false)}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}



// Medication Modal with Pill Shape/Color Selection
function MedicationModal({ isOpen, onClose, onSave, medication, theme }: any) {
    const [formData, setFormData] = useState({
        name: medication?.title || "",
        dosage: medication?.item_metadata?.dosage || "",
        frequency: medication?.item_metadata?.frequency || "",
        prescribedBy: medication?.item_metadata?.prescribedBy || "",
        purpose: medication?.item_metadata?.purpose || "",
        sideEffects: medication?.item_metadata?.sideEffects || "",
        interactions: medication?.item_metadata?.interactions || "",
        rxInstructions: medication?.item_metadata?.rxInstructions || "",
        refillDate: medication?.item_metadata?.refillDate || "",
        nextDose: medication?.item_metadata?.nextDose || "",
        pillShape: medication?.item_metadata?.pillShape || "round",
        pillColor: medication?.item_metadata?.pillColor || "#FFFFFF",
        quantity: medication?.item_metadata?.quantity || 0,
        totalQuantity: medication?.item_metadata?.totalQuantity || 0,
        notes: medication?.item_metadata?.notes || "",
        reminders: medication?.item_metadata?.reminders || []
    })

    const [showQRScanner, setShowQRScanner] = useState(false)
    const [scanningQR, setScanningQR] = useState(false)

    const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setScanningQR(true)
        // Simulate QR code processing (in production, this would use a QR scanning library)
        setTimeout(() => {
            // Mock QR data extraction
            const mockData = {
                name: "Lisinopril",
                dosage: "10mg",
                rxInstructions: "Take 1 tablet by mouth once daily",
                prescribedBy: "Dr. Smith",
                quantity: 30,
                totalQuantity: 30
            }
            setFormData({ ...formData, ...mockData })
            setScanningQR(false)
            setShowQRScanner(false)
            alert("QR Code scanned successfully! Fields have been auto-filled.")
        }, 1500)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl my-8 ${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{medication ? 'Edit' : 'Add'} Medication</h2>
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
                        <button
                            type="button"
                            onClick={() => setShowQRScanner(!showQRScanner)}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition-all"
                        >
                            {showQRScanner ? 'Hide Scanner' : 'Open Scanner'}
                        </button>
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

                <form onSubmit={(e) => { e.preventDefault(); onSave(formData) }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Medication Name *</label>
                            <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Dosage *</label>
                            <input required placeholder="e.g., 500mg" value={formData.dosage} onChange={(e) => setFormData({ ...formData, dosage: e.target.value })} className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                    </div>

                    {/* Pill Shape Selection */}
                    <div>
                        <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Pill Shape</label>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {PILL_SHAPES.map(shape => {
                                const Icon = shape.icon
                                return (
                                    <button
                                        key={shape.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, pillShape: shape.id })}
                                        className={`p-4 rounded-xl border-2 transition-all ${formData.pillShape === shape.id ? 'border-purple-500 bg-purple-500/20' : 'border-gray-700 hover:border-gray-600'}`}
                                    >
                                        <Icon className="h-8 w-8 mx-auto mb-2" />
                                        <div className="text-xs text-center">{shape.label}</div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Pill Color Selection */}
                    <div>
                        <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Pill Color</label>
                        <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                            {PILL_COLORS.map(color => (
                                <button
                                    key={color.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, pillColor: color.hex })}
                                    className={`p-3 rounded-xl border-2 transition-all ${formData.pillColor === color.hex ? 'border-purple-500' : 'border-gray-700 hover:border-gray-600'}`}
                                >
                                    <div className="w-8 h-8 rounded-full mx-auto" style={{ backgroundColor: color.hex, border: '2px solid #333' }}></div>
                                    <div className="text-[10px] text-center mt-1">{color.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Current Quantity</label>
                            <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Total Quantity (Bottle)</label>
                            <input type="number" value={formData.totalQuantity} onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) })} className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                    </div>

                    {/* Rest of form fields */}
                    {/* Frequency & Prescriber */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Frequency</label>
                            <input placeholder="e.g., Twice daily" value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })} className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Prescribed By</label>
                            <input placeholder="Dr. Smith" value={formData.prescribedBy} onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })} className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
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
                        <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">Drug Interactions</label>
                        <textarea
                            placeholder="List any known interactions with other medications..."
                            value={formData.interactions}
                            onChange={(e) => setFormData({ ...formData, interactions: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-400 uppercase mb-2 block">RX Label Instructions</label>
                        <textarea
                            placeholder="Prescription label instructions (e.g., 'Take 1 tablet by mouth twice daily with food')..."
                            value={formData.rxInstructions}
                            onChange={(e) => setFormData({ ...formData, rxInstructions: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold transition-all">
                            {medication ? 'Update' : 'Add'} Medication
                        </button>
                        <button type="button" onClick={onClose} className="px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Pill Library Modal - View all available icons
function PillLibraryModal({ isOpen, onClose, theme }: any) {
    const [selectedShape, setSelectedShape] = useState<string | null>(null)
    const [selectedColor, setSelectedColor] = useState<string | null>(null)

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

                {/* Preview */}
                {selectedShape && selectedColor && (
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30">
                        <h3 className="text-lg font-bold mb-4 text-center">Preview</h3>
                        <div className="flex justify-center items-center gap-6">
                            {(() => {
                                const Icon = PILL_SHAPES.find(s => s.id === selectedShape)?.icon || Circle
                                return <Icon className="h-24 w-24" fill={selectedColor} stroke="#333" strokeWidth={1} />
                            })()}
                            <div className="text-center">
                                <div className="text-xl font-bold">{PILL_SHAPES.find(s => s.id === selectedShape)?.label}</div>
                                <div className="text-sm text-gray-400">{PILL_COLORS.find(c => c.hex === selectedColor)?.label}</div>
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
    // Default Presets
    const defaultPrescriptions = [
        { name: "Hydroxyzine", dosage: "25mg", frequency: "As directed", shape: "round", color: "#FFFFFF", quantity: 30, purpose: "Prescribed" },
        { name: "Prednisone", dosage: "10mg", frequency: "As directed", shape: "round", color: "#FFFFFF", quantity: 30, purpose: "Prescribed" },
        { name: "Loratadine", dosage: "10mg", frequency: "As directed", shape: "round", color: "#FFFFFF", quantity: 30, purpose: "Allergy" },
        { name: "Famotidine", dosage: "20mg", frequency: "As directed", shape: "round", color: "#FFFFFF", quantity: 30, purpose: "Stomach" },
    ]

    const [presetList, setPresetList] = useState<any[]>(defaultPrescriptions)
    const [isEditing, setIsEditing] = useState(false)
    const [editIndex, setEditIndex] = useState(-1)

    // Form for Adding/Editing Presets
    const [newRx, setNewRx] = useState({
        name: "", dosage: "", frequency: "As directed", shape: "round", color: "#FFFFFF", quantity: 30, purpose: ""
    })

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('rx_presets')
        if (saved) {
            try {
                setPresetList(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to load presets", e)
            }
        }
    }, [])

    // Save to local storage whenever list changes
    useEffect(() => {
        localStorage.setItem('rx_presets', JSON.stringify(presetList))
    }, [presetList])

    const handleAddPreset = () => {
        if (!newRx.name || !newRx.dosage) {
            alert("Please enter Name and Dosage")
            return
        }

        if (isEditing && editIndex >= 0) {
            const updated = [...presetList]
            updated[editIndex] = newRx
            setPresetList(updated)
            setIsEditing(false)
            setEditIndex(-1)
        } else {
            setPresetList([...presetList, newRx])
        }

        // Reset form
        setNewRx({ name: "", dosage: "", frequency: "As directed", shape: "round", color: "#FFFFFF", quantity: 30, purpose: "" })
    }

    const handleEditPreset = (index: number) => {
        setNewRx(presetList[index])
        setIsEditing(true)
        setEditIndex(index)
    }

    const handleDeletePreset = (index: number) => {
        if (confirm("Remove this prescription from the list?")) {
            const updated = presetList.filter((_, i) => i !== index)
            setPresetList(updated)
        }
    }

    const handleAddMock = async (drug: any) => {
        // Auto-generate reminders based on frequency
        let reminders: string[] = []
        if (drug.frequency.includes("Once daily")) {
            reminders = ["09:00"]
        } else if (drug.frequency.includes("Twice daily")) {
            reminders = ["09:00", "18:00"]
        }

        await onAddMockDrug({
            name: drug.name,
            dosage: drug.dosage,
            frequency: drug.frequency,
            prescribedBy: "Dr. Smith",
            purpose: drug.purpose,
            sideEffects: "",
            refillDate: "",
            nextDose: new Date(Date.now() + 86400000).toISOString(),
            pillShape: drug.shape || "round",
            pillColor: drug.color || "#FFFFFF",
            quantity: drug.quantity,
            totalQuantity: drug.quantity,
            reminders: reminders,
            notes: "Imported Prescription"
        })
    }

    const handleAddAll = async () => {
        for (const drug of presetList) {
            await handleAddMock(drug)
        }
        alert(`✅ Added all ${presetList.length} prescriptions!`)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className={`w-full max-w-5xl rounded-2xl p-6 shadow-2xl my-8 ${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'}`}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Import Prescriptions</h2>
                        <p className="text-sm text-gray-400 mt-1">Manage and import your prescription list</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button>
                </div>

                {/* Manage List Form */}
                <div className="mb-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        {isEditing ? <Edit className="h-4 w-4 text-purple-400" /> : <Plus className="h-4 w-4 text-green-400" />}
                        {isEditing ? 'Edit Prescription Preset' : 'Add New Prescription to List'}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <input placeholder="Name (e.g. Aspirin)" value={newRx.name} onChange={e => setNewRx({ ...newRx, name: e.target.value })} className="px-3 py-2 bg-[#2a2a2a] rounded-lg border border-gray-600 w-full" />
                        <input placeholder="Dosage (e.g. 10mg)" value={newRx.dosage} onChange={e => setNewRx({ ...newRx, dosage: e.target.value })} className="px-3 py-2 bg-[#2a2a2a] rounded-lg border border-gray-600 w-full" />
                        <input placeholder="Frequency" value={newRx.frequency} onChange={e => setNewRx({ ...newRx, frequency: e.target.value })} className="px-3 py-2 bg-[#2a2a2a] rounded-lg border border-gray-600 w-full" />
                        <input placeholder="Purpose" value={newRx.purpose} onChange={e => setNewRx({ ...newRx, purpose: e.target.value })} className="px-3 py-2 bg-[#2a2a2a] rounded-lg border border-gray-600 w-full" />
                    </div>
                    <button onClick={handleAddPreset} className={`w-full py-2 rounded-lg font-bold ${isEditing ? 'bg-purple-600 hover:bg-purple-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        {isEditing ? 'Update Preset' : 'Add to List'}
                    </button>
                    {isEditing && (
                        <button onClick={() => { setIsEditing(false); setEditIndex(-1); setNewRx({ name: "", dosage: "", frequency: "As directed", shape: "round", color: "#FFFFFF", quantity: 30, purpose: "" }) }} className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-white underline">
                            Cancel Edit
                        </button>
                    )}
                </div>

                {/* Add All Button */}
                <button
                    onClick={handleAddAll}
                    className="w-full mb-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="h-5 w-5" /> Import All {presetList.length} Prescriptions To My Timeline
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {presetList.map((drug, idx) => {
                        return (
                            <div key={idx} className="p-4 rounded-xl bg-gradient-to-r from-green-900/10 to-emerald-900/10 border border-green-500/20 hover:border-green-500/40 transition-all group relative">
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditPreset(idx)} className="p-1.5 bg-gray-800 rounded text-blue-400 hover:text-white"><Edit className="h-3 w-3" /></button>
                                    <button onClick={() => handleDeletePreset(idx)} className="p-1.5 bg-gray-800 rounded text-red-400 hover:text-white"><Trash className="h-3 w-3" /></button>
                                </div>

                                <div className="flex items-center gap-4 mb-3">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                                        <Circle className="h-8 w-8" fill={drug.color} stroke="#333" strokeWidth={1} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{drug.name}</h3>
                                        <p className="text-sm text-gray-400">{drug.dosage} • {drug.frequency}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-400 mb-3">
                                    <div><strong>Purpose:</strong> {drug.purpose}</div>
                                    <div><strong>Quantity:</strong> {drug.quantity} pills</div>
                                </div>
                                <button
                                    onClick={async () => {
                                        await handleAddMock(drug)
                                        // No close - allow multiple
                                        alert(`Added ${drug.name}`)
                                    }}
                                    className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold transition-all"
                                >
                                    Import This Med
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

