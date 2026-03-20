"use client"

import { useState, useMemo } from "react"
import { 
    CreditCard, Plus, Search, Calendar, DollarSign, Trash2, Edit2, X, Check, 
    RefreshCw, Tag, AlertTriangle, HelpCircle, BarChart3, Bell, Wallet, 
    ArrowUpRight, TrendingUp, List, ShieldAlert, Sparkles, PieChart as PieIcon,
    ArrowDownLeft, Clock, Zap
} from "lucide-react"
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { toast } from "sonner"
import { MOCKED_SUBSCRIPTIONS } from "../lib/mock-data"
import MockDataBanner from "./ui/mock-data-banner"
import { useEffect } from "react"

interface SubscriptionsProps {
    records: any[]
    setRecords?: (records: any[]) => void
    addItem: (item: any) => Promise<any>
    updateItem?: (id: string, item: any) => Promise<any>
    deleteItem?: (id: string) => Promise<any>
    theme: string
    onOpenHelp?: (id?: string) => void
    mockSettings?: Record<string, boolean>
}

const BILLING_CYCLES = ["Monthly", "Yearly", "Weekly", "Quarterly"]
const CATEGORIES = ["Streaming", "Software", "Gaming", "Music", "Cloud Storage", "News", "Fitness", "Finance", "Utilities", "Other"]

