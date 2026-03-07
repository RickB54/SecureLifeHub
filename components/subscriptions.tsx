"use client"

import { useState, useMemo } from "react"
import { CreditCard, Plus, Search, Calendar, DollarSign, Trash2, Edit2, X, Check, RefreshCw, Tag, AlertTriangle, HelpCircle } from "lucide-react"
import { toast } from "sonner"

interface SubscriptionsProps {
    records: any[]
    setRecords?: (records: any[]) => void
    addItem: (item: any) => Promise<any>
    updateItem?: (id: string, item: any) => Promise<any>
    deleteItem?: (id: string) => Promise<any>
    theme: string
    onOpenHelp?: (id?: string) => void
}

const BILLING_CYCLES = ["Monthly", "Yearly", "Weekly", "Quarterly"]
const CATEGORIES = ["Streaming", "Software", "Gaming", "Music", "Cloud Storage", "News", "Fitness", "Finance", "Other"]

function getDaysUntil(dateStr: string): number | null {
    if (!dateStr) return null
    const renewal = new Date(dateStr)
    const now = new Date()
    const diff = Math.ceil((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
}

export default function Subscriptions({ records = [], addItem, updateItem, deleteItem, theme, onOpenHelp }: SubscriptionsProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)
    const [formData, setFormData] = useState({
        name: "", cost: "", cycle: "Monthly", date: "", category: "Other", notes: "", color: "#3B82F6"
    })

    const isDark = theme !== "light"

    const subscriptions = useMemo(() =>
        records.filter(r => r.category === "Subscriptions" || r.type === "subscription")
            .filter(r => {
                const name = r.title || r.name || ""
                const cat = r.item_metadata?.sub_category || ""
                return name.toLowerCase().includes(searchTerm.toLowerCase()) || cat.toLowerCase().includes(searchTerm.toLowerCase())
            }),
        [records, searchTerm]
    )

    const totalMonthly = useMemo(() => subscriptions.reduce((sum, sub) => {
        const cost = parseFloat(sub.item_metadata?.cost || "0")
        const freq = (sub.item_metadata?.billing_cycle || "monthly").toLowerCase()
        if (freq === "yearly") return sum + (cost / 12)
        if (freq === "weekly") return sum + (cost * 4.33)
        if (freq === "quarterly") return sum + (cost / 3)
        return sum + cost
    }, 0), [subscriptions])

    const totalYearly = totalMonthly * 12

    const upcomingRenewals = useMemo(() =>
        subscriptions
            .filter(s => s.item_metadata?.renewal_date)
            .map(s => ({ ...s, daysUntil: getDaysUntil(s.item_metadata.renewal_date) }))
            .filter(s => s.daysUntil !== null && s.daysUntil >= 0 && s.daysUntil <= 30)
            .sort((a, b) => (a.daysUntil ?? 99) - (b.daysUntil ?? 99)),
        [subscriptions]
    )

    const openAdd = () => {
        setFormData({ name: "", cost: "", cycle: "Monthly", date: "", category: "Other", notes: "", color: "#3B82F6" })
        setEditingItem(null)
        setIsAddModalOpen(true)
    }

    const openEdit = (sub: any) => {
        setFormData({
            name: sub.title || "",
            cost: sub.item_metadata?.cost || "",
            cycle: sub.item_metadata?.billing_cycle || "Monthly",
            date: sub.item_metadata?.renewal_date || "",
            category: sub.item_metadata?.sub_category || "Other",
            notes: sub.item_metadata?.notes || "",
            color: sub.item_metadata?.color || "#3B82F6"
        })
        setEditingItem(sub)
        setIsAddModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const payload = {
            title: formData.name,
            type: "subscription",
            category: "Subscriptions",
            item_metadata: {
                cost: formData.cost,
                billing_cycle: formData.cycle,
                renewal_date: formData.date,
                sub_category: formData.category,
                notes: formData.notes,
                color: formData.color
            }
        }
        if (editingItem && updateItem) {
            await updateItem(editingItem.id, payload)
            toast.success("Subscription updated")
        } else {
            await addItem(payload)
            toast.success("Subscription added")
        }
        setIsAddModalOpen(false)
    }

    const handleDelete = async (sub: any) => {
        if (!deleteItem) return
        if (!confirm(`Delete "${sub.title}"? This cannot be undone.`)) return
        await deleteItem(sub.id)
        toast.success("Subscription removed")
    }

    return (
        <div className={`min-h-full pb-20 ${isDark ? "text-white" : "text-gray-900"}`}>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                        Subscriptions
                    </h1>
                    <div className="flex items-center gap-2">
                        {onOpenHelp && (
                            <button onClick={() => onOpenHelp("type-subscriptions")}
                                className="p-2 rounded-xl hover:bg-white/10 text-gray-500 hover:text-blue-400 transition-all" title="Help">
                                <HelpCircle className="h-5 w-5" />
                            </button>
                        )}
                        <button onClick={openAdd}
                            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 rounded-2xl font-bold text-sm text-white shadow-lg shadow-green-900/30 transition-all active:scale-95">
                            <Plus className="h-4 w-4" /> Add Subscription
                        </button>
                    </div>
                </div>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Track recurring expenses and renewal dates</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#1e1e1e] border-white/5" : "bg-white border-gray-200 shadow"}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-green-500/20 rounded-lg"><DollarSign className="h-4 w-4 text-green-400" /></div>
                        <span className="text-xs font-bold opacity-50 uppercase tracking-wider">Monthly</span>
                    </div>
                    <p className="text-2xl font-black">${totalMonthly.toFixed(2)}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#1e1e1e] border-white/5" : "bg-white border-gray-200 shadow"}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-blue-500/20 rounded-lg"><RefreshCw className="h-4 w-4 text-blue-400" /></div>
                        <span className="text-xs font-bold opacity-50 uppercase tracking-wider">Yearly</span>
                    </div>
                    <p className="text-2xl font-black">${totalYearly.toFixed(2)}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#1e1e1e] border-white/5" : "bg-white border-gray-200 shadow"}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-purple-500/20 rounded-lg"><CreditCard className="h-4 w-4 text-purple-400" /></div>
                        <span className="text-xs font-bold opacity-50 uppercase tracking-wider">Active</span>
                    </div>
                    <p className="text-2xl font-black">{subscriptions.length}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#1e1e1e] border-white/5" : "bg-white border-gray-200 shadow"}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-amber-500/20 rounded-lg"><AlertTriangle className="h-4 w-4 text-amber-400" /></div>
                        <span className="text-xs font-bold opacity-50 uppercase tracking-wider">Due Soon</span>
                    </div>
                    <p className="text-2xl font-black">{upcomingRenewals.length}</p>
                </div>
            </div>

            {/* Upcoming Renewals Banner */}
            {upcomingRenewals.length > 0 && (
                <div className={`mb-6 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5`}>
                    <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5" /> Renewing Soon
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {upcomingRenewals.map(sub => (
                            <div key={sub.id} className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5 text-xs">
                                <span className="font-bold text-white">{sub.title}</span>
                                <span className="text-amber-400 font-mono">
                                    {sub.daysUntil === 0 ? "Today!" : `${sub.daysUntil}d`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search subscriptions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-sm outline-none ${isDark ? "bg-white/5 border-white/10 focus:border-green-500/50 text-white" : "bg-white border-gray-200 focus:border-green-400 text-gray-900"}`} />
            </div>

            {/* Subscriptions List */}
            {subscriptions.length === 0 ? (
                <div className="text-center py-24 opacity-40">
                    <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="font-bold text-lg">No subscriptions tracked yet</p>
                    <p className="text-sm mt-1">Add your first subscription to start tracking</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {subscriptions.map(sub => {
                        const cost = parseFloat(sub.item_metadata?.cost || "0")
                        const cycle = sub.item_metadata?.billing_cycle || "Monthly"
                        const days = getDaysUntil(sub.item_metadata?.renewal_date)
                        const color = sub.item_metadata?.color || "#3B82F6"
                        const initials = (sub.title || "?").slice(0, 2).toUpperCase()
                        const isDueSoon = days !== null && days >= 0 && days <= 7

                        return (
                            <div key={sub.id}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isDark ? "bg-[#1e1e1e] border-white/5 hover:border-white/10" : "bg-white border-gray-100 shadow hover:shadow-md"}`}>
                                {/* Icon */}
                                <div className="h-12 w-12 rounded-2xl flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                                    style={{ backgroundColor: color + "33", border: `2px solid ${color}66` }}>
                                    <span style={{ color }}>{initials}</span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold truncate">{sub.title}</h3>
                                        {sub.item_metadata?.sub_category && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                                                {sub.item_metadata.sub_category}
                                            </span>
                                        )}
                                        {isDueSoon && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                                                {days === 0 ? "Today" : `${days}d`}
                                            </span>
                                        )}
                                    </div>
                                    <div className={`flex items-center gap-3 mt-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                        <span className="flex items-center gap-1">
                                            <RefreshCw className="h-3 w-3" /> {cycle}
                                        </span>
                                        {sub.item_metadata?.renewal_date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" /> {sub.item_metadata.renewal_date}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Cost */}
                                <div className="text-right flex-shrink-0">
                                    <p className="font-black text-lg">${cost.toFixed(2)}</p>
                                    <p className="text-[10px] uppercase tracking-wider opacity-40">{cycle}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    {updateItem && (
                                        <button onClick={() => openEdit(sub)}
                                            className="p-2 rounded-xl hover:bg-white/10 text-gray-500 hover:text-blue-400 transition-all">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                    )}
                                    {deleteItem && (
                                        <button onClick={() => handleDelete(sub)}
                                            className="p-2 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in"
                    onClick={() => setIsAddModalOpen(false)}>
                    <div onClick={e => e.stopPropagation()}
                        className={`w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 shadow-2xl border animate-in slide-in-from-bottom-8 duration-300 ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-gray-100"}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black">{editingItem ? "Edit Subscription" : "New Subscription"}</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-xl hover:bg-white/10 text-gray-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Service Name *</label>
                                <input required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${isDark ? "bg-black/30 border-white/10 focus:border-green-500/50 text-white" : "bg-gray-50 border-gray-200 focus:border-green-400"}`}
                                    placeholder="Netflix, Spotify, Adobe..." />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Cost *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
                                        <input required type="number" step="0.01" min="0" value={formData.cost}
                                            onChange={e => setFormData(p => ({ ...p, cost: e.target.value }))}
                                            className={`w-full pl-7 pr-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? "bg-black/30 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`}
                                            placeholder="0.00" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Billing Cycle</label>
                                    <select value={formData.cycle} onChange={e => setFormData(p => ({ ...p, cycle: e.target.value }))}
                                        className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? "bg-black/30 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`}>
                                        {BILLING_CYCLES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Category</label>
                                    <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                                        className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? "bg-black/30 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`}>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Next Renewal</label>
                                    <input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                                        className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? "bg-black/30 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Color Tag</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={formData.color} onChange={e => setFormData(p => ({ ...p, color: e.target.value }))}
                                        className="h-9 w-16 rounded-lg border-0 bg-transparent cursor-pointer" />
                                    <span className="text-xs text-gray-500">Used for the service icon</span>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsAddModalOpen(false)}
                                    className={`flex-1 py-3 rounded-2xl font-bold text-sm ${isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"}`}>
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="flex-1 py-3 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm shadow-lg shadow-green-900/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <Check className="h-4 w-4" /> {editingItem ? "Save Changes" : "Add Subscription"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
