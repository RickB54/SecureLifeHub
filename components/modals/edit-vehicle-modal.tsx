"use client"

import { useState, useEffect } from "react"
import { X, Car, Upload, FileText, Calendar, DollarSign, Shield } from "lucide-react"

interface EditVehicleModalProps {
    onClose: () => void
    onSave: (id: string, updates: any) => Promise<void>
    vehicle: any
    theme: string
}

export default function EditVehicleModal({ onClose, onSave, vehicle, theme }: EditVehicleModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [metadata, setMetadata] = useState<any>(vehicle.item_metadata || {})

    // Local state for file names (visual feedback)
    const [photoName, setPhotoName] = useState("")
    const [regDocName, setRegDocName] = useState("")
    const [exciseDocName, setExciseDocName] = useState("")

    useEffect(() => {
        // Initialize state from vehicle if needed
        setMetadata(vehicle.item_metadata || {})
    }, [vehicle])

    // Helper to handle file reading and updating metadata directly
    const handleFileChange = (e: any, key: string, nameSetter: (n: string) => void) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5000000) { alert("File too large (< 5MB)"); return }

        nameSetter(file.name)

        const reader = new FileReader()
        reader.onloadend = () => {
            setMetadata((prev: any) => ({
                ...prev,
                [key]: reader.result as string
            }))
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const fd = new FormData(e.target as HTMLFormElement)

            const updates = {
                title: `${fd.get("year")} ${fd.get("make")} ${fd.get("model")}`,
                item_metadata: {
                    ...metadata,
                    year: fd.get("year"),
                    make: fd.get("make"),
                    model: fd.get("model"),
                    vin: fd.get("vin"),
                    plate: fd.get("plate"),
                    // Insurance
                    insuranceProvider: fd.get("insuranceProvider"),
                    policyNumber: fd.get("policyNumber"),
                    insuranceContact: fd.get("insuranceContact"),
                    // Registration & Excise
                    regExpiryDate: fd.get("regExpiryDate"),
                    exciseDueDate: fd.get("exciseDueDate"),
                    exciseAmount: fd.get("exciseAmount"),
                    // Additional Info
                    customField1: fd.get("customField1"),
                    customValue1: fd.get("customValue1"),
                    customField2: fd.get("customField2"),
                    customValue2: fd.get("customValue2"),
                }
            }

            await onSave(vehicle.id, updates)
            onClose()
        } catch (error) {
            console.error("Failed to update vehicle", error)
            alert("Failed to save changes")
        } finally {
            setIsLoading(false)
        }
    }

    const inputClass = `w-full px-4 py-3 rounded-xl mt-1 outline-none ${theme === 'light' ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-black/30 text-white border-white/10'} border focus:border-orange-500 transition-colors`
    const labelClass = "text-xs uppercase font-bold opacity-50 ml-1"

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'} w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col`}>

                <div className={`p-6 border-b ${theme === 'light' ? 'border-gray-100' : 'border-white/5'} flex justify-between items-center sticky top-0 bg-inherit z-10`}>
                    <h2 className={`text-xl font-bold flex items-center gap-3 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                        <Car className="h-6 w-6 text-orange-500" />
                        Edit Vehicle
                    </h2>
                    <button onClick={onClose} className={`p-2 rounded-full hover:bg-gray-500/10 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">

                    {/* Basic Info */}
                    <section>
                        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Vehicle Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Year</label>
                                <input name="year" defaultValue={metadata.year} required className={inputClass} placeholder="YYYY" />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Make</label>
                                <input name="make" defaultValue={metadata.make} required className={inputClass} placeholder="Make (e.g. Toyota)" />
                            </div>
                            <div className="md:col-span-3">
                                <label className={labelClass}>Model</label>
                                <input name="model" defaultValue={metadata.model} required className={inputClass} placeholder="Model (e.g. Camry XLE)" />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>VIN Number</label>
                                <input name="vin" defaultValue={metadata.vin} className={`${inputClass} font-mono`} placeholder="VIN" />
                            </div>
                            <div>
                                <label className={labelClass}>License Plate</label>
                                <input name="plate" defaultValue={metadata.plate} className={inputClass} placeholder="PLATE #" />
                            </div>
                        </div>
                    </section>

                    {/* Registration & Excise */}
                    <section className={`p-5 rounded-2xl ${theme === 'light' ? 'bg-orange-50/50 border border-orange-100' : 'bg-orange-900/10 border border-orange-500/10'}`}>
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-orange-600 flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Registration & Tax
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Registration */}
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Registration Expiry</label>
                                    <input type="date" name="regExpiryDate" defaultValue={metadata.regExpiryDate} className={inputClass} style={{ colorScheme: theme }} />
                                </div>
                                <div>
                                    <label className={`${labelClass} block mb-1`}>Upload Registration Doc</label>
                                    <label className={`flex items-center gap-3 p-3 rounded-xl border-dashed border-2 cursor-pointer transition-all hover:bg-orange-500/5 ${theme === 'light' ? 'border-orange-200 bg-white' : 'border-orange-500/30 bg-black/20'}`}>
                                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                                            <Upload className="h-4 w-4" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <span className="text-sm font-medium block truncate max-w-[150px]">
                                                {regDocName || (metadata.regDocUrl ? "Update File" : "Upload Scan")}
                                            </span>
                                            {metadata.regDocUrl && <span className="text-xs text-green-500">File attached</span>}
                                        </div>
                                        <input type="file" onChange={(e) => handleFileChange(e, 'regDocUrl', setRegDocName)} className="hidden" accept="image/*,.pdf" />
                                    </label>
                                </div>
                            </div>

                            {/* Excise */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Excise Due</label>
                                        <input type="date" name="exciseDueDate" defaultValue={metadata.exciseDueDate} className={inputClass} style={{ colorScheme: theme }} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Amount ($)</label>
                                        <input name="exciseAmount" defaultValue={metadata.exciseAmount} className={inputClass} placeholder="0.00" />
                                    </div>
                                </div>
                                <div>
                                    <label className={`${labelClass} block mb-1`}>Upload Tax Bill</label>
                                    <label className={`flex items-center gap-3 p-3 rounded-xl border-dashed border-2 cursor-pointer transition-all hover:bg-orange-500/5 ${theme === 'light' ? 'border-orange-200 bg-white' : 'border-orange-500/30 bg-black/20'}`}>
                                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                                            <Upload className="h-4 w-4" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <span className="text-sm font-medium block truncate max-w-[150px]">
                                                {exciseDocName || (metadata.exciseDocUrl ? "Update File" : "Upload Bill")}
                                            </span>
                                            {metadata.exciseDocUrl && <span className="text-xs text-green-500">File attached</span>}
                                        </div>
                                        <input type="file" onChange={(e) => handleFileChange(e, 'exciseDocUrl', setExciseDocName)} className="hidden" accept="image/*,.pdf" />
                                    </label>
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* Insurance */}
                    <section className={`p-5 rounded-2xl ${theme === 'light' ? 'bg-blue-50/50 border border-blue-100' : 'bg-blue-900/10 border border-blue-500/10'}`}>
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-blue-600 flex items-center gap-2">
                            <Shield className="h-4 w-4" /> Insurance Info
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Insurance Provider</label>
                                <input name="insuranceProvider" defaultValue={metadata.insuranceProvider} className={inputClass} placeholder="e.g. Geico, Progressive" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Policy Number</label>
                                    <input name="policyNumber" defaultValue={metadata.policyNumber} className={inputClass} placeholder="Policy #" />
                                </div>
                                <div>
                                    <label className={labelClass}>Contact Phone</label>
                                    <input name="insuranceContact" defaultValue={metadata.insuranceContact} className={inputClass} placeholder="Support Line" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Custom Fields (Simple Prototype) */}
                    <section>
                        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Custom Fields
                        </h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input name="customField1" defaultValue={metadata.customField1} className={inputClass} placeholder="Label (e.g. Color)" />
                                <input name="customValue1" defaultValue={metadata.customValue1} className={inputClass} placeholder="Value (e.g. Black)" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input name="customField2" defaultValue={metadata.customField2} className={inputClass} placeholder="Label (e.g. Tire Size)" />
                                <input name="customValue2" defaultValue={metadata.customValue2} className={inputClass} placeholder="Value (e.g. R19)" />
                            </div>
                            <p className="text-xs opacity-50 italic">Add custom details here.</p>
                        </div>
                    </section>

                    {/* Photo Update */}
                    <section>
                        <label className={labelClass}>Update Vehicle Photo</label>
                        <input type="file" onChange={(e) => handleFileChange(e, 'photoUrl', setPhotoName)} accept="image/*" className={`${inputClass} p-2 text-sm`} />
                        {photoName && <p className="text-xs text-green-500 mt-1">Ready to upload: {photoName}</p>}
                    </section>

                    <div className="flex gap-4 pt-4 border-t border-gray-500/10">
                        <button type="button" onClick={onClose} className={`flex-1 py-4 rounded-xl font-bold ${theme === 'light' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold shadow-xl shadow-orange-500/20 disabled:opacity-50">
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
