"use client"

import { useState, useEffect } from "react"
import { Plus, Activity, Heart, Droplets, Utensils, Trash2, Calendar, FileText } from "lucide-react"

interface VitalsProps {
    records: any[]
    addItem: (item: any) => Promise<any>
    updateItem: (id: string, updates: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
}

export default function Vitals({ records, addItem, deleteItem, theme }: VitalsProps) {
    const [vitals, setVitals] = useState<any[]>([])
    const [showAddModal, setShowAddModal] = useState(false)

    // Filter for Vitals
    useEffect(() => {
        const vitalRecords = records.filter(r => r.category === "Vitals" || r.item_metadata?.is_vital)
        setVitals(vitalRecords)
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
            default: return <Heart className="h-5 w-5 text-pink-500" />
        }
    }

    return (
        <div className="space-y-8 p-4">
            {/* Header */}
            <div className={`p-6 rounded-2xl ${headerStyle} ${glassCardStyle}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-500">
                            Vitals & Stats
                        </h1>
                        <p className="text-sm opacity-80 mt-1">Track your Blood Pressure, Oxygen service, and more.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl shadow-md transition-all transform hover:scale-105"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Log Vital
                    </button>
                </div>
            </div>

            {/* Recent Logs List */}
            <div className={`rounded-2xl overflow-hidden ${glassCardStyle}`}>
                <div className="p-6 border-b border-gray-200/10">
                    <h2 className="text-xl font-semibold">Recent Logs</h2>
                </div>
                <div className="divide-y divide-gray-200/10">
                    {vitals.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No vitals recorded. Log one to get started.
                        </div>
                    ) : (
                        vitals.map(vital => (
                            <div key={vital.id} className="p-6 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className={`p-3 rounded-xl mr-4 ${theme === 'light' ? 'bg-red-50' : 'bg-red-900/20'}`}>
                                        {getVitalIcon(vital.title)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{vital.title}</h3>
                                        <div className="text-2xl font-mono text-blue-500 my-1">{vital.item_metadata?.value} <span className="text-sm text-gray-400">{vital.item_metadata?.unit}</span></div>
                                        <div className="flex text-xs opacity-60 gap-3">
                                            <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {vital.item_metadata?.date}</span>
                                            {vital.item_metadata?.notes && <span className="flex items-center"><FileText className="h-3 w-3 mr-1" /> {vital.item_metadata.notes}</span>}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="p-2 rounded-full hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                                    onClick={() => {
                                        if (confirm("Delete this entry?")) deleteItem(vital.id)
                                    }}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

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
                                    <input type="time" name="time" className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100 dark:text-gray-100' : 'bg-black/30 text-white'}`} style={{ colorScheme: theme }} />
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
