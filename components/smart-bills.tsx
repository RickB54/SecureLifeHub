"use client"

import { useState } from "react"
import { CreditCard, Calendar, Plus, Trash2, CheckCircle2, Circle, AlertCircle, TrendingUp, DollarSign, Wallet, ArrowRight } from "lucide-react"
import { toast } from "sonner"

interface BillsProps {
    records: any[]
    addItem: (item: any) => Promise<any>
    updateItem: (id: string, updates: any) => Promise<void>
    deleteItem: (id: string) => Promise<void>
    theme: string
}

export default function SmartBills({ records = [], addItem, updateItem, deleteItem, theme }: BillsProps) {
    const bills = records.filter(r => r.type === "smart-bill")
    const glassCardStyle = theme === 'light'
        ? "bg-white/80 border border-gray-200 shadow-sm"
        : "bg-white/5 border border-white/10"

    const totalMonthly = bills.reduce((acc, b) => acc + (b.item_metadata?.amount || 0), 0)
    const paidCount = bills.filter(b => b.item_metadata?.paid).length
    const unpaidCount = bills.length - paidCount

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50' : 'bg-[#121212]'} text-white overflow-hidden p-8`}>
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="text-3xl font-black italic bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-600 uppercase flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-emerald-500" /> Smart Bill Tracker
                    </h1>
                    <p className="text-gray-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Secure your cashflow architecture</p>
                </div>
                <div className="flex gap-4">
                    <div className={`p-6 rounded-3xl ${glassCardStyle} flex flex-col items-center justify-center text-center min-w-[140px]`}>
                        <div className="text-2xl font-black italic text-emerald-500">${totalMonthly.toFixed(2)}</div>
                        <div className="text-[10px] font-black uppercase text-gray-500">Monthly Projection</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className={`p-6 rounded-[2rem] bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-green-500/20 flex items-center justify-between`}>
                    <div className="p-4 rounded-2xl bg-emerald-500 text-black shadow-xl shadow-emerald-900/40">
                        <DollarSign className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black italic text-white">{bills.length}</div>
                        <div className="text-[10px] font-black uppercase text-gray-400">Tracked Bills</div>
                    </div>
                </div>
                <div className={`p-6 rounded-[2rem] bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-between`}>
                    <div className="p-4 rounded-2xl bg-blue-500 text-white shadow-xl shadow-blue-900/40">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black italic text-white">{paidCount}</div>
                        <div className="text-[10px] font-black uppercase text-gray-400">Paid</div>
                    </div>
                </div>
                <div className={`p-6 rounded-[2rem] bg-gradient-to-br from-red-500/20 to-orange-600/20 border border-red-500/20 flex items-center justify-between`}>
                    <div className="p-4 rounded-2xl bg-red-500 text-white shadow-xl shadow-red-900/40">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black italic text-white">{unpaidCount}</div>
                        <div className="text-[10px] font-black uppercase text-gray-400">Awaiting Settlement</div>
                    </div>
                </div>
            </div>

            <div className={`flex-1 overflow-y-auto rounded-[2.5rem] ${glassCardStyle} p-8 custom-scrollbar`}>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 italic">Settlement Registry</h3>
                    <button 
                        onClick={async () => {
                            const name = prompt("Bill Name:")
                            const amount = prompt("Amount:")
                            const due = prompt("Due Date (e.g. 15th):")
                            if (!name || !amount) return
                            await addItem({
                                type: "smart-bill",
                                title: name,
                                category: "Financial",
                                item_metadata: {
                                    amount: parseFloat(amount),
                                    due,
                                    paid: false
                                }
                            })
                        }}
                        className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase italic tracking-tighter shadow-xl shadow-emerald-900/20 active:scale-95 transition-all text-xs flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add Bill
                    </button>
                </div>

                <div className="space-y-4">
                    {bills.length === 0 ? (
                        <div className="text-center py-20 opacity-20 flex flex-col items-center">
                            <Wallet className="h-12 w-12 mb-4" />
                            <p className="font-black uppercase tracking-widest italic">Vault Empty. No debits tracked.</p>
                        </div>
                    ) : (
                        bills.map(bill => (
                            <div key={bill.id} className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                                <div className="flex items-center gap-6">
                                    <div 
                                        onClick={async () => await updateItem(bill.id, { item_metadata: { ...bill.item_metadata, paid: !bill.item_metadata.paid } })}
                                        className={`h-12 w-12 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all ${bill.item_metadata.paid ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-900/40' : 'border-white/10 hover:border-emerald-500/50 text-transparent'}`}
                                    >
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-black uppercase italic text-white tracking-tight">{bill.title}</div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
                                            <Calendar className="h-3 w-3" /> Due {bill.item_metadata.due}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10">
                                    <div className="text-right">
                                        <div className="text-xl font-black italic text-emerald-500">${bill.item_metadata.amount.toFixed(2)}</div>
                                        <div className={`text-[8px] font-black uppercase ${bill.item_metadata.paid ? 'text-emerald-500' : 'text-gray-600'}`}>
                                            {bill.item_metadata.paid ? 'Settled' : 'Unpaid'}
                                        </div>
                                    </div>
                                    <button onClick={() => deleteItem(bill.id)} className="p-3 text-gray-700 hover:text-red-500 hover:bg-white/5 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
