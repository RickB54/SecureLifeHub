"use client"

import { useState, useEffect } from "react"
import { Plus, Car, Wrench, FileText, Trash2, Shield, Calendar, ChevronDown, ChevronUp, Edit } from "lucide-react"
import EditVehicleModal from "./modals/edit-vehicle-modal"

interface Props {
    records: any[]
    addItem: (item: any) => Promise<any>
    updateItem: (id: string, updates: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
}

export default function Vehicles({ records, addItem, updateItem, deleteItem, theme }: Props) {
    const [vehicles, setVehicles] = useState<any[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    useEffect(() => {
        setVehicles(records.filter(r => r.category === "Vehicles" || r.item_metadata?.is_vehicle))
    }, [records])

    const glassCardStyle = theme === 'light'
        ? "bg-white/80 border border-gray-200 shadow-sm"
        : "bg-white/5 border border-white/10"

    const handleAddService = async (vehicleId: string, form: FormData) => {
        const vehicle = vehicles.find(v => v.id === vehicleId)
        if (!vehicle) return

        const file = form.get("receipt") as File
        const processServiceLog = async (receiptUrl = "") => {
            const newLog = {
                id: crypto.randomUUID(),
                date: form.get("date"),
                service: form.get("service"),
                cost: form.get("cost"),
                mileage: form.get("mileage"),
                receiptUrl
            }

            const currentHistory = vehicle.item_metadata?.serviceHistory || []
            await updateItem(vehicleId, {
                item_metadata: {
                    ...vehicle.item_metadata,
                    serviceHistory: [newLog, ...currentHistory]
                }
            })
        }

        if (file && file.size > 0) {
            if (file.size > 5000000) { alert("File too large (< 5MB)"); return }
            const reader = new FileReader()
            reader.onloadend = () => processServiceLog(reader.result as string)
            reader.readAsDataURL(file)
        } else {
            await processServiceLog()
        }
    }

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50' : 'bg-[#121212]'} text-white overflow-hidden`}>
            {/* Header */}
            <div className="p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500 flex items-center gap-3">
                            <Car className="h-8 w-8 text-orange-500" /> My Garage
                        </h1>
                        <p className="text-gray-400 mt-1">Manage vehicles, maintenance logs, and insurance.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-5 py-2.5 bg-orange-600 hover:bg-orange-500 rounded-xl font-medium transition-all shadow-lg shadow-orange-500/20"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Vehicle
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
                {vehicles.length === 0 ? (
                    <div className={`p-12 text-center rounded-2xl border-2 border-dashed ${theme === 'light' ? 'border-gray-300' : 'border-white/10'}`}>
                        <Car className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="opacity-50">No vehicles in your garage yet.</p>
                    </div>
                ) : (
                    vehicles.map(v => {
                        const isExpanded = expandedId === v.id
                        const history = v.item_metadata?.serviceHistory || []

                        return (
                            <div key={v.id} className={`rounded-2xl overflow-hidden transition-all ${glassCardStyle}`}>
                                {/* Main Card Header */}
                                <div
                                    onClick={() => setExpandedId(isExpanded ? null : v.id)}
                                    className="p-6 cursor-pointer hover:bg-white/5 transition-colors flex justify-between items-start"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center overflow-hidden ${theme === 'light' ? 'bg-orange-50' : 'bg-orange-500/10'}`}>
                                            {v.item_metadata?.photoUrl ? (
                                                <img src={v.item_metadata.photoUrl} alt="Vehicle" className="w-full h-full object-cover" />
                                            ) : (
                                                <Car className="h-8 w-8 text-orange-500" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{v.title}</h3>
                                            <div className="flex gap-4 mt-2 text-sm opacity-60">
                                                <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {v.item_metadata?.plate || 'No Plate'}</span>
                                                <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> {v.item_metadata?.insuranceProvider || 'No Insurance'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedVehicle(v); setShowEditModal(true) }}
                                            className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); if (confirm("Delete vehicle?")) deleteItem(v.id) }}
                                            className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                        <button className={`p-2 rounded-lg transition-transform ${isExpanded ? 'rotate-180' : ''} ${theme === 'light' ? 'text-gray-400' : 'text-white/40'}`}>
                                            <ChevronDown className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className={`border-t ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

                                            {/* Left Col: Specs & Insurance */}
                                            <div className="space-y-6">
                                                <div className={`p-5 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-black/20'}`}>
                                                    <h4 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4">Specs & Info</h4>
                                                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                                                        <div><span className="block opacity-50 text-xs">VIN</span> <span className="font-mono">{v.item_metadata?.vin || '---'}</span></div>
                                                        <div><span className="block opacity-50 text-xs">Year</span> {v.item_metadata?.year}</div>
                                                        <div><span className="block opacity-50 text-xs">Make</span> {v.item_metadata?.make}</div>
                                                        <div><span className="block opacity-50 text-xs">Model</span> {v.item_metadata?.model}</div>
                                                        <div><span className="block opacity-50 text-xs">Lic. Plate</span> <span className="uppercase">{v.item_metadata?.plate || '---'}</span></div>
                                                    </div>
                                                </div>

                                                <div className={`relative p-5 rounded-xl overflow-hidden ${theme === 'light' ? 'bg-orange-50 border border-orange-100' : 'bg-orange-900/10 border border-orange-500/10'}`}>
                                                    <h4 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4 text-orange-600">Registration & Tax</h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="opacity-50">Reg. Expiry</span>
                                                            <span className={v.item_metadata?.regExpiryDate ? "font-mono" : "opacity-30"}>{v.item_metadata?.regExpiryDate || "N/A"}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="opacity-50">Excise Due</span>
                                                            <span className={v.item_metadata?.exciseDueDate ? "font-mono" : "opacity-30"}>{v.item_metadata?.exciseDueDate || "N/A"}</span>
                                                        </div>
                                                        <div className="flex gap-2 mt-2 pt-2 border-t border-orange-500/10">
                                                            {v.item_metadata?.regDocUrl && (
                                                                <button onClick={() => { }} className="text-xs bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-2 py-1 rounded flex items-center gap-1">
                                                                    <FileText className="h-3 w-3" /> View Reg
                                                                </button>
                                                            )}
                                                            {v.item_metadata?.exciseDocUrl && (
                                                                <button onClick={() => { }} className="text-xs bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-2 py-1 rounded flex items-center gap-1">
                                                                    <FileText className="h-3 w-3" /> View Tax
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={`relative p-5 rounded-xl overflow-hidden ${theme === 'light' ? 'bg-blue-50' : 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/20'}`}>
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="flex items-center gap-2 text-blue-400">
                                                            <Shield className="h-5 w-5" />
                                                            <span className="font-bold">Insurance Card</span>
                                                        </div>
                                                        <span className="text-xs font-mono bg-blue-500/20 text-blue-400 px-2 py-1 rounded">ACTIVE</span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <span className="text-xs opacity-50 block uppercase">Provider</span>
                                                            <span className="font-bold text-lg">{v.item_metadata?.insuranceProvider || 'N/A'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs opacity-50 block uppercase">Policy Number</span>
                                                            <span className="font-mono">{v.item_metadata?.policyNumber || '---'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs opacity-50 block uppercase">Contact</span>
                                                            <span>{v.item_metadata?.insuranceContact || '---'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Col: Service History */}
                                            <div className="flex flex-col h-full">
                                                <h4 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4 flex justify-between items-center">
                                                    <span>Service History</span>
                                                    <span className="text-xs opacity-50">{history.length} Records</span>
                                                </h4>

                                                <div className={`flex-1 rounded-xl mb-4 overflow-hidden ${theme === 'light' ? 'bg-gray-50' : 'bg-black/20'}`}>
                                                    {history.length === 0 ? (
                                                        <div className="h-32 flex items-center justify-center opacity-40 text-sm">No service records found.</div>
                                                    ) : (
                                                        <div className="max-h-[300px] overflow-y-auto">
                                                            {history.map((log: any) => (
                                                                <div key={log.id} className={`p-3 border-b text-sm flex justify-between items-center ${theme === 'light' ? 'border-gray-200' : 'border-white/5'}`}>
                                                                    <div>
                                                                        <div className="font-bold flex items-center gap-2">
                                                                            {log.service}
                                                                            {log.receiptUrl && (
                                                                                <a href="#" onClick={(e) => { e.preventDefault(); alert("Receipt placeholder - Lightbox implementation pending per module") }} className="text-orange-500"><FileText className="h-3 w-3" /></a>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-xs opacity-50">{log.date} • {log.mileage} mi</div>
                                                                    </div>
                                                                    <div className="font-mono text-orange-500 font-bold">${log.cost}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <form onSubmit={(e: any) => {
                                                    e.preventDefault()
                                                    handleAddService(v.id, new FormData(e.target))
                                                    e.target.reset()
                                                }} className="flex gap-2 items-end">
                                                    <div className="flex-1 space-y-2">
                                                        <input name="date" type="date" required className={`w-full p-2 rounded-lg text-sm ${theme === 'light' ? 'bg-white' : 'bg-white/5'}`} style={{ colorScheme: theme }} />
                                                        <input name="service" required placeholder="Service done..." className={`w-full p-2 rounded-lg text-sm ${theme === 'light' ? 'bg-white' : 'bg-white/5'}`} />
                                                    </div>
                                                    <div className="w-24 space-y-2">
                                                        <input name="cost" required placeholder="$ Cost" className={`w-full p-2 rounded-lg text-sm ${theme === 'light' ? 'bg-white' : 'bg-white/5'}`} />
                                                        <input name="mileage" placeholder="Miles" className={`w-full p-2 rounded-lg text-sm ${theme === 'light' ? 'bg-white' : 'bg-white/5'}`} />
                                                    </div>
                                                    <div className="w-10 flex flex-col items-center justify-end h-full pb-1">
                                                        <label className="cursor-pointer text-gray-500 hover:text-white mb-2">
                                                            <FileText className="h-5 w-5" />
                                                            <input type="file" name="receipt" className="hidden" accept="image/*,.pdf" />
                                                        </label>
                                                        <button className="p-2 bg-orange-600 rounded-lg hover:bg-orange-500 text-white"><Plus className="h-4 w-4" /></button>
                                                    </div>
                                                </form>
                                            </div>

                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {showEditModal && selectedVehicle && (
                <EditVehicleModal
                    vehicle={selectedVehicle}
                    onClose={() => { setShowEditModal(false); setSelectedVehicle(null) }}
                    onSave={updateItem}
                    theme={theme}
                />
            )}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'} w-full max-w-lg rounded-2xl p-6 shadow-2xl`}>
                        <h2 className={`text-xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Add New Vehicle</h2>
                        <form onSubmit={(e: any) => {
                            e.preventDefault()
                            const fd = new FormData(e.target)
                            const file = fd.get("photo") as File

                            const saveVehicle = (photoUrl = "") => {
                                addItem({
                                    type: "note",
                                    category: "Vehicles",
                                    title: `${fd.get("year")} ${fd.get("make")} ${fd.get("model")}`,
                                    item_metadata: {
                                        is_vehicle: true,
                                        year: fd.get("year"),
                                        make: fd.get("make"),
                                        model: fd.get("model"),
                                        vin: fd.get("vin"),
                                        plate: fd.get("plate"),
                                        insuranceProvider: fd.get("insuranceProvider"),
                                        policyNumber: fd.get("policyNumber"),
                                        insuranceContact: fd.get("insuranceContact"),
                                        serviceHistory: [],
                                        photoUrl
                                    }
                                })
                                setShowAddModal(false)
                            }

                            if (file && file.size > 0) {
                                if (file.size > 5000000) { alert("File too large (< 5MB)"); return }
                                const reader = new FileReader()
                                reader.onloadend = () => saveVehicle(reader.result as string)
                                reader.readAsDataURL(file)
                            } else {
                                saveVehicle()
                            }
                        }} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <input name="year" required className={`p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Year" />
                                <input name="make" required className={`col-span-2 p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Make (e.g. Toyota)" />
                            </div>
                            <input name="model" required className={`w-full p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Model (e.g. Camry XLE)" />

                            <div className="grid grid-cols-2 gap-4">
                                <input name="vin" className={`p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="VIN Number" />
                                <input name="plate" className={`p-3 rounded-lg outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="License Plate" />
                            </div>

                            <div>
                                <label className="text-xs uppercase font-bold opacity-50 ml-1">Vehicle Photo</label>
                                <input type="file" name="photo" accept="image/*" className={`w-full px-4 py-3 rounded-xl mt-1 text-sm ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} />
                            </div>

                            <div className={`p-4 rounded-xl mt-2 ${theme === 'light' ? 'bg-gray-50' : 'bg-white/5'}`}>
                                <h3 className="text-xs uppercase font-bold opacity-50 mb-3">Insurance Info (Optional)</h3>
                                <div className="space-y-3">
                                    <input name="insuranceProvider" className={`w-full p-2 rounded-lg outline-none text-sm ${theme === 'light' ? 'bg-white' : 'bg-black/30'}`} placeholder="Provider (e.g. Geico)" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input name="policyNumber" className={`w-full p-2 rounded-lg outline-none text-sm ${theme === 'light' ? 'bg-white' : 'bg-black/30'}`} placeholder="Policy #" />
                                        <input name="insuranceContact" className={`w-full p-2 rounded-lg outline-none text-sm ${theme === 'light' ? 'bg-white' : 'bg-black/30'}`} placeholder="Contact Phone" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className={`flex-1 py-3 rounded-xl font-medium ${theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-300'}`}>Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20">Save Vehicle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
