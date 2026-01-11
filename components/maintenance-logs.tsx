"use client"

import { useState, useMemo } from "react"
import { Search, Plus, Wrench, Calendar, Gauge, DollarSign, Filter, MoreVertical, Trash2, History, TrendingUp, AlertCircle, Clock, LayoutGrid, CheckCircle2, User, X } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface MaintenanceLogsProps {
    records: any[]
    addItem: (item: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
}

export default function MaintenanceLogs({ records, addItem, deleteItem, theme }: MaintenanceLogsProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newLog, setNewLog] = useState({
        service: "",
        mileage: "",
        cost: "",
        date: new Date().toISOString().split('T')[0],
        provider: "",
        notes: ""
    })

    // Filter maintenance records
    const maintenanceRecords = useMemo(() => {
        return records.filter(r =>
            r.category === "Vehicle Maintenance" ||
            r.type === "maintenance-log" ||
            r.item_metadata?.is_maintenance_log
        ).sort((a, b) => new Date(b.item_metadata?.date || b.created_at).getTime() - new Date(a.item_metadata?.date || a.created_at).getTime())
    }, [records])

    const filteredLogs = maintenanceRecords.filter(log =>
        log.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.item_metadata?.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.item_metadata?.provider?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalSpent = useMemo(() => {
        return filteredLogs.reduce((acc, log) => acc + (parseFloat(log.item_metadata?.cost) || 0), 0)
    }, [filteredLogs])

    const handleAddLog = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await addItem({
                title: newLog.service,
                type: "note",
                category: "Vehicle Maintenance",
                item_metadata: {
                    is_maintenance_log: true,
                    service: newLog.service,
                    mileage: newLog.mileage,
                    cost: newLog.cost,
                    date: newLog.date,
                    provider: newLog.provider,
                    notes: newLog.notes
                }
            })
            setIsAddModalOpen(false)
            setNewLog({ service: "", mileage: "", cost: "", date: new Date().toISOString().split('T')[0], provider: "", notes: "" })
            toast.success("Maintenance log added")
        } catch (err) {
            toast.error("Failed to add log")
        }
    }

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50' : 'bg-[#121212]'} text-white overflow-hidden`}>
            {/* Header / Stats */}
            <div className={`p-8 border-b ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-white/5'}`}>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 italic uppercase tracking-tighter">
                            Maintenance Logs
                        </h1>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-black tracking-widest">Service history & lifecycle management</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search history..."
                                className={`pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 w-64 ${theme === 'light' ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-black/40 text-white border border-white/10'}`}
                            />
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black uppercase italic tracking-tighter transition-all hover:scale-105 shadow-xl shadow-amber-900/40"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Log Service
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className={`p-6 rounded-3xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Logs</div>
                        <div className="text-3xl font-black italic tracking-tighter text-amber-500">{filteredLogs.length}</div>
                    </div>
                    <div className={`p-6 rounded-3xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Investment</div>
                        <div className="text-3xl font-black italic tracking-tighter text-emerald-500">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className={`p-6 rounded-3xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Last Service</div>
                        <div className="text-2xl font-black italic tracking-tighter">{filteredLogs[0] ? format(new Date(filteredLogs[0].item_metadata.date), 'MMM d, yyyy') : "N/A"}</div>
                    </div>
                    <div className={`p-6 rounded-3xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Health Status</div>
                        <div className="flex items-center gap-2 text-xl font-black italic tracking-tighter text-blue-400">
                            <CheckCircle2 className="h-5 w-5" /> OPTIMIZED
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-8">
                {filteredLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 mt-20">
                        <History className="h-24 w-24 mb-6 text-gray-500" />
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">No service logs</h2>
                        <p className="text-sm font-bold uppercase tracking-widest mt-2 text-center max-w-xs">Log your first oil change, tire rotation, or repair to start tracking</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-5xl mx-auto">
                        {filteredLogs.map((log) => (
                            <div
                                key={log.id}
                                className={`group flex items-center p-6 rounded-[2.5rem] border transition-all hover:bg-white/5 ${theme === 'light' ? 'bg-white border-gray-200 shadow-lg hover:bg-gray-50' : 'bg-black/40 border-white/10'}`}
                            >
                                <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 mr-6">
                                    <Wrench className="h-8 w-8" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className={`text-xl font-black uppercase italic tracking-tighter truncate ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                            {log.item_metadata.service}
                                        </h3>
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            Completed
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(log.item_metadata.date), 'MMMM d, yyyy')}</span>
                                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {log.item_metadata.provider || "Private Shop"}</span>
                                        <span className="flex items-center gap-1 text-amber-500"><Gauge className="h-3 w-3" /> {parseInt(log.item_metadata.mileage).toLocaleString()} MILES</span>
                                    </div>
                                    {log.item_metadata.notes && (
                                        <p className="mt-3 text-sm text-gray-500 italic line-clamp-1">"{log.item_metadata.notes}"</p>
                                    )}
                                </div>

                                <div className="text-right px-8 border-x border-white/5 mr-8">
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Cost</div>
                                    <div className="text-2xl font-black italic tracking-tighter text-emerald-500">
                                        ${parseFloat(log.item_metadata.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>

                                <button
                                    onClick={() => { if (confirm("Delete service log?")) deleteItem(log.id) }}
                                    className="p-3 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'} rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl relative`}>
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-t-full"></div>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className={`text-4xl font-black italic uppercase tracking-tighter ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Log Maintenance</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="h-8 w-8 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleAddLog} className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 space-y-2">
                                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Service Performed</label>
                                <input value={newLog.service} onChange={(e) => setNewLog({ ...newLog, service: e.target.value })} placeholder="e.g. Synthetic Oil Change & Filter" required className={`w-full rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${theme === 'light' ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-black/40 border-white/10 text-white border'}`} />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Date</label>
                                <input type="date" value={newLog.date} onChange={(e) => setNewLog({ ...newLog, date: e.target.value })} required className={`w-full rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${theme === 'light' ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-black/40 border-white/10 text-white border'}`} />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Mileage</label>
                                <input type="number" value={newLog.mileage} onChange={(e) => setNewLog({ ...newLog, mileage: e.target.value })} placeholder="0" required className={`w-full rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${theme === 'light' ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-black/40 border-white/10 text-white border'}`} />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Cost ($)</label>
                                <input type="number" step="0.01" value={newLog.cost} onChange={(e) => setNewLog({ ...newLog, cost: e.target.value })} placeholder="0.00" required className={`w-full rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${theme === 'light' ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-black/40 border-white/10 text-white border'}`} />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Service Provider</label>
                                <input value={newLog.provider} onChange={(e) => setNewLog({ ...newLog, provider: e.target.value })} placeholder="Agency/Shop Name" className={`w-full rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${theme === 'light' ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-black/40 border-white/10 text-white border'}`} />
                            </div>

                            <div className="col-span-2 space-y-2">
                                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Notes / Part Numbers</label>
                                <textarea value={newLog.notes} onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })} placeholder="Internal notes, warranty info, or parts used..." className={`w-full h-32 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-amber-500/50 transition-all resize-none ${theme === 'light' ? 'bg-gray-100 text-gray-900 border-gray-200' : 'bg-black/40 border-white/10 text-white border'}`} />
                            </div>

                            <div className="col-span-2 pt-6">
                                <button type="submit" className="w-full py-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black uppercase italic tracking-tighter rounded-2xl shadow-2xl shadow-amber-900/40 transition-all active:scale-95">
                                    Finalize Log Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
