"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Plus, Folder, Shield, AlertTriangle, Clock, ChevronRight,
  Heart, Car, Briefcase, Box, Smartphone,
  CheckCircle2,
  Book,
  Globe,
  Plane, Target, Key, Activity, CreditCard, Image, Lock, HelpCircle,
  Settings2, Star, Trash2, ChevronDown, ChevronUp, Zap, DollarSign, Database,
  LayoutGrid, PieChart as WheelIcon, TrendingUp, Sparkles, Wallet, Battery, Sun
} from "lucide-react"
import { 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
    ResponsiveContainer, Tooltip as RechartsTooltip, 
    AreaChart, Area, XAxis, YAxis 
} from 'recharts'
import { toast } from "sonner"
import AddPasswordModal from "./modals/add-password-modal"
import AddFolderModal from "./modals/add-folder-modal"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  MOCKED_HEALTH, 
  MOCKED_PASSWORDS, 
  MOCKED_SUBSCRIPTIONS, 
  MOCKED_GOALS, 
  MOCKED_TASKS,
  MOCKED_BUDGET
} from "../lib/mock-data"

interface DashboardProps {
  records: any[]
  setRecords: (records: any[]) => void
  setActivePage: (page: string) => void
  theme: string
  addItem: (item: any) => Promise<any>
  updateItem: (id: string, updates: any) => Promise<any>
  addFolder: (name: string, parentId?: string, extra?: any) => Promise<any>
  securitySettings?: Record<string, { isLocked: boolean }>
  onOpenHelp?: (targetId?: string) => void
  mockSettings?: Record<string, boolean>
}

const DEFAULT_AREAS = [
    { subject: 'Health', score: 7, icon: Battery, color: '#10b981' },
    { subject: 'Wealth', score: 5, icon: Wallet, color: '#f59e0b' },
    { subject: 'Growth', score: 8, icon: TrendingUp, color: '#3b82f6' },
    { subject: 'Spirit', score: 4, icon: Sun, color: '#8b5cf6' },
    { subject: 'Social', score: 6, icon: UsersIcon, color: '#ec4899' },
    { subject: 'Career', score: 9, icon: Briefcase, color: '#ef4444' },
]

function UsersIcon(props: any) {
  return <Globe {...props} /> // Fallback or use Lucide Users if available
}

