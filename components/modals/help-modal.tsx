"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight, BookOpen, Shield, Heart, Activity, Briefcase, Car, Plane, Target, Settings, HelpCircle, LayoutDashboard, Database, Key, CreditCard, User, Globe, FileText, Smartphone } from "lucide-react"

interface HelpPage {
    id: string
    title: string
    icon: any
    content: React.ReactNode
}

const HELP_PAGES: HelpPage[] = [
    {
        id: "intro",
        title: "Welcome to Secure Life Hub",
        icon: BookOpen,
        content: (
            <div className="space-y-4">
                <p className="text-lg text-gray-300 leading-relaxed">
                    Secure Life Hub is your all-in-one private ecosystem for managing every aspect of your life—from digital security to physical health and business assets.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2"><Shield className="h-4 w-4" /> Privacy First</h4>
                        <p className="text-sm text-gray-400">All your data is encrypted and stored securely in your private vault. We never see your secrets.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <h4 className="font-bold text-purple-400 mb-2 flex items-center gap-2"><Globe className="h-4 w-4" /> Global Access</h4>
                        <p className="text-sm text-gray-400">Synchronize your data across all your devices using our Chrome Extension and Web App.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "dashboard",
        title: "Main Dashboard",
        icon: LayoutDashboard,
        content: (
            <div className="space-y-4">
                <p className="text-gray-300">The Mission Control of your life. Here you get a bird's eye view of your entire vault.</p>
                <ul className="space-y-3">
                    <li className="flex gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                        <div><span className="font-bold text-white">Security Score:</span> Live monitoring of your password health and potential risks.</div>
                    </li>
                    <li className="flex gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                        <div><span className="font-bold text-white">Health Snapshot:</span> Quick look at your current medication streak and vital stats.</div>
                    </li>
                    <li className="flex gap-3">
                        <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                        <div><span className="font-bold text-white">Recent Activity:</span> Track the latest changes made to your secure records.</div>
                    </li>
                </ul>
            </div>
        )
    },
    {
        id: "passwords",
        title: "Passwords & Secrets",
        icon: Key,
        content: (
            <div className="space-y-4">
                <p className="text-gray-300">Beyond just passwords—store everything that needs to stay secret.</p>
                <div className="space-y-4">
                    <div className="p-4 border border-white/5 bg-black/20 rounded-xl">
                        <span className="text-xs font-black text-gray-500 uppercase block mb-1">Categories</span>
                        <p className="text-sm text-gray-400">Organize by Logins, Servers, SSH Keys, Databases, Software Licenses, and Secure Notes.</p>
                    </div>
                    <div className="p-4 border border-white/5 bg-black/20 rounded-xl">
                        <span className="text-xs font-black text-gray-500 uppercase block mb-1">Generator</span>
                        <p className="text-sm text-gray-400">Use the built-in generator to create military-grade passwords for any service.</p>
                    </div>
                    <div className="p-4 border border-white/5 bg-black/20 rounded-xl">
                        <span className="text-xs font-black text-gray-500 uppercase block mb-1">Auto-Fill</span>
                        <p className="text-sm text-gray-400">Install the Chrome Extension to automatically fill your credentials on any website.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "health",
        title: "Health Hub",
        icon: Heart,
        content: (
            <div className="space-y-4">
                <p className="text-gray-300">A comprehensive medical dashboard for you and your family.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                        <h5 className="font-bold text-rose-400 text-sm mb-1 uppercase">Medication Timeline</h5>
                        <p className="text-xs text-gray-400">Track doses (Taken/Skipped/Missed) with specialized tapering schedules.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                        <h5 className="font-bold text-blue-400 text-sm mb-1 uppercase">Vital Logging</h5>
                        <p className="text-xs text-gray-400">Monitor Blood Pressure, Weight, and more with AI-informed context tracking.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                        <h5 className="font-bold text-indigo-400 text-sm mb-1 uppercase">AI Dr Assistant</h5>
                        <p className="text-xs text-gray-400">Get clinical insights and research on your symptoms (Educational use only).</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <h5 className="font-bold text-emerald-400 text-sm mb-1 uppercase">Medical Records</h5>
                        <p className="text-xs text-gray-400">Securely store clinic records, visit notes, and diagnostic images.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "finance",
        title: "Finance & Assets",
        icon: CreditCard,
        content: (
            <div className="space-y-4">
                <p className="text-gray-300">Manage your physical and digital wealth securely.</p>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <CreditCard className="h-5 w-5 text-blue-400" />
                        <div>
                            <div className="text-sm font-bold">Credit/Debit Cards</div>
                            <div className="text-xs text-gray-500">Secure storage for card numbers, CVVs, and billing dates.</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <Briefcase className="h-5 w-5 text-emerald-400" />
                        <div>
                            <div className="text-sm font-bold">Business Hub</div>
                            <div className="text-xs text-gray-500">Track client info, business docs, and professional registrations.</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <Database className="h-5 w-5 text-amber-400" />
                        <div>
                            <div className="text-sm font-bold">Assets & Inventory</div>
                            <div className="text-xs text-gray-500">Log high-value property, warranties, and serial numbers.</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "mobility",
        title: "Travel & Mobility",
        icon: Plane,
        content: (
            <div className="space-y-4">
                <p className="text-gray-300">Keep your documents ready for the road or the runway.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-white/5">
                        <Car className="h-6 w-6 text-blue-400 mb-2" />
                        <h5 className="font-bold text-sm">Vehicle Hub</h5>
                        <p className="text-xs text-gray-400">Maintenance logs, registration renewals, and insurance cards.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-white/5">
                        <Plane className="h-6 w-6 text-purple-400 mb-2" />
                        <h5 className="font-bold text-sm">Travel Documents</h5>
                        <p className="text-xs text-gray-400">Passports, Visas, Frequent Flyer numbers, and Trip itineraries.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "settings",
        title: "Settings & Security",
        icon: Settings,
        content: (
            <div className="space-y-4">
                <p className="text-gray-300">Customize your experience and strengthen your vault.</p>
                <div className="space-y-2">
                    <p className="text-sm text-gray-400"><span className="text-white font-bold">Auto-Lock:</span> Configure inactivity timeouts for maximum security.</p>
                    <p className="text-sm text-gray-400"><span className="text-white font-bold">Theming:</span> Switch between clinical Dark and pristine Light modes.</p>
                    <p className="text-sm text-gray-400"><span className="text-white font-bold">Sync:</span> Connect to Supabase for real-time cross-device synchronization.</p>
                    <p className="text-sm text-gray-400"><span className="text-white font-bold">SSO:</span> Use Single Sign-On for a seamless login experience via the extension.</p>
                </div>
            </div>
        )
    }
]

export default function HelpModal({ isOpen, onClose, theme }: { isOpen: boolean, onClose: () => void, theme: string }) {
    const [currentPageIndex, setCurrentPageIndex] = useState(0)
    const [showMobileTOC, setShowMobileTOC] = useState(false)

    if (!isOpen) return null

    const currentPage = HELP_PAGES[currentPageIndex]
    const isFirstPage = currentPageIndex === 0
    const isLastPage = currentPageIndex === HELP_PAGES.length - 1

    const handleNext = () => {
        if (!isLastPage) setCurrentPageIndex(prev => prev + 1)
    }

    const handlePrev = () => {
        if (!isFirstPage) setCurrentPageIndex(prev => prev - 1)
    }

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300 backdrop-blur-md bg-black/60">
            <div className={`w-full max-w-5xl h-full max-h-[90vh] md:max-h-[800px] flex flex-col md:flex-row rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#121212] border-white/10'}`}>

                {/* TOC Sidebar - Collapsible on mobile */}
                <div className={`w-full md:w-72 flex-shrink-0 border-b md:border-b-0 md:border-r ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-black/40 border-white/5'} ${showMobileTOC ? 'flex h-full fixed inset-0 z-[160] md:relative md:inset-auto' : 'hidden md:flex'} flex-col`}>
                    <div className="p-8 border-b border-white/5 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Hub Manual</h2>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Table of Contents</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {HELP_PAGES.map((page, idx) => (
                            <button
                                key={page.id}
                                onClick={() => {
                                    setCurrentPageIndex(idx)
                                    setShowMobileTOC(false)
                                }}
                                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${currentPageIndex === idx
                                    ? 'bg-blue-600 text-white shadow-xl translate-x-1'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <page.icon className={`h-5 w-5 ${currentPageIndex === idx ? 'text-white' : 'text-gray-500'}`} />
                                <span className="text-sm font-bold truncate">{page.title}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-6 border-t border-white/5 flex flex-col gap-4">
                        <button
                            onClick={() => setShowMobileTOC(false)}
                            className="md:hidden w-full py-4 rounded-2xl bg-white/5 text-white font-bold text-sm"
                        >
                            Close Menu
                        </button>
                        <div className="text-[10px] text-gray-600 text-center font-bold tracking-widest uppercase">
                            Version 1.2.0 • SecureLifeHub
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 relative">
                    {/* Top Bar */}
                    <div className="flex justify-between items-center p-4 md:p-8 pb-4">
                        <div className="flex items-center gap-3 md:gap-4">
                            <button
                                onClick={() => setShowMobileTOC(true)}
                                className="md:hidden p-3 rounded-xl bg-blue-500/10 text-blue-400"
                            >
                                <LayoutDashboard className="h-5 w-5" />
                            </button>
                            <div className="hidden md:block p-4 rounded-[1.5rem] bg-blue-500/10 text-blue-400">
                                <currentPage.icon className="h-10 w-10" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-3xl font-black uppercase italic tracking-tighter text-white truncate max-w-[150px] md:max-w-none">{currentPage.title}</h1>
                                <p className="text-[10px] md:text-sm text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                    Section {currentPageIndex + 1} of {HELP_PAGES.length}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 md:p-3 rounded-full hover:bg-white/5 transition-all group"
                        >
                            <X className="h-6 w-6 md:h-8 md:w-8 text-gray-500 group-hover:text-white transition-colors" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-4 custom-scrollbar">
                        <div className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border min-h-[300px] md:min-h-[400px] ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-black/20 border-white/5 shadow-inner'}`}>
                            {currentPage.content}
                        </div>
                    </div>

                    {/* Navigation Footer */}
                    <div className="p-4 md:p-8 border-t border-white/5 flex justify-between items-center bg-black/20">
                        <button
                            onClick={handlePrev}
                            disabled={isFirstPage}
                            className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all ${isFirstPage ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                        >
                            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" /> Prev
                        </button>

                        <div className="flex gap-1 md:gap-2">
                            {HELP_PAGES.map((_, idx) => (
                                <div key={idx} className={`h-1 md:h-1.5 rounded-full transition-all ${currentPageIndex === idx ? 'w-4 md:w-8 bg-blue-500' : 'w-1 md:w-2 bg-white/10'}`} />
                            ))}
                        </div>

                        {isLastPage ? (
                            <button
                                onClick={onClose}
                                className="px-6 md:px-10 py-3 md:py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] md:text-xs tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-center"
                            >
                                Done
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] md:text-xs tracking-widest active:scale-95 transition-all"
                            >
                                Next <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
