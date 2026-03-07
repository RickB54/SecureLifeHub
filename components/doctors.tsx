"use client"

import { useState, useMemo } from "react"
import { 
  Users, 
  Plus, 
  Search, 
  Shield, 
  User, 
  Trash2, 
  Edit3,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Building2,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Heart,
  HelpCircle
} from "lucide-react"
import { toast } from "sonner"
interface DoctorsProps {
  records: any[]
  addItem: (item: any) => Promise<any>
  updateItem: (id: string, updates: any) => Promise<any>
  deleteItem: (id: string) => Promise<any>
  theme: string
  onOpenHelp?: (targetId?: string) => void
}

export default function Doctors({ records, addItem, updateItem, deleteItem, theme, onOpenHelp }: DoctorsProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingDoctor, setEditingDoctor] = useState<any>(null)

  const doctors = useMemo(() => {
    return records.filter(r => 
      r.type === "doctor-record" || (r.category === "My Doctors" && r.type === "note")
    ).sort((a, b) => (a.title || "").localeCompare(b.title || ""))
  }, [records])

  const filteredDoctors = doctors.filter(dr => 
    dr.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dr.item_metadata?.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dr.item_metadata?.facility?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    facility: "",
    phone: "",
    email: "",
    address: "",
    portalUrl: "",
    notes: ""
  })

  const resetForm = () => {
    setFormData({ name: "", specialty: "", facility: "", phone: "", email: "", address: "", portalUrl: "", notes: "" })
    setEditingDoctor(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const doctorData = {
      type: "doctor-record",
      title: formData.name,
      category: "My Doctors",
      item_metadata: {
        specialty: formData.specialty,
        facility: formData.facility,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        portalUrl: formData.portalUrl,
        notes: formData.notes
      }
    }

    if (editingDoctor) {
      await updateItem(editingDoctor.id, doctorData)
      toast.success("Doctor updated successfully")
    } else {
      await addItem(doctorData)
      toast.success("Doctor added to your list")
    }
    setShowAddModal(false)
    resetForm()
  }

  const handleEdit = (doctor: any) => {
    setEditingDoctor(doctor)
    setFormData({
      name: doctor.title || "",
      specialty: doctor.item_metadata?.specialty || "",
      facility: doctor.item_metadata?.facility || "",
      phone: doctor.item_metadata?.phone || "",
      email: doctor.item_metadata?.email || "",
      address: doctor.item_metadata?.address || "",
      portalUrl: doctor.item_metadata?.portalUrl || "",
      notes: doctor.item_metadata?.notes || ""
    })
    setShowAddModal(true)
  }

  return (
    <div className={`p-4 md:p-8 space-y-6 animate-in fade-in duration-500 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            My Medical Team
            <button onClick={() => onOpenHelp?.('type-doctors')} className="p-1 hover:text-blue-400 opacity-50"><HelpCircle className="h-5 w-5" /></button>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Directory of specialists, facilities, and care providers.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-rose-500/20 transition-all font-bold flex items-center gap-2"
        >
          <Plus className="h-5 w-5" /> Add Provider
        </button>
      </div>

      <div className="relative group max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-rose-400 transition-colors" />
        <input
          type="text"
          placeholder="Search by name, specialty, or facility..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full py-4 pl-12 pr-4 rounded-2xl border ${
            theme === 'light' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'
          } focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-medium`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
            <Users className="h-16 w-16 text-gray-700 mx-auto mb-4 opacity-20" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No providers found</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-rose-400 hover:text-rose-300 font-black text-xs uppercase underline"
            >
              Add your first doctor
            </button>
          </div>
        ) : (
          filteredDoctors.map((dr) => (
            <div 
              key={dr.id}
              className={`group p-6 rounded-3xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden ${
                theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-white/5'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 shadow-inner">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(dr)} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-blue-400">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => { if(confirm("Delete this provider?")) deleteItem(dr.id) }} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-rose-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-black uppercase tracking-tighter group-hover:text-rose-400 transition-colors leading-tight truncate">
                  {dr.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-black uppercase text-rose-500/80 tracking-widest">
                    {dr.item_metadata?.specialty || "General Medicine"}
                  </span>
                  <div className="h-1 w-1 rounded-full bg-white/20" />
                  <span className="text-[10px] uppercase font-bold text-gray-500 truncate">
                    {dr.item_metadata?.facility || "Independent Clinic"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  {dr.item_metadata?.phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-300 hover:text-rose-400 transition-colors cursor-pointer group/item">
                      <div className="p-1.5 rounded-lg bg-white/5 group-hover/item:bg-rose-500/10 transition-colors">
                        <Phone className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium">{dr.item_metadata.phone}</span>
                    </div>
                  )}
                  {dr.item_metadata?.email && (
                    <div className="flex items-center gap-3 text-sm text-gray-300 hover:text-rose-400 transition-colors cursor-pointer group/item">
                      <div className="p-1.5 rounded-lg bg-white/5 group-hover/item:bg-rose-500/10 transition-colors">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium truncate">{dr.item_metadata.email}</span>
                    </div>
                  )}
                  {dr.item_metadata?.address && (
                    <div className="flex items-center gap-3 text-sm text-gray-300 hover:text-rose-400 transition-colors cursor-pointer group/item">
                      <div className="p-1.5 rounded-lg bg-white/5 group-hover/item:bg-rose-500/10 transition-colors shrink-0">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium text-xs leading-relaxed">{dr.item_metadata.address}</span>
                    </div>
                  )}
                </div>

                {(dr.item_metadata?.notes || dr.item_metadata?.portalUrl) && (
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    {dr.item_metadata?.notes && (
                      <p className="text-xs text-gray-500 italic line-clamp-2">
                        "{dr.item_metadata.notes}"
                      </p>
                    )}
                    {dr.item_metadata?.portalUrl && (
                      <a 
                        href={dr.item_metadata.portalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 transition-all group/portal"
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/portal:text-rose-400">Patient Portal</span>
                        <ExternalLink className="h-3 h-3 text-gray-600 group-hover/portal:text-rose-400" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className={`relative w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 ${
            theme === 'light' ? 'bg-white' : 'bg-[#1a1a1a] border border-white/10'
          }`}>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                <Users className="h-6 w-6" />
              </div>
              {editingDoctor ? "Update Provider" : "Add New Provider"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Full Name</label>
                  <input autoFocus required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Dr. John Smith" className={`w-full p-4 rounded-2xl border ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5 border-white/10'} focus:ring-2 focus:ring-rose-500 outline-none`} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Specialty</label>
                  <input required value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})} placeholder="e.g. Cardiologist" className={`w-full p-4 rounded-2xl border ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5 border-white/10'} focus:ring-2 focus:ring-rose-500 outline-none`} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Facility / Hospital</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 opacity-50" />
                  <input value={formData.facility} onChange={(e) => setFormData({...formData, facility: e.target.value})} placeholder="e.g. City General Hospital" className={`w-full p-4 pl-12 rounded-2xl border ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5 border-white/10'} focus:ring-2 focus:ring-rose-500 outline-none`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Phone Number</label>
                  <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+1 (555) 000-0000" className={`w-full p-4 rounded-2xl border ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5 border-white/10'} focus:ring-2 focus:ring-rose-500 outline-none`} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="dr@example.com" className={`w-full p-4 rounded-2xl border ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5 border-white/10'} focus:ring-2 focus:ring-rose-500 outline-none`} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Practice Location</label>
                <input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="123 Hospital Way, Suite 400" className={`w-full p-4 rounded-2xl border ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5 border-white/10'} focus:ring-2 focus:ring-rose-500 outline-none`} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Portal URL</label>
                <input type="url" value={formData.portalUrl} onChange={(e) => setFormData({...formData, portalUrl: e.target.value})} placeholder="https://..." className={`w-full p-4 rounded-2xl border ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5 border-white/10'} focus:ring-2 focus:ring-rose-500 outline-none`} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Notes / Instructions</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Office hours, preferred contact method, etc." className={`w-full p-4 rounded-2xl border ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5 border-white/10'} focus:ring-2 focus:ring-rose-500 outline-none min-h-[100px]`} />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-2 py-4 rounded-[2rem] bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest shadow-xl shadow-rose-500/30 transition-all active:scale-95">
                  {editingDoctor ? "Update Provider" : "Confirm Provider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
