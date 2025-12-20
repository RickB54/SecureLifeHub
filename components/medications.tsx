"use client"

import { useState, useEffect } from "react"
import { Plus, Bell, Clock, Calendar, Pill, Trash2, AlertCircle, AlertTriangle, FileText, ChevronDown, ChevronUp } from "lucide-react"

interface MedicationsProps {
    records: any[]
    addItem: (item: any) => Promise<any>
    updateItem: (id: string, updates: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
}

export default function Medications({ records, addItem, deleteItem, theme }: MedicationsProps) {
    const [meds, setMeds] = useState<any[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [expandedMed, setExpandedMed] = useState<string | null>(null)

    // Filter for meds
    useEffect(() => {
        const medicationRecords = records.filter(r => r.category === "Medications" || r.item_metadata?.is_medication)
        setMeds(medicationRecords)
    }, [records])

    // UI Styles (Glassmorphism)
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

            {/* Reminders / Next Dose (Mockup Logic for Visuals) */}
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
                                                {med.item_metadata?.interactions || "None listed."}
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

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className={`w-full max-w-2xl rounded-2xl p-6 shadow-2xl ${glassCardStyle} border-none my-8`}>
                        <h2 className="text-2xl font-bold mb-4">Add Medication</h2>
                        <form onSubmit={(e: any) => {
                            e.preventDefault()
                            const fd = new FormData(e.target)
                            addItem({
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
                                    notes: fd.get("notes")
                                }
                            })
                            setShowAddModal(false)
                        }} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Medication Name</label>
                                    <input name="name" required className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="e.g. Lisinopril" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Prescribing Doctor</label>
                                    <input name="doctor" className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Dr. Smith" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Dosage</label>
                                    <input name="dosage" className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="e.g. 10mg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Frequency / When to take</label>
                                    <input name="frequency" className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="e.g. Once daily at breakfast" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Date</label>
                                    <input type="date" name="startDate" className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100 dark:text-gray-100' : 'bg-black/30 text-white'}`} style={{ colorScheme: theme }} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Refill Reminder Date</label>
                                    <input type="date" name="refillDate" className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100 dark:text-gray-100' : 'bg-black/30 text-white'}`} style={{ colorScheme: theme }} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Drug Interactions</label>
                                <input name="interactions" className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="e.g. Avoid grapefruit, ibuprofen" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Notes / Misc Info</label>
                                <textarea name="notes" rows={3} className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Questions for doctor, side effects, etc." />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2 rounded-lg hover:bg-gray-500/20">Cancel</button>
                                <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Save Medication</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}

function User({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    )
}
