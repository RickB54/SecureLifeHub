"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Activity, Heart, Droplets, Utensils, Trash2, Calendar, FileText, ChevronLeft, ChevronRight, Clock, Weight, Thermometer, Edit } from "lucide-react"
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, startOfDay, endOfDay } from "date-fns"

interface VitalsProps {
    records: any[]
    addItem: (item: any) => Promise<any>
    updateItem: (id: string, updates: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
}

export default function Vitals({ records, addItem, deleteItem, theme }: VitalsProps) {
    const [showAddModal, setShowAddModal] = useState(false)
    const [viewMode, setViewMode] = useState<"list" | "timeline">("list")
    const [currentDate, setCurrentDate] = useState(new Date())
    const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("week")

    // Filter for Vitals - use useMemo to re-run when records change
    const vitals = useMemo(() => {
        const vitalRecords = records.filter(r => r.category === "Vitals" || r.item_metadata?.is_vital)
        console.log("🩺 Vitals found:", vitalRecords.length, "out of", records.length, "total records")
        return vitalRecords
    }, [records])

    // UI Styles
    const glassCardStyle = theme === 'light'
        ? "bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg border border-white/20 shadow-lg"
        : "bg-gray-800 bg-opacity-40 backdrop-filter backdrop-blur-lg border border-gray-700/50 shadow-lg"

    const headerStyle = theme === 'light'
        ? "bg-gradient-to-r from-red-400/20 to-pink-400/20"
        : "bg-gradient-to-r from-red-900/40 to-pink-900/40"

    // Helper to get icon by type
    const getVitalIcon = (type: string) => {
        switch (type) {
            case 'Blood Pressure': return <Activity className="h-5 w-5 text-red-500" />
            case 'Blood Oxygen': return <Activity className="h-5 w-5 text-blue-500" />
            case 'Cholesterol': return <Droplets className="h-5 w-5 text-yellow-500" />
            case 'Vitamin': return <Utensils className="h-5 w-5 text-green-500" />
            case 'Weight': return <Weight className="h-5 w-5 text-indigo-500" />
            case 'Glucose': return <Droplets className="h-5 w-5 text-pink-500" />
            case 'Temperature': return <Thermometer className="h-5 w-5 text-orange-500" />
            default: return <Heart className="h-5 w-5 text-pink-500" />
        }
    }

    // Timeline Data Generation
    const getDaysToShow = () => {
        if (calendarView === 'week') {
            const start = startOfWeek(currentDate)
            const end = endOfWeek(currentDate)
            return eachDayOfInterval({ start, end })
        }
        return [currentDate] // Day view
    }

    const days = getDaysToShow()

    return (
        <div className="space-y-8 p-4">
            {/* Header */}
            <div className={`p-6 rounded-2xl ${headerStyle} ${glassCardStyle}`}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-500">
                            Vitals & Stats
                        </h1>
                        <p className="text-sm opacity-80 mt-1">Track your Blood Pressure, Oxygen levels, Heart Rate, Weight, etc.</p>
                    </div>
                    <div className="flex gap-3">
                        {/* View Switcher */}
                        <div className="flex bg-black/20 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode("list")}
                                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${viewMode === "list" ? "bg-red-500 text-white shadow-md" : "hover:text-white text-gray-400"}`}
                            >
                                List
                            </button>
                            <button
                                onClick={() => setViewMode("timeline")}
                                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${viewMode === "timeline" ? "bg-red-500 text-white shadow-md" : "hover:text-white text-gray-400"}`}
                            >
                                Timeline
                            </button>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl shadow-md transition-all transform hover:scale-105"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Log Vital
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === "list" ? (
                /* Existing List View */
                <div className={`rounded-2xl overflow-hidden ${glassCardStyle}`}>
                    <div className="p-6 border-b border-gray-200/10">
                        <h2 className="text-xl font-semibold">Recent Logs</h2>
                    </div>
                    <div className="divide-y divide-gray-200/10">
                        {vitals.length === 0 ? (
                            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                                <Activity className="h-16 w-16 mb-4 opacity-20" />
                                <p>No vitals recorded. Log one to get started.</p>
                            </div>
                        ) : (
                            vitals.sort((a, b) => new Date(b.item_metadata?.date || 0).getTime() - new Date(a.item_metadata?.date || 1).getTime()).map(vital => (
                                <details key={vital.id} className="group p-6 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <summary className="flex items-center justify-between cursor-pointer list-none">
                                        <div className="flex items-center flex-1">
                                            <div className={`p-3 rounded-xl mr-4 ${theme === 'light' ? 'bg-red-50' : 'bg-red-900/20'}`}>
                                                {getVitalIcon(vital.title)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold">{vital.title}</h3>
                                                <div className="text-2xl font-mono text-blue-500 my-1">{vital.item_metadata?.value} <span className="text-sm text-gray-400">{vital.item_metadata?.unit}</span></div>
                                                <div className="flex text-xs opacity-60 gap-3">
                                                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {vital.item_metadata?.date}</span>
                                                    {vital.item_metadata?.time && <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {vital.item_metadata.time}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className="p-2 rounded-full hover:bg-blue-500/10 text-gray-400 hover:text-blue-500 transition-colors"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    // TODO: Add edit modal
                                                    alert(`Edit ${vital.title} (Coming Soon - Use the form to add a new entry for now)`)
                                                }}
                                                title="Edit"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                className="p-2 rounded-full hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    if (confirm("Delete this entry?")) deleteItem(vital.id)
                                                }}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </summary>

                                    {/* Expanded Notes Section */}
                                    <div className="mt-4 pl-16 pr-12 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                                        <div className="mb-3">
                                            <div className="text-xs font-bold text-gray-500 uppercase mb-2">Notes & Comments</div>
                                            {vital.item_metadata?.notes ? (
                                                <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                                                    <FileText className="h-4 w-4 text-gray-500 inline mr-2" />
                                                    <span className="text-sm">{vital.item_metadata.notes}</span>
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-black/10 rounded-xl border border-white/5 text-sm text-gray-500 italic">
                                                    No notes recorded for this entry
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </details>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                /* New Timeline View (Week/Day) */
                <div className="space-y-6">
                    {/* Controls */}
                    <div className="flex justify-between items-center bg-[#1e1e1e] p-4 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold">
                                {calendarView === 'week' ? `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}` : format(currentDate, 'MMMM d, yyyy')}
                            </h2>
                            <div className="flex gap-2">
                                <button onClick={() => calendarView === 'week' ? setCurrentDate(subWeeks(currentDate, 1)) : setCurrentDate(addDays(currentDate, -1))} className="p-1 hover:bg-white/10 rounded-lg"><ChevronLeft className="h-5 w-5" /></button>
                                <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold">Today</button>
                                <button onClick={() => calendarView === 'week' ? setCurrentDate(addWeeks(currentDate, 1)) : setCurrentDate(addDays(currentDate, 1))} className="p-1 hover:bg-white/10 rounded-lg"><ChevronRight className="h-5 w-5" /></button>
                            </div>
                        </div>
                        <div className="flex gap-2 text-sm bg-black/20 p-1 rounded-lg">
                            <button onClick={() => setCalendarView("day")} className={`px-3 py-1 rounded-md transition-all ${calendarView === "day" ? "bg-red-600 text-white shadow" : "text-gray-400 hover:text-white"}`}>Day</button>
                            <button onClick={() => setCalendarView("week")} className={`px-3 py-1 rounded-md transition-all ${calendarView === "week" ? "bg-red-600 text-white shadow" : "text-gray-400 hover:text-white"}`}>Week</button>
                        </div>
                    </div>

                    {/* Days List */}
                    <div className="space-y-4">
                        {days.map((day, i) => {
                            // Filter vitals for this day
                            const dayVitals = vitals.filter(v => {
                                if (!v.item_metadata?.date) return false
                                // Handle date string matching depending on format (usually yyyy-mm-dd from input type='date')
                                // If stored as ISO string/timestamp, parse logic differs. 
                                // Input type="date" returns '2023-01-01', which matches format(day, 'yyyy-MM-dd')
                                return v.item_metadata.date === format(day, 'yyyy-MM-dd')
                            })

                            const isToday = isSameDay(day, new Date())

                            return (
                                <div key={i} className={`rounded-2xl border ${isToday ? 'border-red-500/50 bg-red-900/10' : 'border-white/10 bg-[#1e1e1e]'} overflow-hidden transition-all duration-500`}>
                                    <div className="p-4 flex items-center justify-between border-b border-white/5 bg-black/10">
                                        <div className="flex items-center gap-3">
                                            <div className={`text-2xl font-bold ${isToday ? 'text-red-400' : 'text-gray-400'}`}>{format(day, 'd')}</div>
                                            <div className="uppercase text-xs font-bold tracking-wider text-gray-500">{format(day, 'EEEE')}</div>
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono">
                                            {dayVitals.length} Logs
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        {dayVitals.length === 0 ? (
                                            <div className="text-sm text-gray-600 italic py-2">No data recorded</div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {dayVitals.map(v => (
                                                    <div key={v.id} className="flex items-center bg-black/20 rounded-xl p-3 border border-white/5 hover:border-white/20 transition-all">
                                                        <div className="mr-3">{getVitalIcon(v.title)}</div>
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-200">{v.title}</div>
                                                            <div className="text-lg font-mono text-blue-400 leading-none">{v.item_metadata.value} <span className="text-xs text-gray-500">{v.item_metadata.unit}</span></div>
                                                            {v.item_metadata.time && <div className="text-xs text-gray-500 mt-1 flex items-center"><Clock className="h-3 w-3 mr-1" /> {v.item_metadata.time}</div>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl ${glassCardStyle} border-none`}>
                        <h2 className="text-2xl font-bold mb-4">Log Vitals</h2>
                        <form onSubmit={(e: any) => {
                            e.preventDefault()
                            const fd = new FormData(e.target)
                            const type = fd.get("type")
                            addItem({
                                type: "note",
                                category: "Vitals",
                                title: type,
                                item_metadata: {
                                    is_vital: true,
                                    value: fd.get("value"),
                                    unit: fd.get("unit"),
                                    date: fd.get("date"),
                                    time: fd.get("time"),
                                    notes: fd.get("notes")
                                }
                            })
                            setShowAddModal(false)
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Vital Type</label>
                                <select name="type" className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}>
                                    <option>Blood Pressure</option>
                                    <option>Blood Oxygen</option>
                                    <option>Cholesterol</option>
                                    <option>Vitamin</option>
                                    <option>Weight</option>
                                    <option>Glucose</option>
                                    <option>Temperature</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Value</label>
                                    <input name="value" required className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="e.g. 120/80" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Unit</label>
                                    <input name="unit" className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="e.g. mmHg" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date</label>
                                    <input type="date" name="date" required className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100 dark:text-gray-100' : 'bg-black/30 text-white'}`} style={{ colorScheme: theme }} defaultValue={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Time</label>
                                    <input type="time" name="time" defaultValue={new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100 dark:text-gray-100' : 'bg-black/30 text-white'}`} style={{ colorScheme: theme }} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Notes</label>
                                <textarea name="notes" className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Context (e.g. after running)" />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2 rounded-lg hover:bg-gray-500/20">Cancel</button>
                                <button type="submit" className="px-5 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600">Save Log</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
