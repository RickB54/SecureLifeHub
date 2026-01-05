"use client"

import { useState, useEffect } from "react"
import { Plus, Bell, Clock, Calendar, Pill, Trash2, AlertCircle, AlertTriangle, FileText, ChevronDown, ChevronUp, Check, X, ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react"

interface MedicationsProps {
    records: any[]
    addItem: (item: any) => Promise<any>
    updateItem: (id: string, updates: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
}

export default function Medications({ records, addItem, updateItem, deleteItem, theme }: MedicationsProps) {
    const [meds, setMeds] = useState<any[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [showTakeMedModal, setShowTakeMedModal] = useState(false)
    const [showMedDetailModal, setShowMedDetailModal] = useState(false)
    const [selectedMedForTaking, setSelectedMedForTaking] = useState<any>(null)
    const [selectedMedForDetail, setSelectedMedForDetail] = useState<any>(null)
    const [expandedMed, setExpandedMed] = useState<string | null>(null)
    const [calendarView, setCalendarView] = useState<'daily' | 'weekly' | 'monthly'>('daily')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [medLog, setMedLog] = useState<any[]>([])
    const [loadingAI, setLoadingAI] = useState(false)

    // Filter for meds from Supabase
    useEffect(() => {
        const medicationRecords = records.filter(r => r.category === "Medications" || r.item_metadata?.is_medication)
        setMeds(medicationRecords)

        // Load med log from Supabase
        const logs = records.filter(r => r.category === "MedicationLog")
        setMedLog(logs)
    }, [records])

    // Helper to get color for medication
    const getMedColor = (index: number) => {
        const colors = [
            'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500',
            'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500'
        ]
        return colors[index % colors.length]
    }

    // Parse frequency to get times per day
    const parseFrequency = (frequency: string): string[] => {
        if (!frequency) return ['09:00']

        const lower = frequency.toLowerCase()

        // Common patterns
        if (lower.includes('once') || lower.includes('1x') || lower.includes('daily')) {
            return ['09:00']
        }
        if (lower.includes('twice') || lower.includes('2x') || lower.includes('bid')) {
            return ['09:00', '21:00']
        }
        if (lower.includes('three') || lower.includes('3x') || lower.includes('tid')) {
            return ['08:00', '14:00', '20:00']
        }
        if (lower.includes('four') || lower.includes('4x') || lower.includes('qid')) {
            return ['08:00', '12:00', '16:00', '20:00']
        }

        // Extract times if present (e.g., "8am and 8pm")
        const timeMatches = frequency.match(/(\d{1,2})\s*(am|pm|:)/gi)
        if (timeMatches && timeMatches.length > 0) {
            return timeMatches.map(t => {
                const hour = parseInt(t)
                return `${hour.toString().padStart(2, '0')}:00`
            })
        }

        return ['09:00'] // Default
    }

    // Helper to check if med was taken on a specific date/time
    const wasMedTaken = (medId: string, date: Date, time?: string) => {
        const dateStr = date.toISOString().split('T')[0]
        return medLog.some(log => {
            const logDate = log.item_metadata?.takenDate
            if (!logDate) return false

            const logDateStr = logDate.split('T')[0]
            if (time) {
                const logTime = logDate.split('T')[1]?.substring(0, 5)
                return log.item_metadata?.medicationId === medId &&
                    logDateStr === dateStr &&
                    logTime === time
            }
            return log.item_metadata?.medicationId === medId && logDateStr === dateStr
        })
    }

    // AI-powered drug interactions lookup
    const fetchDrugInteractions = async (medicationName: string) => {
        setLoadingAI(true)
        try {
            // Simulated AI response - In production, integrate with a real drug database API
            await new Promise(resolve => setTimeout(resolve, 1500))

            const commonInteractions: Record<string, string> = {
                'prednisone': 'Avoid NSAIDs (ibuprofen, aspirin) - increased risk of stomach ulcers. Limit alcohol. May interact with blood thinners. Avoid grapefruit juice.',
                'lisinopril': 'Avoid potassium supplements and salt substitutes. May interact with NSAIDs. Monitor for low blood pressure with diuretics.',
                'metformin': 'Avoid excessive alcohol. May interact with contrast dye (inform radiologist). Take with food to reduce stomach upset.',
                'warfarin': 'CRITICAL: Avoid vitamin K-rich foods in large amounts (spinach, kale). No aspirin or NSAIDs. Avoid alcohol. Many drug interactions - consult pharmacist.',
                'levothyroxine': 'Take on empty stomach, 30-60 minutes before breakfast. Avoid calcium, iron supplements, and antacids within 4 hours.',
            }

            const medLower = medicationName.toLowerCase()
            for (const [key, value] of Object.entries(commonInteractions)) {
                if (medLower.includes(key)) {
                    return value
                }
            }

            return 'No major interactions found in database. Always consult your pharmacist or doctor before combining medications.'
        } catch (error) {
            return 'Unable to fetch drug interactions. Please consult your pharmacist.'
        } finally {
            setLoadingAI(false)
        }
    }

    // AI-powered drug instructions
    const generateDrugInstructions = async (medicationName: string, dosage: string, frequency: string) => {
        setLoadingAI(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))

            const times = parseFrequency(frequency)
            const timesText = times.map(t => {
                const hour = parseInt(t.split(':')[0])
                const ampm = hour >= 12 ? 'PM' : 'AM'
                const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
                return `${displayHour}:00 ${ampm}`
            }).join(', ')

            return `Take ${dosage} at ${timesText}. ${times.length > 1 ? 'Space doses evenly throughout the day.' : ''} Take with food if stomach upset occurs. Do not skip doses. Complete the full course as prescribed.`
        } catch (error) {
            return 'Please enter custom instructions from your doctor.'
        } finally {
            setLoadingAI(false)
        }
    }

    // Handle taking medication
    const handleTakeMedication = async (medId: string, dosageTaken: string, timeTaken: string, notes: string) => {
        const takenDateTime = `${currentDate.toISOString().split('T')[0]}T${timeTaken}`

        await addItem({
            type: "note",
            category: "MedicationLog",
            title: `Med Log - ${meds.find(m => m.id === medId)?.title}`,
            item_metadata: {
                medicationId: medId,
                dosageTaken,
                takenDate: takenDateTime,
                notes
            }
        })

        setShowTakeMedModal(false)
        setSelectedMedForTaking(null)
    }

    // Calendar navigation
    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate)
        if (calendarView === 'daily') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
        } else if (calendarView === 'weekly') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        } else {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        }
        setCurrentDate(newDate)
    }

    // Get dates for weekly view
    const getWeekDates = () => {
        const dates = []
        const start = new Date(currentDate)
        start.setDate(start.getDate() - start.getDay())
        for (let i = 0; i < 7; i++) {
            const date = new Date(start)
            date.setDate(start.getDate() + i)
            dates.push(date)
        }
        return dates
    }

    // Get dates for monthly view
    const getMonthDates = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const dates = []

        const startPadding = firstDay.getDay()
        for (let i = startPadding - 1; i >= 0; i--) {
            const date = new Date(year, month, -i)
            dates.push({ date, isCurrentMonth: false })
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            dates.push({ date: new Date(year, month, i), isCurrentMonth: true })
        }

        return dates
    }

    // UI Styles
    const glassCardStyle = theme === 'light'
        ? "bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg border border-white/20 shadow-lg"
        : "bg-gray-800 bg-opacity-40 backdrop-filter backdrop-blur-lg border border-gray-700/50 shadow-lg"

    const headerStyle = theme === 'light'
        ? "bg-gradient-to-r from-blue-400/20 to-teal-400/20"
        : "bg-gradient-to-r from-blue-900/40 to-teal-900/40"

    return (
        <div className="space-y-8 p-4">
            {/* Header */}
            <div className={`p-6 rounded-2xl ${headerStyle} ${glassCardStyle}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-500">
                            Medications & Reminders
                        </h1>
                        <p className="text-sm opacity-80 mt-1">Manage your prescriptions, dosages, and schedules.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl shadow-md transition-all transform hover:scale-105"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Medication
                    </button>
                </div>
            </div>

            {/* Calendar Section */}
            <div className={`rounded-2xl overflow-hidden ${glassCardStyle}`}>
                <div className="p-6 border-b border-gray-200/10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Medication Schedule</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCalendarView('daily')}
                                className={`px-4 py-2 rounded-lg transition-all ${calendarView === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-500/20 hover:bg-gray-500/30'}`}
                            >
                                Daily
                            </button>
                            <button
                                onClick={() => setCalendarView('weekly')}
                                className={`px-4 py-2 rounded-lg transition-all ${calendarView === 'weekly' ? 'bg-purple-500 text-white' : 'bg-gray-500/20 hover:bg-gray-500/30'}`}
                            >
                                Weekly
                            </button>
                            <button
                                onClick={() => setCalendarView('monthly')}
                                className={`px-4 py-2 rounded-lg transition-all ${calendarView === 'monthly' ? 'bg-pink-500 text-white' : 'bg-gray-500/20 hover:bg-gray-500/30'}`}
                            >
                                Monthly
                            </button>
                        </div>
                    </div>

                    {/* Calendar Navigation */}
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => navigateDate('prev')} className="p-2 hover:bg-gray-500/20 rounded-lg">
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <h3 className="text-xl font-semibold">
                            {calendarView === 'daily' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            {calendarView === 'weekly' && `Week of ${getWeekDates()[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                            {calendarView === 'monthly' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button onClick={() => navigateDate('next')} className="p-2 hover:bg-gray-500/20 rounded-lg">
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Daily View with Time Slots */}
                    {calendarView === 'daily' && (
                        <div className="space-y-3">
                            {meds.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No medications scheduled. Add one to get started.</p>
                            ) : (
                                meds.map((med, index) => {
                                    const times = parseFrequency(med.item_metadata?.frequency || '')
                                    const colorClass = getMedColor(index)

                                    return times.map((time, timeIndex) => {
                                        const taken = wasMedTaken(med.id, currentDate, time)
                                        return (
                                            <div
                                                key={`${med.id}-${timeIndex}`}
                                                className={`p-4 rounded-xl cursor-pointer ${taken ? 'bg-green-500/10 border-2 border-green-500/30' : 'bg-gray-500/10 border-2 border-gray-500/30'} transition-all hover:scale-[1.02]`}
                                                onClick={() => {
                                                    setSelectedMedForDetail(med)
                                                    setShowMedDetailModal(true)
                                                }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
                                                        <div>
                                                            <h4 className="font-bold text-lg">{med.title}</h4>
                                                            <p className="text-sm opacity-70">
                                                                {time} • {med.item_metadata?.dosage} • {med.item_metadata?.frequency}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {taken ? (
                                                            <span className="flex items-center text-green-500 font-medium">
                                                                <Check className="h-5 w-5 mr-1" /> Taken
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setSelectedMedForTaking(med)
                                                                    setShowTakeMedModal(true)
                                                                }}
                                                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                                                            >
                                                                <Pill className="h-4 w-4" />
                                                                Take Now
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                })
                            )}
                        </div>
                    )}

                    {/* Weekly View */}
                    {calendarView === 'weekly' && (
                        <div className="grid grid-cols-7 gap-2">
                            {getWeekDates().map((date, dayIndex) => (
                                <div key={dayIndex} className="space-y-2">
                                    <div className="text-center font-semibold text-sm opacity-70">
                                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                        <div className="text-xs">{date.getDate()}</div>
                                    </div>
                                    <div className="space-y-1">
                                        {meds.map((med, index) => {
                                            const taken = wasMedTaken(med.id, date)
                                            const colorClass = getMedColor(index)
                                            return (
                                                <div
                                                    key={med.id}
                                                    className={`p-2 rounded-lg text-xs cursor-pointer ${taken ? 'bg-green-500/20' : 'bg-gray-500/10'} hover:scale-105 transition-all`}
                                                    onClick={() => {
                                                        setSelectedMedForDetail(med)
                                                        setShowMedDetailModal(true)
                                                    }}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${colorClass} mb-1`}></div>
                                                    <div className="truncate font-medium">{med.title}</div>
                                                    {taken && <Check className="h-3 w-3 text-green-500 mt-1" />}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Monthly View */}
                    {calendarView === 'monthly' && (
                        <div>
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-center font-semibold text-sm opacity-70 p-2">{day}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {getMonthDates().map((item, index) => (
                                    <div key={index} className={`min-h-20 p-2 rounded-lg ${item.isCurrentMonth ? 'bg-gray-500/10' : 'bg-gray-500/5 opacity-50'} border border-gray-500/20`}>
                                        <div className="text-xs font-semibold mb-1">{item.date.getDate()}</div>
                                        <div className="space-y-1">
                                            {meds.slice(0, 3).map((med, medIndex) => {
                                                const taken = wasMedTaken(med.id, item.date)
                                                const colorClass = getMedColor(medIndex)
                                                return (
                                                    <div
                                                        key={med.id}
                                                        className={`w-full h-1 rounded-full cursor-pointer ${taken ? colorClass : 'bg-gray-500/30'} hover:h-2 transition-all`}
                                                        onClick={() => {
                                                            setSelectedMedForDetail(med)
                                                            setShowMedDetailModal(true)
                                                        }}
                                                        title={med.title}
                                                    ></div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reminders / Next Dose */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-2xl ${glassCardStyle}`}>
                    <div className="flex items-center mb-4 text-orange-400">
                        <Bell className="h-6 w-6 mr-2" />
                        <h2 className="text-xl font-semibold">Refill Reminders</h2>
                    </div>
                    {meds.filter(m => m.item_metadata?.refillDate).length === 0 ? (
                        <p className="text-gray-500">No refill reminders set.</p>
                    ) : (
                        <div className="space-y-3">
                            {meds.filter(m => m.item_metadata?.refillDate).slice(0, 3).map(med => (
                                <div key={med.id} className="flex justify-between items-center p-3 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors">
                                    <div className="flex items-center">
                                        <Pill className="h-4 w-4 mr-3 text-red-400" />
                                        <div>
                                            <div className="font-medium">{med.title}</div>
                                            <div className="text-xs text-gray-500">Refill by: {med.item_metadata?.refillDate}</div>
                                        </div>
                                    </div>
                                    <button className="text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded-full hover:bg-red-500/20">
                                        Order
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={`p-6 rounded-2xl ${glassCardStyle}`}>
                    <div className="flex items-center mb-4 text-blue-400">
                        <AlertCircle className="h-6 w-6 mr-2" />
                        <h2 className="text-xl font-semibold">Quick Info</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        Always keep your medication list up to date for your doctor visits.
                    </p>
                    <div className="bg-blue-500/10 p-4 rounded-xl text-blue-500 text-sm">
                        Showing {meds.length} active medications.
                    </div>
                </div>
            </div>

            {/* Medication List */}
            <div className={`rounded-2xl overflow-hidden ${glassCardStyle}`}>
                <div className="p-6 border-b border-gray-200/10">
                    <h2 className="text-xl font-semibold">Active Prescriptions</h2>
                </div>
                <div className="divide-y divide-gray-200/10">
                    {meds.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No medications found. Add one to get started.
                        </div>
                    ) : (
                        meds.map(med => (
                            <div key={med.id} className="flex flex-col transition-colors">
                                <div
                                    className="p-6 hover:bg-black/5 dark:hover:bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                                    onClick={() => setExpandedMed(expandedMed === med.id ? null : med.id)}
                                >
                                    <div className="flex items-start">
                                        <div className={`p-3 rounded-xl mr-4 ${theme === 'light' ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-400'}`}>
                                            <Pill className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold flex items-center">
                                                {med.title}
                                                {expandedMed === med.id ? <ChevronUp className="h-4 w-4 ml-2 opacity-50" /> : <ChevronDown className="h-4 w-4 ml-2 opacity-50" />}
                                            </h3>
                                            <div className="text-sm opacity-70 mb-1">{med.item_metadata?.dosage || "No dosage info"}</div>
                                            <div className="flex flex-wrap gap-2 text-xs opacity-60">
                                                <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {med.item_metadata?.frequency || "Frequency not set"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            className="p-2 rounded-full hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm("Delete this medication?")) deleteItem(med.id)
                                            }}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedMed === med.id && (
                                    <div className={`px-6 pb-6 pt-0 ${theme === 'light' ? 'bg-gray-50' : 'bg-black/20'}`}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                                            <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5">
                                                <div className="font-semibold mb-1 flex items-center"><User className="h-3 w-3 mr-1" /> Prescribing Doctor</div>
                                                {med.item_metadata?.doctor || "N/A"}
                                            </div>
                                            <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5">
                                                <div className="font-semibold mb-1 flex items-center"><Calendar className="h-3 w-3 mr-1" /> Start Date</div>
                                                {med.item_metadata?.startDate || "N/A"}
                                            </div>
                                            <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5 col-span-full">
                                                <div className="font-semibold mb-1 flex items-center text-orange-400"><AlertTriangle className="h-3 w-3 mr-1" /> Drug Interactions</div>
                                                <div className="max-h-32 overflow-y-auto">
                                                    {med.item_metadata?.interactions || "None listed."}
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5 col-span-full">
                                                <div className="font-semibold mb-1 flex items-center"><Pill className="h-3 w-3 mr-1" /> Drug Instructions</div>
                                                <div className="max-h-32 overflow-y-auto">
                                                    {med.item_metadata?.drugInstructions || "No instructions."}
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-lg bg-black/5 dark:bg-white/5 col-span-full">
                                                <div className="font-semibold mb-1 flex items-center"><FileText className="h-3 w-3 mr-1" /> Notes</div>
                                                {med.item_metadata?.notes || "No notes."}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Medication Modal */}
            {showAddModal && (
                <AddMedicationModal
                    onClose={() => setShowAddModal(false)}
                    onSave={addItem}
                    theme={theme}
                    glassCardStyle={glassCardStyle}
                    fetchDrugInteractions={fetchDrugInteractions}
                    generateDrugInstructions={generateDrugInstructions}
                    loadingAI={loadingAI}
                />
            )}

            {/* Take Medication Modal */}
            {showTakeMedModal && selectedMedForTaking && (
                <TakeMedicationModal
                    medication={selectedMedForTaking}
                    onClose={() => setShowTakeMedModal(false)}
                    onSave={handleTakeMedication}
                    theme={theme}
                    glassCardStyle={glassCardStyle}
                />
            )}

            {/* Medication Detail Modal */}
            {showMedDetailModal && selectedMedForDetail && (
                <MedicationDetailModal
                    medication={selectedMedForDetail}
                    onClose={() => setShowMedDetailModal(false)}
                    updateItem={updateItem}
                    theme={theme}
                    glassCardStyle={glassCardStyle}
                    fetchDrugInteractions={fetchDrugInteractions}
                    generateDrugInstructions={generateDrugInstructions}
                    loadingAI={loadingAI}
                />
            )}
        </div>
    )
}

// Add Medication Modal Component
function AddMedicationModal({ onClose, onSave, theme, glassCardStyle, fetchDrugInteractions, generateDrugInstructions, loadingAI }: any) {
    const [medName, setMedName] = useState('')
    const [dosage, setDosage] = useState('')
    const [frequency, setFrequency] = useState('')
    const [interactions, setInteractions] = useState('')
    const [drugInstructions, setDrugInstructions] = useState('')

    const handleAIInteractions = async () => {
        if (!medName) {
            alert('Please enter medication name first')
            return
        }
        const result = await fetchDrugInteractions(medName)
        setInteractions(result)
    }

    const handleAIInstructions = async () => {
        if (!medName || !dosage || !frequency) {
            alert('Please enter medication name, dosage, and frequency first')
            return
        }
        const result = await generateDrugInstructions(medName, dosage, frequency)
        setDrugInstructions(result)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className={`w-full max-w-3xl rounded-2xl p-6 shadow-2xl ${glassCardStyle} border-none my-8`}>
                <h2 className="text-2xl font-bold mb-4">Add Medication</h2>
                <form onSubmit={(e: any) => {
                    e.preventDefault()
                    const fd = new FormData(e.target)
                    onSave({
                        type: "note",
                        category: "Medications",
                        title: fd.get("name"),
                        item_metadata: {
                            is_medication: true,
                            dosage: fd.get("dosage"),
                            frequency: fd.get("frequency"),
                            doctor: fd.get("doctor"),
                            refillDate: fd.get("refillDate"),
                            startDate: fd.get("startDate"),
                            interactions: fd.get("interactions"),
                            drugInstructions: fd.get("drugInstructions"),
                            notes: fd.get("notes")
                        }
                    })
                    onClose()
                }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Medication Name</label>
                            <input
                                name="name"
                                required
                                value={medName}
                                onChange={(e) => setMedName(e.target.value)}
                                className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}
                                placeholder="e.g. Lisinopril"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Prescribing Doctor</label>
                            <input name="doctor" className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Dr. Smith" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Dosage</label>
                            <input
                                name="dosage"
                                value={dosage}
                                onChange={(e) => setDosage(e.target.value)}
                                className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}
                                placeholder="e.g. 10mg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Frequency / When to take</label>
                            <input
                                name="frequency"
                                value={frequency}
                                onChange={(e) => setFrequency(e.target.value)}
                                className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}
                                placeholder="e.g. Twice daily, 8am and 8pm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <input type="date" name="startDate" className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} style={{ colorScheme: theme }} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Refill Reminder Date</label>
                            <input type="date" name="refillDate" className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} style={{ colorScheme: theme }} />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium">Drug Interactions</label>
                            <button
                                type="button"
                                onClick={handleAIInteractions}
                                disabled={loadingAI}
                                className="flex items-center gap-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-3 py-1 rounded-full transition-colors"
                            >
                                {loadingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                AI Lookup
                            </button>
                        </div>
                        <textarea
                            name="interactions"
                            rows={4}
                            value={interactions}
                            onChange={(e) => setInteractions(e.target.value)}
                            className={`w-full p-3 rounded-lg outline-none resize-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}
                            placeholder="e.g. Avoid grapefruit, ibuprofen. AI will auto-populate based on medication name."
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium">Drug Instructions</label>
                            <button
                                type="button"
                                onClick={handleAIInstructions}
                                disabled={loadingAI}
                                className="flex items-center gap-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded-full transition-colors"
                            >
                                {loadingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                AI Generate
                            </button>
                        </div>
                        <textarea
                            name="drugInstructions"
                            rows={4}
                            value={drugInstructions}
                            onChange={(e) => setDrugInstructions(e.target.value)}
                            className={`w-full p-3 rounded-lg outline-none resize-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}
                            placeholder="e.g. Take 1 tablet at 8am and 8pm with food. AI will generate based on frequency."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Notes / Misc Info</label>
                        <textarea name="notes" rows={3} className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Questions for doctor, side effects, etc." />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg hover:bg-gray-500/20">Cancel</button>
                        <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Save Medication</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Take Medication Modal Component
function TakeMedicationModal({ medication, onClose, onSave, theme, glassCardStyle }: any) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl ${glassCardStyle} border-none`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                        Take Medication
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-500/20 rounded-lg">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30">
                    <div className="flex items-center gap-3 mb-2">
                        <Pill className="h-6 w-6 text-blue-500" />
                        <h3 className="text-xl font-bold">{medication.title}</h3>
                    </div>
                    <p className="text-sm opacity-70">Prescribed Dosage: {medication.item_metadata?.dosage}</p>
                    <p className="text-sm opacity-70">Frequency: {medication.item_metadata?.frequency}</p>
                </div>

                <form onSubmit={(e: any) => {
                    e.preventDefault()
                    const fd = new FormData(e.target)
                    onSave(
                        medication.id,
                        fd.get("dosageTaken") as string,
                        fd.get("timeTaken") as string,
                        fd.get("notes") as string
                    )
                }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Dosage Taken</label>
                        <input
                            name="dosageTaken"
                            required
                            defaultValue={medication.item_metadata?.dosage}
                            className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}
                            placeholder="e.g. 10mg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Time Taken</label>
                        <input
                            type="time"
                            name="timeTaken"
                            required
                            defaultValue={new Date().toTimeString().slice(0, 5)}
                            className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}
                            style={{ colorScheme: theme }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                        <textarea
                            name="notes"
                            rows={3}
                            className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}
                            placeholder="Any side effects or observations..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg hover:bg-gray-500/20">
                            Cancel
                        </button>
                        <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium hover:from-green-600 hover:to-teal-600 flex items-center gap-2">
                            <Check className="h-5 w-5" />
                            Confirm Taken
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Medication Detail/Edit Modal Component
function MedicationDetailModal({ medication, onClose, theme, glassCardStyle, updateItem, fetchDrugInteractions, generateDrugInstructions, loadingAI }: any) {
    const [isEditing, setIsEditing] = useState(false)
    const [medName, setMedName] = useState(medication.title || '')
    const [dosage, setDosage] = useState(medication.item_metadata?.dosage || '')
    const [frequency, setFrequency] = useState(medication.item_metadata?.frequency || '')
    const [doctor, setDoctor] = useState(medication.item_metadata?.doctor || '')
    const [startDate, setStartDate] = useState(medication.item_metadata?.startDate || '')
    const [refillDate, setRefillDate] = useState(medication.item_metadata?.refillDate || '')
    const [interactions, setInteractions] = useState(medication.item_metadata?.interactions || '')
    const [drugInstructions, setDrugInstructions] = useState(medication.item_metadata?.drugInstructions || '')
    const [notes, setNotes] = useState(medication.item_metadata?.notes || '')

    const handleAIInteractions = async () => {
        if (!medName) {
            alert('Please enter medication name first')
            return
        }
        const result = await fetchDrugInteractions(medName)
        setInteractions(result)
    }

    const handleAIInstructions = async () => {
        if (!medName || !dosage || !frequency) {
            alert('Please enter medication name, dosage, and frequency first')
            return
        }
        const result = await generateDrugInstructions(medName, dosage, frequency)
        setDrugInstructions(result)
    }

    const handleSave = async () => {
        await updateItem(medication.id, {
            title: medName,
            item_metadata: {
                ...medication.item_metadata,
                dosage,
                frequency,
                doctor,
                startDate,
                refillDate,
                interactions,
                drugInstructions,
                notes
            }
        })
        setIsEditing(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-3xl rounded-2xl p-6 shadow-2xl ${glassCardStyle} border-none max-h-[90vh] overflow-y-auto`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">{isEditing ? 'Edit Medication' : medication.title}</h2>
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-medium transition-colors"
                            >
                                Edit
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-gray-500/20 rounded-lg">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {!isEditing ? (
                    // Read-only view
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-black/5 dark:bg-white/5">
                                <div className="text-sm font-semibold opacity-70 mb-1">Dosage</div>
                                <div className="text-lg font-bold">{dosage || 'N/A'}</div>
                            </div>
                            <div className="p-4 rounded-lg bg-black/5 dark:bg-white/5">
                                <div className="text-sm font-semibold opacity-70 mb-1">Frequency</div>
                                <div className="text-lg font-bold">{frequency || 'N/A'}</div>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-black/5 dark:bg-white/5">
                            <div className="text-sm font-semibold opacity-70 mb-2">Prescribing Doctor</div>
                            <div>{doctor || 'N/A'}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-black/5 dark:bg-white/5">
                                <div className="text-sm font-semibold opacity-70 mb-1">Start Date</div>
                                <div>{startDate || 'N/A'}</div>
                            </div>
                            <div className="p-4 rounded-lg bg-black/5 dark:bg-white/5">
                                <div className="text-sm font-semibold opacity-70 mb-1">Refill Date</div>
                                <div>{refillDate || 'N/A'}</div>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-orange-500/10 border-2 border-orange-500/30">
                            <div className="text-sm font-semibold text-orange-400 mb-2 flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Drug Interactions
                            </div>
                            <div className="max-h-40 overflow-y-auto text-sm">
                                {interactions || 'None listed.'}
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-blue-500/10 border-2 border-blue-500/30">
                            <div className="text-sm font-semibold text-blue-400 mb-2 flex items-center">
                                <Pill className="h-4 w-4 mr-2" />
                                Drug Instructions
                            </div>
                            <div className="max-h-40 overflow-y-auto text-sm">
                                {drugInstructions || 'No instructions provided.'}
                            </div>
                        </div>

                        {notes && (
                            <div className="p-4 rounded-lg bg-black/5 dark:bg-white/5">
                                <div className="text-sm font-semibold opacity-70 mb-2">Notes</div>
                                <div className="text-sm">{notes}</div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Edit mode
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Medication Name</label>
                                <input
                                    value={medName}
                                    onChange={(e) => setMedName(e.target.value)}
                                    className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}
                                    placeholder="e.g. Lisinopril"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Prescribing Doctor</label>
                                <input
                                    value={doctor}
                                    onChange={(e) => setDoctor(e.target.value)}
                                    className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}
                                    placeholder="Dr. Smith"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Dosage</label>
                                <input
                                    value={dosage}
                                    onChange={(e) => setDosage(e.target.value)}
                                    className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}
                                    placeholder="e.g. 10mg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Frequency / When to take</label>
                                <input
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                    className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}
                                    placeholder="e.g. Twice daily, 8am and 8pm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}
                                    style={{ colorScheme: theme }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Refill Reminder Date</label>
                                <input
                                    type="date"
                                    value={refillDate}
                                    onChange={(e) => setRefillDate(e.target.value)}
                                    className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}
                                    style={{ colorScheme: theme }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium">Drug Interactions</label>
                                <button
                                    type="button"
                                    onClick={handleAIInteractions}
                                    disabled={loadingAI}
                                    className="flex items-center gap-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-3 py-1 rounded-full transition-colors"
                                >
                                    {loadingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                    AI Lookup
                                </button>
                            </div>
                            <textarea
                                rows={4}
                                value={interactions}
                                onChange={(e) => setInteractions(e.target.value)}
                                className={`w-full p-3 rounded-lg outline-none resize-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}
                                placeholder="e.g. Avoid grapefruit, ibuprofen. AI will auto-populate based on medication name."
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium">Drug Instructions</label>
                                <button
                                    type="button"
                                    onClick={handleAIInstructions}
                                    disabled={loadingAI}
                                    className="flex items-center gap-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded-full transition-colors"
                                >
                                    {loadingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                    AI Generate
                                </button>
                            </div>
                            <textarea
                                rows={4}
                                value={drugInstructions}
                                onChange={(e) => setDrugInstructions(e.target.value)}
                                className={`w-full p-3 rounded-lg outline-none resize-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}
                                placeholder="e.g. Take 1 tablet at 8am and 8pm with food. AI will generate based on frequency."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Notes / Misc Info</label>
                            <textarea
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}
                                placeholder="Questions for doctor, side effects, etc."
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-5 py-2 rounded-lg hover:bg-gray-500/20"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
                            >
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button onClick={onClose} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function User({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    )
}

