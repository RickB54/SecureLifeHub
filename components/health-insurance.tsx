"use client"

import { useState, useEffect } from "react"
import { Plus, Shield, CreditCard, Phone, Upload, X, FileText, ChevronDown, Trash2, Edit, HelpCircle } from "lucide-react"

interface Props {
    records: any[]
    addItem: (item: any) => Promise<any>
    updateItem: (id: string, updates: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
    onOpenHelp?: (targetId?: string) => void
}

export default function HealthInsurance({ records, addItem, updateItem, deleteItem, theme, onOpenHelp }: Props) {
    const [policies, setPolicies] = useState<any[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    useEffect(() => {
        setPolicies(records.filter(r => r.type === "health-insurance"))
    }, [records])

    const glassCardStyle = theme === 'light'
        ? "bg-white/80 border border-gray-200 shadow-sm"
        : "bg-white/5 border border-white/10"

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50' : 'bg-[#121212]'} text-white overflow-hidden`}>
            {/* Header */}
            <div className="p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center gap-3">
                            <Shield className="h-8 w-8 text-blue-500" /> Health Insurance
                            <button onClick={() => onOpenHelp?.('type-medical')} className="p-1 hover:text-blue-400 opacity-50"><HelpCircle className="h-5 w-5" /></button>
                        </h1>
                        <p className="text-gray-400 mt-1">Manage cards, copays, and provider contacts.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add Policy
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
                {policies.length === 0 ? (
                    <div className={`p-12 text-center rounded-2xl border-2 border-dashed ${theme === 'light' ? 'border-gray-300' : 'border-white/10'}`}>
                        <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="opacity-50">No insurance policies added yet.</p>
                    </div>
                ) : (
                    policies.map(p => {
                        const isExpanded = expandedId === p.id
                        const metadata = p.item_metadata || {}

                        return (
                            <div key={p.id} className={`rounded-2xl overflow-hidden transition-all ${glassCardStyle}`}>
                                {/* Main Card Header */}
                                <div
                                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                                    className="p-6 cursor-pointer hover:bg-white/5 transition-colors flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${theme === 'light' ? 'bg-blue-50' : 'bg-blue-500/10'}`}>
                                            <CreditCard className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{p.title || metadata.planName}</h3>
                                            <div className="flex gap-4 mt-1 text-sm opacity-60">
                                                <span>Member ID: <span className="font-mono">{metadata.memberId || '---'}</span></span>
                                                {metadata.groupNumber && <span>Group: {metadata.groupNumber}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); if (confirm("Delete policy?")) deleteItem(p.id) }}
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
                                    <div className={`border-t p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>

                                        {/* Left: Info & Copays */}
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-black/20'}`}>
                                                    <span className="text-xs uppercase font-bold opacity-50 block mb-1">Policy Holder</span>
                                                    <span className="font-medium">{metadata.policyHolder || '---'}</span>
                                                </div>
                                                <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-black/20'}`}>
                                                    <span className="text-xs uppercase font-bold opacity-50 block mb-1">Rel. to Holder</span>
                                                    <span className="font-medium">{metadata.relationship || 'Self'}</span>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-3 flex items-center gap-2">
                                                    <DollarSignIcon /> Copays
                                                </h4>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <CopayCard label="PCP Visit" value={metadata.copayPcp} theme={theme} />
                                                    <CopayCard label="Specialist" value={metadata.copaySpecialist} theme={theme} />
                                                    <CopayCard label="Urgent Care" value={metadata.copayUrgent} theme={theme} />
                                                    <CopayCard label="Emergency" value={metadata.copayEr} theme={theme} />
                                                    <CopayCard label="Generic Rx" value={metadata.copayRxGen} theme={theme} />
                                                    <CopayCard label="Brand Rx" value={metadata.copayRxBrand} theme={theme} />
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-3 flex items-center gap-2">
                                                    <Phone className="h-4 w-4" /> Contacts
                                                </h4>
                                                <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-gray-50' : 'bg-black/20'} space-y-2 text-sm`}>
                                                    <div className="flex justify-between">
                                                        <span className="opacity-60">Member Services</span>
                                                        <span className="font-mono">{metadata.phoneMember || '---'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="opacity-60">Nurse Line</span>
                                                        <span className="font-mono">{metadata.phoneNurse || '---'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Card Images */}
                                        <div>
                                            <h4 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-4 flex items-center gap-2">
                                                <CreditCard className="h-4 w-4" /> Card Images
                                            </h4>

                                            <div className="space-y-4">
                                                <CardImage
                                                    label="Front of Card"
                                                    url={metadata.cardFrontUrl}
                                                    theme={theme}
                                                />
                                                <CardImage
                                                    label="Back of Card"
                                                    url={metadata.cardBackUrl}
                                                    theme={theme}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && <AddInsuranceModal onClose={() => setShowAddModal(false)} onAdd={addItem} theme={theme} />}
        </div>
    )
}

function CopayCard({ label, value, theme }: { label: string, value: string, theme: string }) {
    return (
        <div className={`p-3 rounded-lg text-center ${theme === 'light' ? 'bg-blue-50 text-blue-900' : 'bg-blue-900/20 text-blue-100'}`}>
            <span className="block text-[10px] uppercase font-bold opacity-60 mb-1">{label}</span>
            <span className="block font-bold">{value || '-'}</span>
        </div>
    )
}

function DollarSignIcon() {
    // Simple icon component to avoid huge import lists just for one icon in sub-component
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="1" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
    )
}

function CardImage({ label, url, theme }: { label: string, url: string, theme: string }) {
    return (
        <div className={`relative aspect-[1.586/1] rounded-xl overflow-hidden group ${theme === 'light' ? 'bg-gray-100 border border-gray-200' : 'bg-black/30 border border-white/10'}`}>
            {url ? (
                <img src={url} alt={label} className="w-full h-full object-cover" />
            ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-30">
                    <CreditCard className="h-8 w-8 mb-2" />
                    <span className="text-xs uppercase font-bold">{label} - No Image</span>
                </div>
            )}
        </div>
    )
}

function AddInsuranceModal({ onClose, onAdd, theme }: { onClose: () => void, onAdd: (i: any) => void, theme: string }) {
    const inputClass = `w-full p-3 rounded-xl mt-1 outline-none text-sm ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'} border border-transparent focus:border-blue-500 transition-colors`
    const labelClass = "text-xs uppercase font-bold opacity-50 ml-1"

    // Simple file handling for prototype (Base64)
    const handleFile = (e: any, setUrl: (s: string) => void) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5000000) { alert("File too large"); return }
        const r = new FileReader()
        r.onloadend = () => setUrl(r.result as string)
        r.readAsDataURL(file)
    }

    const [frontUrl, setFrontUrl] = useState("")
    const [backUrl, setBackUrl] = useState("")

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`${theme === 'light' ? 'bg-white' : 'bg-[#1e1e1e] border border-white/10'} w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6`}>
                <h2 className="text-xl font-bold mb-6">Add Health Insurance</h2>
                <form onSubmit={(e: any) => {
                    e.preventDefault()
                    const fd = new FormData(e.target)
                    onAdd({
                        type: "health-insurance",
                        title: fd.get("planName"),
                        item_metadata: {
                            planName: fd.get("planName"),
                            policyHolder: fd.get("policyHolder"),
                            relationship: fd.get("relationship"),
                            memberId: fd.get("memberId"),
                            groupNumber: fd.get("groupNumber"),
                            // Copays
                            copayPcp: fd.get("copayPcp"),
                            copaySpecialist: fd.get("copaySpecialist"),
                            copayUrgent: fd.get("copayUrgent"),
                            copayEr: fd.get("copayEr"),
                            copayRxGen: fd.get("copayRxGen"),
                            copayRxBrand: fd.get("copayRxBrand"),
                            // Contacts
                            phoneMember: fd.get("phoneMember"),
                            phoneNurse: fd.get("phoneNurse"),
                            // Images
                            cardFrontUrl: frontUrl,
                            cardBackUrl: backUrl
                        }
                    })
                    onClose()
                }} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className={labelClass}>Plan Name / Carrier</label>
                            <input name="planName" required className={inputClass} placeholder="e.g. Blue Cross Blue Shield PPO" />
                        </div>
                        <div>
                            <label className={labelClass}>Member ID</label>
                            <input name="memberId" required className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Group Number</label>
                            <input name="groupNumber" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Policy Holder Name</label>
                            <input name="policyHolder" required className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Relationship</label>
                            <select name="relationship" className={inputClass}>
                                <option value="Self">Self</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Child">Child</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-3 border-b border-gray-500/20 pb-2">Copays ($)</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <input name="copayPcp" className={inputClass} placeholder="PCP" />
                            <input name="copaySpecialist" className={inputClass} placeholder="Specialist" />
                            <input name="copayUrgent" className={inputClass} placeholder="Urgent Care" />
                            <input name="copayEr" className={inputClass} placeholder="Emergency" />
                            <input name="copayRxGen" className={inputClass} placeholder="Generic Rx" />
                            <input name="copayRxBrand" className={inputClass} placeholder="Brand Rx" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider opacity-60 mb-3 border-b border-gray-500/20 pb-2">Contacts</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input name="phoneMember" className={inputClass} placeholder="Member Services #" />
                            <input name="phoneNurse" className={inputClass} placeholder="24/7 Nurse Line #" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Front Image</label>
                            <input type="file" onChange={(e) => handleFile(e, setFrontUrl)} className="mt-1 text-sm" accept="image/*" />
                        </div>
                        <div>
                            <label className={labelClass}>Back Image</label>
                            <input type="file" onChange={(e) => handleFile(e, setBackUrl)} className="mt-1 text-sm" accept="image/*" />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className={`flex-1 py-3 rounded-xl font-medium ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5'}`}>Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold">Save Policy</button>
                    </div>

                </form>
            </div>
        </div>
    )
}
