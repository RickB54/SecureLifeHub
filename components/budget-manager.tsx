"use client"

import { useState, useEffect } from "react"
import { PieChart, Plus, DollarSign, Trash2, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react"

interface Props {
    records: any[]
    addItem: (item: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
}

export default function BudgetManager({ records, addItem, deleteItem, theme }: Props) {
    const [items, setItems] = useState<any[]>([])
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        setItems(records.filter(r => r.category === "Budget" || r.item_metadata?.is_budget))
    }, [records])

    const totalBudget = items.reduce((acc, item) => acc + (parseFloat(item.item_metadata?.limit) || 0), 0)
    const totalSpent = items.reduce((acc, item) => acc + (parseFloat(item.item_metadata?.spent) || 0), 0)
    const remaining = totalBudget - totalSpent
    const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    const glassCardStyle = theme === 'light'
        ? "bg-white/80 border border-gray-200 shadow-sm"
        : "bg-white/5 border border-white/10"

    const inputStyle = `w-full px-4 py-3 rounded-xl outline-none transition-all ${theme === 'light'
            ? 'bg-gray-50 border border-gray-200 focus:border-blue-500 text-gray-900'
            : 'bg-black/20 border border-white/10 focus:border-blue-500 text-white'
        }`

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50' : 'bg-[#121212]'} text-white overflow-hidden`}>
            {/* Header Area */}
            <div className="p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center gap-3">
                            <PieChart className="h-8 w-8 text-blue-500" /> Budget Manager
                        </h1>
                        <p className="text-gray-400 mt-1">Track monthly spending limits and expenses.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Category
                    </button>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className={`p-5 rounded-2xl ${glassCardStyle}`}>
                        <div className="flex items-center gap-3 mb-2 opacity-60">
                            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400"><DollarSign className="h-4 w-4" /></div>
                            <span className="text-sm font-medium">Total Limit</span>
                        </div>
                        <div className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                            ${totalBudget.toLocaleString()}
                        </div>
                    </div>
                    <div className={`p-5 rounded-2xl ${glassCardStyle}`}>
                        <div className="flex items-center gap-3 mb-2 opacity-60">
                            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400"><ArrowUpRight className="h-4 w-4" /></div>
                            <span className="text-sm font-medium">Total Spent</span>
                        </div>
                        <div className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                            ${totalSpent.toLocaleString()}
                        </div>
                    </div>
                    <div className={`p-5 rounded-2xl ${glassCardStyle}`}>
                        <div className="flex items-center gap-3 mb-2 opacity-60">
                            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><ArrowDownRight className="h-4 w-4" /></div>
                            <span className="text-sm font-medium">Remaining</span>
                        </div>
                        <div className={`text-2xl font-bold ${remaining < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            ${remaining.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Main Progress Bar */}
                <div className={`p-1 rounded-full mb-8 h-4 overflow-hidden ${theme === 'light' ? 'bg-gray-200' : 'bg-white/10'}`}>
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${percentUsed > 100 ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    />
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-3">
                {items.length === 0 ? (
                    <div className="text-center py-20 opacity-40">
                        <TrendingUp className="h-16 w-16 mx-auto mb-4" />
                        <p>No budget categories set. Add one to start tracking.</p>
                    </div>
                ) : (
                    items.map(item => {
                        const limit = parseFloat(item.item_metadata?.limit) || 0
                        const spent = parseFloat(item.item_metadata?.spent) || 0
                        const pct = limit > 0 ? (spent / limit) * 100 : 0
                        const isOver = spent > limit

                        return (
                            <div key={item.id} className={`p-5 rounded-2xl flex items-center justify-between group transition-colors ${glassCardStyle} hover:border-blue-500/30`}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className={`font-bold text-lg ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{item.title}</h3>
                                        {isOver && <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">OVER BUDGET</span>}
                                    </div>
                                    {/* Progress Bar for Item */}
                                    <div className="w-full max-w-sm h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${isOver ? 'bg-rose-500' : 'bg-blue-500'}`}
                                            style={{ width: `${Math.min(pct, 100)}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {pct.toFixed(0)}% used
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className={`text-xl font-bold ${isOver ? 'text-rose-500' : (theme === 'light' ? 'text-gray-900' : 'text-white')}`}>
                                            ${spent.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500">of ${limit.toLocaleString()}</div>
                                    </div>
                                    <button
                                        onClick={() => { if (confirm("Delete budget category?")) deleteItem(item.id) }}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-rose-500 transition-all"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'} w-full max-w-md rounded-2xl p-6 shadow-2xl`}>
                        <h2 className={`text-xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>New Budget Category</h2>
                        <form onSubmit={(e: any) => {
                            e.preventDefault()
                            const fd = new FormData(e.target)
                            addItem({
                                type: "note",
                                category: "Budget",
                                title: fd.get("title"),
                                item_metadata: {
                                    is_budget: true,
                                    limit: fd.get("limit"),
                                    spent: fd.get("spent")
                                }
                            })
                            setShowAddModal(false)
                        }} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Category Name</label>
                                <input name="title" required className={inputStyle} placeholder="e.g. Groceries" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Monthly Limit</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input name="limit" type="number" step="0.01" required className={`${inputStyle} pl-9`} placeholder="0.00" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">Spent So Far</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input name="spent" type="number" step="0.01" className={`${inputStyle} pl-9`} placeholder="0.00" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button type="button" onClick={() => setShowAddModal(false)} className={`flex-1 py-3 rounded-xl font-medium ${theme === 'light' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25">Save Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
