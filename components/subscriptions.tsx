"use client"

import { useState } from "react"
import { CreditCard, Plus, Search, Calendar, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react"

// Placeholder for now, can be moved to separate file later
interface SubscriptionsProps {
    records: any[]
    setRecords: (records: any[]) => void
    addItem: (item: any) => Promise<any>
    theme: string
}

export default function Subscriptions({ records = [], addItem, theme }: SubscriptionsProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // Filter for subscriptions
    const subscriptions = records.filter(r => r.category === "Subscriptions" || r.type === "subscription")
        .filter(r => r.title?.toLowerCase().includes(searchTerm.toLowerCase()) || r.name?.toLowerCase().includes(searchTerm.toLowerCase()))

    // Calculate total monthly cost
    const totalMonthly = subscriptions.reduce((sum, sub) => {
        const cost = parseFloat(sub.item_metadata?.cost || "0")
        const freq = sub.item_metadata?.billing_cycle || "monthly"
        if (freq === "yearly") return sum + (cost / 12)
        return sum + cost
    }, 0)

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50' : 'bg-[#1a1a1a]'} text-white overflow-hidden`}>
            {/* Header */}
            <div className="p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            Subscription Manager
                        </h1>
                        <p className="text-gray-400 mt-1">Track recurring expenses and renewal dates</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 p-4 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/20 rounded-lg"><DollarSign className="h-5 w-5 text-blue-400" /></div>
                            <span className="text-sm font-medium opacity-70">Monthly Cost</span>
                        </div>
                        <p className="text-2xl font-bold">${totalMonthly.toFixed(2)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 p-4 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-500/20 rounded-lg"><CreditCard className="h-5 w-5 text-purple-400" /></div>
                            <span className="text-sm font-medium opacity-70">Active Subscriptions</span>
                        </div>
                        <p className="text-2xl font-bold">{subscriptions.length}</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search subscriptions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)} // Open modal
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Subscription
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-3">
                {subscriptions.map(sub => (
                    <div key={sub.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xl font-bold">
                                {sub.title?.[0] || "?"}
                            </div>
                            <div>
                                <h3 className="font-bold">{sub.title}</h3>
                                <p className="text-sm text-gray-400 flex items-center gap-2">
                                    <Calendar className="h-3 w-3" /> {sub.item_metadata?.renewal_date ? `Renews ${sub.item_metadata.renewal_date}` : "No renewal date"}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg">${sub.item_metadata?.cost || "0.00"}</p>
                            <p className="text-xs uppercase tracking-wider opacity-50">{sub.item_metadata?.billing_cycle || "Monthly"}</p>
                        </div>
                    </div>
                ))}
                {subscriptions.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No subscriptions tracked yet.</p>
                    </div>
                )}
            </div>

            {/* Simple Add Modal Inline for speed, ideally separate file */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Add Subscription</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            const fd = new FormData(e.currentTarget)
                            addItem({
                                title: fd.get("name"),
                                type: "subscription",
                                category: "Subscriptions",
                                item_metadata: {
                                    cost: fd.get("cost"),
                                    billing_cycle: fd.get("cycle"),
                                    renewal_date: fd.get("date")
                                }
                            })
                            setIsAddModalOpen(false)
                        }} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Service Name</label>
                                <input name="name" required className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2" placeholder="Netflix, Spotify..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Cost</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                        <input name="cost" type="number" step="0.01" required className="w-full bg-black/40 border border-white/10 rounded-lg pl-6 pr-3 py-2" placeholder="0.00" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Cycle</label>
                                    <select name="cycle" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2">
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Next Renewal</label>
                                <input name="date" type="date" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2" />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium">Add Subscription</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
