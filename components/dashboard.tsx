"use client"

import { useState, useEffect } from "react"
import {
  Plus, Folder, Shield, AlertTriangle, Clock, ChevronRight,
  Heart, Car, Briefcase, Box, Globe, Book, Plane, Target, Key, Activity, CreditCard, Image, Lock, HelpCircle
} from "lucide-react"
import AddPasswordModal from "./modals/add-password-modal"
import AddFolderModal from "./modals/add-folder-modal"

interface DashboardProps {
  records: any[]
  setRecords: (records: any[]) => void
  setActivePage: (page: string) => void
  theme: string
  addItem: (item: any) => Promise<any>
  addFolder: (name: string, parentId?: string) => Promise<any>
  securitySettings?: Record<string, { isLocked: boolean }>
  setHelpOpen?: () => void
}

export default function Dashboard({ records, setRecords, setActivePage, theme, addItem, addFolder, securitySettings = {}, setHelpOpen }: DashboardProps) {
  const [addPasswordModalOpen, setAddPasswordModalOpen] = useState(false)
  const [addFolderModalOpen, setAddFolderModalOpen] = useState(false)

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

  // Recent Activity Clearing
  const [clearedAt, setClearedAt] = useState<number>(0)

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_activity_cleared_at')
    if (saved) setClearedAt(parseInt(saved))
  }, [])

  const handleClearActivity = () => {
    const now = Date.now()
    setClearedAt(now)
    localStorage.setItem('dashboard_activity_cleared_at', now.toString())
  }

  // Recent Activity
  const recentItems = [...records]
    .filter((item: any) => new Date(item.updatedAt || 0).getTime() > clearedAt)
    .sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .slice(0, 5)

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
            <button
              onClick={setHelpOpen}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all shadow-xl"
              title="Open Manual"
            >
              <HelpCircle className="h-6 w-6" />
            </button>
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
        <div className={`p-6 rounded-3xl ${glassPanel} flex-1 flex items-center justify-around relative overflow-hidden group`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Security Pulse */}
          <div className="text-center z-10">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-700/20" />
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - securityScore / 100)}`}
                  className={`${securityScore > 80 ? 'text-green-500' : 'text-yellow-500'} transition-all duration-1000 ease-out`} />
              </svg>
              <Shield className="absolute h-8 w-8 opacity-80" />
            </div>
            <p className="mt-2 font-bold text-sm opacity-70">Security</p>
            <p className="text-xs opacity-50">{securityScore}% Safe</p>
          </div>

          <div className="h-12 w-px bg-gray-500/20 mx-4"></div>

          {/* Asset Pulse */}
          <div className="text-center z-10">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center bg-gray-500/10 rounded-full mb-2">
              <Activity className="h-8 w-8 text-emerald-500" />
            </div>
            <p className="mt-2 font-bold text-sm opacity-70">Net Worth</p>
            <p className="text-xs opacity-50 text-emerald-400 font-mono">${totalAssetValue.toLocaleString()}</p>
          </div>

          <div className="h-12 w-px bg-gray-500/20 mx-4"></div>

          {/* Goals Pulse */}
          <div className="text-center z-10">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center bg-gray-500/10 rounded-full mb-2">
              <Target className="h-8 w-8 text-violet-500" />
            </div>
            <p className="mt-2 font-bold text-sm opacity-70">Active Goals</p>
            <p className="text-xs opacity-50">{goalsCount} Targets</p>
          </div>
        </div>
      </div>

      {/* Biometric Enrollment Prompt (Smart Alert) */}
      {typeof window !== 'undefined' && !localStorage.getItem('biometric_id') && (
        <div className={`p-5 rounded-3xl border animate-in slide-in-from-top-4 duration-500 overflow-hidden relative group ${theme === 'light' ? 'bg-blue-50 border-blue-200' : 'bg-blue-500/10 border-blue-500/20'
          }`}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/30">
              <Key className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg leading-tight uppercase tracking-tighter">Fast Login with Biometrics</h3>
              <p className="text-sm opacity-70">Unlock instantly with Fingerprint/FaceID. <span className="text-blue-400 font-bold">(Choose "This Device" when asked)</span></p>
            </div>
            <button
              onClick={() => setActivePage('settings')}
              className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-xl hover:scale-105 transition-all text-sm whitespace-nowrap"
            >
              Enable Now
            </button>
          </div>
        </div>
      )}

      {/* Main Modules Grid */}
      <h2 className="text-xl font-bold opacity-80 pl-1">Your Hubs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ModuleCard
          title="Vault"
          count={vaultCount}
          description="Manage your passwords, logins, and secure notes."
          icon={<Key className="h-6 w-6 text-purple-500" />}
          colorClass="border-purple-500"
          buttonColorClass="text-purple-400 hover:bg-purple-500"
          onClick={() => setActivePage('passwords')}
          isLocked={securitySettings['passwords']?.isLocked}
        />
        <ModuleCard
          title="Health"
          count={healthCount}
          description="Track health records, medications, and vitals."
          icon={<Heart className="h-6 w-6 text-red-500" />}
          colorClass="border-red-500"
          buttonColorClass="text-red-400 hover:bg-red-500"
          onClick={() => setActivePage('type-health-records')}
          isLocked={securitySettings['type-health-records']?.isLocked}
        />
        <ModuleCard
          title="Financial Cards"
          count={records.filter((r: any) => r.type === "financial-card").length}
          description="Manage your credit and debit cards securely."
          icon={<CreditCard className="h-6 w-6 text-yellow-500" />}
          colorClass="border-yellow-500"
          buttonColorClass="text-yellow-400 hover:bg-yellow-500"
          onClick={() => setActivePage('financial-cards')}
          isLocked={securitySettings['financial-cards']?.isLocked}
        />
        <ModuleCard
          title="Vehicles"
          count={vehicleCount}
          description="Manage vehicle profiles, maintenance, and docs."
          icon={<Car className="h-6 w-6 text-blue-500" />}
          colorClass="border-blue-500"
          buttonColorClass="text-blue-400 hover:bg-blue-500"
          onClick={() => setActivePage('type-vehicles')}
          isLocked={securitySettings['type-vehicles']?.isLocked}
        />
        <ModuleCard
          title="Business"
          count={bizCount}
          description="Organize side projects, clients, and contracts."
          icon={<Briefcase className="h-6 w-6 text-orange-500" />}
          colorClass="border-orange-500"
          buttonColorClass="text-orange-400 hover:bg-orange-500"
          onClick={() => setActivePage('type-business')}
          isLocked={securitySettings['type-business']?.isLocked}
        />
        <ModuleCard
          title="Assets"
          count={assetCount}
          description="Track physical inventory and asset values."
          icon={<Box className="h-6 w-6 text-emerald-500" />}
          colorClass="border-emerald-500"
          buttonColorClass="text-emerald-400 hover:bg-emerald-500"
          onClick={() => setActivePage('type-assets')}
          isLocked={securitySettings['type-assets']?.isLocked}
        />
        <ModuleCard
          title="Social Life"
          count={digitalCount}
          description="Manage social media and online assets."
          icon={<Globe className="h-6 w-6 text-pink-500" />}
          colorClass="border-pink-500"
          buttonColorClass="text-pink-400 hover:bg-pink-500"
          onClick={() => setActivePage('type-digital-life')}
          isLocked={securitySettings['type-digital-life']?.isLocked}
        />
        <ModuleCard
          title="My Diary"
          count={diaryCount}
          description="Personal journal and daily thoughts."
          icon={<Book className="h-6 w-6 text-rose-500" />}
          colorClass="border-rose-500"
          buttonColorClass="text-rose-400 hover:bg-rose-500"
          onClick={() => setActivePage('type-diary')}
          isLocked={securitySettings['diary']?.isLocked}
        />
        <ModuleCard
          title="Subscriptions"
          count={records.filter((r: any) => r.category === "Subscriptions" || r.type === "subscription").length}
          description="Track recurring expenses and renewals."
          icon={<CreditCard className="h-6 w-6 text-green-500" />}
          colorClass="border-green-500"
          buttonColorClass="text-green-400 hover:bg-green-500"
          onClick={() => setActivePage('type-subscriptions')}
          isLocked={securitySettings['type-subscriptions']?.isLocked}
        />
        <ModuleCard
          title="Media Vault"
          count={records.filter((r: any) => r.category === "Secure Media").length}
          description="Encrypted gallery for photos and videos."
          icon={<Image className="h-6 w-6 text-teal-500" />}
          colorClass="border-teal-500"
          buttonColorClass="text-teal-400 hover:bg-teal-500"
          onClick={() => setActivePage('type-media')}
          isLocked={securitySettings['type-media']?.isLocked}
        />
        <ModuleCard
          title="Knowledge"
          count={knowledgeCount}
          description="Personal wiki, SOPs, and reference vault."
          icon={<Book className="h-6 w-6 text-yellow-500" />}
          colorClass="border-yellow-500"
          buttonColorClass="text-yellow-400 hover:bg-yellow-500"
          onClick={() => setActivePage('type-knowledge')}
          isLocked={securitySettings['type-knowledge']?.isLocked}
        />
        <ModuleCard
          title="Travel"
          count={travelCount}
          description="Travel plans, passports, and itineraries."
          icon={<Plane className="h-6 w-6 text-indigo-500" />}
          colorClass="border-indigo-500"
          buttonColorClass="text-indigo-400 hover:bg-indigo-500"
          onClick={() => setActivePage('type-travel')}
          isLocked={securitySettings['type-travel']?.isLocked}
        />
        <ModuleCard
          title="Goals"
          count={goalsCount}
          description="Set goals, track steps, and visualize progress."
          icon={<Target className="h-6 w-6 text-pink-500" />}
          colorClass="border-pink-500"
          buttonColorClass="text-pink-400 hover:bg-pink-500"
          onClick={() => setActivePage('type-goals')}
          isLocked={securitySettings['type-goals']?.isLocked}
        />
      </div>

      {/* Recent Activity */}
      <div className={`p-6 rounded-2xl ${glassPanel}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Clock className="h-5 w-5 opacity-50" /> Recent Activity</h2>
          {recentItems.length > 0 && (
            <button
              onClick={handleClearActivity}
              className="text-xs font-bold uppercase tracking-widest text-[#007bff] hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-3">
          {recentItems.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-default">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10`}>
                  {getIconForCategory(item.category)}
                </div>
                <div>
                  <p className="font-bold text-sm tracking-wide">{item.title || item.name || "Untitled"}</p>
                  <p className="text-xs opacity-50 flex items-center gap-1">
                    {item.category || "General"} â€¢ <span className="opacity-70">{new Date(item.updatedAt).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
            </div>
          ))}
          {records.length === 0 && (
            <div className="text-center py-8 text-gray-500">No activity yet</div>
          )}
        </div>
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
            await addFolder(folder.name, folder.parentFolder)
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
  colorClass: string // expecting something like "border-purple-500"
  buttonColorClass: string // "text-purple-400 group-hover:bg-purple-500/10"
  onClick: () => void
  count: number
  isLocked?: boolean
}

function ModuleCard({ title, description, icon, colorClass, buttonColorClass, onClick, count, isLocked }: ModuleCardProps) {
  return (
    <div className={`bg-[#1e1e1e] border border-white/10 rounded-lg flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group ${colorClass} border-t-4 relative`}>
      {isLocked && <Lock className="absolute top-3 right-3 h-5 w-5 text-yellow-500 z-10" />}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon}
            <h3 className="font-bold text-lg text-white">{title}</h3>
          </div>
          {count > 0 && <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-gray-400">{count}</span>}
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>

      <button
        onClick={onClick}
        className={`w-full py-4 text-sm font-bold uppercase tracking-wider border-t border-white/5 transition-colors flex items-center justify-center gap-2 ${buttonColorClass} group-hover:text-white group-hover:bg-opacity-20`}
      >
        Open {title.split(" ")[0]} <ChevronRight className="h-4 w-4" />
      </button>
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

