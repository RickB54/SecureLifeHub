"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, BookOpen, Shield, Heart, Activity, Briefcase, Car, Plane, Target, Settings, HelpCircle, LayoutDashboard, Database, Key, CreditCard, User, Globe, FileText, Smartphone, AlertCircle, Image, Pill, Clock, Sun, RotateCcw, Trash, Lock, DollarSign, Sparkles, Maximize2, Printer, Archive, LayoutGrid, ListTodo, TrendingUp } from "lucide-react"
import Logo from "../logo"

interface HelpPage {
    id: string
    title: string
    icon: any
    content: React.ReactNode
}

// Map page IDs to help indices or IDs
export const HELP_MAP: Record<string, string> = {
    "dashboard": "intro",
    "pulse-personalizer": "pulse-personalizer",
    // Vault / Passwords
    "passwords": "passwords",
    "all-items": "passwords",
    "all": "passwords",
    "type-logins": "passwords",
    "favorites": "passwords",
    "type-secure-notes": "passwords",
    "type-wifi": "passwords",
    "type-servers": "passwords",
    "type-software-licenses": "passwords",
    "secure-notes": "passwords",
    "security-audit": "passwords",
    "trash": "passwords",
    "generate-password": "passwords",
    "section-vault": "passwords",
    // Finance
    "financial-cards": "finance",
    "type-payment-cards": "finance",
    "type-business": "finance",
    "type-clients": "finance",
    "type-assets": "finance",
    "type-budget": "budget",
    "budget": "budget",
    "section-business": "finance",
    "section-assets": "finance",
    // Health
    "type-health-records": "health",
    "health-records": "health",
    "type-vitals": "health",
    "vitals": "health",
    "type-medications": "health",
    "medications": "health",
    "type-health-diary": "health",
    "health-diary": "health",
    "type-health-portals": "health",
    "health-portals": "health",
    "type-doctors": "health",
    "doctors": "health",
    "type-medical": "health",
    "medical": "health",
    "type-health-ai": "dr-ai",
    "section-healthFitness": "health",
    // Vehicle / Mobility
    "type-vehicles": "mobility",
    "type-vehicle-docs": "mobility",
    "type-maintenance": "mobility",
    "type-travel": "mobility",
    "section-vehicles": "mobility",
    // Social / Life
    "type-digital-life": "social",
    "type-social": "social",
    "type-diary": "social",
    "diary": "social",
    "type-subscriptions": "social",
    "section-digitalLife": "social",
    // Goals / Media
    "type-goals": "goals",
    "goals": "goals",
    "section-goals": "goals",
    "type-media": "media",
    "media-vault": "media",
    "media": "media",
    "section-media": "media",
    "type-knowledge": "knowledge",
    "knowledge": "knowledge",
    // Settings
    "settings": "settings",
    "settings-account": "settings-account",
    "settings-security": "settings-security",
    "settings-automation": "settings-automation",
    "settings-appearance": "settings-appearance",
    "settings-recents": "settings-recents",
    "settings-access": "settings-access",
    "settings-test-data": "settings-test-data",
    "settings-data": "settings-data",
    "settings-danger-zone": "settings-danger-zone",
    "settings-mock-data": "settings-mock-data",
    "user-settings": "settings",
    "dr-ai": "dr-ai",
    "secure-database": "secure-database",
    "type-tasks": "task-architect",
    "task-architect": "task-architect",
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
        id: "pulse-personalizer",
        title: "Personalize Your Pulse",
        icon: Target,
        content: (
            <div className="space-y-6">
                <p className="text-lg text-gray-300 leading-relaxed">
                    The Pulse Personalizer allows you to choose exactly which metrics and analytics you want to see at a glance on your dashboard.
                </p>
                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                        <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">How it Works</h4>
                        <p className="text-sm text-gray-400">
                            Click on any category (Security, Finance, Health, etc.) to see available pulses. Toggle them on or off to pin or unpin them from your dashboard "Life Pulse" bar.
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                        <h4 className="font-bold text-purple-400 mb-2 flex items-center gap-2">Available Pulses</h4>
                        <ul className="text-xs text-gray-400 space-y-2 list-disc pl-4">
                            <li><strong>Security Score:</strong> Live health of your password vault.</li>
                            <li><strong>Net Worth:</strong> Total value of all assets tracked in the Assets hub.</li>
                            <li><strong>Health Vitals:</strong> Quick look at your latest biological measurements.</li>
                            <li><strong>Subscription Burn:</strong> Monthly recurring costs for digital services.</li>
                            <li><strong>Travel Hub:</strong> Quick access to your next itineraries and plans.</li>
                        </ul>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs text-gray-400 italic">
                        Note: Your preferences are saved locally to this device.
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "pulse",
        title: "Life Pulse Analytics",
        icon: Activity,
        content: (
            <div className="space-y-6">
                <p className="text-gray-300 italic">"What you measure, you can manage." Track the key metrics of your life in real-time.</p>
                <div className="space-y-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <h5 className="text-blue-400 font-black text-xs uppercase mb-2">Security Score</h5>
                        <p className="text-[10px] text-gray-500">Live monitoring of your vault. It detects common passwords, old secrets, and potential security holes. High Score = High Safety.</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <h5 className="text-emerald-400 font-black text-xs uppercase mb-2">Net Worth Tracker</h5>
                        <p className="text-[10px] text-gray-500">Calculates the total value of your assets (Homes, Vehicles, Collections). Useful for tracking overall financial growth.</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <h5 className="text-red-400 font-black text-xs uppercase mb-2">Active Health Vitals</h5>
                        <p className="text-[10px] text-gray-500">Summary of recent vitals (BP/Weight) and medication compliance. Warns you if a required dose has been missed.</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <h5 className="text-indigo-400 font-black text-xs uppercase mb-2">Subscription Burn</h5>
                        <p className="text-[10px] text-gray-500">Monitors your monthly expenditures on digital services. Helps you see where your "digital leaks" are coming from.</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <h5 className="text-amber-400 font-black text-xs uppercase mb-2">Goal Trajectory</h5>
                        <p className="text-[10px] text-gray-500">A progress indicator for your most important life targets. Shows percentage of sub-tasks completed.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "media",
        title: "Secure Media Vault",
        icon: Image,
        content: (
            <div className="space-y-4">
                <p className="text-gray-300">A military-grade encrypted gallery for your most private photos and documents.</p>
                <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 border border-white/5 bg-black/20 rounded-xl">
                        <h5 className="text-xs font-black text-blue-400 uppercase mb-1">Encrypted Gallery</h5>
                        <p className="text-xs text-gray-400">Photos uploaded here are encrypted before storage. They are only decrypted in your browser when you view them.</p>
                    </div>
                    <div className="p-4 border border-white/5 bg-black/20 rounded-xl">
                        <h5 className="text-xs font-black text-blue-400 uppercase mb-1">Metadata Stripping</h5>
                        <p className="text-xs text-gray-400">Our vault automatically strips location and device data (EXIF) from photos to ensure your privacy is absolute.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "knowledge",
        title: "Knowledge Vault",
        icon: BookOpen,
        content: (
            <div className="space-y-4">
                <p className="text-gray-300">Your personal Wikipedia and reference library.</p>
                <div className="space-y-3">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-yellow-400 font-bold text-xs uppercase block mb-1">SOPs & Guides</span>
                        <p className="text-xs text-gray-400">Store "Standard Operating Procedures" for your home, business, or digital workflows.</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-yellow-400 font-bold text-xs uppercase block mb-1">Reference Library</span>
                        <p className="text-xs text-gray-400">Keep safe copies of manuals, code snippets, and research papers.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "goals",
        title: "Goals & Targets",
        icon: Target,
        content: (
            <div className="space-y-4">
                <p className="text-gray-300">Turn your dreams into actionable steps.</p>
                <div className="space-y-4">
                    <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                        <h5 className="font-bold text-purple-400 text-sm mb-2">Step Tracking</h5>
                        <p className="text-xs text-gray-400">Break down large objectives into smaller, manageable sub-tasks with their own deadlines.</p>
                    </div>
                    <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                        <h5 className="font-bold text-purple-400 text-sm mb-2">Visual Progress</h5>
                        <p className="text-xs text-gray-400">Automatic progress bars calculate how close you are to finishing based on completed steps.</p>
                    </div>
                </div>
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
        title: "Medical & Health Hub",
        icon: Heart,
        content: (
            <div className="space-y-6">
                <p className="text-gray-300">Your central command for all health-related data. Use these modules to build a complete medical history for you and your family.</p>
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Medical Records */}
                    <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="flex items-center gap-3 mb-3">
                            <FileText className="h-5 w-5 text-emerald-400" />
                            <h5 className="font-black text-emerald-400 text-xs uppercase tracking-widest">Medical Records & Files</h5>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            A secure archive for clinic notes, lab results, and diagnostic images. Store PDFs or high-resolution photos of paper records.
                            <br /><br />
                            <strong>How to use:</strong> Tag records by physician or facility. Use the "Upload" button to add photos of physical documents; our system preserves them with military-grade encryption.
                        </p>
                    </div>

                    {/* Medications */}
                    <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                        <div className="flex items-center gap-3 mb-3">
                            <Pill className="h-5 w-5 text-rose-400" />
                            <h5 className="font-black text-rose-400 text-xs uppercase tracking-widest">Medication Timeline</h5>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Master your prescription schedule. Record exactly when you take your doses to build a compliance history.
                            <br /><br />
                            <strong>How to use:</strong> Set up reminders for daily or as-needed (PRN) meds. Tapering schedules are dynamically calculated based on your intake logs.
                        </p>
                    </div>

                    {/* Vitals */}
                    <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                        <div className="flex items-center gap-3 mb-3">
                            <Activity className="h-5 w-5 text-blue-400" />
                            <h5 className="font-black text-blue-400 text-xs uppercase tracking-widest">Vital Logging & Trends</h5>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Track Blood Pressure, Weight, Blood Glucose, and Heart Rate. Interactive charts show you how these metrics change over weeks or months.
                            <br /><br />
                            <strong>How to use:</strong> Log data immediately after measurement. Our AI summary identifies trends that might be relevant for your doctor.
                        </p>
                    </div>

                    {/* Health Diary */}
                    <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                        <div className="flex items-center gap-3 mb-3">
                            <BookOpen className="h-5 w-5 text-amber-400" />
                            <h5 className="font-black text-amber-400 text-xs uppercase tracking-widest">Health & Symptom Diary</h5>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Document daily pain levels, energy, mood, or specific symptoms. This is your personal health journal.
                            <br /><br />
                            <strong>How to use:</strong> Maintain a "Streak" by logging daily. This data is invaluable during physician consultations to prove chronic patterns.
                        </p>
                    </div>

                    {/* Health Portals */}
                    <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                        <div className="flex items-center gap-3 mb-3">
                            <Globe className="h-5 w-5 text-purple-400" />
                            <h5 className="font-black text-purple-400 text-xs uppercase tracking-widest">Health Portals (Links)</h5>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            A directory for external websites like Quest Diagnostics, LabCorp, or hospital systems.
                            <br /><br />
                            <strong>How to use:</strong> Add the direct URL and any notes about your login. Use the "Open" shortcut to launch the portal in a new tab instantly.
                        </p>
                    </div>

                    {/* My Doctors */}
                    <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                        <div className="flex items-center gap-3 mb-3">
                            <User className="h-5 w-5 text-indigo-400" />
                            <h5 className="font-black text-indigo-400 text-xs uppercase tracking-widest">My Medical Team</h5>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Store contact info for specialists, primary care, and facilities.
                            <br /><br />
                            <strong>How to use:</strong> Keep phone numbers, address links, and specialty details ready for coordination between doctors.
                        </p>
                    </div>

                    {/* Health Insurance */}
                    <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="flex items-center gap-3 mb-3">
                            <Shield className="h-5 w-5 text-emerald-400" />
                            <h5 className="font-black text-emerald-400 text-xs uppercase tracking-widest">Insurance & Policies</h5>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Centralize policy numbers, group IDs, and carrier contact info.
                            <br /><br />
                            <strong>How to use:</strong> Take photos of your insurance cards front and back. Have them ready at the clinic check-in desk.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "dr-ai",
        title: "Dr. AI Clinical Intelligence",
        icon: Sparkles,
        content: (
            <div className="space-y-6">
                <p className="text-lg text-gray-300 leading-relaxed italic">
                    "Your global clinical research assistant, powered by authoritative medical databases."
                </p>
                <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="p-6 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 shadow-xl">
                        <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <Sparkles className="h-5 w-5" /> Comprehensive Explanations
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Unlike simple search engines, Dr. AI provides deep clinical summaries first. It synthesizes data from Wikipedia Medical, Mayo Clinic, and PubMed to give you a full overview of symptoms, causes, and treatments.
                        </p>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-blue-400" /> How to use Dr. AI
                        </h4>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black font-mono">01</span>
                                <div>
                                    <h5 className="text-[11px] font-bold text-gray-200">The Bottom Input Field</h5>
                                    <p className="text-[10px] text-gray-500">This is your primary command center. Type your medical query or symptoms here and hit the Send button to begin an investigation.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black font-mono">02</span>
                                <div>
                                    <h5 className="text-[11px] font-bold text-gray-200">The Top Title Area</h5>
                                    <p className="text-[10px] text-gray-500">The text at the very top is the <strong>Title</strong> of your current session. You can click it to rename the investigation for your records (e.g. "Sore Throat Log"). It is not for asking questions.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black font-mono">03</span>
                                <div>
                                    <h5 className="text-[11px] font-bold text-gray-200">History & Suggestions</h5>
                                    <p className="text-[10px] text-gray-500">Use the left sidebar to jump between past sessions. After an AI response, look for "AI Suggested Investigations" chips—click them to quickly dive into related topics.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-blue-500/5 border border-white/5">
                            <h5 className="text-[10px] font-black text-blue-400 uppercase mb-2 flex items-center gap-2">
                                <Maximize2 className="h-4 w-4" /> Focus Mode
                            </h5>
                            <p className="text-[11px] text-gray-500">Enable expanded workspace to fill your screen for deep reading. Press ESC at any time to return to the dashboard.</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-white/5">
                            <h5 className="text-[10px] font-black text-emerald-400 uppercase mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Research Notes
                            </h5>
                            <p className="text-[11px] text-gray-500">Keep side-notes during your session. Dr. AI automatically tracks topics but your personal observations are kept in the session notes panel.</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-black/40 border border-white/5">
                        <h4 className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3">Core Features & Icons</h4>
                        <ul className="space-y-3 text-[11px] text-gray-400">
                            <li className="flex gap-3"><Printer className="h-4 w-4 text-gray-500 mt-1" /> <strong>Print & PDF:</strong> Direct export of the consultation history for your physical doctor.</li>
                            <li className="flex gap-3"><Archive className="h-4 w-4 text-gray-500 mt-1" /> <strong>History Vault:</strong> All sessions are saved, editable, and archivable in the left sidebar.</li>
                            <li className="flex gap-3"><Shield className="h-4 w-4 text-gray-500 mt-1" /> <strong>Privacy:</strong> Research queries are parsed through an anonymized proxy. No medical data is tied to your ID in clinical databases.</li>
                        </ul>
                    </div>

                    <div className="p-5 rounded-[2rem] bg-rose-500/10 border border-rose-500/20">
                        <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" /> Medical Disclaimer
                        </h4>
                        <p className="text-[10px] text-rose-300/60 font-medium">
                            Dr. AI is a research tool, not a diagnostic medical service. Always consult with a licensed healthcare professional for medical advice, diagnoses, or treatment.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "social",
        title: "Social & Digital Life",
        icon: Globe,
        content: (
            <div className="space-y-4">
                <p className="text-gray-300">Track your online presence, subscriptions, and personal memoirs.</p>
                <div className="space-y-3">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-blue-400 font-bold text-xs uppercase block mb-1 tracking-widest">Subscription Manager</span>
                        <p className="text-xs text-gray-400">Never forget a renewal date. Track monthly costs and billing cycles for apps and services.</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-purple-400 font-bold text-xs uppercase block mb-1 tracking-widest">Online Presence</span>
                        <p className="text-xs text-gray-400">Keep a master list of all social accounts and non-financial digital assets.</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-amber-400 font-bold text-xs uppercase block mb-1 tracking-widest">Personal Diary</span>
                        <p className="text-xs text-gray-400">A private space for your thoughts, protected by your master key.</p>
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
                        <DollarSign className="h-5 w-5 text-green-400" />
                        <div>
                            <div className="text-sm font-bold">Budget Manager</div>
                            <div className="text-xs text-gray-500">Track personal and business income, expenses, and profit vs loss.</div>
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
        id: "budget",
        title: "Budget Manager",
        icon: DollarSign,
        content: (
            <div className="space-y-4">
                <p className="text-gray-300">Take control of your finances with dual Personal and Business ledgers.</p>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <h5 className="font-bold text-emerald-400 text-sm mb-1 uppercase tracking-tighter">Mock Data Demonstration</h5>
                        <p className="text-xs text-gray-400 leading-relaxed">If you haven't entered any real data yet, the dashboard will pre-populate with sample entries to show how graphs, filters, and tables work. Simply click the "Clear & Start Real Tracking" button on the banner to wipe the fake data and begin tracking your true numbers.</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                        <h5 className="font-bold text-blue-400 text-sm mb-1 uppercase tracking-tighter">Tracking Incomes & Expenses</h5>
                        <p className="text-xs text-gray-400 leading-relaxed">Quickly add transactions specifying the date, customizable categories, and whether they are tax-deductible. The system auto-calculates your Net Profit/Loss and updates the visual cards accordingly.</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                        <h5 className="font-bold text-purple-400 text-sm mb-1 uppercase tracking-tighter">Date & Custom Range Filters</h5>
                        <p className="text-xs text-gray-400 leading-relaxed">The Date dropdown lets you filter items from 'All Time' down to 'Today', 'This Week', 'This Month', and 'This Year'. Picking 'Custom Range' allows you to select specific Start and End dates to visualize transaction history over unique timeframes.</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                        <h5 className="font-bold text-amber-400 text-sm mb-1 uppercase tracking-tighter">Graphs & Charts</h5>
                        <p className="text-xs text-gray-400 leading-relaxed">Data visualization breaks down where your money is going via interactive bar charts, pie charts, and monthly performance line charts automatically. Hover or tap the graphs to reveal exact metric snapshots.</p>
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
        title: "Global Settings Overview",
        icon: Settings,
        content: (
            <div className="space-y-6">
                <p className="text-gray-300">Take full control of your vault's security, automation, and appearance. These settings are local to this device and browser unless synced via your account provider. Use the specific help icons within each section for deeper explanations.</p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-black/20 rounded-xl border border-white/5 text-[10px] text-gray-500">
                        <strong className="text-white block mb-1 uppercase tracking-tighter tracking-widest">Account & Identity</strong>
                        Manage your profile and linked providers (Google/Email).
                    </div>
                    <div className="p-3 bg-black/20 rounded-xl border border-white/5 text-[10px] text-gray-500">
                        <strong className="text-white block mb-1 uppercase tracking-tighter tracking-widest">Security Protocols</strong>
                        2FA, Biometrics, and Master Password management.
                    </div>
                </div>
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-[11px] text-gray-400 italic">
                    Tip: Most settings are saved automatically. Look for the "Saved" toast notification at the bottom of your screen.
                </div>
            </div>
        )
    },
    {
        id: "settings-account",
        title: "Account & Identity",
        icon: User,
        content: (
            <div className="space-y-4">
                <p className="text-gray-300 italic">Your digital footprint within the Secure Life Hub ecosystem.</p>
                <div className="space-y-4">
                    <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                        <h5 className="font-bold text-blue-400 text-sm mb-2 flex items-center gap-2"><Globe className="h-4 w-4" /> Provider Transparency</h5>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            We support both Google OAuth and traditional Email/Password logins. Your provider is shown here to help you identify which credentials you need for the Chrome Extension.
                        </p>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                        <h5 className="font-bold text-white text-sm mb-2">Security Note</h5>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Logging in via Google uses their secure authentication flow. We never receive your Google password; we only receive a secure token to verify your identity.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "settings-security",
        title: "Security Protocols",
        icon: Shield,
        content: (
            <div className="space-y-6">
                <p className="text-gray-300">The core mechanisms protecting your encrypted vault.</p>
                <div className="space-y-4">
                    <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                        <h5 className="font-bold text-purple-400 text-sm mb-1">Two-Factor Auth (2FA)</h5>
                        <p className="text-xs text-gray-400">The most important defense. Even if someone steals your Master Password, they cannot enter without your secondary physical device or app code. We use standard TOTP/Email 2FA for maximum compatibility.</p>
                    </div>
                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                        <h5 className="font-bold text-blue-400 text-sm mb-1">Biometric Login / Passkeys</h5>
                        <p className="text-xs text-gray-400">Unlock your vault instantly using your Fingerprint or FaceID. This registers a unique cryptographic "Passkey" on this hardware. Note: You must re-enable this on every new device you use.</p>
                    </div>
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                        <h5 className="font-bold text-amber-400 text-sm mb-1">Remember Master Password</h5>
                        <p className="text-[10px] text-gray-500 italic mb-2">⚠️ CAUTION: Only for trusted personal computers.</p>
                        <p className="text-xs text-gray-400 leading-relaxed">Saves your master secret in your browser's local storage so you don't have to type it every time. <span className="text-amber-300">Never enable this on shared or public computers.</span></p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "settings-automation",
        title: "Automation & Access",
        icon: Clock,
        content: (
            <div className="space-y-6">
                <p className="text-gray-300">Streamline your workflow without sacrificing security.</p>
                <div className="space-y-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <h5 className="font-bold text-blue-400 text-sm mb-2 flex items-center gap-2"><Clock className="h-4 w-4" /> Auto-Lock Timer</h5>
                        <p className="text-xs text-gray-400 leading-relaxed">Sets the "idle timeout." After this period of inactivity, the hub will automatically purge your session and lock the vault. For maximum security, use <span className="text-white">5-10 minutes</span>.</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <h5 className="font-bold text-purple-400 text-sm mb-2">Startup Configuration</h5>
                        <p className="text-xs text-gray-400 leading-relaxed">Choose your landing page. If you primarily use the hub for health tracking, set your startup page to <span className="text-white">Health records</span> to skip the dashboard on login.</p>
                    </div>
                    <div className="p-4 bg-white/10 border border-white/5 rounded-2xl">
                        <h5 className="font-bold text-emerald-400 text-sm mb-2 flex items-center gap-2"><Globe className="h-4 w-4" /> Browser Auto-Fill</h5>
                        <p className="text-xs text-gray-400 leading-relaxed">Allows the Secure Life Hub extension to talk to this vault. When enabled, your passwords can be injected directly into login forms on other websites.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "settings-appearance",
        title: "Interface & Appearance",
        icon: Sun,
        content: (
            <div className="space-y-6">
                <p className="text-gray-300 italic">"Security should be beautiful." Customize your visual experience.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-500/5 border border-white/5 rounded-xl">
                        <h5 className="font-bold text-blue-400 text-sm mb-1 uppercase tracking-tighter">Theme Modes</h5>
                        <p className="text-[10px] text-gray-500">Toggle between Dark and Light mode. Our Dark theme reduces eye strain and implements glassmorphism for a premium feel.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "settings-recents",
        title: "Recent Activity History",
        icon: RotateCcw,
        content: (
            <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed">Manage your navigation footprint. The "Recents" list tracks your latest changes and page visits for quick jumping.</p>
                <div className="space-y-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <h5 className="font-bold text-emerald-400 text-sm mb-2 flex items-center gap-2"><Trash className="h-4 w-4" /> Individual Deletion</h5>
                        <p className="text-xs text-gray-400 leading-relaxed">You can now remove single items from your recently visited list in Settings without clearing your entire history. This is ideal for hiding specific records you just edited from shoulder-surfers.</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <h5 className="font-bold text-blue-400 text-sm mb-2">Reset All History</h5>
                        <p className="text-xs text-gray-400 leading-relaxed">The <span className="text-blue-200">Reset</span> button wipes your entire recent history by setting a new "Cutoff Date." Old activity is hidden, while new activity starting <span className="italic">now</span> will begin to populate normally.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "settings-data",
        title: "Vault Data Management",
        icon: Database,
        content: (
            <div className="space-y-6">
                <p className="text-gray-300">Maintain full control over your vault's data lifecycle.</p>
                <div className="space-y-4">
                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                        <h5 className="font-bold text-blue-400 text-sm mb-1 uppercase tracking-tighter">Backup & Recovery</h5>
                        <p className="text-xs text-gray-400">Export your entire vault as an encrypted JSON file. This is the ultimate safety net. You can re-import this file on a new device to restore all your secrets instantly.</p>
                    </div>
                    <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                        <h5 className="font-bold text-purple-400 text-sm mb-1 uppercase tracking-tighter">Export Vault</h5>
                        <p className="text-xs text-gray-400">Downloads a raw copy of your data. Keep this file extremely safe, as it contains all your stored credentials and health history.</p>
                    </div>
                    <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-yellow-500 font-bold border-dashed">
                        <h5 className="font-bold text-yellow-400 text-sm mb-1 uppercase tracking-tighter">Wipe All Mock Data</h5>
                        <p className="text-xs text-yellow-600">The "Demo Mode" toggle adds sample records for you to explore. If you've finished testing and want to clean those up while keeping your real records, use this mass-cleanup tool.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "settings-access",
        title: "Module Access Controls",
        icon: Lock,
        content: (
            <div className="space-y-6">
                <p className="text-gray-300">Control PIN restriction and mock data demonstration for each module.</p>
                <div className="space-y-4">
                    <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                        <h5 className="font-black text-emerald-400 text-xs uppercase tracking-widest mb-3 flex items-center gap-2"><Lock className="h-4 w-4" /> Toggle Access Lock</h5>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Some modules (like your Diary or Health Records) are more sensitive than others. You can lock these with an independent 4-digit PIN using the right-side toggle switch. 
                            <br /><br />
                            Even if your computer is unlocked and the main vault is open, these specific modules will remain shielded until the correct PIN is entered.
                        </p>
                    </div>
                    <div className="p-5 bg-yellow-500/5 border border-yellow-500/10 rounded-3xl">
                        <h5 className="font-black text-yellow-400 text-xs uppercase tracking-widest mb-3 flex items-center gap-2"><Database className="h-4 w-4" /> Toggle Mock Data</h5>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Perfect for exploring the possibilities of Secure Life Hub without having to manually input your data at the start. Use the left-side yellow toggle to flip a module into "Demo Data" mode.
                            <br /><br />
                            This replaces your real data with interactive fake transactions temporarily. Safe to toggle without affecting your real records! Toggle it back off to return to your real information.
                        </p>
                    </div>
                    <div className="p-4 border border-white/5 bg-black/20 rounded-xl text-[10px] text-gray-500 italic">
                        Note: For your privacy, these settings and PINs are stored in your browser's encrypted local storage. They are device-specific.
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "settings-test-data",
        title: "Test Data Utilities",
        icon: Database,
        content: (
            <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed">Perfect for exploring the possibilities of Secure Life Hub without having to manually input your data at the start.</p>
                <div className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-3xl">
                    <h5 className="font-bold text-purple-400 text-sm mb-3">Live Injection</h5>
                    <p className="text-xs text-gray-400 leading-relaxed">Using these tools will add sample records to your vault. These look and act exactly like real data, allowing you to see how different hubs interact, how graphs trend, and how categories organize themselves.</p>
                    <p className="text-[10px] text-orange-400 font-bold mt-3 uppercase tracking-widest">Cleanup is easy:</p>
                    <p className="text-[10px] text-gray-500 italic">You can delete individual demo items later, or use the "Danger Zone" mass-wipe tools to clear a whole category at once.</p>
                </div>
            </div>
        )
    },
    {
        id: "settings-mock-data",
        title: "Mock Data Playground",
        icon: Database,
        content: (
            <div className="space-y-6">
                <p className="text-gray-300">Test the hub's capabilities by injecting sample data into specific modules.</p>
                <div className="space-y-4">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <h5 className="font-bold text-emerald-400 text-sm mb-1 uppercase tracking-tighter">Budget Demo Data</h5>
                        <p className="text-xs text-gray-400 leading-relaxed">Instantly populate your Budget Manager with transactions, income, and goals. This lets you see the trend charts and category breakdowns without entering your own data first.</p>
                    </div>
                    <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                        <h5 className="font-bold text-yellow-400 text-sm mb-1 uppercase tracking-tighter">Safe Cleanup</h5>
                        <p className="text-xs text-gray-400">Use the "Sanitize Vault" tool to remove all injected mock data in one click. Our cleanup tools are specifically designed to PROTECT your real passwords and manual entries.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "secure-database",
        title: "Secure Database Architect",
        icon: Database,
        content: (
            <div className="space-y-6">
                <p className="text-lg text-gray-300 leading-relaxed italic">
                    "High-fidelity collections with custom schemas and professional reporting."
                </p>
                <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="p-6 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 shadow-xl">
                        <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <Database className="h-5 w-5" /> Professional Schemas
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Access over 15 pre-built professional blueprints including Project Management, CRM, Inventory, and Health. Each blueprint is pre-configured with the exact fields you need for complex data tracking.
                        </p>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-blue-400" /> Core Architect Features
                        </h4>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 h-fit">
                                    <LayoutGrid className="h-5 w-5" />
                                </div>
                                <div>
                                    <h5 className="text-[11px] font-bold text-gray-200 uppercase">Synchronized Blueprints</h5>
                                    <p className="text-[10px] text-gray-500">Use the 'Synchronize Blueprints' tool in the Actions menu to inject the latest professional collections into your vault instantly.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 h-fit">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <div>
                                    <h5 className="text-[11px] font-bold text-gray-200 uppercase">Dual Intelligence Reporting</h5>
                                    <p className="text-[10px] text-gray-500">Toggle between 'Insights' for real-time visual charts and 'Reports' for a full Custom Architect builder where you can save personalized data blueprints.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 h-fit">
                                    <Maximize2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h5 className="text-[11px] font-bold text-gray-200 uppercase">Full Record Immersion</h5>
                                    <p className="text-[10px] text-gray-500">Click any record to enter 'Deep View' mode. The entire interface themes itself to match the collection's unique color signature for a vibrant experience.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-[2rem] bg-amber-500/10 border border-amber-500/20">
                        <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Clock className="h-5 w-5" /> Data Persistence
                        </h4>
                        <p className="text-[10px] text-amber-300/60 font-medium leading-relaxed">
                            Reports and Blueprints are saved to your local architecture. You can print reports directly or export snapshots for external use.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "task-architect",
        title: "Task Architect Engine",
        icon: ListTodo,
        content: (
            <div className="space-y-6">
                <p className="text-lg text-gray-300 leading-relaxed italic">
                    "Strategic execution and objective tracking engine for mission-critical tasks."
                </p>
                <div className="space-y-4">
                    <div className="p-6 rounded-[2rem] bg-blue-600/10 border border-blue-500/20 shadow-xl">
                        <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <Target className="h-5 w-5" /> Execution Matrix
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Track your highest priority objectives through a streamlined execution matrix. Monitor Critical Path (Urgent) tasks and Active Processes (Pending) from a unified dashboard.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                            <h5 className="text-[10px] font-black text-blue-400 uppercase mb-2 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" /> Sync Status
                            </h5>
                            <p className="text-[11px] text-gray-500">Task completion is 'Synchronized' into your permanent achievement log, providing historical data on execution speed.</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                            <h5 className="text-[10px] font-black text-red-400 uppercase mb-2 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" /> Critical Path
                            </h5>
                            <p className="text-[11px] text-gray-500">Urgent tasks are highlighted with a pulse effect in the center HUD to ensure strategic focus remains on core objectives.</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "settings-danger-zone",
        title: "The Danger Zone",
        icon: AlertCircle,
        content: (
            <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-red-500">
                    Irreversible Actions. We cannot recover data deleted using these tools.
                </p>
                <div className="space-y-4">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <h5 className="font-bold text-red-400 text-sm mb-2">Individual Page Wipe</h5>
                        <p className="text-xs text-gray-400 leading-relaxed">Choose a specific module (like <span className="text-white">Vehicles</span> or <span className="text-white">Passwords</span>) and delete all items within it in one click. Other sections remain untouched.</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <h5 className="font-bold text-red-400 text-sm mb-2">Master Reset</h5>
                        <p className="text-xs text-gray-400 leading-relaxed">Removes local customizations like PINs, biometrics, and themes without deleting your encrypted vault records.</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <h5 className="font-bold text-red-400 text-sm mb-2">Nuclear Wipe</h5>
                        <p className="text-xs text-gray-400 leading-relaxed">The absolute last resort. This deletes EVERY record across your entire vault, including folders, passwords, and medical data. This resets your account to a baseline, factory-fresh state.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "biometrics",
        title: "Biometric Login",
        icon: Smartphone,
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="text-gray-300">Unlock your vault instantly using your phone or computer's built-in security.</p>

                <div className="space-y-4">
                    <div className="p-4 border border-white/5 bg-blue-500/5 rounded-xl">
                        <h5 className="font-bold text-blue-400 mb-1">What is a Passkey?</h5>
                        <p className="text-xs text-gray-400">A Passkey is the digital handshake between your device and this hub. It uses your Fingerprint or FaceID to unlock a secret key stored safely on your phone. No biometric data ever leaves your device.</p>
                    </div>

                    <div className="space-y-3">
                        <h5 className="font-bold text-white uppercase text-[10px] tracking-widest">How to Enable:</h5>
                        <ul className="space-y-2 text-xs text-gray-400">
                            <li className="flex gap-2">
                                <span className="text-blue-500 font-bold">01.</span>
                                <span>Go to <span className="text-white">Settings</span> while logged in.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-500 font-bold">02.</span>
                                <span>Find <span className="text-white font-bold">Biometric Login</span> and toggle it ON.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-500 font-bold">03.</span>
                                <span>When prompted by your OS, choose <span className="text-white">"This Device"</span> and scan your finger/face.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="p-4 border border-white/5 bg-amber-500/5 rounded-xl">
                        <h5 className="font-bold text-amber-400 mb-1 flex items-center gap-2"><Key className="h-3 w-3" /> Troubleshooting</h5>
                        <p className="text-[10px] text-gray-400">If you move to a new website address (like netlify.app), your old passkey will stop working for security. Simply go to settings, toggle biometrics OFF and then back ON to create a fresh key.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "recovery",
        title: "Security Recovery",
        icon: AlertCircle,
        content: (
            <div className="space-y-4 text-sm">
                <p className="text-gray-300">Forgot your module PIN or access code? Here is how to regain access.</p>
                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                        <h5 className="font-bold text-blue-400 mb-1 tracking-tight">Option 1: Danger Zone Reset</h5>
                        <p className="text-xs text-gray-400">If you can still access the <span className="text-white">Settings</span> page, you can use the Master Reset tool in the <span className="text-red-500 font-bold">Danger Zone</span>. This will clear all module locks (Health, Diary, etc.) instantly.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                        <h5 className="font-bold text-orange-400 mb-1 tracking-tight">Option 2: Clear Site Data</h5>
                        <p className="text-xs text-gray-400">If you are locked out of Settings, you can clear your browser's local storage for this site. This resets all local PINs without deleting your encrypted data in the database.</p>
                        <p className="text-[10px] text-gray-500 mt-2 italic">How: Browser Settings → Privacy → Site Settings → Secure Life Hub → Clear Data.</p>
                    </div>
                    <div className="p-4 border border-white/5 bg-black/20 rounded-xl">
                        <h5 className="font-bold text-white text-xs uppercase mb-1">Important Note</h5>
                        <p className="text-xs text-gray-400">Module PINs are stored ONLY on your device for maximum privacy. We cannot reset them remotely via email.</p>
                    </div>
                </div>
            </div>
        )
    }
]

export default function HelpModal({ isOpen, onClose, theme, initialPageId }: { isOpen: boolean, onClose: () => void, theme: string, initialPageId?: string }) {
    const [currentPageIndex, setCurrentPageIndex] = useState(0)
    const [showMobileTOC, setShowMobileTOC] = useState(false)

    // Handle initial page jump on open
    useEffect(() => {
        if (isOpen) {
            if (initialPageId) {
                const helpId = HELP_MAP[initialPageId] || initialPageId
                const idx = HELP_PAGES.findIndex(p => p.id === helpId)
                if (idx !== -1) {
                    setCurrentPageIndex(idx)
                    return
                }
            }
            // Fallback to page 0 if no valid initial ID is provided for the CURRENT open action
            setCurrentPageIndex(0)
        }
    }, [isOpen, initialPageId])

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
        <div 
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300 backdrop-blur-md bg-black/60"
            onClick={onClose}
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-5xl h-[95vh] md:h-full md:max-h-[800px] flex flex-col md:flex-row rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#121212] border-white/10'}`}
            >

                {/* TOC Sidebar - Collapsible on mobile */}
                <div className={`w-full md:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-black/90 md:bg-black/40 border-white/10'} ${showMobileTOC ? 'flex h-full fixed inset-0 z-[200] md:relative md:inset-auto animate-in slide-in-from-left duration-300' : 'hidden md:flex'} flex-col`}>

                    <div className="p-8 border-b border-white/5 flex items-center gap-3">
                        <Logo size="sm" />
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
                                <span className="text-sm font-bold leading-tight">{page.title}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-6 border-t border-white/10 bg-black/40 flex flex-col gap-4">
                        <button
                            onClick={() => setShowMobileTOC(false)}
                            className="md:hidden w-full py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20"
                        >
                            Back to Article
                        </button>
                        <div className="text-[10px] text-gray-600 text-center font-bold tracking-widest uppercase">
                            Manual v1.3.2 • SecureLifeHub
                        </div>
                    </div>
                </div>


                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 relative h-full">
                    {/* Top Bar */}
                    <div className="flex justify-between items-center p-4 md:p-8 pb-4 shrink-0">
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
                                <h1 className="text-lg md:text-3xl font-black uppercase italic tracking-tighter text-white leading-tight">{currentPage.title}</h1>
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
                    <div className="p-4 md:p-8 border-t border-white/5 flex justify-between items-center bg-black/20 shrink-0">
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
