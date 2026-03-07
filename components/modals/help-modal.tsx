"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, BookOpen, Shield, Heart, Activity, Briefcase, Car, Plane, Target, Settings, HelpCircle, LayoutDashboard, Database, Key, CreditCard, User, Globe, FileText, Smartphone, AlertCircle, Image, Pill } from "lucide-react"
import Logo from "../logo"

interface HelpPage {
    id: string
    title: string
    icon: any
    content: React.ReactNode
}

// Map page IDs to help indices or IDs
export const HELP_MAP: Record<string, string> = {
    "dashboard": "pulse",
    "all-items": "passwords",
    "type-payment-cards": "finance",
    "type-secure-notes": "passwords",
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
    "type-vehicles": "mobility",
    "type-vehicle-docs": "mobility",
    "type-maintenance": "mobility",
    "type-business": "finance",
    "type-clients": "finance",
    "type-assets": "finance",
    "type-budget": "finance",
    "type-digital-life": "social",
    "type-social": "social",
    "type-diary": "social",
    "type-subscriptions": "social",
    "type-travel": "mobility",
    "settings": "settings",
    "user-settings": "settings",
    "type-goals": "goals",
    "goals": "goals",
    "type-media": "media",
    "media": "media",
    "type-knowledge": "knowledge",
    "knowledge": "knowledge"
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
                    <div className="p-4 bg-red-400 font-black text-xs uppercase mb-2">Active Health Vitals</div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <p className="text-[10px] text-gray-500">Summary of recent vitals (BP/Weight) and medication compliance. Warns you if a required dose has been missed.</p>
                    </div>
                    <div className="p-4 bg-indigo-400 font-black text-xs uppercase mb-2">Subscription Burn</div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                        <p className="text-[10px] text-gray-500">Monitors your monthly expenditures on digital services. Helps you see where your "digital leaks" are coming from.</p>
                    </div>
                    <div className="p-4 bg-amber-400 font-black text-xs uppercase mb-2">Goal Trajectory</div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
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
        title: "Settings Configuration",
        icon: Settings,
        content: (
            <div className="space-y-6">
                <p className="text-gray-300">Control your experience and manage vault-wide security protocols. Below are the key modules you can configure:</p>
                
                <div className="space-y-6">
                    <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                        <h5 className="text-blue-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Shield className="h-4 w-4" /> Security & Access
                        </h5>
                        <div className="space-y-4">
                            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                <span className="text-white font-bold text-sm block mb-1">Two-Factor Authentication (2FA)</span>
                                <p className="text-xs text-gray-400 leading-relaxed">Adds a critical second layer of protection. When logging in from an unrecognized device, you will be required to verify your identity via a secure code sent to your registered Email or SMS. This ensures that even if your password is stolen, your vault remains locked.</p>
                            </div>
                            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                <span className="text-white font-bold text-sm block mb-1">Startup Configuration</span>
                                <p className="text-xs text-gray-400 leading-relaxed">Personalize your entry point. Instead of landing on the dashboard every time, you can set the Hub to immediately open your <span className="text-blue-300">Medications</span>, <span className="text-purple-300">Vault</span>, or <span className="text-emerald-300">Financial Cards</span> upon successful sign-in.</p>
                            </div>
                            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                <span className="text-white font-bold text-sm block mb-1">Auto-Fill Integration</span>
                                <p className="text-xs text-gray-400 leading-relaxed">Enable seamless logins across the web. This setting bridges your vault with the Secure Life Hub browser extension, allowing you to instantly inject credentials into login forms without leaving your current tab.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                        <h5 className="text-orange-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Database className="h-4 w-4" /> Data Management
                        </h5>
                        <div className="space-y-4">
                            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                <span className="text-white font-bold text-sm block mb-1">Backup & Recovery (JSON Export)</span>
                                <p className="text-xs text-gray-400 leading-relaxed">You own your data. Download a complete, encrypted JSON archive of your entire hub at any time. This file can be used to restore your data on a new instance or kept as an offline safety copy.</p>
                            </div>
                            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                <span className="text-white font-bold text-sm block mb-1">Module Access & PINs</span>
                                <p className="text-xs text-gray-400 leading-relaxed">Create "Vaults within Vaults." Set secondary PIN codes for specific modules like Medical Hub, Social Diary, or Business Assets. This prevents someone who has access to your unlocked phone from viewing your most sensitive files.</p>
                            </div>
                            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                <span className="text-white font-bold text-sm block mb-1">Reset Recent Items</span>
                                <p className="text-xs text-gray-400 leading-relaxed">Privacy maintenance. This tool wipes your "Recently Visited" history from the dashboard sidebar. It does <span className="text-orange-400">not</span> delete any records; it simply resets the navigation shortcuts to maintain your privacy from shoulder-surfers.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                        <h5 className="text-purple-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Activity className="h-4 w-4" /> Test Data Utilities
                        </h5>
                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                            <span className="text-white font-bold text-sm block mb-2 font-mono">Demo Data Injection</span>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-[10px] text-gray-500 bg-white/5 p-2 rounded-lg border border-white/5">
                                    <strong className="text-gray-300 block mb-1 italic">Medical Demo</strong>
                                    Injects mock prescriptions, vitals, and hospital visits.
                                </div>
                                <div className="text-[10px] text-gray-500 bg-white/5 p-2 rounded-lg border border-white/5">
                                    <strong className="text-gray-300 block mb-1 italic">Vault Demo</strong>
                                    Generates example logins, secure notes, and API keys.
                                </div>
                                <div className="text-[10px] text-gray-500 bg-white/5 p-2 rounded-lg border border-white/5">
                                    <strong className="text-gray-300 block mb-1 italic">Finance Demo</strong>
                                    Populates sample credit cards and asset inventories.
                                </div>
                                <div className="text-[10px] text-gray-500 bg-white/5 p-2 rounded-lg border border-white/5">
                                    <strong className="text-gray-300 block mb-1 italic">Social Demo</strong>
                                    Adds sample diary entries and social profiles.
                                </div>
                            </div>
                            <p className="text-[9px] text-blue-400/60 mt-3 font-bold uppercase tracking-tighter">* Useful for exploring layout possibilities before adding your real data.</p>
                        </div>
                    </div>

                    <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl group">
                        <h5 className="text-red-500 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2 group-hover:animate-pulse">
                            <AlertCircle className="h-4 w-4" /> The Danger Zone
                        </h5>
                        <div className="space-y-3">
                            <p className="text-xs text-gray-400">Irreversible actions that modify the fundamental state of your hub. <span className="text-red-400 font-bold underline">Proceed with extreme caution.</span></p>
                            <ul className="space-y-2">
                                <li className="text-[10px] flex gap-2">
                                    <span className="text-red-500 font-bold">WIPE SECTIONS:</span> 
                                    <span className="text-gray-500">Mass-delete every record in a specific hub (e.g. Delete all 400 passwords at once).</span>
                                </li>
                                <li className="text-[10px] flex gap-2">
                                    <span className="text-red-500 font-bold">MASTER RESET:</span> 
                                    <span className="text-gray-500">Removes all local biometrics, custom themes, and cached settings without deleting vault data.</span>
                                </li>
                                <li className="text-[10px] flex gap-2">
                                    <span className="text-red-500 font-bold">FACTORY RESET:</span> 
                                    <span className="text-gray-500 font-black uppercase italic">Permanent destruction.</span> 
                                    <span className="text-gray-500">Wipes your entire account, all encrypted records, and all backups from our servers.</span>
                                </li>
                            </ul>
                        </div>
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
        if (isOpen && initialPageId) {
            const helpId = HELP_MAP[initialPageId] || initialPageId
            const idx = HELP_PAGES.findIndex(p => p.id === helpId)
            if (idx !== -1) {
                setCurrentPageIndex(idx)
            }
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
