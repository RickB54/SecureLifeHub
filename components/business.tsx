"use client"

import { useState, useEffect } from "react"
import { Plus, Briefcase, Users, FileText, Trash2, TrendingUp, AlertCircle, DollarSign, Calendar } from "lucide-react"

interface Props {
    records: any[]
    addItem: (item: any) => Promise<any>
    updateItem: (id: string, updates: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
}

export default function Business({ records, addItem, deleteItem, theme }: Props) {
    const [items, setItems] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState("overview") // overview, taxes, finance
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        setItems(records.filter(r => r.category === "Business" || r.item_metadata?.is_business))
    }, [records])

    const taxes = items.filter(i => i.item_metadata?.bizType === 'tax')
    const finances = items.filter(i => i.item_metadata?.bizType === 'income' || i.item_metadata?.bizType === 'expense')
    const general = items.filter(i => !['tax', 'income', 'expense'].includes(i.item_metadata?.bizType))

    const glassCardStyle = theme === 'light'
        ? "bg-white/80 border border-gray-200 shadow-sm"
        : "bg-white/5 border border-white/10"

    const calculateTotal = (type: 'income' | 'expense') => {
        return finances
            .filter(i => i.item_metadata?.bizType === type)
            .reduce((acc, curr) => acc + (parseFloat(curr.item_metadata?.amount) || 0), 0)
    }

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50' : 'bg-[#121212]'} text-white overflow-hidden`}>
            {/* Header */}
            <div className="p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-400 to-gray-500 flex items-center gap-3">
                            <Briefcase className="h-8 w-8 text-slate-500" /> Business Hub
                        </h1>
                        <p className="text-gray-400 mt-1">Manage clients, taxes, and side-hustle finances.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-white/10 pb-4">
                    {['overview', 'taxes', 'finance'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === tab
                                    ? "bg-slate-500 text-white"
                                    : "text-gray-400 hover:text-white"
                                }`}
                        >
                            {tab === 'overview' && <Briefcase className="h-4 w-4" />}
                            {tab === 'taxes' && <FileText className="h-4 w-4" />}
                            {tab === 'finance' && <DollarSign className="h-4 w-4" />}
                            {tab === 'finance' ? 'Income & Expenses' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">

                {/* === OVERVIEW TAB === */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm font-bold">
                                <Plus className="h-4 w-4 mr-2" /> Add Project/Client
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {general.length === 0 ? (
                                <div className={`col-span-full p-12 text-center rounded-2xl border-2 border-dashed ${theme === 'light' ? 'border-gray-300' : 'border-white/10'}`}>
                                    <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p className="opacity-50">No active projects or clients.</p>
                                </div>
                            ) : (
                                general.map(item => (
                                    <div key={item.id} className={`p-6 rounded-2xl group ${glassCardStyle}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-2 rounded-lg bg-slate-500/10 text-slate-500">
                                                {item.item_metadata?.bizType === 'client' ? <Users className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
                                            </div>
                                            <button onClick={() => { if (confirm("Delete record?")) deleteItem(item.id) }} className="opacity-0 group-hover:opacity-100 text-red-500 p-1 hover:bg-red-500/10 rounded">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <h3 className={`font-bold text-lg mb-1 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{item.title}</h3>
                                        <span className="text-xs font-mono uppercase bg-white/5 px-2 py-1 rounded opacity-60">
                                            {item.item_metadata?.bizType}
                                        </span>
                                        <p className="mt-4 text-sm opacity-70 line-clamp-2">{item.item_metadata?.details}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* === TAXES TAB === */}
                {activeTab === 'taxes' && (
                    <div className="space-y-6">
                        <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-indigo-50 text-indigo-900' : 'bg-indigo-500/10 border border-indigo-500/20'}`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" /> Tax Compliance Tracker
                                    </h3>
                                    <p className="text-sm opacity-70 mt-1">Track estimated payments, filings, and deadlines.</p>
                                </div>
                                <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold">
                                    <Plus className="h-4 w-4 mr-2" /> Add Filing
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {taxes.map(tax => (
                                <div key={tax.id} className={`p-4 rounded-xl flex items-center justify-between ${glassCardStyle}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                                            <Calendar className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{tax.title}</h4>
                                            <p className="text-sm opacity-60">Due: {tax.item_metadata?.dueDate || 'No Date'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${tax.item_metadata?.status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                            {tax.item_metadata?.status || 'Pending'}
                                        </span>
                                        <button onClick={() => { if (confirm("Delete?")) deleteItem(tax.id) }} className="text-red-500 p-2 hover:bg-red-500/10 rounded">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* === FINANCE TAB === */}
                {activeTab === 'finance' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-green-50 text-green-900' : 'bg-green-500/10 border border-green-500/20'}`}>
                                <h3 className="text-sm font-bold uppercase opacity-60">Total Income</h3>
                                <div className="text-3xl font-mono font-bold mt-2 text-green-500">
                                    +${calculateTotal('income').toLocaleString()}
                                </div>
                            </div>
                            <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-red-50 text-red-900' : 'bg-red-500/10 border border-red-500/20'}`}>
                                <h3 className="text-sm font-bold uppercase opacity-60">Total Expenses</h3>
                                <div className="text-3xl font-mono font-bold mt-2 text-red-500">
                                    -${calculateTotal('expense').toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-8 mb-4">
                            <h3 className="font-bold opacity-80">Ledger</h3>
                            <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold">
                                <Plus className="h-4 w-4 mr-2" /> Log Transaction
                            </button>
                        </div>

                        <div className={`rounded-2xl overflow-hidden ${glassCardStyle}`}>
                            {finances.map((item, idx) => (
                                <div key={item.id} className={`p-4 flex justify-between items-center ${idx !== finances.length - 1 ? 'border-b border-white/5' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-10 rounded-full ${item.item_metadata?.bizType === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <div>
                                            <div className={`font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{item.title}</div>
                                            <div className="text-xs opacity-50">{new Date(item.item_metadata?.date || Date.now()).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-mono font-bold ${item.item_metadata?.bizType === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                            {item.item_metadata?.bizType === 'income' ? '+' : '-'}${parseFloat(item.item_metadata?.amount).toLocaleString()}
                                        </span>
                                        <button onClick={() => { if (confirm("Delete transaction?")) deleteItem(item.id) }} className="text-gray-500 hover:text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'} w-full max-w-lg rounded-2xl p-6 shadow-2xl`}>
                        <h2 className={`text-xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                            {activeTab === 'overview' ? 'Add Asset' : activeTab === 'taxes' ? 'Add Tax Record' : 'Log Transaction'}
                        </h2>

                        <form onSubmit={(e: any) => {
                            e.preventDefault()
                            const fd = new FormData(e.target)
                            const baseItem = {
                                type: "note",
                                category: "Business",
                                title: fd.get("title"),
                                item_metadata: {
                                    is_business: true,
                                    bizType: fd.get("bizType"),
                                    details: fd.get("details"),
                                    amount: fd.get("amount"),
                                    date: fd.get("date"),
                                    dueDate: fd.get("dueDate"),
                                    status: fd.get("status")
                                }
                            }
                            addItem(baseItem)
                            setShowAddModal(false)
                        }} className="space-y-4">

                            {activeTab === 'overview' && (
                                <>
                                    <select name="bizType" className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}>
                                        <option value="client">Client</option>
                                        <option value="contract">Contract</option>
                                        <option value="project">Project</option>
                                    </select>
                                    <input name="title" required className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Name (e.g. Acme Corp)" />
                                    <textarea name="details" className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Details..." />
                                </>
                            )}

                            {activeTab === 'taxes' && (
                                <>
                                    <input type="hidden" name="bizType" value="tax" />
                                    <input name="title" required className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Filing Name (e.g. Q3 Estimated Tax)" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs uppercase font-bold opacity-50 ml-1">Due Date</label>
                                            <input name="dueDate" type="date" required className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} style={{ colorScheme: theme }} />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase font-bold opacity-50 ml-1">Status</label>
                                            <select name="status" className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}>
                                                <option value="pending">Pending</option>
                                                <option value="filed">Filed</option>
                                                <option value="paid">Paid</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'finance' && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <select name="bizType" className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}>
                                            <option value="income">Income (+)</option>
                                            <option value="expense">Expense (-)</option>
                                        </select>
                                        <input name="amount" type="number" step="0.01" required className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Amount" />
                                    </div>
                                    <input name="title" required className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Description (e.g. Invoiced Client A)" />
                                    <input name="date" type="date" required className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} style={{ colorScheme: theme }} />
                                </>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className={`flex-1 py-3 rounded-xl font-medium ${theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-300'}`}>Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-bold shadow-lg shadow-slate-500/20">Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
