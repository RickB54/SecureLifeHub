"use client"

import { useState, useEffect } from "react"
import { Plus, Plane, Trash2, Calendar, MapPin, AlertTriangle, FileText, CreditCard, Edit } from "lucide-react"
import EditTravelModal from "./modals/edit-travel-modal"

interface Props {
    records: any[]
    addItem: (item: any) => Promise<any>
    updateItem: (id: string, updates: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
}

export default function Travel({ records, addItem, deleteItem, theme }: Props) {
    const [items, setItems] = useState<any[]>([])
    const [filter, setFilter] = useState("all") // all, trips, docs
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedItem, setSelectedItem] = useState<any>(null)

    useEffect(() => {
        setItems(records.filter(r => r.category === "Travel" || r.item_metadata?.is_travel))
    }, [records])

    const glassCardStyle = theme === 'light'
        ? "bg-white/80 border border-gray-200 shadow-sm"
        : "bg-white/5 border border-white/10"

    const passports = items.filter(i => i.item_metadata?.travelType === 'passport' || i.item_metadata?.travelType === 'visa')
    const itineraryItems = items.filter(i => i.item_metadata?.travelType !== 'passport' && i.item_metadata?.travelType !== 'visa')

    // Sort itinerary by date if available
    itineraryItems.sort((a, b) => {
        const da = a.item_metadata?.startDate ? new Date(a.item_metadata.startDate).getTime() : 0
        const db = b.item_metadata?.startDate ? new Date(b.item_metadata.startDate).getTime() : 0
        return da - db
    })

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50' : 'bg-[#121212]'} text-white overflow-hidden`}>
            {/* Header */}
            <div className="p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500 flex items-center gap-3">
                            <Plane className="h-8 w-8 text-sky-500" /> Travel Hub
                        </h1>
                        <p className="text-gray-400 mt-1">Manage documents, flights, and itineraries.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-5 py-2.5 bg-sky-600 hover:bg-sky-500 rounded-xl font-medium transition-all shadow-lg shadow-sky-500/20"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Trip/Doc
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-8">

                {/* Important Documents Section */}
                {passports.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 opacity-80">
                            <CreditCard className="h-5 w-5" /> Travel Documents
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {passports.map(doc => {
                                const expiry = doc.item_metadata?.expiryDate ? new Date(doc.item_metadata.expiryDate) : null
                                const isExpiring = expiry && expiry.getTime() - Date.now() < 1000 * 60 * 60 * 24 * 180 // 6 months
                                return (
                                    <div key={doc.id} className={`relative p-6 rounded-2xl overflow-hidden group ${glassCardStyle}`}>
                                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                            <FileText className="h-24 w-24" />
                                        </div>
                                        <div className="relative z-10">
                                            <h3 className={`font-bold text-lg mb-1 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{doc.title}</h3>
                                            <p className="text-sm opacity-60 uppercase tracking-widest text-[10px] mb-4">{doc.item_metadata?.travelType}</p>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="opacity-50">Number</span>
                                                    <span className="font-mono">{doc.item_metadata?.docNumber || '---'}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="opacity-50">Expires</span>
                                                    <span className={`font-mono ${isExpiring ? 'text-rose-500 font-bold' : ''}`}>
                                                        {doc.item_metadata?.expiryDate || 'N/A'}
                                                        {isExpiring && <AlertTriangle className="h-3 w-3 inline ml-1" />}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <button onClick={() => { setSelectedItem(doc); setShowEditModal(true) }} className="p-2 hover:bg-white/10 text-white rounded-lg">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => { if (confirm("Delete doc?")) deleteItem(doc.id) }} className="p-2 hover:bg-rose-500/20 text-rose-500 rounded-lg">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* Itinerary Timeline */}
                <section>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 opacity-80">
                        <Calendar className="h-5 w-5" /> Itinerary & Trips
                    </h2>

                    {itineraryItems.length === 0 ? (
                        <div className={`p-10 rounded-2xl text-center border-2 border-dashed ${theme === 'light' ? 'border-gray-300' : 'border-white/10'}`}>
                            <Plane className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p className="opacity-50">No upcoming trips planned.</p>
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-white/10 ml-3 space-y-8 pl-8 py-2">
                            {itineraryItems.map((item, idx) => (
                                <div key={item.id} className="relative group">
                                    <div className={`absolute -left-[41px] top-4 h-5 w-5 rounded-full border-4 ${theme === 'light' ? 'border-white bg-sky-500' : 'border-[#121212] bg-sky-500'}`} />

                                    <div className={`p-5 rounded-2xl ${glassCardStyle} hover:border-sky-500/30 transition-all`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-sky-50 text-sky-600' : 'bg-sky-500/20 text-sky-400'}`}>
                                                    {item.item_metadata?.travelType === 'flight' ? <Plane className="h-6 w-6" /> :
                                                        item.item_metadata?.travelType === 'hotel' ? <Calendar className="h-6 w-6" /> :
                                                            <MapPin className="h-6 w-6" />}
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold bg-sky-500/10 text-sky-500 px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">
                                                        {item.item_metadata?.startDate || 'TBD'}
                                                    </span>
                                                    <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{item.title}</h3>
                                                    <p className="opacity-60 text-sm mt-1 max-w-xl">{item.item_metadata?.details}</p>
                                                    {item.item_metadata?.confirmation && (
                                                        <div className="mt-3 flex items-center gap-2 text-xs font-mono opacity-50">
                                                            <span>CONF:</span>
                                                            <span className="bg-white/10 px-1.5 py-0.5 rounded">{item.item_metadata.confirmation}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                                                <button onClick={() => { setSelectedItem(item); setShowEditModal(true) }} className="p-2 text-sky-500 hover:bg-sky-500/10 rounded-lg">
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => { if (confirm("Delete item?")) deleteItem(item.id) }} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg">
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Edit Modal */}
                {showEditModal && selectedItem && (
                    <EditTravelModal
                        item={selectedItem}
                        onClose={() => { setShowEditModal(false); setSelectedItem(null) }}
                        onSave={async (id, updates) => { await props.updateItem(id, updates); }}
                        theme={theme}
                    />
                )}

                {/* Add Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'} w-full max-w-lg rounded-2xl p-6 shadow-2xl`}>
                            <h2 className={`text-xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Add Travel Record</h2>
                            <form onSubmit={(e: any) => {
                                e.preventDefault()
                                const fd = new FormData(e.target)
                                const file = (fd.get("file") as File)

                                const saveItem = (url: string = "") => {
                                    addItem({
                                        type: "note",
                                        category: "Travel",
                                        title: fd.get("title"),
                                        item_metadata: {
                                            is_travel: true,
                                            travelType: fd.get("travelType"),
                                            docNumber: fd.get("docNumber"),
                                            expiryDate: fd.get("expiryDate"),
                                            startDate: fd.get("startDate"),
                                            details: fd.get("details"),
                                            confirmation: fd.get("confirmation"),
                                            url: url // Store Base64 or URL
                                        }
                                    })
                                    setShowAddModal(false)
                                }

                                if (file && file.size > 0) {
                                    if (file.size > 5000000) { alert("File too large"); return }
                                    const reader = new FileReader()
                                    reader.onloadend = () => saveItem(reader.result as string)
                                    reader.readAsDataURL(file)
                                } else {
                                    saveItem()
                                }

                            }} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs uppercase font-bold opacity-50 ml-1">Type</label>
                                        <select name="travelType" className={`w-full px-4 py-3 rounded-xl mt-1 outline-none ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-black/30 text-white'}`}>
                                            <option value="flight">Flight</option>
                                            <option value="hotel">Hotel / Stay</option>
                                            <option value="event">Event / Activity</option>
                                            <option value="passport">Passport</option>
                                            <option value="visa">Visa</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs uppercase font-bold opacity-50 ml-1">Title / Destination</label>
                                    <input name="title" required className={`w-full px-4 py-3 rounded-xl mt-1 outline-none ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-black/30 text-white'}`} placeholder="e.g. Flight to Paris or US Passport" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs uppercase font-bold opacity-50 ml-1">Number / Conf #</label>
                                        <input name="docNumber" className={`w-full px-4 py-3 rounded-xl mt-1 outline-none ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-black/30 text-white'}`} placeholder="A12345678" />
                                        {/* Hidden input mapping for consistent generic naming if needed */}
                                        <input type="hidden" name="confirmation" />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase font-bold opacity-50 ml-1">Date / Expire</label>
                                        <input type="date" name="startDate" className={`w-full px-4 py-3 rounded-xl mt-1 outline-none ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-black/30 text-white'}`} style={{ colorScheme: theme }} />
                                        {/* Use same date picker for expiry logic based on type in form handler if strictly needed, but separate names are safer */}
                                        <input type="hidden" name="expiryDate" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs uppercase font-bold opacity-50 ml-1">Notes / Details</label>
                                    <textarea name="details" className={`w-full px-4 py-3 rounded-xl mt-1 outline-none ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-black/30 text-white'}`} rows={3} placeholder="Terminal info, seat numbers, constraints..." />
                                </div>

                                <div>
                                    <label className="text-xs uppercase font-bold opacity-50 ml-1">Attachment (Ticket/Scan)</label>
                                    <input type="file" name="file" accept="image/*,.pdf" className={`w-full px-4 py-3 rounded-xl mt-1 text-sm ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-black/30 text-white'}`} />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button type="button" onClick={() => setShowAddModal(false)} className={`flex-1 py-3 rounded-xl font-medium ${theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-300'}`}>Cancel</button>
                                    <button type="submit" className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-500/20">Save Record</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