function getDaysUntil(dateStr: string): number | null {
    if (!dateStr) return null
    const renewal = new Date(dateStr)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    renewal.setHours(0, 0, 0, 0)
    const diff = Math.ceil((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
}

export default function Subscriptions({ records = [], addItem, updateItem, deleteItem, theme, onOpenHelp, mockSettings }: SubscriptionsProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)
    const [activeView, setActiveView] = useState<"list" | "insights" | "reminders">("list")
    const [formData, setFormData] = useState({
        name: "", cost: "", cycle: "Monthly", date: "", category: "Other", notes: "", color: "#3B82F6", paymentMethodId: "", autoRenew: true
    })

    const isDark = theme === "dark" || theme !== "light"

    // Mock data state
    const [showMockData, setShowMockData] = useState(false)
    const [isForcedMock, setIsForcedMock] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const dismissed = localStorage.getItem('subs_mock_dismissed') === 'true'
            const localMock = mockSettings?.['type-subscriptions'] || false
            
            setIsForcedMock(localMock)
            
            // Show mock if forced OR (no real records AND not dismissed)
            const realRecordsCount = records.filter(r => r.category === "Subscriptions" || r.type === "subscription").length

            if (localMock) {
                setShowMockData(true)
            } else if (realRecordsCount === 0 && !dismissed) {
                setShowMockData(true)
            } else {
                setShowMockData(false)
            }
        }
    }, [records, mockSettings])

    const handleClearMockData = () => {
        setShowMockData(false)
        if (typeof window !== 'undefined') {
            localStorage.setItem('subs_mock_dismissed', 'true')
            localStorage.setItem('subs_mock_enabled', 'false')
            window.dispatchEvent(new Event('storage'))
        }
    }

    // Filtered data
    const subscriptions = useMemo(() => {
        const base = showMockData ? MOCKED_SUBSCRIPTIONS : records;
        return base.filter(r => r.category === "Subscriptions" || r.type === "subscription")
            .filter(r => {
                const name = (r.title || r.name || "").toLowerCase()
                const cat = (r.item_metadata?.sub_category || "").toLowerCase()
                const query = searchTerm.toLowerCase()
                return name.includes(query) || cat.includes(query)
            })
    }, [records, searchTerm, showMockData])

    // Financials
    const totalMonthly = useMemo(() => subscriptions.reduce((sum, sub) => {
        const cost = parseFloat(sub.item_metadata?.cost || "0")
        const freq = (sub.item_metadata?.billing_cycle || "monthly").toLowerCase()
        if (freq === "yearly") return sum + (cost / 12)
        if (freq === "weekly") return sum + (cost * 4.33)
        if (freq === "quarterly") return sum + (cost / 3)
        return sum + cost
    }, 0), [subscriptions])

    const totalYearly = totalMonthly * 12

    // Budget Integration
    const budgetRecords = useMemo(() => records.filter(r => r.category === "Budget" || r.item_metadata?.is_budget), [records])
    const monthlyIncome = useMemo(() => budgetRecords
        .filter(r => r.item_metadata?.entry_type === 'income')
        .reduce((sum, r) => sum + (parseFloat(r.item_metadata?.amount) || 0), 0),
    [budgetRecords])

    const incomeImpact = monthlyIncome > 0 ? (totalMonthly / monthlyIncome) * 100 : 0

    // Reminders
    const reminders = useMemo(() =>
        subscriptions
            .filter(s => s.item_metadata?.renewal_date)
            .map(s => ({ ...s, daysUntil: getDaysUntil(s.item_metadata.renewal_date) }))
            .filter(s => s.daysUntil !== null && s.daysUntil >= -1 && s.daysUntil <= 30)
            .sort((a, b) => (a.daysUntil ?? 99) - (b.daysUntil ?? 99)),
        [subscriptions]
    )

    const paymentCards = useMemo(() => 
        records.filter(r => r.type === "financial-card"),
        [records]
    )

    const categoryData = useMemo(() => {
        const data: Record<string, number> = {}
        subscriptions.forEach(sub => {
            const cat = sub.item_metadata?.sub_category || "Other"
            const cost = parseFloat(sub.item_metadata?.cost || "0")
            const freq = (sub.item_metadata?.billing_cycle || "monthly").toLowerCase()
            let mCost = cost
            if (freq === "yearly") mCost = cost / 12
            if (freq === "weekly") mCost = cost * 4.33
            if (freq === "quarterly") mCost = cost / 3
            data[cat] = (data[cat] || 0) + mCost
        })
        return Object.entries(data).map(([name, value]) => ({ name, value }))
    }, [subscriptions])

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1']

    const openAdd = () => {
        setFormData({ name: "", cost: "", cycle: "Monthly", date: "", category: "Other", notes: "", color: "#3B82F6", paymentMethodId: "", autoRenew: true })
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
            color: sub.item_metadata?.color || "#3B82F6",
            paymentMethodId: sub.item_metadata?.paymentMethodId || "",
            autoRenew: sub.item_metadata?.auto_renew !== false
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
                color: formData.color,
                paymentMethodId: formData.paymentMethodId,
                auto_renew: formData.autoRenew
            }
        }
        if (editingItem && updateItem) {
            await updateItem(editingItem.id, payload)
            toast.success("Subscription updated")
        } else {
            await addItem(payload)
            toast.success("Subscription added to vault")
        }
        setIsAddModalOpen(false)
    }

    const handleDelete = async (sub: any) => {
        if (!deleteItem) return
        if (!confirm(`Archive "${sub.title}" tracking data?`)) return
        await deleteItem(sub.id)
        toast.success("Subscription data purged")
    }

    return (
        <div className={`min-h-full pb-20 p-4 md:p-8 animate-in fade-in duration-500 ${isDark ? "text-white" : "text-gray-900"}`}>
            {showMockData && (
                <MockDataBanner theme={theme} onClear={handleClearMockData} isForced={isForcedMock} pageName="Subscriptions" />
            )}
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 italic tracking-tighter">
                            Billing Architect
                        </h1>
                        <p className={`text-xs font-black uppercase tracking-[0.3em] mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Intelligent Recurring Expense Engine</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={openAdd}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black text-xs text-white shadow-2xl shadow-emerald-900/30 transition-all active:scale-95 uppercase tracking-widest">
                            <Plus className="h-4 w-4" /> Secure New Service
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-black/20 p-1.5 rounded-2xl border border-white/5 w-fit">
                {[
                    { id: "list", label: "Active Nodes", icon: List },
                    { id: "reminders", label: "Signal Alerts", icon: Bell },
                    { id: "insights", label: "Execution Matrix", icon: BarChart3 }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveView(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === tab.id ? "bg-emerald-600 text-white shadow-xl shadow-emerald-500/20" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
                    >
                        <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/5 shadow-2xl" : "bg-white border-gray-100 shadow-md"}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl"><DollarSign className="h-4 w-4 text-emerald-400" /></div>
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Monthly Drift</span>
                    </div>
                    <p className="text-3xl font-black tracking-tighter italic">${totalMonthly.toFixed(2)}</p>
                </div>
                <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/5 shadow-2xl" : "bg-white border-gray-100 shadow-md"}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl"><Zap className="h-4 w-4 text-blue-400" /></div>
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Annual Load</span>
                    </div>
                    <p className="text-3xl font-black tracking-tighter italic">${totalYearly.toFixed(0)}</p>
                </div>
                <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/5 shadow-2xl" : "bg-white border-gray-100 shadow-md"}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-purple-500/10 rounded-xl"><Clock className="h-4 w-4 text-purple-400" /></div>
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Income Impact</span>
                    </div>
                    <p className="text-3xl font-black tracking-tighter italic">{incomeImpact.toFixed(1)}%</p>
                </div>
                <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/5 shadow-2xl" : "bg-white border-gray-100 shadow-md"}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-amber-500/10 rounded-xl"><ShieldAlert className="h-4 w-4 text-amber-400" /></div>
                        <span className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Active Nodes</span>
                    </div>
                    <p className="text-3xl font-black tracking-tighter italic">{subscriptions.length}</p>
                </div>
            </div>

            {activeView === "list" && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="RESONATE ACROSS SERVICE NODES..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                            className={`w-full pl-12 pr-6 py-4 rounded-[2rem] border text-xs font-black uppercase tracking-widest outline-none transition-all ${isDark ? "bg-black/40 border-white/10 focus:border-emerald-500/50 text-white placeholder:text-gray-700" : "bg-white border-gray-200 focus:border-emerald-400 text-gray-900"}`} 
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {subscriptions.length === 0 ? (
                            <div className="col-span-full text-center py-32 opacity-20">
                                <Plus className="h-20 w-20 mx-auto mb-6 opacity-30 animate-pulse" />
                                <p className="font-black text-xl uppercase tracking-[0.5em]">No Nodes Detected</p>
                                <p className="text-xs mt-4">Initiate tracking for recurring financial streams</p>
                            </div>
                        ) : (
                            subscriptions.map(sub => {
                                const cost = parseFloat(sub.item_metadata?.cost || "0")
                                const cycle = sub.item_metadata?.billing_cycle || "Monthly"
                                const days = getDaysUntil(sub.item_metadata?.renewal_date)
                                const color = sub.item_metadata?.color || "#3B82F6"
                                const isDueSoon = days !== null && days >= 0 && days <= 7
                                const cardId = sub.item_metadata?.paymentMethodId
                                const card = paymentCards.find(c => c.id === cardId)

                                return (
                                    <div key={sub.id}
                                        className={`group relative flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-[2.5rem] border transition-all hover:scale-[1.01] active:scale-[0.99] ${isDark ? "bg-[#161616]/60 backdrop-blur-md border-white/5 hover:border-emerald-500/30 shadow-2xl" : "bg-white border-gray-100 shadow-xl hover:shadow-2xl"}`}>
                                        
                                        {/* Graphic Icon */}
                                        <div className="h-16 w-16 rounded-[1.5rem] flex items-center justify-center font-black text-lg flex-shrink-0 relative overflow-hidden"
                                            style={{ backgroundColor: color + "15" }}>
                                            <div className="absolute inset-0 opacity-10" style={{ backgroundColor: color }} />
                                            <span style={{ color }}>{(sub.title || "?").slice(0, 2).toUpperCase()}</span>
                                        </div>

                                        {/* Node Signature */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap mb-2">
                                                <h3 className="text-xl font-black italic tracking-tighter text-white group-hover:text-emerald-400 transition-colors uppercase">{sub.title}</h3>
                                                {sub.item_metadata?.sub_category && (
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white/5 text-gray-500 border border-white/5">
                                                        {sub.item_metadata.sub_category}
                                                    </span>
                                                )}
                                                {isDueSoon && (
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-2 animate-pulse">
                                                        <Zap className="h-2.5 w-2.5" /> Renewing
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className={`flex items-center gap-4 text-[10px] font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                                <span className="flex items-center gap-1.5"><RefreshCw className="h-3 w-3" /> {cycle}</span>
                                                {sub.item_metadata?.renewal_date && <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date(sub.item_metadata.renewal_date).toLocaleDateString()}</span>}
                                                {card && <span className="flex items-center gap-1.5 text-emerald-400/70"><Wallet className="h-3 w-3" /> {card.title}</span>}
                                            </div>
                                        </div>

                                        {/* Load Output */}
                                        <div className="flex items-center justify-between md:flex-col md:items-end gap-2 flex-shrink-0">
                                            <div className="flex flex-col md:items-end">
                                                <p className="text-3xl font-black italic tracking-tighter">${cost.toFixed(2)}</p>
                                                <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30">Cycle Terminal</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openEdit(sub)}
                                                    className="p-3 rounded-2xl bg-white/5 hover:bg-emerald-500/10 text-gray-600 hover:text-emerald-400 transition-all">
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(sub)}
                                                    className="p-3 rounded-2xl bg-white/5 hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}

            {activeView === "reminders" && (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="p-8 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-[2rem] bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                                <Bell className="h-8 w-8 text-black" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">Temporal Signal Ops</h3>
                                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-1">Imminent renewal detection & alerts</p>
                            </div>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Upcoming Node Load</p>
                            <p className="text-2xl font-black italic text-white">${reminders.reduce((acc, r) => acc + (parseFloat(r.item_metadata.cost) || 0), 0).toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reminders.length === 0 ? (
                            <div className="col-span-full py-20 text-center opacity-30 italic font-black uppercase text-xs tracking-[0.3em]">
                                No temporal triggers detected for next 30 solar cycles
                            </div>
                        ) : (
                            reminders.map(sub => (
                                <div key={sub.id} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-1.5 w-1.5 rounded-full ${sub.daysUntil <= 3 ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]' : 'bg-emerald-500 animate-pulse'}`} />
                                        <div>
                                            <p className="text-sm font-black uppercase text-white tracking-tight">{sub.title}</p>
                                            <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest">
                                                {sub.daysUntil === 0 ? "Firing Today" : sub.daysUntil < 0 ? "Overdue" : `Sync in ${sub.daysUntil} Days`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black italic text-emerald-400">${parseFloat(sub.item_metadata.cost).toFixed(2)}</p>
                                        <p className="text-[8px] font-black uppercase text-gray-600 tracking-tighter">{sub.item_metadata.billing_cycle}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeView === "insights" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Matrix Column 1: Financial DNA */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className={`p-10 rounded-[3rem] border ${isDark ? "bg-[#161616]/80 border-white/5 shadow-2xl" : "bg-white border-gray-100 shadow-xl"}`}>
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500 mb-10 flex items-center gap-3">
                                    <TrendingUp className="h-5 w-5 text-emerald-500" /> Sector Volume Distribution
                                </h3>
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                innerRadius={90}
                                                outerRadius={120}
                                                paddingAngle={8}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip 
                                                contentStyle={{ backgroundColor: '#121212', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', padding: '20px' }}
                                                itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {categoryData.map((err, idx) => (
                                        <div key={idx} className="flex flex-col gap-1 p-4 rounded-3xl bg-white/2 hover:bg-white/5 transition-all">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 truncate">{err.name}</span>
                                            </div>
                                            <p className="text-xl font-black italic tracking-tighter text-white">${err.value.toFixed(0)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Monthly Projection */}
                            <div className={`p-10 rounded-[3rem] border ${isDark ? "bg-[#161616]/80 border-white/5" : "bg-white border-gray-100 shadow-xl"}`}>
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500 mb-10 flex items-center gap-3">
                                    <ArrowDownLeft className="h-5 w-5 text-blue-500" /> Subscription Drift (Cash-Flow Impact)
                                </h3>
                                <div className="space-y-8">
                                    <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-red-500 transition-all duration-1000" style={{ width: `${Math.min(100, incomeImpact)}%` }} />
                                        {incomeImpact > 10 && (
                                            <div className="absolute top-0 h-full w-0.5 bg-white opacity-40 shadow-[0_0_10px_white]" style={{ left: '10%' }} />
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-6 rounded-[2rem] bg-white/2 border border-white/5">
                                            <p className="text-[8px] font-black uppercase text-gray-500 mb-2">Efficiency Rating</p>
                                            <p className={`text-xl font-black italic ${incomeImpact < 5 ? 'text-emerald-500' : incomeImpact < 15 ? 'text-amber-500' : 'text-red-500'}`}>
                                                {incomeImpact < 5 ? 'OPTIMAL' : incomeImpact < 15 ? 'NOMINAL' : 'CRITICAL'}
                                            </p>
                                        </div>
                                        <div className="p-6 rounded-[2rem] bg-white/2 border border-white/5">
                                            <p className="text-[8px] font-black uppercase text-gray-500 mb-2">Monthly Leakage</p>
                                            <p className="text-xl font-black italic text-white">${totalMonthly.toFixed(2)}</p>
                                        </div>
                                        <div className="p-6 rounded-[2rem] bg-white/2 border border-white/5">
                                            <p className="text-[8px] font-black uppercase text-gray-500 mb-2">Retention Cost</p>
                                            <p className="text-xl font-black italic text-white">${(totalMonthly * 0.85).toFixed(0)}+ Est.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Node Creep Analysis */}
                        <div className="space-y-8 lg:col-span-1">
                            <div className={`p-8 rounded-[3rem] border h-full ${isDark ? "bg-white/5 border-white/5 shadow-2xl relative overflow-hidden" : "bg-white border-gray-100 shadow-xl"}`}>
                                <div className="absolute -top-12 -right-12 h-40 w-40 bg-orange-500/10 blur-[60px] rounded-full" />
                                
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-8 flex items-center gap-3 font-mono">
                                    <ShieldAlert className="h-4 w-4" /> NODE CREEP ANALYSIS
                                </h3>

                                <div className="space-y-8 relative z-10">
                                    <div className="p-8 rounded-[2.5rem] bg-orange-500/5 border border-orange-500/10 text-center">
                                        <p className="text-[8px] font-black uppercase text-orange-200 opacity-60 mb-2 tracking-widest">Aggregate Annual Load</p>
                                        <p className="text-5xl font-black italic text-orange-500 tracking-tighter">${totalYearly.toFixed(0)}</p>
                                        <p className="text-[10px] text-gray-600 mt-4 leading-relaxed font-bold italic lowercase first-letter:uppercase">Structural integrity requires constant re-evaluation of recurring nodes.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 block underline">OPTIMIZATION TARGETS</span>
                                        {subscriptions.sort((a,b) => parseFloat(b.item_metadata?.cost) - parseFloat(a.item_metadata?.cost)).slice(0, 3).map(sub => (
                                            <div key={sub.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-red-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">{sub.title}</span>
                                                </div>
                                                <p className="text-sm font-black italic text-white">${parseFloat(sub.item_metadata.cost).toFixed(0)}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">
                                        <h4 className="text-[9px] font-black uppercase text-emerald-400 mb-2 flex items-center gap-2">
                                            <Sparkles className="h-3 w-3" /> STRATEGIC INTEL
                                        </h4>
                                        <p className="text-[10px] leading-relaxed text-gray-400 font-bold italic">
                                            {subscriptions.length > 8 
                                                ? "Node density is at high capacity. Consolidating 2-3 services could recover $340/year based on market pattern overlap."
                                                : "Node density remains nominal. Continue monitoring for recurring stream overlap."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Components */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in"
                    onClick={() => setIsAddModalOpen(false)}>
                    <div onClick={e => e.stopPropagation()}
                        className={`w-full md:max-w-xl rounded-t-[3rem] md:rounded-[3rem] p-10 shadow-3xl border animate-in slide-in-from-bottom-12 duration-500 relative overflow-hidden ${isDark ? "bg-[#0c0c0c] border-white/10" : "bg-white border-gray-100"}`}>
                        
                        {/* Background Glow */}
                        <div className="absolute -top-20 -left-20 h-64 w-64 bg-emerald-500/10 blur-[100px] rounded-full" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">{editingItem ? "RECONFIGURE NODE" : "INITIALIZE NODE"}</h2>
                                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mt-1">Assign periodic financial load parameters</p>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all flex items-center justify-center">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">SERVICE CALLSIGN *</label>
                                        <input required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                            className={`w-full px-6 py-4 rounded-2xl border text-sm font-bold placeholder:opacity-30 outline-none transition-all ${isDark ? "bg-white/5 border-white/10 focus:border-emerald-500/50 text-white" : "bg-gray-50 border-gray-200 focus:border-emerald-500"}`}
                                            placeholder="FLUX, SPECTER, CORE..." />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">FUNDING SIGNAL</label>
                                        <select value={formData.paymentMethodId} onChange={e => setFormData(p => ({ ...p, paymentMethodId: e.target.value }))}
                                            className={`w-full px-6 py-4 rounded-2xl border text-sm font-black uppercase tracking-tighter outline-none appearance-none ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`}>
                                            <option value="">STANDALONE</option>
                                            {paymentCards.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">RECURRING LOAD *</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-sm">$</span>
                                            <input required type="number" step="0.01" min="0" value={formData.cost}
                                                onChange={e => setFormData(p => ({ ...p, cost: e.target.value }))}
                                                className={`w-full pl-10 pr-6 py-4 rounded-2xl border text-sm font-black italic outline-none transition-all ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`}
                                                placeholder="0.00" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">FREQUENCY CYCLE</label>
                                        <select value={formData.cycle} onChange={e => setFormData(p => ({ ...p, cycle: e.target.value }))}
                                            className={`w-full px-6 py-4 rounded-2xl border text-sm font-black uppercase outline-none appearance-none ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`}>
                                            {BILLING_CYCLES.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">NODE SECTOR</label>
                                        <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                                            className={`w-full px-6 py-4 rounded-2xl border text-sm font-black uppercase outline-none appearance-none ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`}>
                                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">NEXT TEMPORAL SYNC (RENEWAL)</label>
                                        <input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                                            className={`w-full px-6 py-4 rounded-2xl border text-sm font-black outline-none ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200"}`} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <button type="submit"
                                        className="flex-1 py-5 rounded-[2rem] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase italic tracking-tighter text-sm shadow-2xl shadow-emerald-900/40 active:scale-95 transition-all flex items-center justify-center gap-3">
                                        <Check className="h-5 w-5" /> {editingItem ? "COMMIT CHANGES" : "SECURE NODE"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
