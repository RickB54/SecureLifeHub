"use client"

import { useState, useEffect } from "react"
import {
  Plus, Folder, Shield, AlertTriangle, Clock, ChevronRight,
  Heart, Car, Briefcase, Box, Globe, Book, Plane, Target, Key, Activity, CreditCard, Image, Lock, HelpCircle,
  Settings2, Star, Trash2, ChevronDown, ChevronUp, Zap, DollarSign, Database
} from "lucide-react"
import AddPasswordModal from "./modals/add-password-modal"
import AddFolderModal from "./modals/add-folder-modal"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface DashboardProps {
  records: any[]
  setRecords: (records: any[]) => void
  setActivePage: (page: string) => void
  theme: string
  addItem: (item: any) => Promise<any>
  addFolder: (name: string, parentId?: string, extra?: any) => Promise<any>
  securitySettings?: Record<string, { isLocked: boolean }>
  onOpenHelp?: (targetId?: string) => void
}

export default function Dashboard({ records, setRecords, setActivePage, theme, addItem, addFolder, securitySettings = {}, onOpenHelp }: DashboardProps) {
  const [addPasswordModalOpen, setAddPasswordModalOpen] = useState(false)
  const [addFolderModalOpen, setAddFolderModalOpen] = useState(false)
  const [showPersonalizer, setShowPersonalizer] = useState(false)
  const [enabledPulseIds, setEnabledPulseIds] = useState<string[]>(['security', 'assets', 'goals'])
  const [dbCount, setDbCount] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_pulses')
    if (saved) {
      try {
        setEnabledPulseIds(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse pulses", e)
      }
    }

    // Calculate DB Count for the new card
    const savedDbs = localStorage.getItem('slh_custom_databases')
    if (savedDbs) {
      try {
        const parsed = JSON.parse(savedDbs)
        setDbCount(Array.isArray(parsed) ? parsed.length : 0)
      } catch (e) {}
    }
  }, [])

  const togglePulse = (id: string) => {
    const newIds = enabledPulseIds.includes(id)
      ? enabledPulseIds.filter(pid => pid !== id)
      : [...enabledPulseIds, id]
    setEnabledPulseIds(newIds)
    localStorage.setItem('dashboard_pulses', JSON.stringify(newIds))
  }

  // -- Stats Calculation --
  const folders = records.filter((r: any) => r.type === "folder")
  const totalItems = records.length

  // Specific Category Counts
  const healthCount = records.filter((r: any) => r.category === "Health Records" || r.category === "Medications" || r.item_metadata?.is_vital).length
  const vehicleCount = records.filter((r: any) => r.category === "Vehicles").length
  const bizCount = records.filter((r: any) => r.category === "Business").length
  const assetCount = records.filter((r: any) => r.category === "Assets").length
  const digitalCount = records.filter((r: any) => r.category === "Digital Life" || r.category === "Social Life").length
  const diaryCount = records.filter((r: any) => r.category === "My Diary").length
  const knowledgeCount = records.filter((r: any) => r.category === "Knowledge Vault").length
  const travelCount = records.filter((r: any) => r.category === "Travel").length
  const goalsCount = records.filter((r: any) => r.category === "Goals").length
  const vaultCount = records.filter((r: any) => r.type === "password" || r.category === "Logins").length

  // Asset Value Calculation
  const totalAssetValue = records
    .filter((r: any) => r.category === "Assets" && r.item_metadata?.value)
    .reduce((sum: number, r: any) => sum + (parseFloat(r.item_metadata.value) || 0), 0)

  // Security Score (Mock calculation based on weak passwords)
  const weakPasswords = records.filter((r: any) => r.type === "password" && r.strength === "weak").length
  const securityScore = Math.max(0, 100 - (weakPasswords * 5))

  // Additional Analytics Data
  const subCount = records.filter((r: any) => r.category === "Subscriptions" || r.type === "subscription").length
  const mediaCount = records.filter((r: any) => r.category === "Secure Media" || r.type === "media").length
  const passCount = records.filter((r: any) => r.type === "password" || r.type === "login").length
  const favoriteCount = records.filter((r: any) => r.is_favorite).length

  // Budget / Financial Stats
  const budgetItems = records.filter((r: any) => r.category === "Budget" || r.item_metadata?.is_budget)
  const totalIncome = budgetItems
    .filter((r: any) => r.item_metadata?.entry_type === 'income')
    .reduce((sum: number, r: any) => sum + (parseFloat(r.item_metadata.amount) || 0), 0)
  const totalExpenses = budgetItems
    .filter((r: any) => r.item_metadata?.entry_type === 'expense')
    .reduce((sum: number, r: any) => sum + (parseFloat(r.item_metadata.amount) || 0), 0)
  const netProfit = totalIncome - totalExpenses

  // Pulse Definitions
  const ALL_PULSES = [
    { id: 'security', label: 'Security', icon: Shield, color: 'text-yellow-500', value: securityScore, valueText: `${securityScore}% Safe` },
    { id: 'budget', label: 'Financials', icon: DollarSign, color: 'text-blue-500', valueText: `$${netProfit.toLocaleString()} Net` },
    { id: 'assets', label: 'Net Worth', icon: Activity, color: 'text-emerald-500', valueText: `$${totalAssetValue.toLocaleString()}` },
    { id: 'goals', label: 'Active Goals', icon: Target, color: 'text-violet-500', valueText: `${goalsCount} Targets` },
    { id: 'health', label: 'Health Vitals', icon: Heart, color: 'text-red-500', valueText: `${healthCount} Records` },
    { id: 'subscriptions', label: 'Monthly Sub', icon: CreditCard, color: 'text-green-500', valueText: `${subCount} Services` },
    { id: 'media', label: 'Media Vault', icon: Image, color: 'text-teal-500', valueText: `${mediaCount} Items` },
    { id: 'vehicles', label: 'Vehicles', icon: Car, color: 'text-blue-500', valueText: `${vehicleCount} Profiles` },
    { id: 'business', label: 'Business', icon: Briefcase, color: 'text-orange-500', valueText: `${bizCount} Projects` },
    { id: 'knowledge', label: 'Knowledge', icon: Book, color: 'text-yellow-500', valueText: `${knowledgeCount} Guides` },
    { id: 'travel', label: 'Travel Hub', icon: Plane, color: 'text-indigo-500', valueText: `${travelCount} Plans` },
    { id: 'vault', label: 'Vault Items', icon: Lock, color: 'text-purple-500', valueText: `${passCount} Credentials` },
    { id: 'favorites', label: 'Favorites', icon: Star, color: 'text-amber-500', valueText: `${favoriteCount} Starred` },
    { id: 'diary', label: 'Daily Diary', icon: Book, color: 'text-rose-500', valueText: `${diaryCount} Entries` },
  ]

  const activePulses = ALL_PULSES.filter(p => enabledPulseIds.includes(p.id))

  // Recent Activity Clearing
  const [clearedAt, setClearedAt] = useState<number>(0)

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_activity_cleared_at')
    if (saved) setClearedAt(parseInt(saved))
  }, [])

  const handleClearActivity = () => {
    if (window.confirm("Are you sure you want to clear your recent activity history? This will only remove the shortcuts from this dashboard view.")) {
      const now = Date.now()
      setClearedAt(now)
      localStorage.setItem('dashboard_activity_cleared_at', now.toString())
    }
  }

  // Recent Activity
  const recentItems = [...records]
    .filter((item: any) => new Date(item.updatedAt || 0).getTime() > clearedAt)
    .sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .slice(0, 25)

  // Styles
  const glassPanel = theme === 'light'
    ? "bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl"
    : "bg-gray-800/40 backdrop-blur-xl border border-white/5 shadow-xl"

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">

      {/* Header & Life Pulse */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Welcome Section */}
        <div className="flex-1 space-y-2 relative">
          <div className="flex justify-between items-start">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Secure Life Hub
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Your entire digital and physical life, centralized.</p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setAddPasswordModalOpen(true)}
              className="flex items-center px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all font-medium text-white"
            >
              <Plus className="h-5 w-5 mr-2" /> Quick Add
            </button>
            <button
              onClick={() => setAddFolderModalOpen(true)}
              className="flex items-center px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium"
            >
              <Folder className="h-5 w-5 mr-2" /> New Folder
            </button>
            <button
              onClick={() => setActivePage("settings")}
              className="flex items-center px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium"
            >
              <Activity className="h-5 w-5 mr-2" /> Settings
            </button>
          </div>
        </div>

        {/* Life Pulse Widget */}
        <div className="flex-1 space-y-4">
          <div className={`rounded-3xl ${glassPanel} relative overflow-hidden group`}>
            <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={() => onOpenHelp?.("pulse-personalizer")}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className={`flex flex-wrap justify-center gap-2 px-6 py-4 w-full relative ${activePulses.length === 0 ? 'min-h-[80px] items-center' : ''}`}>
              {activePulses.length === 0 ? (
                <div className="w-full text-center opacity-30 italic text-sm">No analytics pinned. Click the settings icon to add.</div>
              ) : (
                activePulses.map((pulse) => {
                  const goToPage = (id: string) => {
                    const mapping: Record<string, string> = {
                      security: 'security-audit',
                      assets: 'type-assets',
                      goals: 'type-goals',
                      health: 'type-health-records',
                      subscriptions: 'type-subscriptions',
                      media: 'type-media',
                      vehicles: 'type-vehicles',
                      business: 'type-business',
                      knowledge: 'type-knowledge',
                      travel: 'type-travel',
                      vault: 'passwords',
                      budget: 'type-budget',
                      favorites: 'favorites',
                      diary: 'type-diary'
                    }
                    setActivePage(mapping[id] || 'dashboard')
                  }

                  return (
                    <button
                      key={pulse.id}
                      onClick={() => goToPage(pulse.id)}
                      className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl bg-white/5 min-w-[64px] hover:bg-white/10 hover:scale-105 active:scale-95 transition-all group/item"
                    >
                      {pulse.id === 'security' ? (
                        <div className="relative w-10 h-10 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-700/20" />
                            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent"
                              strokeDasharray={`${2 * Math.PI * 16}`}
                              strokeDashoffset={`${2 * Math.PI * 16 * (1 - (pulse.value || 0) / 100)}`}
                              className={`${(pulse.value || 0) > 80 ? 'text-green-500' : 'text-yellow-500'} transition-all duration-1000 ease-out`} />
                          </svg>
                          <Shield className="absolute h-4 w-4 opacity-80" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center bg-gray-500/10 rounded-full group-hover/item:scale-105 transition-transform">
                          <pulse.icon className={`h-5 w-5 ${pulse.color}`} />
                        </div>
                      )}
                      <p className="text-[9px] font-bold uppercase tracking-wide opacity-60 whitespace-nowrap">{pulse.label}</p>
                      <p className={`text-[9px] opacity-50 font-mono ${pulse.id === 'assets' ? 'text-emerald-400' : ''}`}>{pulse.valueText}</p>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Pulse Personalizer (Accordion Style) */}
          {/* Pulse Personalizer (Permanent Accordion) */}
          <div className={`rounded-3xl ${glassPanel} overflow-hidden shadow-2xl border border-white/10`}>
            <Accordion type="single" collapsible className="w-full border-none">
              <AccordionItem value="personalizer" className="border-none">
                <AccordionTrigger className="px-6 py-5 hover:no-underline [&[data-state=open]>svg]:rotate-180 group/trigger">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full pr-6 gap-3">
                    <div className="text-left flex items-center gap-2">
                      <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-blue-400 group-hover/trigger:text-blue-300 transition-colors flex items-center gap-2">
                          Personalize Your Pulse
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => { e.stopPropagation(); onOpenHelp?.("pulse-personalizer"); }}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onOpenHelp?.("pulse-personalizer"); } }}
                            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-blue-500/40 hover:text-blue-400 transition-all cursor-help"
                          >
                            <HelpCircle className="h-4 w-4" />
                          </span>
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-1 lowercase first-letter:uppercase font-medium">Configure analytics pinned to your dashboard</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 font-black uppercase tracking-widest whitespace-nowrap shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        {enabledPulseIds.length} Active
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-300">
                    <div className="mt-2">
                      <Accordion type="multiple" className="w-full space-y-3 border-none">
                        {[
                          { 
                            id: 'core', 
                            title: 'Security & Core', 
                            items: ['security', 'vault', 'favorites'],
                            icon: Shield
                          },
                          { 
                            id: 'finance', 
                            title: 'Finances & Assets', 
                            items: ['assets', 'subscriptions'],
                            icon: CreditCard
                          },
                          { 
                            id: 'health', 
                            title: 'Health & Life', 
                            items: ['health', 'diary', 'goals'],
                            icon: Activity
                          },
                          { 
                            id: 'lifestyle', 
                            title: 'Essentials & Hubs', 
                            items: ['vehicles', 'business', 'knowledge', 'travel', 'media'],
                            icon: Globe
                          }
                        ].map((group) => (
                          <AccordionItem key={group.id} value={group.id} className="border border-white/5 rounded-2xl overflow-hidden px-4 bg-white/5">
                            <AccordionTrigger className="hover:no-underline py-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-white/5 text-blue-400">
                                  <group.icon className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest">{group.title}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-0 pb-5">
                              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-2">
                                {ALL_PULSES.filter(p => group.items.includes(p.id)).map(pulse => {
                                  const isActive = enabledPulseIds.includes(pulse.id)
                                  return (
                                    <button
                                      key={pulse.id}
                                      onClick={() => togglePulse(pulse.id)}
                                      className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 group relative h-full justify-center ${isActive
                                          ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
                                          : 'bg-white/5 border-white/5 opacity-50 hover:opacity-100'
                                        }`}
                                    >
                                      <div className={`p-2.5 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-gray-400'}`}>
                                        <pulse.icon className="h-4 w-4" />
                                      </div>
                                      <span className="text-[10px] font-black uppercase tracking-tight text-center leading-tight">
                                        {pulse.label}
                                      </span>
                                      {isActive && (
                                        <div className="absolute top-2 right-2">
                                          <Zap className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                                        </div>
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
        </div>
      </div>



      <div className="flex items-center gap-3 pl-1">
        <h2 className="text-xl font-bold opacity-80">Your Hubs</h2>
        <button onClick={() => onOpenHelp?.("intro")} className="p-1 hover:bg-white/5 rounded-full text-gray-500 hover:text-blue-400 transition-colors">
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        <ModuleCard
          title="Vault"
          count={vaultCount}
          description="Manage your passwords, logins, and secure notes."
          icon={<Key className="h-6 w-6 text-purple-500" />}
          colorClass="border-purple-500"
          shadowColor="rgba(168, 85, 247, 0.35)"
          buttonColorClass="text-purple-400 hover:bg-purple-500"
          onClick={() => setActivePage('passwords')}
          onHelp={() => onOpenHelp?.("passwords")}
          isLocked={securitySettings['passwords']?.isLocked}
        />
        <ModuleCard
          title="Health"
          count={healthCount}
          description="Track health records, medications, and vitals."
          icon={<Heart className="h-6 w-6 text-red-500" />}
          colorClass="border-red-500"
          shadowColor="rgba(239, 68, 68, 0.35)"
          buttonColorClass="text-red-400 hover:bg-red-500"
          onClick={() => setActivePage('type-health-records')}
          onHelp={() => onOpenHelp?.("health")}
          isLocked={securitySettings['type-health-records']?.isLocked}
        />
        <ModuleCard
          title="Financial Cards"
          count={records.filter((r: any) => r.type === "financial-card").length}
          description="Manage your credit and debit cards securely."
          icon={<CreditCard className="h-6 w-6 text-yellow-500" />}
          colorClass="border-yellow-500"
          shadowColor="rgba(234, 179, 8, 0.35)"
          buttonColorClass="text-yellow-400 hover:bg-yellow-500"
          onClick={() => setActivePage('financial-cards')}
          onHelp={() => onOpenHelp?.("finance")}
          isLocked={securitySettings['financial-cards']?.isLocked}
        />
        <ModuleCard
          title="Vehicles"
          count={vehicleCount}
          description="Manage vehicle profiles, maintenance, and docs."
          icon={<Car className="h-6 w-6 text-blue-500" />}
          colorClass="border-blue-500"
          shadowColor="rgba(59, 130, 246, 0.35)"
          buttonColorClass="text-blue-400 hover:bg-blue-500"
          onClick={() => setActivePage('type-vehicles')}
          onHelp={() => onOpenHelp?.("mobility")}
          isLocked={securitySettings['type-vehicles']?.isLocked}
        />
        <ModuleCard
          title="Business"
          count={bizCount}
          description="Organize side projects, clients, and contracts."
          icon={<Briefcase className="h-6 w-6 text-orange-500" />}
          colorClass="border-orange-500"
          shadowColor="rgba(249, 115, 22, 0.35)"
          buttonColorClass="text-orange-400 hover:bg-orange-500"
          onClick={() => setActivePage('type-business')}
          onHelp={() => onOpenHelp?.("finance")}
          isLocked={securitySettings['type-business']?.isLocked}
        />
        <ModuleCard
          title="Assets"
          count={assetCount}
          description="Track physical inventory and asset values."
          icon={<Box className="h-6 w-6 text-emerald-500" />}
          colorClass="border-emerald-500"
          shadowColor="rgba(16, 185, 129, 0.35)"
          buttonColorClass="text-emerald-400 hover:bg-emerald-500"
          onClick={() => setActivePage('type-assets')}
          onHelp={() => onOpenHelp?.("finance")}
          isLocked={securitySettings['type-assets']?.isLocked}
        />
        <ModuleCard
          title="Social Life"
          count={digitalCount}
          description="Manage social media and online assets."
          icon={<Globe className="h-6 w-6 text-pink-500" />}
          colorClass="border-pink-500"
          shadowColor="rgba(236, 72, 153, 0.35)"
          buttonColorClass="text-pink-400 hover:bg-pink-500"
          onClick={() => setActivePage('type-digital-life')}
          onHelp={() => onOpenHelp?.("social")}
          isLocked={securitySettings['type-digital-life']?.isLocked}
        />
        <ModuleCard
          title="Secure Database"
          count={dbCount}
          description="High-fidelity kolektions with custom schemas and dynamic reports."
          icon={<Database className="h-6 w-6 text-indigo-500" />}
          colorClass="border-indigo-500"
          shadowColor="rgba(99, 102, 241, 0.35)"
          buttonColorClass="text-indigo-400 hover:bg-indigo-500"
          onClick={() => setActivePage('secure-database')}
          onHelp={() => onOpenHelp?.("secure-database")}
        />
        <ModuleCard
          title="My Diary"
          count={diaryCount}
          description="Personal journal and daily thoughts."
          icon={<Book className="h-6 w-6 text-rose-500" />}
          colorClass="border-rose-500"
          shadowColor="rgba(244, 63, 94, 0.35)"
          buttonColorClass="text-rose-400 hover:bg-rose-500"
          onClick={() => setActivePage('type-diary')}
          onHelp={() => onOpenHelp?.("social")}
          isLocked={securitySettings['diary']?.isLocked}
        />
        <ModuleCard
          title="Subscriptions"
          count={records.filter((r: any) => r.category === "Subscriptions" || r.type === "subscription").length}
          description="Track recurring expenses and renewals."
          icon={<CreditCard className="h-6 w-6 text-green-500" />}
          colorClass="border-green-500"
          shadowColor="rgba(34, 197, 94, 0.35)"
          buttonColorClass="text-green-400 hover:bg-green-500"
          onClick={() => setActivePage('type-subscriptions')}
          onHelp={() => onOpenHelp?.("social")}
          isLocked={securitySettings['type-subscriptions']?.isLocked}
        />
        <ModuleCard
          title="Media Vault"
          count={records.filter((r: any) => r.category === "Secure Media").length}
          description="Encrypted gallery for photos and videos."
          icon={<Image className="h-6 w-6 text-teal-500" />}
          colorClass="border-teal-500"
          shadowColor="rgba(20, 184, 166, 0.35)"
          buttonColorClass="text-teal-400 hover:bg-teal-500"
          onClick={() => setActivePage('type-media')}
          onHelp={() => onOpenHelp?.("media")}
          isLocked={securitySettings['media']?.isLocked}
        />
        <ModuleCard
          title="Travel"
          count={travelCount}
          description="Travel plans, passports, and itineraries."
          icon={<Plane className="h-6 w-6 text-indigo-500" />}
          colorClass="border-indigo-500"
          shadowColor="rgba(99, 102, 241, 0.35)"
          buttonColorClass="text-indigo-400 hover:bg-indigo-500"
          onClick={() => setActivePage('type-travel')}
          onHelp={() => onOpenHelp?.("mobility")}
          isLocked={securitySettings['type-travel']?.isLocked}
        />
        <ModuleCard
          title="Goals"
          count={goalsCount}
          description="Life goals and interactive progress tracking."
          icon={<Target className="h-6 w-6 text-pink-500" />}
          colorClass="border-pink-500"
          shadowColor="rgba(236, 72, 153, 0.35)"
          buttonColorClass="text-pink-400 hover:bg-pink-500"
          onClick={() => setActivePage('type-goals')}
          onHelp={() => onOpenHelp?.("goals")}
          isLocked={securitySettings['goals']?.isLocked}
        />
      </div>

      <div className={`p-0 rounded-3xl ${glassPanel} overflow-hidden shadow-2xl border border-white/10`}>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="activity" className="border-none">
            <AccordionTrigger className="px-6 py-5 hover:no-underline [&[data-state=open]>svg]:rotate-180 group/trigger">
              <div className="flex items-center justify-between w-full pr-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                      Recent Activity
                      <span 
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); onOpenHelp?.("settings-recents"); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onOpenHelp?.("settings-recents"); }}}
                        className="p-1 px-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-blue-400 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Help</span>
                      </span>
                    </h2>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tight">{recentItems.length} Changes Captured</p>
                  </div>
                </div>
                {recentItems.length > 0 && (
                  <span
                    onClick={(e) => { e.stopPropagation(); handleClearActivity(); }}
                    className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-white transition-colors bg-blue-500/5 px-3 py-1.5 rounded-full border border-blue-500/10 cursor-pointer"
                  >
                    Clear History
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                {recentItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group cursor-default">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-black/20 border border-white/5`}>
                        {getIconForCategory(item.category)}
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-wide text-gray-200">{item.title || item.name || "Untitled"}</p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-2 uppercase font-black tracking-tight">
                          {item.category || "General"} <span className="text-gray-700">•</span> <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                ))}
                {recentItems.length === 0 && (
                  <div className="text-center py-10">
                    <div className="inline-flex p-4 rounded-full bg-white/5 mb-3 text-gray-600">
                      <Clock className="h-8 w-8" />
                    </div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">No activity found</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Modals */}
      {addPasswordModalOpen && (
        <AddPasswordModal
          onClose={() => setAddPasswordModalOpen(false)}
          onAdd={(item: any) => {
            addItem({
              ...item,
              type: "password", // default
              category: "Logins"
            })
            setAddPasswordModalOpen(false)
          }}
          folders={folders}
          theme={theme}
        />
      )}
      {addFolderModalOpen && (
        <AddFolderModal
          onClose={() => setAddFolderModalOpen(false)}
          onAdd={async (folder: any) => {
            await addFolder(folder.name, undefined, folder.parentFolder)
            setAddFolderModalOpen(false)
          }}
          folders={folders}
          theme={theme}
        />
      )}
    </div>
  )
}

// -- Subcomponents --

interface ModuleCardProps {
  title: string
  description: string
  icon: any
  colorClass: string
  buttonColorClass: string
  shadowColor?: string
  onClick: () => void
  count: number
  isLocked?: boolean
  onHelp?: () => void
}

function ModuleCard({ title, description, icon, colorClass, buttonColorClass, shadowColor, onClick, count, isLocked, onHelp }: ModuleCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#1e1e1e] border-2 rounded-3xl flex flex-col overflow-hidden transition-all duration-300 group ${colorClass} relative w-full text-left active:scale-[0.98] cursor-pointer`}
      style={{
        boxShadow: shadowColor
          ? `0 0 30px ${shadowColor}, 0 0 60px ${shadowColor.replace('0.35', '0.15')}, 0 8px 32px rgba(0,0,0,0.7)`
          : '0 8px 32px rgba(0,0,0,0.7)'
      }}
    >
      {isLocked && <Lock className="absolute top-4 right-4 h-4 w-4 text-yellow-500 z-10" />}
      <div className="p-4 md:p-6 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/5 group-hover:scale-110 group-active:scale-95 transition-transform">
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-lg text-white leading-tight">{title}</h3>
              {count > 0 && <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-gray-500">{count} Items</span>}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onHelp?.(); }}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onHelp?.(); }}}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-all cursor-pointer bg-white/5"
            title="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
        <p className="text-gray-400 text-[10px] md:text-xs leading-relaxed line-clamp-2 md:line-clamp-none">{description}</p>
      </div>
    </div>
  )
}

function getIconForCategory(category: string) {
  if (!category) return <Shield className="h-4 w-4 opacity-50" />
  if (category.includes("Health") || category.includes("Med") || category.includes("Vital")) return <Heart className="h-4 w-4 text-red-500" />
  if (category.includes("Vehicle")) return <Car className="h-4 w-4 text-blue-500" />
  if (category.includes("Business")) return <Briefcase className="h-4 w-4 text-orange-500" />
  if (category.includes("Asset")) return <Box className="h-4 w-4 text-emerald-500" />
  if (category.includes("Digital") || category.includes("Social")) return <Globe className="h-4 w-4 text-pink-500" />
  if (category.includes("Diary")) return <Book className="h-4 w-4 text-rose-500" />
  if (category.includes("Knowledge")) return <Book className="h-4 w-4 text-yellow-500" />
  if (category.includes("Travel")) return <Plane className="h-4 w-4 text-indigo-500" />
  if (category.includes("Goal")) return <Target className="h-4 w-4 text-pink-500" />
  if (category.includes("Media")) return <Image className="h-4 w-4 text-teal-500" />
  if (category.includes("Sub")) return <CreditCard className="h-4 w-4 text-green-500" />
  return <Key className="h-4 w-4 text-purple-500" />
}

