"use client"

import { useState, useMemo } from "react"
import { 
  Globe, 
  Plus, 
  ExternalLink, 
  Copy, 
  MoreHorizontal, 
  Search, 
  Shield, 
  User, 
  Key, 
  Trash2, 
  Edit3,
  Check,
  Hospital,
  Stethoscope,
  Activity,
  HelpCircle
} from "lucide-react"
import { toast } from "sonner"

interface HealthPortalsProps {
  records: any[]
  addItem: (item: any) => Promise<any>
  updateItem: (id: string, updates: any) => Promise<any>
  deleteItem: (id: string) => Promise<any>
  theme: string
  onOpenHelp?: (targetId?: string) => void
}

export default function HealthPortals({ records, addItem, updateItem, deleteItem, theme, onOpenHelp }: HealthPortalsProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingPortal, setEditingPortal] = useState<any>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const portals = useMemo(() => {
    return records.filter(r => 
      r.type === "health-portal" || (r.category === "Health Portals" && r.type === "login")
    ).sort((a, b) => (a.title || "").localeCompare(b.title || ""))
  }, [records])

  const filteredPortals = portals.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.item_metadata?.facility?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(`${field}-${text}`)
    toast.success(`${field} copied to clipboard`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const [formData, setFormData] = useState({
    title: "",
    url: "",
    username: "",
    password: "",
    facility: "",
    notes: ""
  })

  const resetForm = () => {
    setFormData({ title: "", url: "", username: "", password: "", facility: "", notes: "" })
    setEditingPortal(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const portalData = {
      type: "health-portal",
      title: formData.title,
      category: "Health Portals",
      item_metadata: {
        url: formData.url,
        username: formData.username,
        password: formData.password,
        facility: formData.facility,
        notes: formData.notes
      }
    }

    if (editingPortal) {
      await updateItem(editingPortal.id, portalData)
      toast.success("Portal updated successfully")
    } else {
      await addItem(portalData)
      toast.success("Portal added successfully")
    }
    setShowAddModal(false)
    resetForm()
  }

  const handleEdit = (portal: any) => {
    setEditingPortal(portal)
    setFormData({
      title: portal.title || "",
      url: portal.item_metadata?.url || "",
      username: portal.item_metadata?.username || "",
      password: portal.item_metadata?.password || "",
      facility: portal.item_metadata?.facility || "",
      notes: portal.item_metadata?.notes || ""
    })
    setShowAddModal(true)
  }

  return (
    <div className={`p-4 md:p-8 space-y-6 animate-in fade-in duration-500 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Globe className="h-8 w-8 text-blue-500" />
            Health Portals & Logins
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage links and access details for your medical provider portals.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/20 transition-all font-bold flex items-center gap-2"
        >
          <Plus className="h-5 w-5" /> Add Portal
        </button>
      </div>

      <div className="relative group max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
        <input
          type="text"
          placeholder="Search portals or facilities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full py-4 pl-12 pr-4 rounded-2xl border ${
            theme === 'light' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'
          } focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPortals.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
            <Globe className="h-16 w-16 text-gray-700 mx-auto mb-4 opacity-20" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No portals found</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-blue-400 hover:text-blue-300 font-black text-xs uppercase underline"
            >
              Add your first portal
            </button>
          </div>
        ) : (
          filteredPortals.map((portal) => (
            <div 
              key={portal.id}
              className={`group p-6 rounded-3xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden ${
                theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-white/5'
              }`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={() => handleEdit(portal)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-400">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button onClick={() => { if(confirm("Delete this portal?")) deleteItem(portal.id) }} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 shadow-inner">
                  {portal.item_metadata?.facility?.toLowerCase().includes('hospital') ? <Hospital className="h-8 w-8" /> : <Stethoscope className="h-8 w-8" />}
                </div>
                <div className="min-w-0 pr-12">
                  <h3 className="text-xl font-black uppercase tracking-tighter break-words leading-tight group-hover:text-blue-400 transition-colors">
                    {portal.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                    {portal.item_metadata?.facility || "General Provider"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 group/row">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-[10px] uppercase font-black text-gray-600 mb-0.5">Username</p>
                      <p className="text-sm font-mono break-words">{portal.item_metadata?.username || "---"}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(portal.item_metadata?.username, "Username")}
                    className="p-2 rounded-xl hover:bg-white/10 text-gray-500 hover:text-white opacity-0 group-hover/row:opacity-100 transition-all"
                  >
                    {copiedField === `Username-${portal.item_metadata?.username}` ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 group/row">
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-[10px] uppercase font-black text-gray-600 mb-0.5">Password</p>
                      <p className="text-sm font-mono break-words">••••••••••••</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(portal.item_metadata?.password, "Password")}
                    className="p-2 rounded-xl hover:bg-white/10 text-gray-500 hover:text-white opacity-0 group-hover/row:opacity-100 transition-all"
                  >
                    {copiedField === `Password-${portal.item_metadata?.password}` ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <a 
                  href={portal.item_metadata?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-500 transition-all font-black text-xs uppercase tracking-widest group/btn"
                >
                  Visit Portal <ExternalLink className="h-4 w-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className={`relative w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 ${
            theme === 'light' ? 'bg-white' : 'bg-[#1a1a1a] border border-white/10'
          }`}>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
              {editingPortal ? <Edit3 className="text-blue-400" /> : <Plus className="text-blue-400" />}
              {editingPortal ? "Edit Health Portal" : "Add Health Portal"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Portal Name</label>
                <input 
                  autoFocus required
                  value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. MyChart, Quest Diagnostics"
                  className={`w-full p-4 rounded-2xl border ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/10'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Facility / Doctor</label>
                <input 
                  value={formData.facility} onChange={(e) => setFormData({...formData, facility: e.target.value})}
                  placeholder="e.g. Mass General Hospital"
                  className={`w-full p-4 rounded-2xl border ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/10'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Login URL</label>
                <input 
                  type="url"
                  value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})}
                  placeholder="https://..."
                  className={`w-full p-4 rounded-2xl border ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/10'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Username</label>
                  <input 
                    value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="Username"
                    className={`w-full p-4 rounded-2xl border ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/10'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Password</label>
                  <input 
                    type="password"
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Password"
                    className={`w-full p-4 rounded-2xl border ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/10'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Notes</label>
                <textarea 
                  value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional access instructions..."
                  className={`w-full p-4 rounded-2xl border ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/10'} focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]`}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all">
                  {editingPortal ? "Update Portal" : "Save Portal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