export default function Dashboard({ 
    records, 
    setRecords, 
    setActivePage, 
    theme, 
    addItem, 
    updateItem, 
    addFolder, 
    securitySettings = {}, 
    onOpenHelp,
    mockSettings
}: DashboardProps) {
  const [addPasswordModalOpen, setAddPasswordModalOpen] = useState(false)
  const [addFolderModalOpen, setAddFolderModalOpen] = useState(false)
  const [enabledPulseIds, setEnabledPulseIds] = useState<string[]>(['security', 'assets', 'goals'])
  const [dbCount, setDbCount] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'wheel'>('grid')
  const [localScores, setLocalScores] = useState<Record<string, number>>({})
  const [configOpen, setConfigOpen] = useState(false)

  const isDark = theme !== "light"

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_pulses')
    if (saved) {
      try { enEnabledPulseIds(JSON.parse(saved)) } catch (e) {}
    }
    const savedDbs = localStorage.getItem('slh_custom_databases')
    if (savedDbs) {
      try {
        const parsed = JSON.parse(savedDbs)
        setDbCount(Array.isArray(parsed) ? parsed.length : 0)
      } catch (e) {}
    }
  }, [])

  function enEnabledPulseIds(val: string[]) { setEnabledPulseIds(val) }

  const togglePulse = (id: string) => {
    const newIds = enabledPulseIds.includes(id)
      ? enabledPulseIds.filter(pid => pid !== id)
      : [...enabledPulseIds, id]
    setEnabledPulseIds(newIds)
    localStorage.setItem('dashboard_pulses', JSON.stringify(newIds))
  }
  // -- Base Records (Merged with Mocks) --
  const baseRecords = useMemo(() => {
    let combined = [...records];
    
    // Extract real records by type for checking
    const realPasswords = records.filter(r => r.type === 'password' || r.type === 'login' || r.category === 'Logins')
    const realHealth = records.filter(r => r.type === 'health-record' || r.category === 'Health Records' || r.category === 'Vitals' || r.type === 'medication' || r.category === 'Medications')
    const realSubs = records.filter(r => r.category === "Subscriptions" || r.type === "subscription")
    const realGoals = records.filter(r => r.item_metadata?.is_goal || r.category === "Goals")
    const realTasks = records.filter(r => r.type === "architect-task")
    const realBudget = records.filter(r => r.category === "Budget" || r.item_metadata?.is_budget)

    // Only add mock data if there are ZERO real records of that type, even if mock settings are enabled.
    // This follows the priority rule set for individual pages.
    if (mockSettings?.['type-health-records'] && realHealth.length === 0) combined = [...combined, ...MOCKED_HEALTH];
    if (mockSettings?.['passwords'] && realPasswords.length === 0) combined = [...combined, ...MOCKED_PASSWORDS];
    if (mockSettings?.['type-subscriptions'] && realSubs.length === 0) combined = [...combined, ...MOCKED_SUBSCRIPTIONS];
    if (mockSettings?.['type-goals'] && realGoals.length === 0) combined = [...combined, ...MOCKED_GOALS];
    if (mockSettings?.['type-tasks'] && realTasks.length === 0) combined = [...combined, ...MOCKED_TASKS];
    if (mockSettings?.['type-budget'] && realBudget.length === 0) combined = [...combined, ...MOCKED_BUDGET];
    
    return combined;
  }, [records, mockSettings]);

  // -- Stats Calculation --
  const folders = baseRecords.filter((r: any) => r.type === "folder")
  const healthCount = baseRecords.filter((r: any) => r.category === "Health Records" || r.category === "Medications" || r.item_metadata?.is_vital).length
  const vehicleCount = baseRecords.filter((r: any) => r.category === "Vehicles").length
  const bizCount = baseRecords.filter((r: any) => r.category === "Business").length
  const assetCount = baseRecords.filter((r: any) => r.category === "Assets" || r.type === "asset").length
  const digitalCount = baseRecords.filter((r: any) => r.category === "Digital Life" || r.category === "Social Life").length
  const diaryCount = baseRecords.filter((r: any) => r.category === "My Diary").length
  const knowledgeCount = baseRecords.filter((r: any) => r.category === "Knowledge Vault").length
  const travelCount = baseRecords.filter((r: any) => r.category === "Travel").length
  const goalsCount = baseRecords.filter((r: any) => r.category === "Goals" || r.type === "goal" || r.item_metadata?.is_goal).length
  const vaultCount = baseRecords.filter((r: any) => r.type === "password" || r.category === "Logins").length

  const totalAssetValue = baseRecords
    .filter((r: any) => (r.category === "Assets" || r.type === "asset") && r.item_metadata?.value)
    .reduce((sum: number, r: any) => sum + (parseFloat(r.item_metadata.value) || 0), 0)

  const weakPasswords = baseRecords.filter((r: any) => r.type === "password" && r.strength === "weak").length
  const securityScore = Math.max(0, 100 - (weakPasswords * 5))
  const subCount = baseRecords.filter((r: any) => r.category === "Subscriptions" || r.type === "subscription").length
  const mediaCount = baseRecords.filter((r: any) => r.category === "Secure Media" || r.type === "media").length
  const passCount = baseRecords.filter((r: any) => r.type === "password" || r.type === "login").length
  const favoriteCount = baseRecords.filter((r: any) => r.is_favorite).length

  // Subscriptions Financials
  const monthlyBurn = baseRecords
    .filter(r => r.category === "Subscriptions" || r.type === "subscription")
    .reduce((acc, s) => acc + (parseFloat(s.item_metadata?.cost) || 0), 0)

  // Net Profit
  const budgetItems = baseRecords.filter((r: any) => r.category === "Budget" || r.item_metadata?.is_budget)
  const totalIncome = budgetItems.filter((r: any) => r.item_metadata?.entry_type === 'income').reduce((s, r) => s + (parseFloat(r.item_metadata.amount) || 0), 0)
  const totalExpenses = budgetItems.filter((r: any) => r.item_metadata?.entry_type === 'expense').reduce((s, r) => s + (parseFloat(r.item_metadata.amount) || 0), 0)
  const netProfit = totalIncome - totalExpenses

  // Health Stats
  const healthLogs = baseRecords.filter(r => r.type === "energy-mood-log" || r.type === "health-checkin")
  const avgEnergy = healthLogs.length > 0 ? healthLogs.reduce((acc, l) => acc + (l.item_metadata.energy || 0), 0) / healthLogs.length : 0

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

  // Recent Activity
  const [clearedAt, setClearedAt] = useState<number>(0)
  useEffect(() => {
    const saved = localStorage.getItem('dashboard_activity_cleared_at')
    if (saved) setClearedAt(parseInt(saved))
  }, [])
  const recentItems = [...records]
    .filter((item: any) => new Date(item.updatedAt || 0).getTime() > clearedAt)
    .sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .slice(0, 15)

  // -- Unified Life Wheel Calculation --
  const lifeWheelData = useMemo(() => {
    return DEFAULT_AREAS.map(area => {
        let score = localScores[area.subject] || area.score
        if (area.subject === 'Health') score = Math.max(score, avgEnergy || 0)
        if (area.subject === 'Wealth') score = Math.max(score, Math.min(10, totalAssetValue / 10000))
        if (area.subject === 'Growth') score = Math.max(score, Math.min(10, goalsCount))
        return { ...area, A: score, fullMark: 10 }
    })
  }, [avgEnergy, totalAssetValue, goalsCount, localScores])

  const averageLifeScore = Math.round(lifeWheelData.reduce((acc, curr) => acc + curr.A, 0) / lifeWheelData.length * 10);

  // Styles
  const glassPanel = isDark
    ? "bg-[#1a1a1a]/60 backdrop-blur-3xl border border-white/5 shadow-2xl"
    : "bg-white/60 backdrop-blur-xl border border-gray-200 shadow-xl"

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header & Pulse Tools */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 uppercase">
                Life Architect Hub
              </h1>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Centralized Operational Insight Engine</p>
            </div>
          </div>
          <div className="flex gap-3">
             <button onClick={() => setAddPasswordModalOpen(true)} className="flex items-center px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/20 text-white font-black uppercase text-[10px] tracking-widest transition-all active:scale-95">
              <Plus className="h-4 w-4 mr-2" /> Quick Add
            </button>
            <button onClick={() => setAddFolderModalOpen(true)} className="flex items-center px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-black uppercase text-[10px] tracking-widest transition-all hover:text-white">
              <Folder className="h-4 w-4 mr-2" /> New Map
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4">
           {/* Pulse Widget */}
          <div className={`rounded-[2.5rem] ${glassPanel} p-6 relative group overflow-hidden`}>
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="flex flex-wrap justify-center gap-2 relative">
                {activePulses.length === 0 ? (
                  <div className="opacity-20 italic text-xs py-4 uppercase font-black tracking-widest">No Signals Pinned</div>
                ) : (
                  activePulses.map(pulse => (
                    <button key={pulse.id} onClick={() => setActivePage(ALL_PULSES.find(p => p.id === pulse.id)?.id as any)} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/5 hover:bg-white/10 hover:scale-105 transition-all min-w-[70px]">
                        <pulse.icon className={`h-4 w-4 ${pulse.color}`} />
                        <span className="text-[8px] font-black uppercase text-gray-500">{pulse.label}</span>
                        <span className="text-[9px] font-bold text-white">{pulse.valueText}</span>
                    </button>
                  ))
                )}
             </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="pulse" className="border-none">
                <AccordionTrigger className={`px-6 py-4 rounded-3xl ${glassPanel} hover:no-underline font-black text-[10px] uppercase tracking-widest text-blue-400`}>
                    Personalize Pulse Signals
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-0">
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                        {ALL_PULSES.map(pulse => (
                            <button key={pulse.id} onClick={() => togglePulse(pulse.id)} className={`p-2 rounded-xl text-[8px] font-black uppercase tracking-tighter border transition-all ${enabledPulseIds.includes(pulse.id) ? 'bg-blue-600/20 border-blue-500/50 text-white' : 'bg-white/5 border-white/5 text-gray-600 hover:text-gray-400'}`}>
                                {pulse.label}
                            </button>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Main View Toggle */}
      <div className="flex items-center justify-between pl-4">
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white/80">Operational Mapping</h2>
        <div className="flex bg-black/20 p-1 rounded-2xl border border-white/5">
            <button onClick={() => setViewMode('grid')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'text-gray-500 hover:text-white'}`}>Grid View</button>
            <button onClick={() => setViewMode('wheel')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'wheel' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' : 'text-gray-500 hover:text-white'}`}>Life Wheel</button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-700">
            <ModuleCard title="Vault" count={vaultCount} description="Secure credentials & sync" icon={<Key />} color="purple" onClick={() => setActivePage('passwords')} isLocked={securitySettings['passwords']?.isLocked} onHelp={() => onOpenHelp?.('passwords')} />
            <ModuleCard title="Health" count={healthCount} description="Vital signals & medical hub" icon={<Heart />} color="red" onClick={() => setActivePage('type-health-records')} isLocked={securitySettings['type-health-records']?.isLocked} onHelp={() => onOpenHelp?.('health')} />
            <ModuleCard title="Financial Cards" count={records.filter((r: any) => r.type === "financial-card").length} description="Manage credit & debit cards" icon={<CreditCard />} color="emerald" onClick={() => setActivePage('financial-cards')} isLocked={securitySettings['financial-cards']?.isLocked} onHelp={() => onOpenHelp?.('finance')} />
            <ModuleCard title="Subscriptions" count={subCount} description="Recurring load monitoring" icon={<Zap />} color="amber" onClick={() => setActivePage('type-subscriptions')} onHelp={() => onOpenHelp?.('subscriptions')} />
            <ModuleCard title="Vehicles" count={vehicleCount} description="Fleet & transport terminal" icon={<Car />} color="blue" onClick={() => setActivePage('type-vehicles')} onHelp={() => onOpenHelp?.('mobility')} />
            <ModuleCard title="Business" count={bizCount} description="Strategic project management" icon={<Briefcase />} color="orange" onClick={() => setActivePage('type-business')} onHelp={() => onOpenHelp?.('finance')} />
            <ModuleCard title="Social" count={digitalCount} description="Online presence audit" icon={<Globe />} color="pink" onClick={() => setActivePage('type-digital-life')} onHelp={() => onOpenHelp?.('social')} />
            <ModuleCard title="Databases" count={dbCount} description="Custom schema kolektions" icon={<Database />} color="indigo" onClick={() => setActivePage('secure-database')} onHelp={() => onOpenHelp?.('secure-database')} />
            <ModuleCard title="Diary" count={diaryCount} description="Temporal consciousness log" icon={<Book />} color="rose" onClick={() => setActivePage('type-diary')} onHelp={() => onOpenHelp?.('social')} />
            <ModuleCard title="Goals" count={goalsCount} description="Objective & habit architecture" icon={<Target />} color="teal" onClick={() => setActivePage('type-goals')} onHelp={() => onOpenHelp?.('goals')} />
            <ModuleCard title="Media" count={mediaCount} description="High-fidelity visual vault" icon={<Image />} color="cyan" onClick={() => setActivePage('type-media')} onHelp={() => onOpenHelp?.('media')} />
            <ModuleCard title="Travel" count={travelCount} description="Itinerary & mobility hub" icon={<Plane />} color="indigo" onClick={() => setActivePage('type-travel')} onHelp={() => onOpenHelp?.('mobility')} />
        </div>
      ) : (
        <div className={`p-10 rounded-[3rem] ${glassPanel} animate-in zoom-in-95 duration-700`}>
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 h-[500px] w-full relative">
                    <div className="absolute inset-0 bg-indigo-500/5 blur-[120px] rounded-full" />
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={lifeWheelData}>
                            <PolarGrid stroke="#ffffff10" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10, fontWeight: 'black' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                            <Radar name="Balance" dataKey="A" stroke="#6366f1" strokeWidth={4} fill="#6366f1" fillOpacity={0.15} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-5 space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase">Personal Equilibrium</h3>
                        <button onClick={() => setConfigOpen(!configOpen)} className="p-3 rounded-2xl bg-white/5 text-gray-500 hover:text-white transition-all"><Settings2 className="h-4 w-4" /></button>
                    </div>
                    {configOpen && (
                        <div className="grid grid-cols-2 gap-3 p-6 rounded-3xl bg-black/20 animate-in slide-in-from-top-4 duration-300">
                            {lifeWheelData.map(area => (
                                <div key={area.subject} className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-gray-500">{area.subject}</label>
                                    <input type="number" min="0" max="10" value={area.A} onChange={e => setLocalScores(p => ({ ...p, [area.subject]: parseInt(e.target.value) }))} className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-center text-xs font-black text-white outline-none" />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div className="p-8 rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 text-center relative overflow-hidden group">
                           <div className="absolute -top-10 -right-10 p-10 opacity-5 group-hover:scale-110 transition-transform"><Sparkles className="h-32 w-32" /></div>
                           <p className="text-[10px] font-black uppercase text-indigo-400 mb-2 tracking-widest">Aggregate Vitality Status</p>
                           <p className="text-5xl font-black italic text-white tracking-tighter">{averageLifeScore}%</p>
                           <p className="text-xs text-gray-600 mt-4 leading-relaxed font-bold italic tracking-tight">"Structural integrity depends on multi-node balance across all operational sectors."</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                             <div className="p-4 rounded-2xl bg-white/5 flex flex-col items-center">
                                <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Monthly Burn</p>
                                <p className="text-lg font-black italic text-white">${monthlyBurn.toFixed(0)}</p>
                             </div>
                             <div className="p-4 rounded-2xl bg-white/5 flex flex-col items-center">
                                <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Active Targets</p>
                                <p className="text-lg font-black italic text-white">{goalsCount}</p>
                             </div>
                             <div className="p-4 rounded-2xl bg-white/5 flex flex-col items-center">
                                <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Security Rating</p>
                                <p className="text-lg font-black italic text-emerald-500">{securityScore}%</p>
                             </div>
                        </div>
                    </div>
                </div>
             </div>
        </div>
      )}

      {/* Execution & Activity Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className={`p-8 rounded-[3rem] ${glassPanel}`}>
                 <div className="flex justify-between items-center mb-8 pr-2">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        <h2 className="text-xl font-black italic uppercase tracking-tighter">Execution Matrix</h2>
                    </div>
                    <button onClick={() => setActivePage('type-tasks')} className="text-[10px] font-black text-blue-500 hover:text-white uppercase tracking-widest">Full Command ΓÇö&gt;</button>
                 </div>
                 <div className="space-y-3">
                    {records.filter(r => r.type === "architect-task" && !r.item_metadata?.completed).slice(0, 4).map(task => (
                        <div key={task.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                             <div className="flex items-center gap-4">
                                <div className={`h-1.5 w-1.5 rounded-full ${task.item_metadata?.priority === 'urgent' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                <span className="text-xs font-bold text-white uppercase tracking-tight">{task.title}</span>
                             </div>
                             <button onClick={() => updateItem(task.id, { item_metadata: { ...task.item_metadata, completed: true } })} className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-emerald-500 transition-all"><CheckCircle2 className="h-4 w-4" /></button>
                        </div>
                    ))}
                    {records.filter(r => r.type === "architect-task" && !r.item_metadata?.completed).length === 0 && <div className="text-center py-6 opacity-20 text-[10px] font-black uppercase">No Active Protocols</div>}
                 </div>
            </div>

            <div className={`p-8 rounded-[3rem] ${glassPanel}`}>
                 <div className="flex justify-between items-center mb-8 pr-2">
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-amber-500" />
                        <h2 className="text-xl font-black italic uppercase tracking-tighter">Temporal Log</h2>
                    </div>
                    {recentItems.length > 0 && <button onClick={() => { setClearedAt(Date.now()); localStorage.setItem('dashboard_activity_cleared_at', Date.now().toString()); }} className="text-[10px] font-black text-amber-500 hover:text-white uppercase tracking-widest">Purge Logs</button>}
                 </div>
                 <div className="space-y-2">
                    {recentItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/2 hover:bg-white/5 transition-all text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            <span className="truncate max-w-[200px] text-white/80">{item.title || "Untitled Record"}</span>
                            <span className="opacity-30">{new Date(item.updatedAt).toLocaleDateString()}</span>
                        </div>
                    ))}
                    {recentItems.length === 0 && <div className="text-center py-6 opacity-20 text-[10px] font-black uppercase">Archive Synchronized</div>}
                 </div>
            </div>
      </div>

      <Modals addPasswordOpen={addPasswordModalOpen} setAddPasswordOpen={setAddPasswordModalOpen} addFolderOpen={addFolderModalOpen} setAddFolderOpen={setAddFolderModalOpen} folders={folders} theme={theme} addItem={addItem} addFolder={addFolder} />
    </div>
  )
}

function ModuleCard({ title, count, description, icon, color, onClick, isLocked, onHelp }: any) {
    const colors: any = {
        purple: "border-purple-500/30 hover:border-purple-500 text-purple-400 shadow-purple-900/10",
        red: "border-red-500/30 hover:border-red-500 text-red-500 shadow-red-900/10",
        emerald: "border-emerald-500/30 hover:border-emerald-500 text-emerald-400 shadow-emerald-900/10",
        amber: "border-amber-500/30 hover:border-amber-500 text-amber-500 shadow-amber-900/10",
        blue: "border-blue-500/30 hover:border-blue-500 text-blue-400 shadow-blue-900/10",
        orange: "border-orange-500/30 hover:border-orange-500 text-orange-400 shadow-orange-900/10",
        pink: "border-pink-500/30 hover:border-pink-500 text-pink-400 shadow-pink-900/10",
        indigo: "border-indigo-500/30 hover:border-indigo-500 text-indigo-400 shadow-indigo-900/10",
        rose: "border-rose-500/30 hover:border-rose-500 text-rose-500 shadow-rose-900/10",
        teal: "border-teal-500/30 hover:border-teal-500 text-teal-400 shadow-teal-900/10",
        cyan: "border-cyan-500/30 hover:border-cyan-500 text-cyan-400 shadow-cyan-900/10",
    }
    const colorStyle = colors[color] || colors.blue

    return (
        <div className={`text-left p-8 rounded-[3rem] border bg-white/5 backdrop-blur-3xl transition-all hover:scale-[1.02] active:scale-[0.98] group relative flex flex-col justify-between h-full ${colorStyle}`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                {icon && <div className={color === 'pink' ? 'text-pink-500' : ''}>{Object.cloneElement(icon, { className: "h-20 w-20" })}</div>}
            </div>
            
            <div className="relative z-10 w-full mb-8">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white/5 cursor-pointer" onClick={onClick}>
                          {icon && Object.cloneElement(icon, { className: "h-5 w-5" })}
                        </div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-black italic tracking-tighter text-white uppercase cursor-pointer" onClick={onClick}>{title}</h4>
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); onHelp?.(); }}
                            className="p-1 rounded-full hover:bg-white/10 text-gray-500 hover:text-blue-400 transition-all focus:outline-none"
                            title={`Explain ${title}`}
                          >
                            <HelpCircle className="h-4 w-4" />
                          </button>
                        </div>
                    </div>
                    {isLocked && <Shield className="h-4 w-4 text-white opacity-40" />}
                </div>
                <div className="mb-4">
                  <span className="bg-white/5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter text-gray-400 border border-white/5">{count} Items</span>
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed cursor-pointer" onClick={onClick}>{description}</p>
            </div>
            
            <div className="flex items-end justify-between relative z-10 cursor-pointer" onClick={onClick}>
                <p className="text-5xl font-black italic tracking-tighter text-white">{count}</p>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Open Hub</span>
                    <ChevronRight className="h-3 w-3 text-gray-700" />
                </div>
            </div>
        </div>
    )
}

function Modals({ addPasswordOpen, setAddPasswordOpen, addFolderOpen, setAddFolderOpen, folders, theme, addItem, addFolder }: any) {
    return (
        <>
            {addPasswordOpen && <AddPasswordModal onClose={() => setAddPasswordOpen(false)} onAdd={(item: any) => { addItem({ ...item, type: "password", category: "Logins" }); setAddPasswordOpen(false); }} folders={folders} theme={theme} />}
            {addFolderOpen && <AddFolderModal onClose={() => setAddFolderOpen(false)} onAdd={async (folder: any) => { await addFolder(folder.name, undefined, folder.parentFolder); setAddFolderOpen(false); }} folders={folders} theme={theme} />}
        </>
    )
}

const Object: any = {
    cloneElement: (el: any, props: any) => { 
        if (!el) return null
        const Icon = el.type
        return <Icon {...el.props} {...props} />
    }
}
