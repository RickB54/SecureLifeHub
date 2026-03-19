"use client"

import React, { useState, useRef } from "react"
import imageCompression from 'browser-image-compression'
import { 
  X, Save, Trash2, Edit3, 
  MapPin, User, Tag, FileText, 
  Layers, Package, Info, CheckCircle2,
  Calendar, Clock, DollarSign, Users,
  Minus, Plus, Type, Hash, Image as ImageIcon,
  Upload, Sparkles, Camera
} from "lucide-react"
import type { Database, DbRecord, Field, FieldType } from "@/types/secure-database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface RecordFormProps {
  database: Database
  record?: DbRecord
  onSubmit: (values: { [key: string]: any }, images?: string[]) => void
  onCancel: () => void
  onUpdateDatabase?: (updatedDatabase: Database) => void
  onUpdateRecord?: (dbId: string, recordId: string, updates: any) => Promise<void>
}

export function RecordForm({ database, record, onSubmit, onCancel, onUpdateDatabase, onUpdateRecord }: RecordFormProps) {
  const [newOption, setNewOption] = useState("")
  const [showAddField, setShowAddField] = useState(false)
  const [newFieldName, setNewFieldName] = useState("")
  const [newFieldType, setNewFieldType] = useState<FieldType>("text")
  const [newFieldOptions, setNewFieldOptions] = useState<string[]>([])
  const [newOptionState, setNewOptionState] = useState("")
  const [localImages, setLocalImages] = useState<string[]>(record?.images || [])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const values: { [key: string]: any } = {}

    database.fields.forEach((field) => {
      if (field.type === "checkbox") {
        const selectedOptions = formData.getAll(field.name)
        values[field.name] = selectedOptions
      } else {
        values[field.name] = formData.get(field.name)
      }
    })

    onSubmit(values, localImages)
  }

  const handleAddField = () => {
    if (!newFieldName || !onUpdateDatabase) return
    
    const newField: Field = {
        name: newFieldName,
        type: newFieldType,
        showOnCard: false,
        options: (newFieldType === "dropdown" || newFieldType === "checkbox") ? newFieldOptions : undefined
    }
    
    const updatedDb = {
        ...database,
        fields: [...database.fields, newField]
    }
    
    onUpdateDatabase(updatedDb)
    setNewFieldName("")
    setNewFieldOptions([])
    setNewFieldType("text")
    setShowAddField(false)
    toast.success(`Matrix evolved: ${newFieldName} field neutralized`)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
        toast.error("No Assets Detected: Buffer Empty")
        return
    }

    toast.info(`Asset Protocol Engaged: ${files.length} object(s) detected. Protocol: ${files[0].name.split('.').pop()?.toUpperCase()}`)

    // Add a small delay to let the browser stabilize after the camera app closes
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
        toast.info("Initializing Secure Compression Engine...", { duration: 1000 })
      const options = {
        maxSizeMB: 0.2, // Drastically reduced from 1MB to 200KB
        maxWidthOrHeight: 1024, // Reduced from 1920 to 1024
        useWebWorker: false,
        initialQuality: 0.6
      }

      const compressedFiles: File[] = []
      for (const file of Array.from(files)) {
        try {
          const compressed = await imageCompression(file, options)
          compressedFiles.push(compressed)
        } catch (error) {
          console.error("Compression Error:", error)
          compressedFiles.push(file)
        }
      }

      const base64Images: string[] = []
      for (const file of compressedFiles) {
        toast.info(`Acquiring asset index ${base64Images.length + 1}...`, { duration: 1000 })
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        base64Images.push(base64)
      }

      const allImages = [...localImages, ...base64Images]
      setLocalImages(allImages)
      
      // If we are editing an existing record, save immediately to prevent data loss on browser swap/reload
      if (record && record.id && onUpdateRecord && database.id) {
          toast.info("Synchronizing assets with cloud architecture...", { duration: 2000 })
          await onUpdateRecord(database.id, record.id, { images: allImages })
          toast.success("Sector synchronized with primary vault")
      } else {
          toast.success(`${base64Images.length} assets successfully staged in local buffer`)
      }
    } catch (error: any) {
      console.error("Critical Asset Injection Fault:", error)
      toast.error(`Fault Detected: ${error.message || 'Unknown Protocol Error'}`)
    }
  }

  const removeImage = (index: number) => {
    setLocalImages(prev => prev.filter((_, i) => i !== index))
  }

  const getFieldIcon = (type: FieldType) => {
    switch (type) {
      case "text": return <Type className="h-4 w-4" />
      case "number": return <Hash className="h-4 w-4" />
      case "date": return <Calendar className="h-4 w-4" />
      case "checkbox": return <CheckCircle2 className="h-4 w-4" />
      case "dropdown": return <Tag className="h-4 w-4" />
      case "textarea": return <FileText className="h-4 w-4" />
      case "gallery": return <ImageIcon className="h-4 w-4" />
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

  const renderFieldInput = (field: Field) => {
    const value = record?.values[field.name]
    const baseClasses = "bg-white/5 border-white/5 h-12 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 text-white font-bold transition-all hover:bg-white/8"

    const fieldLabel = (
      <div className="flex items-center justify-between mb-3 px-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <div className={`h-6 w-6 rounded-lg bg-${themeColor}/20 flex items-center justify-center text-${themeColor}`}>
                {getFieldIcon(field.type)}
            </div>
            {field.name}
        </label>
      </div>
    )

    switch (field.type) {
      case "text":
      case "number":
      case "date":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {fieldLabel}
            <Input 
                type={field.type} 
                name={field.name} 
                defaultValue={value || ""} 
                className={baseClasses} 
                required={field.name.toLowerCase().includes("name") || field.name.toLowerCase().includes("title")}
            />
          </div>
        )

      case "textarea":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 md:col-span-2">
            {fieldLabel}
            <Textarea 
                name={field.name} 
                defaultValue={value || ""} 
                className={`${baseClasses} min-h-[140px] pt-4 leading-relaxed`} 
            />
          </div>
        )

      case "dropdown":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {fieldLabel}
            <Select name={field.name} defaultValue={value}>
              <SelectTrigger className={baseClasses}>
                <SelectValue placeholder="Select high-fidelity option..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white shadow-2xl backdrop-blur-2xl">
                {field.options?.map((opt) => (
                  <SelectItem key={opt} value={opt} className="focus:bg-white/10 font-bold uppercase text-[10px] tracking-widest py-3">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case "checkbox":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 md:col-span-2 space-y-4">
            {fieldLabel}
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-[3rem] bg-white/2 border border-white/5`}>
              {field.options?.map((opt) => (
                <div key={opt} className="flex items-center gap-4 p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-colors group">
                  <Checkbox 
                    id={`${field.name}-${opt}`} 
                    name={field.name} 
                    value={opt} 
                    defaultChecked={(value || []).includes(opt)}
                    className={`h-6 w-6 border-white/10 data-[state=checked]:bg-${themeColor} data-[state=checked]:border-${themeColor} rounded-xl`}
                  />
                  <Label htmlFor={`${field.name}-${opt}`} className="text-xs font-black uppercase text-gray-500 group-hover:text-white transition-colors cursor-pointer flex-1">
                    {opt}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )

      case "gallery":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 md:col-span-2">
            {fieldLabel}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="p-12 border-2 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center gap-4 text-center group hover:border-indigo-500/40 hover:bg-white/2 transition-all cursor-pointer"
            >
                <div className="h-16 w-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 transition-all group-hover:scale-110 group-hover:bg-indigo-500/20">
                    <ImageIcon className="h-8 w-8" />
                </div>
                <div>
                   <p className="text-xs font-black uppercase text-white mb-1">Click to Inject Assets</p>
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Secure Object Storage Node Active</p>
                </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      <div className={`h-1.5 w-full bg-gradient-to-r from-${themeColor}/0 via-${themeColor} to-${themeColor}/0`} />

      <ScrollArea className="flex-1">
        <form id="record-form" onSubmit={handleSubmit} className="p-4 sm:p-8 md:p-12 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 mb-8 sm:mb-16">
             <div className="space-y-4">
                <div className={`h-24 w-24 rounded-[2.5rem] bg-gradient-to-br from-${themeColor} to-indigo-600 shadow-2xl shadow-${themeColor}/20 flex items-center justify-center text-white ring-8 ring-white/5`}>
                  <Package className="h-10 w-10" />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-1">
                        {record ? 'Edit Record' : 'Create Entry'}
                    </h2>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] flex items-center gap-2">
                        <Layers className={`h-3 w-3 text-${themeColor}`} />
                        {database.title}
                    </p>
                </div>
             </div>
             
             <div className="hidden lg:flex gap-4">
                <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-center min-w-[120px]">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">State</p>
                    <p className="text-xs font-bold text-gray-400">{record ? 'Revision' : 'Evolution'}</p>
                </div>
                <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-center min-w-[120px]">
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Identity</p>
                    <p className="text-xs font-bold text-gray-400">#{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-8 sm:gap-y-12">
            {database.fields.map((field) => (
                <React.Fragment key={field.name}>
                    {renderFieldInput(field)}
                </React.Fragment>
            ))}

            {/* Image Upload Matrix */}
            <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-3 px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400`}>
                            <ImageIcon className="h-3 w-3" />
                        </div>
                        Digital Asset Gallery
                    </label>
                    <Badge variant="outline" className="text-[9px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-2">
                        {localImages.length} ASSETS READY
                    </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {localImages.map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative group shadow-2xl">
                            <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Asset" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => removeImage(idx)}
                                    className="h-10 w-10 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-full"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-3xl border-2 border-dashed border-white/5 bg-white/2 hover:bg-white/5 hover:border-indigo-500/30 transition-all flex flex-col items-center justify-center gap-2 group shadow-xl"
                    >
                        <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                            <Upload className="h-5 w-5 text-indigo-400" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Inject Asset</p>
                    </button>
                    <label 
                        htmlFor="camera-input-primary"
                        className="aspect-square rounded-3xl border-2 border-dashed border-white/5 bg-white/2 hover:bg-white/5 hover:border-indigo-500/30 transition-all flex flex-col items-center justify-center gap-2 group shadow-xl cursor-pointer"
                    >
                        <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                            <Camera className="h-5 w-5 text-indigo-400" />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Take Photo</p>
                    </label>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                    />
                    <input 
                        id="camera-input-primary"
                        type="file" 
                        ref={cameraInputRef} 
                        onChange={handleImageUpload} 
                        accept="image/*" 
                        capture="environment"
                        className="hidden" 
                    />
                </div>
            </div>

            {/* Dynamic Schema Evolution */}
            <div className="md:col-span-2 mt-8 sm:mt-12 p-5 sm:p-10 border-2 border-dashed border-white/5 rounded-[2rem] sm:rounded-[3.5rem] bg-white/2 hover:border-indigo-500/40 transition-all group overflow-hidden relative">
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
                
                {!showAddField ? (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setShowAddField(true)}
                        className="w-full h-20 rounded-2xl text-indigo-400 hover:bg-indigo-500/10 hover:text-white font-black uppercase text-[11px] tracking-[0.2em] gap-4 transition-all"
                    >
                        <Sparkles className="h-5 w-5 animate-pulse" />
                        Evolve Database Architecture (Add Vector)
                    </Button>
                ) : (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-500/20 rounded-2xl">
                                <Plus className="h-6 w-6 text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black uppercase italic text-white leading-none">Initialize New Node</h4>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Expanding intelligence parameters</p>
                            </div>
                        </div>
                        
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                           <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-600 pl-1">Vector Identifier</Label>
                                <Input 
                                    placeholder="e.g., Tactical Notes, Mission Cost..." 
                                    value={newFieldName}
                                    onChange={(e) => setNewFieldName(e.target.value)}
                                    className="h-14 bg-black border-white/10 rounded-2xl font-bold focus:border-indigo-500"
                                />
                           </div>
                           <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-600 pl-1">Data Type Protocol</Label>
                                <Select value={newFieldType} onValueChange={(v: any) => {
                                    setNewFieldType(v)
                                    setNewFieldOptions([])
                                }}>
                                    <SelectTrigger className="h-14 bg-black border-white/10 rounded-2xl font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white shadow-2xl rounded-2xl">
                                        <SelectItem value="text" className="rounded-xl py-3 px-4 focus:bg-white/10 font-bold uppercase text-[10px] tracking-widest">Text Node</SelectItem>
                                        <SelectItem value="number" className="rounded-xl py-3 px-4 focus:bg-white/10 font-bold uppercase text-[10px] tracking-widest">Numeric Vector</SelectItem>
                                        <SelectItem value="date" className="rounded-xl py-3 px-4 focus:bg-white/10 font-bold uppercase text-[10px] tracking-widest">Temporal Marker</SelectItem>
                                        <SelectItem value="dropdown" className="rounded-xl py-3 px-4 focus:bg-white/10 font-bold uppercase text-[10px] tracking-widest">Single Select (Dropdown)</SelectItem>
                                        <SelectItem value="checkbox" className="rounded-xl py-3 px-4 focus:bg-white/10 font-bold uppercase text-[10px] tracking-widest">Multi Select (Checkbox)</SelectItem>
                                        <SelectItem value="textarea" className="rounded-xl py-3 px-4 focus:bg-white/10 font-bold uppercase text-[10px] tracking-widest">Large Text Area</SelectItem>
                                        <SelectItem value="gallery" className="rounded-xl py-3 px-4 focus:bg-white/10 font-bold uppercase text-[10px] tracking-widest">Media Assets Gallery</SelectItem>
                                    </SelectContent>
                                </Select>
                           </div>
                        </div>

                        {(newFieldType === "dropdown" || newFieldType === "checkbox") && (
                            <div className="space-y-4 p-6 rounded-3xl bg-black/40 border border-white/5 animate-in slide-in-from-top-4 duration-500">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-indigo-400 pl-1">Option Matrix Construction</Label>
                                <div className="flex flex-wrap gap-2">
                                    {newFieldOptions.map((opt, i) => (
                                        <Badge key={i} variant="secondary" className="bg-white/10 text-white px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2 group">
                                            {opt}
                                            <X 
                                                className="h-3 w-3 text-gray-500 hover:text-rose-400 cursor-pointer" 
                                                onClick={() => setNewFieldOptions(newFieldOptions.filter((_, idx) => idx !== i))}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Add high-fidelity option..." 
                                        value={newOptionState}
                                        onChange={(e) => setNewOptionState(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                if (newOptionState) {
                                                    setNewFieldOptions([...newFieldOptions, newOptionState])
                                                    setNewOptionState("")
                                                }
                                            }
                                        }}
                                        className="h-12 bg-black border-white/5 rounded-xl"
                                    />
                                    <Button 
                                        type="button"
                                        onClick={() => {
                                            if (newOptionState) {
                                                setNewFieldOptions([...newFieldOptions, newOptionState])
                                                setNewOptionState("")
                                            }
                                        }}
                                        className="bg-indigo-500 hover:bg-indigo-600 h-12 px-6 rounded-xl font-black uppercase text-[10px]"
                                    >
                                        Inject
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div className="flex gap-3 pt-4">
                            <Button type="button" onClick={handleAddField} className="flex-1 bg-indigo-500 hover:bg-indigo-600 h-16 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-indigo-500/20 active:scale-95">
                                Finalize Vector Construction
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setShowAddField(false)} className="px-8 h-16 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 font-black uppercase text-[11px] tracking-widest">
                                Discard
                            </Button>
                        </div>
                    </div>
                )}
            </div>
          </div>
          
          <div className="h-20 sm:h-32" />
        </form>
      </ScrollArea>

      <div className="p-5 sm:p-10 border-t border-white/5 bg-[#0d0d0d]/80 backdrop-blur-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          className="px-12 h-16 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 font-black uppercase text-xs tracking-widest transition-all"
        >
          Purge Changes
        </Button>
        <Button 
          type="submit" 
          form="record-form"
          className={`px-16 h-16 rounded-2xl bg-gradient-to-br from-${themeColor} to-indigo-600 hover:scale-105 active:scale-95 text-white font-black uppercase text-xs tracking-widest shadow-2xl shadow-${themeColor}/20 transition-all`}
        >
          <Save className="h-5 w-5 mr-3" />
          {record ? 'Commit Revision' : 'Initialize Data Node'}
        </Button>
      </div>
    </div>
  )
}
