"use client"

import { useState } from "react"
import { X, Plane, Upload, FileText } from "lucide-react"

interface EditTravelModalProps {
    onClose: () => void
    onSave: (id: string, updates: any) => Promise<void>
    item: any
    theme: string
}

export default function EditTravelModal({ onClose, onSave, item, theme }: EditTravelModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [metadata, setMetadata] = useState<any>(item.item_metadata || {})
    const [fileName, setFileName] = useState("")

    const handleFileChange = (e: any) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5000000) { alert("File too large (< 5MB)"); return }

        setFileName(file.name)
        const reader = new FileReader()
        reader.onloadend = () => {
            setMetadata((prev: any) => ({ ...prev, url: reader.result as string }))
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const fd = new FormData(e.target as HTMLFormElement)

            const updates = {
                title: fd.get("title"),
                item_metadata: {
                    ...metadata, // Keep existing metadata like url if not replaced
                    travelType: fd.get("travelType"),
                    docNumber: fd.get("docNumber"),
                    expiryDate: fd.get("expiryDate"),
                    startDate: fd.get("startDate"),
                    details: fd.get("details"),
                    confirmation: fd.get("confirmation"),
                    // url is handled by state if changed
                }
            }

            await onSave(item.id, updates)
            onClose()
        } catch (error) {
            console.error("Failed to update travel item", error)
            alert("Failed to save changes")
        } finally {
            setIsLoading(false)
        }
    }

    const inputClass = `w-full px-4 py-3 rounded-xl mt-1 outline-none ${theme === 'light' ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-black/30 text-white border-white/10'} border focus:border-sky-500 transition-colors`
    const labelClass = "text-xs uppercase font-bold opacity-50 ml-1"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'} w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col`}>

                <div className={`p-6 border-b ${theme === 'light' ? 'border-gray-100' : 'border-white/5'} flex justify-between items-center sticky top-0 bg-inherit z-10`}>
                    <h2 className={`text-xl font-bold flex items-center gap-3 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                        <Plane className="h-6 w-6 text-sky-500" />
                        Edit Record
                    </h2>
                    <button onClick={onClose} className={`p-2 rounded-full hover:bg-gray-500/10 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className={labelClass}>Type</label>
                            <select name="travelType" defaultValue={metadata.travelType} className={inputClass}>
                                <option value="flight">Flight</option>
                                <option value="hotel">Hotel / Stay</option>
                                <option value="event">Event / Activity</option>
                                <option value="passport">Passport</option>
                                <option value="visa">Visa</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Title / Destination</label>
                        <input name="title" defaultValue={item.title} required className={inputClass} placeholder="e.g. Fight to Paris" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Number / Conf #</label>
                            <input name="docNumber" defaultValue={metadata.docNumber} className={inputClass} placeholder="A12345678" />
                        </div>
                        <div>
                            <label className={labelClass}>Date / Expire</label>
                            <input type="date" name="startDate" defaultValue={metadata.startDate || metadata.expiryDate} className={inputClass} style={{ colorScheme: theme }} />
                            {/* Hidden inputs to map generic date picker to specific fields if needed */}
                            <input type="hidden" name="expiryDate" value={metadata.startDate} />
                            <input type="hidden" name="confirmation" value={metadata.docNumber} />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Notes / Details</label>
                        <textarea name="details" defaultValue={metadata.details} className={inputClass} rows={3} placeholder="Details..." />
                    </div>

                    <div>
                        <label className={labelClass}>Update Attachment</label>
                        <label className={`flex items-center gap-3 p-3 rounded-xl border-dashed border-2 cursor-pointer mt-1 ${theme === 'light' ? 'border-gray-300 bg-gray-50' : 'border-gray-700 bg-black/20'}`}>
                            <Upload className="h-5 w-5 opacity-50" />
                            <span className="text-sm opacity-70 truncate flex-1">
                                {fileName || (metadata.url ? "Replace current file" : "Upload File")}
                            </span>
                            <input type="file" onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
                        </label>
                        {metadata.url && <p className="text-xs text-green-500 mt-2 flex items-center gap-1"><FileText className="h-3 w-3" /> File currently attached</p>}
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-500/10">
                        <button type="button" onClick={onClose} className={`flex-1 py-3 rounded-xl font-medium ${theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-300'}`}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-xl shadow-sky-500/20 disabled:opacity-50">
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
