"use client"

import { useState, useEffect } from "react"
import { Plus, Globe, Trash2, Key, Users, Shield, Copy, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface Props {
    records: any[]
    addItem: (item: any) => Promise<any>
    updateItem: (id: string, updates: any) => Promise<any>
    deleteItem: (id: string) => Promise<any>
    theme: string
}

export default function DigitalLife({ records, addItem, deleteItem, theme }: Props) {
    const [items, setItems] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState("assets") // assets, legacy, 2fa
    const [showAddModal, setShowAddModal] = useState(false)
    const [visibleCodes, setVisibleCodes] = useState<Record<string, boolean>>({})

    useEffect(() => {
        setItems(records.filter(r => r.category === "Digital Life" || r.item_metadata?.is_digital))
    }, [records])

    const assets = items.filter(i => !i.item_metadata?.is_legacy && !i.item_metadata?.is_2fa)
    const legacyContacts = items.filter(i => i.item_metadata?.is_legacy)
    const twoFaCodes = items.filter(i => i.item_metadata?.is_2fa)

    const glassCardStyle = theme === 'light'
        ? "bg-white/80 border border-gray-200 shadow-sm"
        : "bg-white/5 border border-white/10"

    const toggleCodeVisibility = (id: string) => {
        setVisibleCodes(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard")
    }

    return (
        <div className={`h-full flex flex-col ${theme === 'light' ? 'bg-gray-50' : 'bg-[#121212]'} text-white overflow-hidden`}>
            {/* Header */}
            <div className="p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
                            <Globe className="h-8 w-8 text-cyan-500" /> Digital Life
                        </h1>
                        <p className="text-gray-400 mt-1">Manage online assets, legacy contacts, and recovery codes.</p>
                    </div>
                </div>

                {/* Tags / Tabs */}
                <div className="flex gap-4 border-b border-white/10 pb-4">
                    {['assets', 'legacy', '2fa'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === tab
                                    ? "bg-cyan-500 text-black"
                                    : "text-gray-400 hover:text-white"
                                }`}
                        >
                            {tab === 'assets' && <Globe className="h-4 w-4" />}
                            {tab === 'legacy' && <Users className="h-4 w-4" />}
                            {tab === '2fa' && <Shield className="h-4 w-4" />}
                            {tab === 'assets' ? 'Online Assets' : tab === 'legacy' ? 'Legacy Contacts' : '2FA Backups'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">

                {/* === ASSETS TAB === */}
                {activeTab === 'assets' && (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-bold">
                                <Plus className="h-4 w-4 mr-2" /> Add Asset
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assets.length === 0 ? (
                                <div className={`col-span-full p-12 text-center rounded-2xl border-2 border-dashed ${theme === 'light' ? 'border-gray-300' : 'border-white/10'}`}>
                                    <Globe className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p className="opacity-50">No digital assets tracked.</p>
                                </div>
                            ) : (
                                assets.map(item => (
                                    <div key={item.id} className={`p-6 rounded-2xl group ${glassCardStyle}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
                                                <Globe className="h-5 w-5" />
                                            </div>
                                            <button onClick={() => { if (confirm("Delete asset?")) deleteItem(item.id) }} className="opacity-0 group-hover:opacity-100 text-red-500 p-1 hover:bg-red-500/10 rounded">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <h3 className={`font-bold text-lg mb-1 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{item.title}</h3>
                                        <div className="text-xs font-mono opacity-50 mb-4">{item.item_metadata?.digitalType}</div>
                                        <div className="p-3 rounded-lg bg-black/20 text-sm font-mono break-all opacity-80">
                                            {item.item_metadata?.url || 'No URL'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* === LEGACY TAB === */}
                {activeTab === 'legacy' && (
                    <div className="space-y-6">
                        <div className={`p-6 rounded-2xl ${theme === 'light' ? 'bg-blue-50 text-blue-900' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                            <div className="flex items-start gap-4">
                                <Users className="h-8 w-8 text-blue-500" />
                                <div>
                                    <h3 className="font-bold text-lg">Digital Heir</h3>
                                    <p className="text-sm opacity-70 mt-1 max-w-2xl">
                                        Designate a trusted contact who can access your digital life in case of emergency.
                                        This information is stored securely in your vault.
                                    </p>
                                </div>
                                <button onClick={() => setShowAddModal(true)} className="ml-auto flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20">
                                    <Plus className="h-4 w-4 mr-2" /> Add Contact
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {legacyContacts.map(contact => (
                                <div key={contact.id} className={`p-6 rounded-2xl relative overflow-hidden ${glassCardStyle}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-xl font-bold text-white">
                                            {contact.title.charAt(0)}
                                        </div>
                                        <button onClick={() => { if (confirm("Remove contact?")) deleteItem(contact.id) }} className="text-red-500 p-2 hover:bg-red-500/10 rounded">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{contact.title}</h3>
                                    <p className="opacity-50 text-sm mb-4">{contact.item_metadata?.relation || 'Trusted Contact'}</p>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between p-2 rounded bg-black/5 dark:bg-white/5">
                                            <span className="opacity-50">Email</span>
                                            <span>{contact.item_metadata?.email}</span>
                                        </div>
                                        <div className="flex justify-between p-2 rounded bg-black/5 dark:bg-white/5">
                                            <span className="opacity-50">Phone</span>
                                            <span>{contact.item_metadata?.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* === 2FA TAB === */}
                {activeTab === '2fa' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold opacity-80">Backup Codes</h2>
                            <button onClick={() => setShowAddModal(true)} className="flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-bold">
                                <Plus className="h-4 w-4 mr-2" /> Add Codes
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {twoFaCodes.map(code => (
                                <div key={code.id} className={`p-6 rounded-2xl ${glassCardStyle}`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className={`font-bold text-lg flex items-center gap-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                            <Key className="h-4 w-4 text-cyan-500" /> {code.title}
                                        </h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => toggleCodeVisibility(code.id)} className="p-2 hover:bg-white/10 rounded text-cyan-400">
                                                {visibleCodes[code.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                            <button onClick={() => copyToClipboard(code.item_metadata?.codes)} className="p-2 hover:bg-white/10 rounded text-cyan-400">
                                                <Copy className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => { if (confirm("Delete codes?")) deleteItem(code.id) }} className="p-2 hover:bg-red-500/10 rounded text-red-500">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-xl font-mono text-sm leading-relaxed whitespace-pre-wrap ${theme === 'light' ? 'bg-gray-100 text-gray-800' : 'bg-black/30 text-cyan-100'}`}>
                                        {visibleCodes[code.id] ? code.item_metadata?.codes : '•••••••• •••••••• •••••••• ••••••••\n•••••••• •••••••• •••••••• ••••••••'}
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
                            {activeTab === 'assets' ? 'Add Digital Asset' : activeTab === 'legacy' ? 'Add Legacy Contact' : 'Add Backup Codes'}
                        </h2>

                        <form onSubmit={(e: any) => {
                            e.preventDefault()
                            const fd = new FormData(e.target)
                            const baseItem = {
                                type: "note",
                                category: "Digital Life",
                                title: fd.get("title"),
                                item_metadata: {
                                    is_digital: true,
                                    // Merging all specific fields
                                    is_legacy: activeTab === 'legacy',
                                    is_2fa: activeTab === '2fa',
                                    digitalType: fd.get("digitalType"),
                                    url: fd.get("url"),
                                    notes: fd.get("notes"),

                                    // Legacy fields
                                    relation: fd.get("relation"),
                                    email: fd.get("email"),
                                    phone: fd.get("phone"),

                                    // 2FA fields
                                    codes: fd.get("codes")
                                }
                            }
                            addItem(baseItem)
                            setShowAddModal(false)
                        }} className="space-y-4">

                            {/* Dynamic Form Fields */}
                            <div>
                                <label className="text-xs font-bold opacity-50 uppercase ml-1 block mb-1">
                                    {activeTab === 'assets' ? 'Asset Name' : activeTab === 'legacy' ? 'Contact Name' : 'Service Name'}
                                </label>
                                <input name="title" required className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder={activeTab === 'assets' ? 'e.g. GoDaddy' : activeTab === 'legacy' ? 'e.g. John Doe' : 'e.g. Google Backup Codes'} />
                            </div>

                            {activeTab === 'assets' && (
                                <>
                                    <select name="digitalType" className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`}>
                                        <option value="domain">Domain / Hosting</option>
                                        <option value="social">Social Media</option>
                                        <option value="subscription">Subscription</option>
                                        <option value="license">License Key</option>
                                    </select>
                                    <input name="url" className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="URL" />
                                </>
                            )}

                            {activeTab === 'legacy' && (
                                <>
                                    <input name="relation" className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Relationship (e.g. Spouse, Lawyer)" />
                                    <input name="email" type="email" className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Email" />
                                    <input name="phone" className={`w-full p-3 rounded-xl outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Phone" />
                                </>
                            )}

                            {activeTab === '2fa' && (
                                <div>
                                    <label className="text-xs font-bold opacity-50 uppercase ml-1 block mb-1">Backup Codes (Paste here)</label>
                                    <textarea name="codes" rows={5} className={`w-full p-3 rounded-xl font-mono text-sm outline-none ${theme === 'light' ? 'bg-gray-100' : 'bg-black/30'}`} placeholder="Paste your recovery codes here..." />
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className={`flex-1 py-3 rounded-xl font-medium ${theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-300'}`}>Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
