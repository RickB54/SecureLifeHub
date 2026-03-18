import React from "react"
import type { Database, DbRecord, Field } from "@/types/secure-database"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  X, Edit2, Star, Calendar, Clock, 
  MapPin, User, Tag, FileText, 
  Layers, Package, Info, CheckCircle2 
} from "lucide-react"

interface RecordDetailsProps {
  database: Database
  record: DbRecord
  onClose: () => void
  onEdit: () => void
  onToggleFavorite: (recordId: string) => void
}

export function RecordDetails({ 
  database, 
  record, 
  onClose, 
  onEdit, 
  onToggleFavorite 
}: RecordDetailsProps) {
  
  const getFieldIcon = (field: Field) => {
    switch (field.type) {
      case "text": return <Type className="h-4 w-4" />
      case "number": return <Layers className="h-4 w-4" />
      case "date": return <Calendar className="h-4 w-4" />
      case "checkbox": return <CheckCircle2 className="h-4 w-4" />
      case "dropdown": return <Tag className="h-4 w-4" />
      case "textarea": return <FileText className="h-4 w-4" />
      case "gallery": return <Layers className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const colorMap: { [key: string]: string } = {
    emerald: "indigo-500",
    green: "emerald-400",
    teal: "teal-400",
    cyan: "sky-400",
    indigo: "indigo-400",
    rose: "rose-400",
    red: "rose-500",
    amber: "amber-400",
    blue: "blue-400",
    pink: "pink-400",
  }

  const themeColor = colorMap[database.color || "emerald"] || "indigo-500"

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header Profile Area */}
      <div className={`relative h-48 bg-gradient-to-br from-${themeColor}/30 via-[#111] to-[#0a0a0a] border-b border-white/5`}>
        <div className="absolute top-6 right-8 flex gap-3 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onToggleFavorite(record.id)}
            className={`h-11 w-11 rounded-2xl backdrop-blur-xl border border-white/10 transition-all ${record.isFavorite ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' : 'text-white/50 bg-white/5 hover:text-white'}`}
          >
            <Star className={`h-5 w-5 ${record.isFavorite ? 'fill-current' : ''}`} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-11 w-11 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-2xl backdrop-blur-xl border border-white/10 transition-all"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex items-end gap-6">
            <div className={`h-24 w-24 rounded-[2rem] bg-gradient-to-br from-${themeColor} to-indigo-600 shadow-2xl flex items-center justify-center text-white ring-8 ring-white/5`}>
              <Package className="h-10 w-10" />
            </div>
            <div className="flex-1 mb-2">
              <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-none mb-2">
                {Object.values(record.values)[0] as string}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                <Layers className={`h-3 w-3 text-${themeColor}`} />
                {database.title}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {database.fields.map((field, idx) => {
              const value = record.values[field.name]
              if (!value && field.type !== "gallery") return null

              return (
                <div key={field.name} className={`space-y-2 group animate-in fade-in slide-in-from-bottom-2 duration-700 delay-[${idx * 50}ms]`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`h-7 w-7 rounded-lg bg-${themeColor}/10 border border-${themeColor}/20 flex items-center justify-center text-${themeColor}`}>
                      {getFieldIcon(field)}
                    </div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{field.name}</label>
                  </div>
                  
                  {field.type === "textarea" ? (
                    <div className="p-5 rounded-3xl bg-white/2 border border-white/5 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {value || "No detailed information provided."}
                    </div>
                  ) : field.type === "checkbox" ? (
                    <div className="flex flex-wrap gap-2">
                      {(value as string[] || []).map(opt => (
                        <span key={opt} className={`px-4 py-1.5 rounded-xl bg-${themeColor}/10 border border-${themeColor}/20 text-${themeColor} text-[10px] font-black uppercase tracking-tight`}>
                          {opt}
                        </span>
                      ))}
                    </div>
                  ) : field.type === "gallery" ? (
                    <div className="space-y-4">
                      {record.images && record.images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {record.images.map((img, i) => (
                            <div key={i} className="aspect-square rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative group shadow-2xl">
                              <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`Asset ${i}`} />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <p className="text-[10px] text-white font-black uppercase tracking-widest">View Asset</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="aspect-video rounded-[2.5rem] bg-gradient-to-br from-white/5 to-white/2 border border-white/5 border-dashed flex flex-col items-center justify-center text-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-600">
                            <Layers className="h-6 w-6" />
                          </div>
                          <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Digital Asset Vault<br/>Module Connectivity Active</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xl font-bold text-white pl-1">
                      {String(value || "—")}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-16 p-8 rounded-[3rem] bg-white/2 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Entry Serial</p>
                    <p className="text-xs font-bold text-gray-400">{record.id}</p>
                </div>
                <div className="w-px h-8 bg-white/5" />
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Established</p>
                    <p className="text-xs font-bold text-gray-400">{new Date(record.created).toLocaleDateString()}</p>
                </div>
            </div>
            
            <Button 
              onClick={onEdit}
              className={`h-16 px-10 rounded-2xl bg-${themeColor} hover:bg-${themeColor}/80 text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-${themeColor}/20 transition-all hover:scale-105 active:scale-95`}
            >
              <Edit2 className="h-5 w-5 mr-3" />
              Upgrade Record
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

import { Type } from "lucide-react"
