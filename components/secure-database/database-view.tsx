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
  ListTodo,
  CheckCircle2,
  Share2,
  Camera,
  Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  searchQuery: string
  onDatabaseUpdate: (db: DatabaseType) => void
  onDuplicateRecord: (record: DbRecord) => void
  onEditRecord: (record: DbRecord) => void
  onSelectRecord: (record: DbRecord) => void
  collapseAll: boolean
  allDatabases: DatabaseType[]
  onSelectDatabase: (title: string) => void
  onAddTodo: (todo: any) => void
  onAddRecord: () => void
  initialExpandedRecordId?: string
}

export function DatabaseView({ 
  database, 
  searchQuery, 
  onDatabaseUpdate, 
  onDuplicateRecord,
  onEditRecord,
  onSelectRecord,
  collapseAll,
  allDatabases,
  onSelectDatabase,
  onAddTodo,
  onAddRecord,
  initialExpandedRecordId 
}: DatabaseViewProps) {
  const [expandedRecords, setExpandedRecords] = useState<{ [key: string]: boolean }>({})
  const recordRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null)

  useEffect(() => {
    if (initialExpandedRecordId) {
      setExpandedRecords(prev => ({ ...prev, [initialExpandedRecordId]: true }))
      setTimeout(() => {
          recordRefs.current[initialExpandedRecordId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    }
  }, [initialExpandedRecordId])

  useEffect(() => {
    if (collapseAll) {
        setExpandedRecords({})
    }
  }, [collapseAll])

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

  const toggleExpand = (recordId: string) => {
    const willExpand = !expandedRecords[recordId]
    setExpandedRecords(prev => ({ ...prev, [recordId]: willExpand }))
    
    if (willExpand) {
        // Delay slightly for render then scroll into view
        setTimeout(() => {
            recordRefs.current[recordId]?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            })
        }, 100)
    }
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

  const vibrantColors = [
    { bg: "bg-purple-700", border: "border-purple-500/30", text: "text-purple-100" },
    { bg: "bg-rose-700", border: "border-rose-500/30", text: "text-rose-100" },
    { bg: "bg-indigo-700", border: "border-indigo-500/30", text: "text-indigo-100" },
    { bg: "bg-emerald-700", border: "border-emerald-500/30", text: "text-emerald-100" },
    { bg: "bg-amber-600", border: "border-amber-400/30", text: "text-amber-100" },
    { bg: "bg-blue-700", border: "border-blue-500/30", text: "text-blue-100" },
    { bg: "bg-teal-700", border: "border-teal-500/30", text: "text-teal-100" },
    { bg: "bg-cyan-700", border: "border-cyan-500/30", text: "text-cyan-100" },
  ]

  const getRecordTheme = (index: number) => {
    return vibrantColors[index % vibrantColors.length]
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
                        key={db.title}
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

  return (
    <div className="space-y-6">
      {/* Header Info Area */}
      <div className={`p-8 rounded-3xl ${themeColor} border ${themeBorder} flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group`}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
          <div className="relative z-10">
              <h3 className="text-2xl font-black tracking-tight text-white leading-none mb-2">{database.title}</h3>
              <p className="text-[11px] text-white/70 font-medium">
                {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'} • {searchQuery ? 'Showing filtered records' : 'Showing all records'}
              </p>
          </div>
          <div className="flex items-center gap-2 relative z-10 w-full md:w-auto">
              <Button 
                onClick={onAddRecord}
                className="bg-white hover:bg-white/90 text-black rounded-xl text-[11px] font-bold h-10 px-4 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
              <Button variant="ghost" className="bg-black/20 hover:bg-black/40 text-white rounded-xl text-[11px] font-bold h-10 px-4 ml-1">
                <Printer className="h-4 w-4 mr-2" />
                Print Database
              </Button>
          </div>
      </div>

      <div className="space-y-4">
        {filteredRecords.map((record, index) => {
          const isExpanded = expandedRecords[record.id]
          const titleField = database.fields[0].name
          const recordTheme = getRecordTheme(index)
          
          return (
            <div 
              key={record.id}
              ref={el => { recordRefs.current[record.id] = el }}
              className={`rounded-[2rem] overflow-hidden border transition-all duration-500 shadow-xl
                ${isExpanded ? `${recordTheme.bg} ${recordTheme.border}` : 'bg-white/5 border-white/5 hover:border-white/10'}`}
            >
              {/* Record Header Bar */}
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                      <h4 className={`text-lg font-bold tracking-tight truncate ${isExpanded ? 'text-white' : 'text-gray-100'}`}>
                        {record.values[titleField] || "Untitled Record"}
                      </h4>
                      <div className={`h-1.5 w-1.5 rounded-full hidden md:block ${isExpanded ? 'bg-white/40' : 'bg-white/10'}`} />
                      <p className={`text-[11px] font-mono font-medium ${isExpanded ? 'text-white/40' : 'text-gray-500'}`}>
                        {format(new Date(record.created), "MMM d, yyyy h:mm a")}
                      </p>
                  </div>

                  <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onEditRecord(record)} className={`h-9 w-9 rounded-xl ${isExpanded ? 'text-white hover:bg-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDuplicateRecord(record)} className={`h-9 w-9 rounded-xl ${isExpanded ? 'text-white hover:bg-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <div className="relative group">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!isExpanded) toggleExpand(record.id)
                            setTimeout(() => {
                              const gallerySection = document.getElementById(`gallery-${record.id}`)
                              gallerySection?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }, 200)
                          }}
                          className={`h-9 w-9 rounded-xl ${isExpanded ? 'text-white hover:bg-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <ImageIcon className="h-4 w-4" />
                            <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-black text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-indigo-500">
                                {record.images?.length || 0}
                            </span>
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => toggleFavorite(record.id)} className={`h-9 w-9 rounded-xl ${isExpanded ? 'text-white hover:bg-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'} ${record.isFavorite ? 'text-amber-400' : ''}`}>
                        <Star className={`h-4 w-4 ${record.isFavorite ? 'fill-current' : ''}`} />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => toggleExpand(record.id)} 
                        className={`h-9 w-9 rounded-xl ${isExpanded ? 'text-white hover:bg-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>

                      <div className="w-px h-6 bg-white/10 mx-1" />

                      <Button variant="ghost" size="icon" className={`h-9 w-9 rounded-xl ${isExpanded ? 'text-white hover:bg-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <FileDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className={`h-9 w-9 rounded-xl ${isExpanded ? 'text-white hover:bg-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteRecord(record.id)} className={`h-9 w-9 rounded-xl ${isExpanded ? 'text-white hover:bg-black/20' : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/20'}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
              </div>

              {/* Collapsed Preview Line */}
              {!isExpanded && (
                  <div className="px-6 pb-6 pt-0 border-t border-white/5 mt-[-8px]">
                      <div className="flex flex-wrap gap-4 mt-4">
                          {database.fields.filter(f => f.showOnCard).slice(1, 4).map(field => (
                              <div key={field.name} className="flex items-center gap-2">
                                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">{field.name}:</span>
                                  <span className="text-xs font-bold text-gray-400 truncate max-w-[150px]">
                                    {String(record.values[field.name] || "—")}
                                  </span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* Full Expanded Content */}
              {isExpanded && (
                  <div className="bg-black/20 backdrop-blur-md p-8 pt-4 border-t border-white/10 animate-in slide-in-from-top-4 duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {database.fields.map((field) => (
                           <div key={field.name} className="space-y-1.5 group">
                               <label className="text-[10px] font-black uppercase tracking-widest text-white/50 pl-1">{field.name}</label>
                               <div className="relative">
                                   <div className={`w-full bg-black/30 border border-white/10 rounded-2xl p-4 flex items-center justify-between group/field hover:border-white/20 transition-all ${field.type === 'gallery' ? 'cursor-pointer hover:bg-white/5' : ''}`}
                                        onClick={() => {
                                            if (field.type === 'gallery') {
                                                const gallerySection = document.getElementById(`gallery-${record.id}`)
                                                gallerySection?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                            }
                                        }}
                                   >
                                       <span className="text-sm font-bold text-white truncate pr-8 flex items-center gap-2">
                                            {field.type === 'gallery' ? (
                                                <>
                                                    <ImageIcon className="h-4 w-4 text-indigo-400" />
                                                    <span>Open Record Gallery ({record.images?.length || 0} Assets)</span>
                                                </>
                                            ) : (
                                                String(record.values[field.name] || "") || <span className="text-white/20 italic">Empty Field</span>
                                            )}
                                       </span>
                                       <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button 
                                                    className="absolute right-3 p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover/field:opacity-100"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 bg-[#0a0a0a] border-white/10 text-white shadow-2xl rounded-2xl p-1">
                                                <DropdownMenuItem className="gap-2 rounded-xl focus:bg-white/10 cursor-pointer" onClick={() => onEditRecord(record)}>
                                                    <Edit2 className="h-4 w-4 text-indigo-400" />
                                                    <span className="font-bold text-xs uppercase tracking-tight">Edit Field</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 rounded-xl focus:bg-white/10 cursor-pointer" onClick={() => handleSendToTodo(record, field.name)}>
                                                    <ListTodo className="h-4 w-4 text-emerald-400" />
                                                    <span className="font-bold text-xs uppercase tracking-tight">Send to To-Do List</span>
                                                </DropdownMenuItem>
                                                {field.type === 'gallery' && (
                                                    <DropdownMenuItem 
                                                        className="gap-2 rounded-xl focus:bg-white/10 cursor-pointer" 
                                                        onClick={() => {
                                                            setActiveRecordId(record.id)
                                                            fileInputRef.current?.click()
                                                        }}
                                                    >
                                                        <Upload className="h-4 w-4 text-sky-400" />
                                                        <span className="font-bold text-xs uppercase tracking-tight">Add Images</span>
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator className="bg-white/5" />
                                                <DropdownMenuItem className="gap-2 rounded-xl focus:bg-white/10 cursor-pointer">
                                                    <Share2 className="h-4 w-4 text-sky-400" />
                                                    <span className="font-bold text-xs uppercase tracking-tight">Share Intelligence</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                       </DropdownMenu>
                                   </div>
                               </div>
                           </div>
                        ))}
                      </div>

                      <div id={`gallery-${record.id}`} className="mt-8 pt-8 border-t border-white/10">
                          <div className="flex items-center justify-between mb-4 px-1">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/50">Digital Asset Gallery</h5>
                              <div className="flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 rounded-xl bg-white/5 text-xs font-bold hover:bg-white/10"
                                    onClick={() => {
                                        setActiveRecordId(record.id)
                                        cameraInputRef.current?.click()
                                    }}
                                  >
                                      <Camera className="h-3 w-3 mr-2 text-indigo-400" />
                                      Take Pic
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 rounded-xl bg-white/5 text-xs font-bold hover:bg-white/10"
                                    onClick={() => {
                                        setActiveRecordId(record.id)
                                        fileInputRef.current?.click()
                                    }}
                                  >
                                      <Upload className="h-3 w-3 mr-2 text-indigo-400" />
                                      Upload
                                  </Button>
                              </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-4">
                                {record.images && record.images.length > 0 ? (
                                    <>
                                        {record.images.map((img, i) => (
                                            <div key={i} className="h-28 w-28 rounded-[1.5rem] overflow-hidden border border-white/10 bg-white/5 group relative shadow-xl hover:scale-105 transition-all">
                                                <img src={img} alt="Resource" className="h-full w-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleDeleteImage(record.id, i)}
                                                        className="h-10 w-10 text-rose-400 hover:text-white hover:bg-rose-500/20"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {/* Quick Add Button at end of gallery */}
                                        <button 
                                            onClick={() => {
                                                setActiveRecordId(record.id)
                                                fileInputRef.current?.click()
                                            }}
                                            className="h-28 w-28 rounded-[1.5rem] border-2 border-dashed border-white/5 bg-white/2 hover:bg-white/5 hover:border-indigo-500/30 transition-all flex flex-col items-center justify-center gap-2 group"
                                        >
                                            <Plus className="h-6 w-6 text-white/20 group-hover:text-white/40 group-hover:scale-110 transition-all" />
                                            <span className="text-[8px] font-black uppercase text-gray-600">Add More</span>
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
    </div>
  )
}
