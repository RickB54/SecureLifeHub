"use client"

import { useState } from "react"
import { X, Save, Calendar, Clock, User, FileText, MapPin } from "lucide-react"

interface AddHealthRecordModalProps {
    onClose: () => void
    onAdd: (record: any) => Promise<void>
    theme: string
}

export default function AddHealthRecordModal({ onClose, onAdd, theme }: AddHealthRecordModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        doctor: "",
        facility: "",
        date: "", // YYYY-MM-DD
        time: "", // HH:MM
        reason: "",
        notes: "",
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onAdd({
                type: "note", // Use allowed DB type, filter by category/metadata
                title: formData.title || `${formData.reason} with ${formData.doctor}`,
                category: "Health Records",
                notes: formData.notes,
                item_metadata: {
                    is_health_record: true,
                    doctor: formData.doctor,
                    facility: formData.facility,
                    date: formData.date ? (formData.time ? `${formData.date}T${formData.time}:00` : new Date(formData.date).toISOString()) : null,
                    time: formData.time,
                    reason: formData.reason
                }
            })
            onClose()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div
                className={`w-full max-w-2xl rounded-lg shadow-xl overflow-hidden ${theme === "light" ? "bg-white text-gray-900" : "bg-[#1F2937] text-white"
                    }`}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold">New Health Record / Appointment</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Title / Reason */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Annual Checkup"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className={`w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "light" ? "bg-white border-gray-300" : "bg-[#374151] border-gray-600"
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Reason for Visit</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Checkup, Vaccination"
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className={`w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "light" ? "bg-white border-gray-300" : "bg-[#374151] border-gray-600"
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 flex items-center">
                                <Calendar className="h-4 w-4 mr-1" /> Date
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className={`w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "light" ? "bg-white border-gray-300" : "bg-[#374151] border-gray-600"
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 flex items-center">
                                <Clock className="h-4 w-4 mr-1" /> Time
                            </label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className={`w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "light" ? "bg-white border-gray-300" : "bg-[#374151] border-gray-600"
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Doctor & Facility */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 flex items-center">
                                <User className="h-4 w-4 mr-1" /> Doctor / Specialist
                            </label>
                            <input
                                type="text"
                                placeholder="Dr. Smith"
                                value={formData.doctor}
                                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                                className={`w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "light" ? "bg-white border-gray-300" : "bg-[#374151] border-gray-600"
                                    }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 flex items-center">
                                <MapPin className="h-4 w-4 mr-1" /> Facility / Location
                            </label>
                            <input
                                type="text"
                                placeholder="City Hospital"
                                value={formData.facility}
                                onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                                className={`w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "light" ? "bg-white border-gray-300" : "bg-[#374151] border-gray-600"
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea
                            rows={4}
                            placeholder="Results, instructions, prescriptions..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className={`w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "light" ? "bg-white border-gray-300" : "bg-[#374151] border-gray-600"
                                }`}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-md transition-colors ${theme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Record
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
