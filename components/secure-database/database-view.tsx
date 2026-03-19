"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreVertical, 
  Star, 
  Edit2, 
  Copy, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  Database,
  Printer,
  FileDown,
  Image as ImageIcon,
  MoreHorizontal,
  Settings,
  ListTodo,
  CheckCircle2,
  Share2,
  Camera,
  Upload,
  Save,
  Sparkles,
  Mic,
  Maximize2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Database as DatabaseType, DbRecord } from "@/types/secure-database"
import { format } from "date-fns"
import { toast } from "sonner"

interface DatabaseViewProps {
  database?: DatabaseType
  allDatabases: DatabaseType[]
  searchQuery: string
  onDatabaseUpdate: (database: DatabaseType) => void
  onDuplicateRecord: (record: DbRecord, dbTitle?: string) => void
  onEditRecord: (record: DbRecord) => void
  onSelectRecord: (record: DbRecord) => void
  onSelectDatabase: (title: string) => void
  onAddTodo: (todo: any) => void
  onAddRecord: () => void
  onEditSchema?: (database: DatabaseType) => void
  onRecordUpdate?: (record: DbRecord) => void
  initialExpandedRecordId?: string
  collapseAll?: boolean
}

export function DatabaseView({ 
  database, 
  allDatabases,
  searchQuery, 
  onDatabaseUpdate, 
  onDuplicateRecord,
  onEditRecord,
  onSelectRecord,
  onSelectDatabase,
  onAddTodo,
  onAddRecord,
  onEditSchema,
  onRecordUpdate,
  initialExpandedRecordId,
  collapseAll,
}: DatabaseViewProps) {
  const [expandedRecords, setExpandedRecords] = useState<{ [key: string]: boolean }>({})
  const [editingField, setEditingField] = useState<{ recordId: string; fieldName: string } | null>(null)
  const [fieldOptionsDraft, setFieldOptionsDraft] = useState<string[]>([])
  const [newOptionInput, setNewOptionInput] = useState("")
  const [fullscreenNote, setFullscreenNote] = useState<{ recordId: string; fieldName: string; value: string } | null>(null)
  const [fullscreenGallery, setFullscreenGallery] = useState<{ recordId: string; imageIndex: number } | null>(null)
  const recordRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  
  const toggleExpand = (id: string) => {
    const isExpanding = !expandedRecords[id];
    setExpandedRecords(prev => ({
      ...prev,
      [id]: isExpanding
    }))
    
    if (isExpanding) {
        setTimeout(() => {
            recordRefs.current[id]?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 300);
    }
  }
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    if (initialExpandedRecordId) {
      setExpandedRecords(prev => ({ ...prev, [initialExpandedRecordId]: true }))
      setTimeout(() => {
          recordRefs.current[initialExpandedRecordId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    }
  }, [initialExpandedRecordId])
 
  const prevCollapseAll = useRef(collapseAll)
  useEffect(() => {
    if (prevCollapseAll.current !== collapseAll) {
        if (database) {
            if (collapseAll) {
                setExpandedRecords({})
            } else {
                const expansionMatrix: { [key: string]: boolean } = {}
                database.records.forEach(r => {
                    expansionMatrix[r.id] = true
                })
                setExpandedRecords(expansionMatrix)
            }
        }
        prevCollapseAll.current = collapseAll
    }
  }, [collapseAll, database])


  const filteredRecords = useMemo(() => {
    if (!database) return []
    if (!searchQuery) return database.records

    const query = searchQuery.toLowerCase()
    return database.records.filter((record: DbRecord) => 
      Object.values(record.values).some(val => 
        String(val).toLowerCase().includes(query)
      )
    )
  }, [database, searchQuery])

  const toggleFavorite = (recordId: string) => {
    if (!database) return
    const updatedRecords = database.records.map((r: DbRecord) => 
      r.id === recordId ? { ...r, isFavorite: !r.isFavorite } : r
    )
    onDatabaseUpdate({ ...database, records: updatedRecords })
  }

  const deleteRecord = (recordId: string) => {
    if (!database) return
    if (!window.confirm("Are you sure you want to purge this record from memory?")) return
    const updatedRecords = database.records.filter((r: DbRecord) => r.id !== recordId)
    onDatabaseUpdate({ ...database, records: updatedRecords })
    toast.success("Record purged from architecture")
  }

  const handleSendToTodo = (record: DbRecord, fieldName: string) => {
    const value = record.values[fieldName]
    if (!value) return

    onAddTodo({
      title: `${database?.title}: ${record.values[database?.fields[0].name || ""] || "Untitled"} - ${fieldName}`,
      notes: String(value),
      sourceDatabase: database?.title,
      sourceRecordId: record.id,
      sourceFieldName: fieldName,
      priority: "medium",
    })
    toast.success("Linked to Task Architect Matrix")
  }

  const handleImageAdd = async (recordId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !database || files.length === 0) return

    const filePromises = Array.from(files).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
    })

    try {
      const base64Images = await Promise.all(filePromises)
      const updatedRecords = database.records.map((r: DbRecord) => {
        if (r.id === recordId) {
          return { ...r, images: [...(r.images || []), ...base64Images] }
        }
        return r
      })
      onDatabaseUpdate({ ...database, records: updatedRecords })
      toast.success(`${base64Images.length} assets successfully acquired`)
      
      // Clear inputs for subsequent uploads
      if (e.target) e.target.value = ""
    } catch (error) {
      toast.error("Failed to process assets")
    }
  }

  const handleDeleteImage = (recordId: string, imageIndex: number) => {
    if (!database) return
    if (!window.confirm("Purge this asset from memory?")) return

    const updatedRecords = database.records.map((r: DbRecord) => {
        if (r.id === recordId) {
            const newImages = (r.images || []).filter((_, i) => i !== imageIndex)
            return { ...r, images: newImages }
        }
        return r
    })
    onDatabaseUpdate({ ...database, records: updatedRecords })
    toast.success("Asset purged")
  }

  const handleSpeechToText = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Speech recognition not supported in this browser")
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      toast.info("Neural link established. Listening...")
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      if (fullscreenNote) {
        setFullscreenNote({ ...fullscreenNote, value: (fullscreenNote.value || "") + " " + transcript })
      }
      setIsListening(false)
      toast.success("Intel acquired via neural link")
    }

    recognition.onerror = () => {
      setIsListening(false)
      toast.error("Neural link interrupted")
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }


  const colorMap: { [key: string]: string } = {
    emerald: "bg-emerald-600",
    green: "bg-green-600",
    teal: "bg-teal-600",
    cyan: "bg-cyan-600",
    indigo: "bg-indigo-600",
    rose: "bg-rose-600",
    red: "bg-red-600",
    amber: "bg-amber-600",
    blue: "bg-blue-600",
    pink: "bg-pink-600",
    purple: "bg-purple-600",
  }

  const borderMap: { [key: string]: string } = {
    emerald: "border-emerald-500/30",
    green: "border-green-500/30",
    teal: "border-teal-500/30",
    cyan: "border-cyan-500/30",
    indigo: "border-indigo-500/30",
    rose: "border-rose-500/30",
    red: "border-red-500/30",
    amber: "border-amber-500/30",
    blue: "border-blue-500/30",
    pink: "border-pink-500/30",
    purple: "border-purple-500/30",
  }

  const themeColor = colorMap[database?.color || "indigo"] || "bg-indigo-600"
  const themeBorder = borderMap[database?.color || "indigo"] || "border-indigo-500/30"

  if (!database) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Your Databases ({allDatabases.length})</h3>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em] mt-1">Central Intelligence Library</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-2">
                    <Database className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-bold text-gray-400">{allDatabases.reduce((acc, db) => acc + db.records.length, 0)} Total Records</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allDatabases.map((db) => {
                const dotColor = colorMap[db.color || 'indigo'] || "bg-indigo-500"

                return (
                    <button
                        key={db.id || db.title}
                        onClick={() => onSelectDatabase(db.title)}
                        className="group flex items-center justify-between p-5 rounded-[2rem] bg-white/2 border border-white/5 hover:bg-white/5 hover:border-indigo-500/30 transition-all duration-300 text-left"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${dotColor} shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:scale-125 transition-transform`} />
                            <div>
                                <h4 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{db.title}</h4>
                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-0.5">{db.fields.length} Data Vectors</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="text-sm font-black text-indigo-400/50 group-hover:text-indigo-400 transition-colors uppercase font-mono">{db.records.length}</span>
                             <ChevronRight className="h-4 w-4 text-gray-700 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                        </div>
                    </button>
                )
            })}
        </div>

        <div className="p-10 rounded-[3rem] border-2 border-dashed border-white/5 bg-white/1 flex flex-col items-center justify-center text-center opacity-40 hover:opacity-100 transition-opacity">
            <Plus className="h-10 w-10 text-gray-500 mb-4" />
            <h4 className="text-lg font-black uppercase italic tracking-tighter text-gray-400">Architect New Matrix</h4>
            <p className="text-xs text-gray-600 font-bold max-w-xs mt-2">Create a custom collection with localized parameters and high-fidelity schemas.</p>
        </div>
      </div>
    )
  }
 
  const vibrantColors = [
    { bg: "bg-indigo-600", border: "border-indigo-400" },
    { bg: "bg-rose-600", border: "border-rose-400" },
    { bg: "bg-amber-600", border: "border-amber-400" },
    { bg: "bg-emerald-600", border: "border-emerald-400" },
    { bg: "bg-sky-600", border: "border-sky-400" },
    { bg: "bg-purple-600", border: "border-purple-400" },
    { bg: "bg-fuchsia-600", border: "border-fuchsia-400" },
    { bg: "bg-orange-600", border: "border-orange-400" },
  ]
  const getRecordTheme = (index: number) => vibrantColors[index % vibrantColors.length]

  return (
    <div className="space-y-6">
      {/* Header Info Area */}
      <div className={`p-8 rounded-3xl ${themeColor} border ${themeBorder} flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group`}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
          <div className="relative z-10 font-bold uppercase tracking-tighter">
              <h3 className="text-2xl font-black text-white leading-none mb-2 italic uppercase">{database?.title}</h3>
              <p className="text-[10px] text-white/60 font-black tracking-widest uppercase">
                {filteredRecords.length} records integrated into system • {searchQuery ? 'Active search filter' : 'Full data matrix'}
              </p>
          </div>
          <div className="flex items-center gap-2 relative z-10 w-full md:w-auto">
              <Button 
                onClick={onAddRecord}
                className="bg-white hover:bg-white/90 text-black rounded-xl text-[10px] font-black uppercase tracking-widest h-10 px-5 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Inject Record
              </Button>
              {onEditSchema && (
                <Button 
                  onClick={() => database && onEditSchema && onEditSchema(database!)}
                  variant="ghost" 
                  className="bg-black/20 hover:bg-black/40 text-white rounded-xl text-[10px] font-black uppercase tracking-widest h-10 px-5 border border-white/10"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Schema
                </Button>
              )}
              <Button 
                variant="ghost" 
                onClick={() => window.print()}
                className="bg-black/20 hover:bg-black/40 text-white rounded-xl text-[10px] font-black uppercase tracking-widest h-10 px-5 border border-white/10"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Matrix
              </Button>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-12 pt-8">
        {filteredRecords.map((record, index) => {
          const isExpanded = expandedRecords[record.id]
          const titleField = database?.fields[0]?.name || 'id'
          const recordTheme = getRecordTheme(index)
          
          return (
             <div 
              key={record.id}
              ref={el => { recordRefs.current[record.id] = el }}
              className={`rounded-[2.5rem] overflow-hidden border transition-all duration-500 shadow-2xl
                ${recordTheme.bg} ${recordTheme.border}`}
            >
              {/* Record Header Bar */}
              <div className={`p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${isExpanded ? 'border-white/10' : 'border-transparent'}`}>
                  <div className="flex items-center gap-5">
                      <div className="flex flex-col">
                        <h4 className="text-2xl font-black tracking-tighter italic uppercase truncate max-w-[400px] text-white">
                            {record.values[titleField] || "Untitled Sector"}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Record Active</p>
                        </div>
                      </div>
                      <div className="h-6 w-px bg-white/10 hidden md:block mx-2" />
                      <div className="flex flex-col items-start gap-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 italic">Initializing Matrix...</p>
                        <p className="text-[9px] font-bold text-white/50 tracking-widest font-mono">
                            {(() => {
                                try {
                                    if (!record.created) return "BUFFER_EMPTY";
                                    const date = new Date(record.created);
                                    if (isNaN(date.getTime())) return "DATE_INVALID";
                                    return format(date, "MM.dd.yyyy / HH:mm:ss");
                                } catch (e) {
                                    return "DATE_ERR";
                                }
                            })()}
                        </p>
                      </div>
                  </div>

                  <div className="flex items-center gap-2">
                      <div className="flex items-center bg-black/20 rounded-2xl p-1 gap-1">
                          <Button variant="ghost" size="icon" onClick={() => onEditRecord(record)} className="h-11 w-11 rounded-xl text-white hover:bg-white/10 transition-all">
                            <Edit2 className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => onDuplicateRecord(record)} className="h-11 w-11 rounded-xl text-white hover:bg-white/10 transition-all">
                            <Copy className="h-5 w-5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => {
                                e.stopPropagation()
                                if (!isExpanded) toggleExpand(record.id)
                                setTimeout(() => {
                                    const gallerySection = document.getElementById(`gallery-${record.id}`)
                                    gallerySection?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                }, 300)
                            }}
                            className="h-11 w-11 rounded-xl relative text-white hover:bg-white/10 transition-all"
                          >
                              <ImageIcon className="h-5 w-5" />
                              <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 bg-white text-black text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-indigo-500">
                                  {record.images?.length || 0}
                              </span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => toggleFavorite(record.id)} className={`h-11 w-11 rounded-xl text-white hover:bg-white/10 transition-all ${record.isFavorite ? 'text-amber-400' : ''}`}>
                            <Star className={`h-5 w-5 ${record.isFavorite ? 'fill-current' : ''}`} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteRecord(record.id)} className="h-11 w-11 rounded-xl text-white hover:bg-rose-500 transition-all">
                            <Trash2 className="h-5 w-5" />
                          </Button>
                      </div>
                      
                      <div className="w-px h-8 bg-white/10 mx-2" />

                      <Button 
                        variant="ghost" 
                        className="px-6 rounded-2xl flex items-center gap-3 group/expand h-12 bg-white text-black hover:bg-white/90 shadow-xl transition-all"
                        onClick={() => toggleExpand(record.id)} 
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">{isExpanded ? 'Collapse Sector' : 'Access Data'}</span>
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5 group-hover/expand:translate-y-0.5 transition-transform" />}
                      </Button>
                  </div>
              </div>

              {/* Collapsed Top Fields Layout */}
              {!isExpanded && (
                  <div className="px-8 pb-8 pt-6 mt-0 min-h-[100px] flex items-center flex-wrap gap-x-12 gap-y-6">
                          {database && database.fields.filter(f => f.showOnCard).slice(1).map(field => {
                              const value = record.values[field.name];
                              let displayValue = String(value || "—");
                              
                              if (field.type === 'checkbox' && Array.isArray(value)) {
                                displayValue = value.join(' • ') || "No selections";
                              } else if (field.type === 'date' && value) {
                                try { 
                                  const date = new Date(String(value));
                                  if (!isNaN(date.getTime())) {
                                    displayValue = format(date, "MMM d, yyyy"); 
                                  }
                                } catch(e) {}
                              }

                              return (
                                <div key={field.name} className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{field.name}:</span>
                                    <span className="text-sm font-bold text-white tracking-tight">
                                      {displayValue}
                                    </span>
                                </div>
                              );
                          })}
                  </div>
              )}

              {/* Full Expanded Content */}
              {isExpanded && (
                  <div className="bg-black/30 backdrop-blur-xl p-10 pt-4 border-t border-white/10 animate-in slide-in-from-top-4 duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
                        {database && database.fields.map((field) => {
                           const isEditingThisField = editingField?.recordId === record.id && editingField?.fieldName === field.name;
                           
                           return (
                             <div key={field.name} className={`space-y-2.5 group ${field.type === 'checkbox' || field.type === 'textarea' || field.type === 'gallery' || field.name.toLowerCase().includes('note') ? 'md:col-span-2' : ''}`}>
                                <div className="flex items-center justify-between pl-1">
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{field.name}</label>
                                        <div className="h-1 w-1 bg-white/20 rounded-full" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[#4d79ff]/40">{field.type}</span>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className={`h-8 w-8 rounded-lg transition-all ${isEditingThisField ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
                                        onClick={() => {
                                            if (isEditingThisField) {
                                                setEditingField(null);
                                                toast.success("Sector optimized and saved");
                                            } else {
                                                setEditingField({ recordId: record.id, fieldName: field.name });
                                            }
                                        }}
                                    >
                                        {isEditingThisField ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                                    </Button>
                                </div>
                                
                                <div className="relative">
                                    {isEditingThisField && (field.type === 'checkbox' || field.type === 'dropdown') ? (
                                        <div className="p-8 rounded-[2.5rem] bg-black/40 border border-indigo-500/30 space-y-6 shadow-3xl animate-in zoom-in-95 duration-300 relative">
                                            <div className="flex items-center justify-between mb-4">
                                                <h5 className="text-sm font-black text-white italic uppercase tracking-widest">{field.name}</h5>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg p-0"
                                                    onClick={() => {
                                                        setEditingField(null);
                                                        toast.success("Sector optimized and saved");
                                                    }}
                                                >
                                                    <Save className="h-5 w-5" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                                                {(field.options || []).map((opt) => (
                                                    <div 
                                                        key={opt} 
                                                        className={`flex items-center gap-4 p-4 rounded-xl bg-white/2 border transition-all cursor-pointer ${ (record.values[field.name] || []).includes(opt) ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/5 hover:bg-white/5'}`}
                                                        onClick={() => {
                                                            const currentValues = Array.isArray(record.values[field.name]) ? record.values[field.name] : [];
                                                            const isChecked = currentValues.includes(opt);
                                                            const newValues = isChecked 
                                                                ? currentValues.filter((v: string) => v !== opt)
                                                                : [...currentValues, opt];
                                                            
                                                            const updatedRecord = {
                                                                ...record,
                                                                values: { ...record.values, [field.name]: newValues },
                                                                lastUpdated: new Date().toISOString()
                                                            };
                                                            onDatabaseUpdate({
                                                                ...database,
                                                                records: database.records.map(r => r.id === record.id ? updatedRecord : r)
                                                            });
                                                        }}
                                                    >
                                                        <Checkbox 
                                                            id={`opt-${record.id}-${field.name}-${opt}`}
                                                            checked={(record.values[field.name] || []).includes(opt)}
                                                            className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 h-6 w-6 rounded-md border-white/20"
                                                        />
                                                        <label className="text-sm font-bold text-gray-300 cursor-pointer flex-1">{opt}</label>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2.5 mt-4">
                                                <Input 
                                                    placeholder="Add new option..." 
                                                    value={newOptionInput}
                                                    onChange={(e) => setNewOptionInput(e.target.value)}
                                                    className="h-12 bg-black/40 border-white/10 rounded-xl focus:border-indigo-500/50 transition-all font-bold text-sm px-5"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            if (!newOptionInput.trim()) return;
                                                            const updatedFields = database.fields.map(f => {
                                                                if (f.name === field.name) {
                                                                    return { ...f, options: [...(f.options || []), newOptionInput.trim()] };
                                                                }
                                                                return f;
                                                            });
                                                            onDatabaseUpdate({ ...database, fields: updatedFields });
                                                            setNewOptionInput("");
                                                            toast.success(`Option '${newOptionInput}' injected`);
                                                        }
                                                    }}
                                                />
                                                <Button 
                                                    onClick={() => {
                                                        if (!newOptionInput.trim()) return;
                                                        const updatedFields = database.fields.map(f => {
                                                            if (f.name === field.name) {
                                                                return { ...f, options: [...(f.options || []), newOptionInput.trim()] };
                                                            }
                                                            return f;
                                                        });
                                                        onDatabaseUpdate({ ...database, fields: updatedFields });
                                                        setNewOptionInput("");
                                                        toast.success(`Option '${newOptionInput}' injected`);
                                                    }}
                                                    className="h-12 w-12 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg active:scale-95 transition-all shrink-0"
                                                >
                                                    <Plus className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`w-full bg-black/40 border border-white/5 rounded-[1.5rem] p-5 flex items-center justify-between group/field hover:border-white/20 transition-all ${field.type === 'gallery' ? 'cursor-pointer hover:bg-white/5' : ''}`}
                                             onClick={() => {
                                                 if (field.type === 'gallery') {
                                                     const gallerySection = document.getElementById(`gallery-${record.id}`)
                                                     gallerySection?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                                 }
                                             }}
                                        >
                                            <div className="text-sm font-bold text-white pr-8 flex items-center gap-3 overflow-hidden w-full group/text">
                                                  {(field.type === 'textarea' || field.name.toLocaleLowerCase().includes('note')) && (
                                                     <div className="flex items-center gap-2 mr-2 shrink-0">
                                                         <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-9 w-9 rounded-xl text-white/20 hover:text-indigo-400 hover:bg-white/10 transition-all active:scale-95"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFullscreenNote({ recordId: record.id, fieldName: field.name, value: String(record.values[field.name] || "") });
                                                            }}
                                                         >
                                                             <Edit2 className="h-4 w-4" />
                                                         </Button>
                                                         <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-9 w-9 rounded-xl text-white/20 hover:text-rose-400 hover:bg-white/10 transition-all active:scale-95"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toast.info("Neural STT engine initializing...");
                                                            }}
                                                         >
                                                             <Mic className="h-4 w-4" />
                                                         </Button>
                                                     </div>
                                                  )}
                                                  {field.type === 'gallery' ? (
                                                     <>
                                                         <div className="p-2 rounded-lg bg-indigo-500/10">
                                                            <ImageIcon className="h-5 w-5 text-indigo-400" />
                                                         </div>
                                                         <span className="uppercase tracking-widest text-xs font-black text-indigo-400/80">Access Records Matrix ({record.images?.length || 0} Assets)</span>
                                                     </>
                                                 ) : field.type === 'checkbox' ? (
                                                    <div className="flex flex-wrap gap-2.5 py-1">
                                                        {(record.values[field.name] || []).map((v: string) => (
                                                            <Badge key={v} variant="outline" className="text-[10px] bg-indigo-500/10 border-indigo-500/20 text-indigo-300 font-black px-3 py-1 rounded-xl uppercase tracking-tighter">
                                                                {v}
                                                            </Badge>
                                                        ))}
                                                        {(!record.values[field.name] || record.values[field.name].length === 0) && <span className="text-white/10 italic text-xs">Sector initialization pending</span>}
                                                    </div>
                                                 ) : (
                                                     <span className="truncate tracking-tight">{String(record.values[field.name] || "—")}</span>
                                                 )}
                                            </div>
                                            {!isEditingThisField && field.type !== 'gallery' && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 opacity-0 group-hover/field:opacity-100 transition-opacity rounded-xl hover:bg-white/10">
                                                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-64 bg-[#0a0a0a] border-white/10 text-white shadow-3xl rounded-2xl p-2 backdrop-blur-2xl">
                                                        <DropdownMenuItem className="gap-3 rounded-xl focus:bg-white/10 cursor-pointer p-3" onClick={() => handleSendToTodo(record, field.name)}>
                                                            <div className="p-1.5 rounded-lg bg-emerald-500/10">
                                                                <ListTodo className="h-4 w-4 text-emerald-400" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-[10px] uppercase tracking-widest">Connect to Flow</span>
                                                                <span className="text-[9px] text-gray-500 font-bold uppercase">Send sector to action matrix</span>
                                                            </div>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/5 my-1" />
                                                        <DropdownMenuItem className="gap-3 rounded-xl focus:bg-white/10 cursor-pointer p-3">
                                                            <div className="p-1.5 rounded-lg bg-sky-500/10">
                                                                <Share2 className="h-4 w-4 text-sky-400" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-[10px] uppercase tracking-widest">Broadcast Segment</span>
                                                                <span className="text-[9px] text-gray-500 font-bold uppercase">Share secure data packet</span>
                                                            </div>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    )}
                                </div>
                             </div>
                           );
                        })}

                        {/* On-the-fly Field Addition */}
                        <div className="md:col-span-2 mt-6">
                            <Button 
                                variant="ghost" 
                                onClick={() => onEditSchema?.(database)}
                                className="w-full h-16 rounded-[2.5rem] border-2 border-dashed border-white/5 hover:bg-indigo-500/5 hover:border-indigo-500/20 text-gray-600 hover:text-indigo-400 transition-all font-black uppercase text-[10px] tracking-[0.2em] gap-3"
                            >
                                <Sparkles className="h-5 w-5" />
                                Evolve Matrix Schema (Add New Field)
                            </Button>
                        </div>
                      </div>

                      {/* Expanded Gallery */}
                      <div id={`gallery-${record.id}`} className="mt-12 pt-12 border-t border-white/10 animate-in slide-in-from-bottom-8 duration-700">
                          <div className="flex items-center justify-between mb-8 px-1">
                              <div>
                                <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Digital Visual Assets</h5>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-indigo-400/60">High-fidelity encrypted buffer</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-11 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 border border-white/5 px-6 shadow-xl"
                                    onClick={() => {
                                        setActiveRecordId(record.id)
                                        cameraInputRef.current?.click()
                                    }}
                                  >
                                      <Camera className="h-4 w-4 mr-2 text-indigo-400" />
                                      Capture Visual
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-11 rounded-2xl bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 border border-indigo-500/20 px-6 shadow-xl"
                                    onClick={() => {
                                        setActiveRecordId(record.id)
                                        fileInputRef.current?.click()
                                    }}
                                  >
                                      <Upload className="h-4 w-4 mr-2" />
                                      Inject Assets
                                  </Button>
                              </div>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {record.images && record.images.length > 0 ? (
                                    <>
                                        {record.images.map((img, i) => (
                                             <div 
                                                key={i} 
                                                className="aspect-square rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/40 group relative shadow-3xl hover:translate-y-[-4px] transition-all duration-500 cursor-pointer"
                                                onClick={() => setFullscreenGallery({ recordId: record.id, imageIndex: i })}
                                             >
                                                 <img src={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" alt="Asset" />
                                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                                                     <div className="bg-indigo-500/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-indigo-500/30">
                                                        <span className="text-[10px] font-black uppercase text-indigo-100 tracking-[0.2em]">Examine Asset</span>
                                                     </div>
                                                 </div>
                                             </div>
                                         ))}
                                        <button 
                                            onClick={() => {
                                                setActiveRecordId(record.id)
                                                fileInputRef.current?.click()
                                            }}
                                            className="aspect-square rounded-[2.5rem] border-2 border-dashed border-white/5 bg-white/2 hover:bg-white/5 hover:border-indigo-500/30 transition-all flex flex-col items-center justify-center gap-3 group/addmore"
                                        >
                                            <Plus className="h-8 w-8 text-white/10 group-hover/addmore:text-indigo-400 group-hover/addmore:scale-110 transition-all" />
                                            <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Inject Data</span>
                                        </button>
                                    </>
                                ) : (
                                    <div 
                                        onClick={() => {
                                            setActiveRecordId(record.id)
                                            fileInputRef.current?.click()
                                        }}
                                        className="w-full aspect-video md:aspect-auto md:h-32 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/2 flex items-center justify-center group/add cursor-pointer hover:bg-white/5 transition-all"
                                    >
                                        <div className="text-center">
                                            <Plus className="h-8 w-8 text-white/20 mx-auto mb-2 group-hover/add:scale-110 group-hover/add:text-white/40 transition-all" />
                                            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] group-hover/add:text-white/40">Initialize Gallery Matrix</p>
                                        </div>
                                    </div>
                                )}
                          </div>
                      </div>
                  </div>
              )}
            </div>
          )
        })}

        {/* Hidden Global Inputs */}
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => activeRecordId && handleImageAdd(activeRecordId, e)}
            multiple 
            accept="image/*" 
            className="hidden" 
        />
        <input 
            type="file" 
            ref={cameraInputRef} 
            onChange={(e) => activeRecordId && handleImageAdd(activeRecordId, e)}
            accept="image/*" 
            capture="environment" 
            className="hidden" 
        />
      </div>

      {filteredRecords.length === 0 && (
         <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/2">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Search className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-gray-500 font-bold tracking-tight text-lg">No records match your search parameters</p>
            <p className="text-gray-600 text-xs mt-2 font-mono">ADAPTIVE_SEARCH_RESULT: 0_ENTRIES</p>
            <Button variant="link" onClick={() => {}} className="text-indigo-400 text-xs mt-6 uppercase font-black tracking-widest">Clear active filters</Button>
         </div>
       )}
 
        {/* Fullscreen Notes Overlay */}
        {fullscreenNote && (
           <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center p-6 md:p-20 overflow-hidden">
              <div className="absolute top-10 right-10 flex items-center gap-4">
                 <Button 
                     variant="ghost" 
                     className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-2xl h-14 px-8 text-xs font-black uppercase tracking-widest gap-3 transition-all ring-1 ring-emerald-500/20"
                     onClick={() => {
                        if (!fullscreenNote) return;
                        const rec = database?.records.find(r => r.id === fullscreenNote.recordId);
                        if (database && rec) {
                            onAddTodo({
                                id: Math.random().toString(36).substr(2, 9),
                                title: `Review: ${fullscreenNote.fieldName} from ${database.title}`,
                                description: fullscreenNote.value,
                                priority: 'normal',
                                status: 'active',
                                created: new Date().toISOString(),
                                databaseSource: database.title
                            });
                            toast.success("Intel synced to Task Architect");
                        }
                     }}
                 >
                     <ListTodo className="h-5 w-5" />
                     Connect to Flow
                 </Button>
                 <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-14 w-14 rounded-full bg-white/5 border border-white/10 text-white hover:bg-rose-500 hover:text-white transition-all shadow-2xl"
                     onClick={() => setFullscreenNote(null)}
                 >
                     <Plus className="h-6 w-6 rotate-45" />
                 </Button>
              </div>
              
              <div className="max-w-5xl w-full space-y-8 animate-in slide-in-from-bottom-12 duration-700">
                 <div className="space-y-4">
                     <div className="flex items-center gap-4">
                         <div className="h-3 w-3 bg-indigo-500 rounded-full animate-pulse" />
                         <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Notes Architect v2.0 // Deep Focus</h2>
                     </div>
                     <h1 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-tight">{fullscreenNote?.fieldName}</h1>
                 </div>
 
                 <div className="relative group">
                     <textarea 
                         className="w-full h-[50vh] bg-transparent border-l-4 border-indigo-500/50 pl-12 text-2xl md:text-5xl font-black text-white/90 placeholder:text-white/5 focus:outline-none focus:border-indigo-500 transition-all resize-none leading-relaxed tracking-tight"
                         value={fullscreenNote?.value || ''}
                         onChange={(e) => {
                             if (!fullscreenNote || !database) return;
                             const newVal = e.target.value;
                             setFullscreenNote({ ...fullscreenNote, value: newVal });
                             
                             const record = database.records.find(r => r.id === fullscreenNote.recordId);
                             if (record) {
                                 const updatedRecord = {
                                     ...record,
                                     values: { ...record.values, [fullscreenNote.fieldName]: newVal },
                                     lastUpdated: new Date().toISOString()
                                 };
                                 onDatabaseUpdate({
                                     ...database,
                                     records: database.records.map(r => r.id === record.id ? updatedRecord : r)
                                 });
                             }
                         }}
                         autoFocus
                         placeholder="Neural buffer ready. Begin stream..."
                     />
                     <div className="absolute top-0 right-0 h-full w-px bg-white/5" />
                     <div className="absolute bottom-0 left-0 w-full h-px bg-white/5" />
                     
                     <div className="absolute bottom-10 left-12 flex items-center gap-10">
                         <div className="flex flex-col">
                             <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Words Generated</span>
                             <span className="text-3xl font-black text-indigo-400/80">{fullscreenNote?.value.trim().split(/\s+/).filter(Boolean).length || 0}</span>
                         </div>
                         <div className="flex flex-col">
                             <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Characters Logged</span>
                             <span className="text-3xl font-black text-indigo-400/80">{fullscreenNote?.value.length || 0}</span>
                         </div>
                         <Button 
                             variant="ghost" 
                             className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-2xl h-14 w-14 p-0 shadow-2xl animate-pulse"
                             onClick={handleSpeechToText}
                         >
                             <Mic className={`h-6 w-6 ${isListening ? 'animate-bounce' : ''}`} />
                         </Button>
                     </div>
                 </div>
                 
                 <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">Neural Stream Logs // {format(new Date(), "HH:mm:ss")}</p>
              </div>
           </div>
        )}
 
        {/* Gallery Vision Fullscreen Overlay */}
        {fullscreenGallery && (
             <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500 flex flex-col items-center justify-center p-8">
                 <div className="w-full max-w-6xl flex items-center justify-between mb-12 relative z-10 px-8">
                     <div className="flex items-center gap-4">
                         <div className="p-4 rounded-3xl bg-indigo-500/20 text-indigo-400 shadow-[0_0_30px_rgba(129,140,248,0.2)]">
                             <ImageIcon className="h-8 w-8" />
                         </div>
                         <div>
                             <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Gallery Vision</h2>
                             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em]">Asset Protocol: v4.2.0 • Immersive Environment</p>
                         </div>
                     </div>
                     
                     <div className="flex items-center gap-3">
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-emerald-500 hover:text-white transition-all shadow-2xl"
                          onClick={() => {
                              if (!fullscreenGallery) return;
                              const imgUrl = database?.records.find(r => r.id === fullscreenGallery.recordId)?.images?.[fullscreenGallery.imageIndex];
                              if (imgUrl) {
                                  const link = document.createElement('a');
                                  link.href = imgUrl;
                                  link.download = `asset-${fullscreenGallery.recordId}-${fullscreenGallery.imageIndex}.png`;
                                  link.click();
                              }
                          }}
                         >
                             <FileDown className="h-6 w-6" />
                         </Button>
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-rose-500 hover:text-white transition-all shadow-2xl"
                          onClick={() => {
                              if (!fullscreenGallery) return;
                              const { recordId, imageIndex } = fullscreenGallery;
                              handleDeleteImage(recordId, imageIndex);
                              setFullscreenGallery(null);
                          }}
                         >
                             <Trash2 className="h-6 w-6" />
                         </Button>
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-14 w-14 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/20 transition-all shadow-2xl"
                          onClick={() => setFullscreenGallery(null)}
                         >
                             <Plus className="h-6 w-6 rotate-45" />
                         </Button>
                     </div>
                 </div>
  
                 <div className="relative w-full h-[70vh] flex items-center justify-center group/view">
                     <img 
                      src={database?.records.find(r => r.id === (fullscreenGallery?.recordId || ''))?.images?.[fullscreenGallery?.imageIndex || 0]} 
                      className="max-w-[90vw] max-h-full rounded-[3rem] shadow-[0_0_100px_rgba(30,58,138,0.3)] border border-white/10 cursor-zoom-out"
                      onClick={() => setFullscreenGallery(null)}
                      alt="Immersion View"
                     />
                     
                     {/* Navigation */}
                     <div className="absolute inset-x-10 flex items-center justify-between opacity-0 group-hover/view:opacity-100 transition-opacity">
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={fullscreenGallery?.imageIndex === 0}
                          className="h-20 w-20 rounded-[2.5rem] bg-black/50 backdrop-blur-xl border border-white/10 text-white hover:bg-indigo-500 hover:border-indigo-500 disabled:opacity-0 transition-all"
                          onClick={() => fullscreenGallery && setFullscreenGallery({ ...fullscreenGallery, imageIndex: (fullscreenGallery.imageIndex || 0) - 1 })}
                         >
                             <ChevronDown className="h-10 w-10 rotate-90" />
                         </Button>
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={fullscreenGallery?.imageIndex === (database?.records.find(r => r.id === (fullscreenGallery?.recordId || ''))?.images?.length || 1) - 1}
                          className="h-20 w-20 rounded-[2.5rem] bg-black/50 backdrop-blur-xl border border-white/10 text-white hover:bg-indigo-500 hover:border-indigo-500 disabled:opacity-0 transition-all"
                          onClick={() => fullscreenGallery && setFullscreenGallery({ ...fullscreenGallery, imageIndex: (fullscreenGallery.imageIndex || 0) + 1 })}
                         >
                             <ChevronDown className="h-10 w-10 -rotate-90" />
                         </Button>
                     </div>
                 </div>
  
                 <div className="absolute bottom-12 flex flex-col items-center gap-6">
                     <div className="flex gap-3">
                         {database?.records.find(r => r.id === (fullscreenGallery?.recordId || ''))?.images?.map((_, i) => (
                             <div 
                              key={i} 
                              className={`h-1.5 transition-all rounded-full ${i === (fullscreenGallery?.imageIndex || 0) ? 'w-12 bg-indigo-500' : 'w-3 bg-white/10 hover:bg-white/20 cursor-pointer'}`}
                              onClick={() => fullscreenGallery && setFullscreenGallery({ ...fullscreenGallery, imageIndex: i })}
                             />
                         ))}
                     </div>
                     <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">
                         ASSET_INDEX: {(fullscreenGallery?.imageIndex || 0) + 1} / {database?.records.find(r => r.id === (fullscreenGallery?.recordId || ''))?.images?.length || 0}
                     </p>
                 </div>
             </div>
          )}
     </div>
   )
 }
